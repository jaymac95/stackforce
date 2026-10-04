---
name: build-story
description: Build the next story (or a named one) with plan, code, tests and review.
argument-hint: [story number, optional]
disable-model-invocation: true
---

Build one story end to end.

1. Pick the story: $ARGUMENTS if given, otherwise the first story in `docs/stories/` not marked `done`. Require `phase: build`.
2. Create or switch to a branch `story/NNN-short-name`, starting new branches from the latest default branch (`git pull` it first if it has a remote). Never work on a protected branch.
3. `tech-lead`: write a short plan in the story file (files, data, tests).
4. Assign the work by ownership: `frontend-developer`, `mobile-developer`, `api-developer`, `database-specialist`, `auth-specialist`, `integrations-specialist` and the stack specialist as needed.
5. `test-engineer`: tests for every acceptance criterion.
6. Run the project checks (`.stackforce/config.json` `checks`).
7. `code-reviewer`: review the diff. Fix every **must fix** item. After two rounds without approval, run `/decide` instead of looping.
8. Show the user what changed and how to see it working (URL, command or screen). Ask for approval.
9. On approval: mark the story `done`, commit, increment `stories.done`, set `stories.current` to the next story. Update `.stackforce/state.json` (set `updated` to now) when done.
10. If the repo has a remote, offer to push the branch and open a pull request (`gh pr create`) for the user to merge. Push only on their yes.
