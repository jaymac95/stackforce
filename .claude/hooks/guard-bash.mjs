// PreToolUse (Bash|PowerShell): blocks destructive commands, shell reads of secrets files,
// and commits/pushes on protected branches.
import { execSync } from "node:child_process";
import { readInput, readJson, isSecretName, block, allow, projectDir } from "./lib.mjs";

const input = await readInput();
const cmd = String(input?.tool_input?.command ?? "");
if (!cmd) allow();

// A root, home or wildcard target: /, ~, *, C:\, $HOME, $env:USERPROFILE (optionally quoted).
const BIG_TARGET = String.raw`\s["']?(\/|~|\*|[A-Za-z]:[\\/]?|\$HOME|\$env:USERPROFILE)[\\/]?\*?["']?(\s|$)`;
const DESTRUCTIVE = [
  [/\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\b[^;&|]*\s(\/|~|\*)(\/\S*)?(\s|$)/, "recursive delete of a root, home or whole directory"],
  [new RegExp(String.raw`\b(Remove-Item|ri|rm|del|rmdir|rd)\b(?=[^;|]*\s-r(ecurse)?\b)[^;|]*` + BIG_TARGET, "i"), "recursive delete of a drive, home or whole directory"],
  [new RegExp(String.raw`\b(rd|rmdir)\s+\/s\b[^;&|]*` + BIG_TARGET, "i"), "recursive delete of a drive, home or whole directory"],
  [/\bFormat-Volume\b|\bformat\s+[A-Za-z]:/i, "formatting a drive"],
  [/\bgit\s+push\b[^;&|]*(\s--force\b|\s-f\b)(?![-\w])/, "force push (use --force-with-lease on your own branch, and ask the user first)"],
  [/\bgit\s+reset\s+--hard\b/, "git reset --hard discards work; ask the user first"],
  [/\bgit\s+clean\s+-[a-zA-Z]*f/, "git clean -f deletes untracked files; ask the user first"],
  [/\b(git\s+commit|git\s+push)\b[^;&|]*\s--no-verify\b/, "--no-verify skips the studio's checks"],
  [/\bDROP\s+(DATABASE|TABLE|SCHEMA)\b/i, "dropping a database, table or schema; ask the user first"],
  [/\bTRUNCATE\s+TABLE\b/i, "truncating a table; ask the user first"],
  [/\bchmod\s+-R\s+777\b/, "chmod -R 777 makes everything world-writable"],
];
for (const [re, why] of DESTRUCTIVE) {
  if (re.test(cmd)) block(`blocked ${why}. Command: ${cmd.slice(0, 200)}`);
}

// Secrets: no reading .env or key files through the shell (the file tools are guarded separately).
const READERS = /\b(cat|type|more|less|head|tail|bat|nl|od|xxd|hexdump|strings|grep|egrep|rg|ag|sed|awk|cut|base64|source|Get-Content|gc|Select-String|sls|findstr|Import-Csv|ReadAllText|ReadAllLines)\b|(^|\s)\.\s|<\s*\S/i;
if (READERS.test(cmd)) {
  const secret = cmd
    .split(/[\s"'`;|&<>()=,]+/)
    .map((tok) => tok.split(/[\\/]/).pop())
    .find((name) => name && isSecretName(name));
  if (secret) block(`"${secret}" may contain secrets and is off limits. Document variable names in .env.example instead.`);
}

// Protected branches: no commits or pushes straight to main/master.
const config = readJson(".stackforce/config.json", {});
const protectedBranches = config.protectedBranches ?? ["main", "master"];
if (/\bgit\s+(commit|push)\b/.test(cmd)) {
  let branch = "";
  try {
    branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: projectDir, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    allow(); // not a git repo yet
  }
  const pushTarget = /\bgit\s+push\b.*\b(?:origin|upstream)\s+(\S+)/.exec(cmd)?.[1]?.replace(/^HEAD:/, "");
  const hitsProtected =
    protectedBranches.includes(branch) || (pushTarget && protectedBranches.includes(pushTarget));
  if (hitsProtected) {
    const isInitialCommit = (() => {
      try {
        execSync("git rev-parse --verify HEAD", { cwd: projectDir, stdio: "ignore" });
        return false;
      } catch {
        return true;
      }
    })();
    // Publishing a new repo: the first push that creates the protected branch on the remote is allowed.
    const createsRemoteBranch = (() => {
      const m = /\bgit\s+push\b(?:\s+-\S+)*\s+([\w.-]+)\s+(?:HEAD:)?(\S+)/.exec(cmd);
      if (!m || !protectedBranches.includes(m[2])) return false;
      try {
        const heads = execSync(`git ls-remote --heads ${m[1]} ${m[2]}`, {
          cwd: projectDir,
          stdio: ["ignore", "pipe", "ignore"],
          timeout: 20000,
        }).toString();
        return heads.trim() === "";
      } catch {
        return false; // unreachable remote: stay safe
      }
    })();
    if (!isInitialCommit && !createsRemoteBranch) {
      block(
        `"${pushTarget || branch}" is a protected branch. Create a story branch first: git switch -c story/NNN-short-name`,
      );
    }
  }
}
allow();
