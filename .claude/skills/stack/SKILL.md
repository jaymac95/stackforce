---
name: stack
description: Get a stack and platform recommendation, or revisit the stack choice.
argument-hint: [what to compare, optional]
disable-model-invocation: true
---

Run the `stack-advisor` subagent.

1. Use `docs/intake.md` if it exists; otherwise ask the intake questions from `/start` step 2 that matter for stack choice.
2. $ARGUMENTS narrows the question if given (for example "hosting only" or "compare Supabase and Firebase").
3. Present: **recommended**, **runner-up**, **why**, **watch out for**, and what it costs to switch later.
4. If the user changes an existing stack choice, record a new decision in `docs/decisions/` that supersedes the old one, and warn about work that must change.
