---
name: brief
description: Write the project brief and get it approved.
disable-model-invocation: true
---

1. Using `docs/intake.md`, have the `product-manager` draft `docs/brief.md` from `docs/templates/brief.md`.
2. Have the `product-director` review it. Fix anything it sends back.
3. Show the user the brief and ask for approval or changes.
4. **Gate:** once the user approves, set gate `brief` to `pass` and `phase` to `plan`. Update `.stackforce/state.json` (set `updated` to now) when done.
5. Next: `/prd`.
