---
name: prd
description: Write the product requirements document.
disable-model-invocation: true
---

1. Require an approved brief (gate `brief`). If missing, stop and suggest `/brief`.
2. Have the `product-manager` write `docs/prd.md` from `docs/templates/prd.md`.
3. For `website`, `webapp` and `mobile` tracks, have the `ux-lead` review user-facing requirements.
4. Show the user. Revise until approved.
5. Next: `/stories`. Update `.stackforce/state.json` (set `updated` to now) when done.
