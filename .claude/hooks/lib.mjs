// Shared helpers for Stackforce hooks. Plain Node, no dependencies, works on Windows, macOS and Linux.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export function readJson(rel, fallback) {
  const p = join(projectDir, rel);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

const SECRET_OK = [/^\.env\.example$/, /^\.env\.sample$/, /^\.env\.template$/];
const SECRET = [
  /^\.env(\..+)?$/,
  /\.(pem|key|p12|pfx|keystore|jks)$/,
  /^id_(rsa|ed25519|ecdsa|dsa)$/,
  /^credentials(\.json)?$/,
  /^service-account.*\.json$/,
  /^\.npmrc$/,
  /^\.pypirc$/,
];

/** True when a file name (not a path) looks like it holds secrets. */
export function isSecretName(name) {
  const n = name.toLowerCase();
  return !SECRET_OK.some((re) => re.test(n)) && SECRET.some((re) => re.test(n));
}

/** Exit code 2 blocks the tool call and shows the reason to Claude. */
export function block(reason) {
  process.stderr.write(`Stackforce guard: ${reason}\n`);
  process.exit(2);
}

export function allow() {
  process.exit(0);
}
