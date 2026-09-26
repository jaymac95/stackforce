---
name: stories
description: Break the PRD into small, testable stories.
disable-model-invocation: true
---

1. Require `docs/prd.md`.
2. Have the `product-manager` write one file per story in `docs/stories/` named `NNN-short-name.md`, using `docs/templates/story.md`.
3. Each story: one user-visible outcome, testable acceptance criteria, buildable and reviewable in one session. Split anything bigger.
4. Order stories so each builds on finished work. Put setup and auth first where needed.
5. **Gate:** when the user approves the list, set gate `scope` to `pass`, `stories.total`, and `phase` to `design`. Update `.stackforce/state.json` (set `updated` to now) when done.
6. Next: `/architecture` (and `/ux` unless the track is `api`).
