// PreToolUse (Read|Edit|Write|MultiEdit|Grep): keeps secrets files out of the conversation.
import { basename } from "node:path";
import { readInput, isSecretName, block, allow } from "./lib.mjs";

const input = await readInput();
const path = String(input?.tool_input?.file_path ?? input?.tool_input?.path ?? "");
if (!path) allow();

const name = basename(path);
if (isSecretName(name)) {
  block(`"${name}" may contain secrets and is off limits. Document variable names in .env.example instead.`);
}
allow();
