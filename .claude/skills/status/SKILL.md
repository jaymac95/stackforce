---
name: status
description: Show where the project stands and what to do next. Use when the user asks for status, progress or what's next.
---

Read `.stackforce/state.json`, `docs/stories/` and gate results. Reply in at most eight lines:
- Project, track and stack
- Phase, and stories done out of total
- Current story
- Gates: passed, failed, pending, and stale (code changed since the gate's `commit`; see `CLAUDE.md`)
- Anything blocked and who owns it
- The single next command to run
