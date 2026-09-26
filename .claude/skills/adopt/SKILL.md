---
name: adopt
description: Add Stackforce to an existing project without changing its code.
disable-model-invocation: true
---

1. Inspect the project: package files, framework config, folder structure, tests, CI. Read only what's needed.
2. Infer the track and stack. Confirm both with the user.
3. Write `docs/architecture.md` describing the project **as it is**, and `docs/intake.md` from a short interview (skip questions the code already answers).
4. Set `.stackforce/state.json`: track, stack, and `phase` (usually `build`). Mark gates as `pending`.
5. Set `.stackforce/config.json` `checks` from the project's existing lint and test scripts.
6. Do not change application code. Suggest `/audit` for an honest review and improvement plan, `/stories` for new work, or `/verify` for a quality baseline.
