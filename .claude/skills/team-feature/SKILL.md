---
name: team-feature
description: Build a larger feature with several agents working together.
argument-hint: <feature name>
disable-model-invocation: true
---

For a feature that spans several stories or both frontend and backend.

1. Identify the stories involved ($ARGUMENTS names the feature).
2. `tech-lead`: write the contract first (API shapes, data, events) in `docs/contracts/<feature>.md`. Both sides build against it.
3. Run backend and frontend work as separate subagents in parallel when they don't touch the same files.
4. Integrate, then `test-engineer` adds end-to-end tests for the full flow.
5. `code-reviewer` reviews the combined diff. Conflicts go through `/decide`.
6. Show the user, get approval, mark the stories done. Update `.stackforce/state.json` (set `updated` to now) when done.
