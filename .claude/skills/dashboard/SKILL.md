---
name: dashboard
description: Open the live studio dashboard that shows the agents working.
disable-model-invocation: true
---

1. Start the server in the background (Bash with `run_in_background`): `node .stackforce/dashboard/server.mjs --open`. It serves on `http://localhost:4455` (change with `dashboardPort` in `.stackforce/config.json`) and opens the browser. If it says it's already running, that's fine.
2. Tell the user the URL in one line, and that the page updates live: each agent's card lights up while it works and shows its task and latest action, and the timeline and feed fill in as work happens.
3. If they see no activity, the hooks may not be loaded yet: ask them to start a new Claude Code session so `.claude/settings.json` is re-read.
4. To stop it later, stop the background task. Logging can be turned off with `"activityLog": false` in `.stackforce/config.json`.
