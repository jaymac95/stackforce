// PreToolUse (Bash|PowerShell): before `git commit`, scan the changes being committed for secrets,
// then run the project's checks.
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { readInput, readJson, isSecretName, block, allow, projectDir } from "./lib.mjs";

const input = await readInput();
const cmd = String(input?.tool_input?.command ?? "");
if (!/\bgit\s+commit\b/.test(cmd)) allow();

const git = (args) =>
  execSync(`git ${args}`, { cwd: projectDir, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 50 * 1024 * 1024 }).toString();

// 1. Secret scan. The hook runs before the command, so `git commit -a` or `git add … && git commit`
// haven't staged anything yet: in those cases scan the working tree and untracked files too.
let diff = "";
try {
  diff = git("diff --cached --unified=0 --no-color");
} catch {
  allow(); // not a git repo
}
const addsFirst = /\bgit\s+add\b/.test(cmd) || /\bgit\s+commit\b[^;&|]*\s(-[a-zA-Z]*a[a-zA-Z]*|--all)\b/.test(cmd);

// Secrets files themselves (for example `git add -f .env`) never get committed, whatever they contain.
let files = [];
try {
  files = git("diff --cached --name-only -z").split("\0");
} catch {}
if (addsFirst) {
  const adds = [...cmd.matchAll(/\bgit\s+add\b([^;&|]*)/g)].flatMap((m) => m[1].split(/\s+/));
  files.push(...adds.map((t) => t.replace(/^["']|["']$/g, "")));
}
const secretFile = files.map((f) => basename(f)).find((name) => name && isSecretName(name));
if (secretFile) block(`"${secretFile}" may contain secrets and must not be committed. Unstage it (git restore --staged ${secretFile}) and keep it in .gitignore.`);

const untracked = [];
if (addsFirst) {
  try {
    diff += "\n" + git("diff --unified=0 --no-color");
  } catch {}
  try {
    for (const f of git("ls-files --others --exclude-standard -z").split("\0").filter(Boolean)) {
      const p = join(projectDir, f);
      if (statSync(p).size > 1024 * 1024) continue;
      const text = readFileSync(p, "utf8");
      if (!text.includes("\0")) untracked.push(...text.split("\n").map((l) => `+${l}`));
    }
  } catch {}
}
const added = diff
  .split("\n")
  .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
  .concat(untracked);
const PATTERNS = [
  [/AKIA[0-9A-Z]{16}/, "AWS access key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/\bsk-(?:live|proj|ant)?[-_]?[A-Za-z0-9]{20,}/, "API secret key"],
  [/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}/, "GitHub token"],
  [/\bxox[abposr]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "Google API key"],
  [/\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/, "Stripe live key"],
  [/(?:api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["'][^"'\s]{12,}["']/i, "hard-coded credential"],
];
for (const line of added) {
  for (const [re, what] of PATTERNS) {
    if (re.test(line)) {
      block(`staged changes contain what looks like a ${what}. Move it to an environment variable and unstage it. Line: ${line.slice(0, 120)}`);
    }
  }
}

// 2. Project checks (lint, tests) from .stackforce/config.json.
const config = readJson(".stackforce/config.json", {});
if (config.runChecksBeforeCommit === false) allow();
const checks = Array.isArray(config.checks) ? config.checks : [];
const timeout = (config.checkTimeoutSeconds ?? 300) * 1000;
for (const check of checks) {
  const res = spawnSync(check, { cwd: projectDir, shell: true, encoding: "utf8", timeout });
  if (res.status !== 0) {
    const out = `${res.stdout ?? ""}\n${res.stderr ?? ""}`.trim().split("\n").slice(-40).join("\n");
    block(`check failed: "${check}". Fix it before committing.\n${out}`);
  }
}
allow();
