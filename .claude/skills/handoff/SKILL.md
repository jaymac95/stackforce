---
name: handoff
description: Write handoff docs for a client or the next developer.
disable-model-invocation: true
---

1. Ask who the reader is if the brief doesn't say (client, developer, both).
2. Have `docs-handoff` write `docs/handoff.md` from `docs/templates/handoff.md` and update `README.md` setup steps.
3. Have the `tech-lead` check every command and setting is accurate.
4. Update `.stackforce/state.json` (set `updated` to now) when done.
