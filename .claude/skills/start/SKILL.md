---
name: start
description: Start a new Stackforce project: interview, pick a track, recommend a stack, set up state.
disable-model-invocation: true
---

Set up this project as a Stackforce studio.

1. Read `.stackforce/state.json`. If `phase` is not `start`, show `/status` output and ask whether to restart. Never overwrite existing docs without a yes.
2. Interview the user **one question at a time**, skipping anything already answered:
   - What are you building, and what problem does it solve?
   - Who uses it, and on which devices?
   - Who edits content after launch? (a non-technical client changes the answer)
   - Which languages or frameworks do you already know?
   - Budget for hosting and services: free tier, small monthly, or flexible?
   - Must-haves: logins, payments, a mobile app, specific integrations?
   - Expected users at launch and in a year?
   - Deadline?
3. Save the answers to `docs/intake.md`.
4. Pick a track from `.stackforce/tracks.json` (`website`, `webapp`, `mobile`, `api`). Tell the user which and why in one sentence. They can override.
5. Run the `stack-advisor` subagent with the intake. Present its recommendation, runner-up and trade-offs. The user chooses.
6. Record the choice as `docs/decisions/0001-stack.md` using `docs/templates/decision.md`.
7. Set up state:
   - `.stackforce/state.json`: `project`, `track`, `stack` (pack slug or `null`), `phase: "discover"`.
   - `.stackforce/config.json`: copy the `checks` commands from `stacks/packs/<slug>.md` if the pack exists.
   - If no pack exists for the chosen stack, say so. The general agents still work.
8. Tell the user the active team for their track (from `tracks.json`) in one line, then: "Next: `/brief`."
