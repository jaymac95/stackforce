// PreToolUse (Bash|PowerShell): blocks destructive commands, shell reads of secrets files,
// and commits/pushes on protected branches.
import { execSync } from "node:child_process";
import { readInput, readJson, isSecretName, block, allow, projectDir } from "./lib.mjs";

const input = await readInput();
const raw = String(input?.tool_input?.command ?? "");
if (!raw) allow();
// Commit messages and PR text are prose, not commands: "Block DROP TABLE" in a message must not trip the guards.
const cmd = stripProse(raw);

// A root, home, drive, wildcard or current/parent directory target (optionally quoted).
const BIG_TARGET = String.raw`\s["']?(\/|\/[A-Za-z]|~|\*|\.{1,2}|[A-Za-z]:|\$HOME|\$\{HOME\}|\$env:USERPROFILE|%USERPROFILE%)[\\/]?\*?["']?(\s|$)`;
const DESTRUCTIVE = [
  [new RegExp(String.raw`\b(Remove-Item|ri|rm|del|rmdir|rd)\b(?=[^;&|]*\s(-[a-zA-Z]*r[a-zA-Z]*|--recursive)\b)[^;&|]*` + BIG_TARGET, "i"), "recursive delete of a drive, home, current or whole directory"],
  [new RegExp(String.raw`\b(rd|rmdir|del)\s+\/s\b[^;&|]*` + BIG_TARGET, "i"), "recursive delete of a drive, home, current or whole directory"],
  [/\bFormat-Volume\b|\bformat\s+[A-Za-z]:/i, "formatting a drive"],
  [/\bgit\s+push\b[^;&|]*(\s--force\b|\s-f\b)(?![-\w])/, "force push (use --force-with-lease on your own branch, and ask the user first)"],
  [/\bgit\s+push\b[^;&|]*\s["']?\+[^\s"']/, "force push via a +refspec (ask the user first)"],
  [/\bgit\s+reset\s+--hard\b/, "git reset --hard discards work; ask the user first"],
  [/\bgit\s+clean\s+-[a-zA-Z]*f/, "git clean -f deletes untracked files; ask the user first"],
  [/\bgit\s+(checkout|restore)\s+(?![^;&|]*--staged)(--\s+)?\.(\s|$)/, "discarding every uncommitted change; ask the user first"],
  [/\b(git\s+commit|git\s+push)\b[^;&|]*\s--no-verify\b/, "--no-verify skips the studio's checks"],
  [/\bDROP\s+(DATABASE|TABLE|SCHEMA)\b/i, "dropping a database, table or schema; ask the user first"],
  [/\bTRUNCATE\s+TABLE\b/i, "truncating a table; ask the user first"],
  [/\bchmod\s+-R\s+777\b/, "chmod -R 777 makes everything world-writable"],
];
for (const [re, why] of DESTRUCTIVE) {
  if (re.test(cmd)) block(`blocked ${why}. Command: ${raw.slice(0, 200)}`);
}

// Secrets: no reading, copying or uploading .env or key files through the shell (the file tools are guarded separately).
const READERS = /\b(cat|type|more|less|head|tail|bat|nl|od|xxd|hexdump|strings|grep|egrep|rg|ag|sed|awk|cut|base64|source|Get-Content|gc|Select-String|sls|findstr|Import-Csv|ReadAllText|ReadAllLines|cp|copy|Copy-Item|cpi|mv|move|Move-Item|scp|rsync|curl|wget|Invoke-WebRequest|iwr|node|python3?|ruby|php|perl|tar|zip|Compress-Archive)\b|(^|\s)\.\s|<\s*\S/i;
if (READERS.test(cmd)) {
  const secret = cmd
    .split(/[\s"'`;|&<>()=,]+/)
    .map((tok) => tok.replace(/^@/, "").split(/[\\/]/).pop())
    .find((name) => name && isSecretName(name));
  if (secret) block(`"${secret}" may contain secrets and is off limits. Document variable names in .env.example instead.`);
}

// Protected branches: no commits or pushes straight to main/master.
const GIT = String.raw`\bgit(?:\s+-[Cc]\s+\S+)*\s+`;
const isCommit = new RegExp(GIT + String.raw`commit\b`).test(cmd);
const pushes = [...cmd.matchAll(new RegExp(GIT + String.raw`push\b([^;&|]*)`, "g"))].map((m) => m[1]);
if (!isCommit && !pushes.length) allow();

const config = readJson(".stackforce/config.json", {});
const protectedBranches = config.protectedBranches ?? ["main", "master"];
const git = (args, timeout) =>
  execSync(`git ${args}`, { cwd: projectDir, stdio: ["ignore", "pipe", "ignore"], timeout }).toString().trim();
let branch = "";
try {
  branch = git("rev-parse --abbrev-ref HEAD");
} catch {
  allow(); // not a git repo yet
}
const hasCommits = (() => {
  try {
    git("rev-parse --verify HEAD");
    return true;
  } catch {
    return false;
  }
})();
const storyHint = "Create a story branch first: git switch -c story/NNN-short-name";

if (isCommit) {
  // `git switch -c story/x && git commit …` commits on the new branch, not the current one.
  const switched = new RegExp(GIT + String.raw`(?:switch\s+(?:-c|-C|--create)|checkout\s+-[bB])\s+(\S+)[\s\S]*?` + GIT + "commit\\b").exec(cmd);
  const target = switched?.[1] ?? branch;
  if (protectedBranches.includes(target) && hasCommits) block(`"${target}" is a protected branch. ${storyHint}`);
}

for (const args of pushes) {
  for (const { remote, dst, del } of pushTargets(args)) {
    if (dst === "*") block(`pushing every branch includes protected ones (${protectedBranches.join(", ")}). Push your story branch by name.`);
    if (!protectedBranches.includes(dst)) continue;
    // Publishing a new repo: the first push that creates the protected branch on the remote is allowed.
    let createsRemoteBranch = false;
    if (!del) {
      try {
        createsRemoteBranch = git(`ls-remote --heads ${remote} ${dst}`, 20000) === "";
      } catch {
        // unreachable remote: stay safe
      }
    }
    if (!createsRemoteBranch) block(`"${dst}" is a protected branch. ${storyHint}`);
  }
}
allow();

/** Remote branches a `git push` would write to, from its arguments. */
function pushTargets(args) {
  const toks = args.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/^["']|["']$/g, ""));
  const positional = [];
  let all = false;
  let del = false;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (/^(--all|--mirror|--branches)$/.test(t)) all = true;
    else if (t === "-d" || t === "--delete") del = true;
    else if (/^(-o|--push-option|--repo|--receive-pack|--exec)$/.test(t)) i++;
    else if (!t.startsWith("-")) positional.push(t);
  }
  const remote = positional[0] ?? "origin";
  if (all) return [{ remote, dst: "*" }];
  const refspecs = positional.slice(1);
  if (!refspecs.length) refspecs.push(branch); // a bare `git push` updates the current branch
  return refspecs.map((spec) => {
    spec = spec.replace(/^\+/, "");
    let dst = spec.includes(":") ? spec.slice(spec.lastIndexOf(":") + 1) : spec;
    if (dst === "HEAD" || dst === "") dst = branch;
    return { remote, dst: dst.replace(/^refs\/heads\//, ""), del: del || spec.startsWith(":") };
  });
}

/** Removes commit messages, PR/issue text and the heredocs that feed them. Other commands are left as they are. */
function stripProse(c) {
  if (!/\bgit\s+(commit|tag)\b|\bgh\s+(pr|issue|release)\b/.test(c)) return c;
  return c
    .replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2(?=\s|\)|$)/g, "<<HEREDOC")
    .replace(/(\s(?:-m|--message|-t|--title|-b|--body|-n|--notes))(?:=|\s+)("(?:[^"\\]|\\.)*"|'[^']*')/g, "$1 MSG");
}
