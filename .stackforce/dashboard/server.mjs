// Stackforce studio dashboard: a local page that shows the agents working, live.
// Plain Node, no dependencies. Run: node .stackforce/dashboard/server.mjs [--open]
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync, openSync, readSync, closeSync, watchFile } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.CLAUDE_PROJECT_DIR || join(here, "..", "..");
const LOG = join(root, ".stackforce", "activity.jsonl");
const STATE = join(root, ".stackforce", "state.json");
const config = readJsonFile(join(root, ".stackforce", "config.json"), {});
const PORT = Number(process.env.STACKFORCE_DASHBOARD_PORT || config.dashboardPort || 4455);
const HISTORY = 1500; // events replayed to a new page

function readJsonFile(p, fallback) {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function tierOf(name) {
  if (name.endsWith("-director")) return "director";
  if (name.endsWith("-lead") || name === "product-manager") return "lead";
  if (name.startsWith("stack-")) return "stack";
  return "specialist";
}

function team() {
  const state = readJsonFile(STATE, {});
  const tracks = readJsonFile(join(root, ".stackforce", "tracks.json"), { tracks: {} }).tracks;
  const dir = join(root, ".claude", "agents");
  const agents = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          const text = readFileSync(join(dir, f), "utf8");
          const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "";
          const get = (k) => new RegExp(`^${k}:\\s*(.*)$`, "m").exec(fm)?.[1]?.trim() ?? "";
          const name = get("name") || f.replace(/\.md$/, "");
          return { name, description: get("description"), model: get("model"), tier: tierOf(name) };
        })
    : [];
  const onTrack = state.track && tracks[state.track] ? tracks[state.track].agents : null;
  const stackAgent = state.stack ? `stack-${state.stack}` : null;
  return {
    state,
    trackLabel: state.track ? tracks[state.track]?.label ?? state.track : null,
    agents: agents.map((a) => ({
      ...a,
      onTrack: onTrack ? onTrack.includes(a.name) || a.name === stackAgent : true,
    })),
  };
}

function history() {
  if (!existsSync(LOG)) return [];
  return readFileSync(LOG, "utf8").split("\n").filter(Boolean).slice(-HISTORY);
}

// Live tail: every open page gets new log lines and state changes as server-sent events.
const clients = new Set();
let offset = existsSync(LOG) ? statSync(LOG).size : 0;
let partial = "";
function broadcast(event, data) {
  for (const res of clients) res.write(`event: ${event}\ndata: ${data}\n\n`);
}
watchFile(LOG, { interval: 400 }, (cur) => {
  if (cur.size < offset) {
    offset = 0; // log was trimmed
    partial = "";
  }
  if (cur.size === offset) return;
  const fd = openSync(LOG, "r");
  const buf = Buffer.alloc(cur.size - offset);
  readSync(fd, buf, 0, buf.length, offset);
  closeSync(fd);
  offset = cur.size;
  const lines = (partial + buf.toString("utf8")).split("\n");
  partial = lines.pop();
  for (const line of lines) if (line.trim()) broadcast("activity", line);
});
watchFile(STATE, { interval: 1000 }, () => broadcast("team", JSON.stringify(team())));

const server = createServer((req, res) => {
  // Only answer pages served from this machine, so another site can't read the log through DNS rebinding.
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.headers.host ?? "")) return res.writeHead(403).end("forbidden");
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return res.end(readFileSync(join(here, "index.html")));
  }
  if (url.pathname === "/events") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
    res.write(`event: team\ndata: ${JSON.stringify(team())}\n\n`);
    res.write(`event: history\ndata: [${history().join(",")}]\n\n`);
    clients.add(res);
    const ping = setInterval(() => res.write(": ping\n\n"), 20000);
    req.on("close", () => {
      clearInterval(ping);
      clients.delete(res);
    });
    return;
  }
  res.writeHead(404).end("not found");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Stackforce dashboard is already running at http://localhost:${PORT}`);
    process.exit(0);
  }
  throw err;
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Stackforce dashboard: ${url}  (Ctrl+C to stop)`);
  if (process.argv.includes("--open")) {
    const cmd = process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd, () => {});
  }
});
