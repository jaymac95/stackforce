// Activity log for the studio dashboard. Runs on agent and tool events and appends one JSON line
// per event to .stackforce/activity.jsonl. Never blocks: every path exits 0.
import { appendFileSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { readInput, readJson, projectDir } from "./lib.mjs";

const LOG = join(projectDir, ".stackforce", "activity.jsonl");
const MAX_BYTES = 2 * 1024 * 1024;

try {
  const config = readJson(".stackforce/config.json", {});
  if (config.activityLog === false) process.exit(0);

  const input = await readInput();
  const ev = input.hook_event_name;
  const ti = input.tool_input ?? {};
  const tool = input.tool_name ?? "";
  const isAgentTool = tool === "Agent" || tool === "Task";
  const base = { t: Date.now(), session: input.session_id?.slice(0, 8) };
  // Present when the event fires inside a subagent (newer Claude Code versions).
  const who = { agentId: input.agent_id, agent: input.agent_type };

  let entry = null;
  if (ev === "SessionStart") {
    trim();
    entry = { type: "session", source: input.source };
  } else if (ev === "PreToolUse" && isAgentTool) {
    entry = {
      type: "spawn",
      id: input.tool_use_id,
      agent: ti.subagent_type || "general-purpose",
      desc: clip(ti.description, 80),
      by: who.agent,
    };
  } else if (ev === "PostToolUse" && isAgentTool) {
    // A background launch returns at once; the agent is still working until SubagentStop.
    const res = JSON.stringify(input.tool_response ?? "").slice(0, 2000);
    const async = /async_launched|in the background|running in background|"status":"launched"/i.test(res);
    entry = { type: "done", id: input.tool_use_id, agent: ti.subagent_type || "general-purpose", async };
  } else if (ev === "PreToolUse") {
    entry = { type: "tool", ...who, tool, target: target(tool, ti) };
  } else if (ev === "SubagentStart") {
    entry = { type: "start", ...who };
  } else if (ev === "SubagentStop") {
    entry = { type: "stop", ...who };
  } else if (ev === "Stop") {
    entry = { type: "idle" };
  }
  if (entry) appendFileSync(LOG, JSON.stringify({ ...base, ...entry }) + "\n");
} catch {
  // The dashboard is optional; never get in the way of real work.
}
process.exit(0);

function clip(s, n) {
  s = String(s ?? "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// A short, safe description of what a tool call touches. File names only, never contents.
function target(tool, ti) {
  const p = ti.file_path ?? ti.notebook_path ?? ti.path;
  if (p) return basename(String(p));
  if (ti.command) return clip(redact(ti.command), 60);
  if (ti.pattern) return clip(ti.pattern, 40);
  if (ti.url) return clip(ti.url, 60);
  if (ti.query) return clip(ti.query, 50);
  if (ti.skill) return "/" + ti.skill;
  return "";
}

// Drop a leading `cd <dir> &&` (it hides the real command) and mask anything that looks like a credential.
function redact(c) {
  return String(c)
    .replace(/^\s*cd\s+("[^"]*"|'[^']*'|\S+)\s*(&&|;)\s*/, "")
    .replace(/\b((?:[\w-]*(?:key|token|secret|password|passwd|pwd))\s*[=:]\s*)("[^"]*"|'[^']*'|\S+)/gi, "$1***")
    .replace(/\b(?:sk|rk|pk)_(?:live|test)_\w+|\bsk-[\w-]{16,}|\b(?:ghp|gho|ghs|ghu|github_pat)_\w+|\bAKIA[0-9A-Z]{16}|\bxox[abposr]-[\w-]+/g, "***")
    .replace(/(Bearer\s+)\S+/gi, "$1***");
}

// Keep the log small: at session start, drop the oldest half once it passes MAX_BYTES.
function trim() {
  if (!existsSync(LOG) || statSync(LOG).size < MAX_BYTES) return;
  const lines = readFileSync(LOG, "utf8").split("\n").filter(Boolean);
  writeFileSync(LOG, lines.slice(Math.floor(lines.length / 2)).join("\n") + "\n");
}
