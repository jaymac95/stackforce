---
name: architecture
description: Design the architecture and get it approved.
disable-model-invocation: true
---

1. Require gate `scope`.
2. Have the `tech-lead` draft `docs/architecture.md` from `docs/templates/architecture.md`: structure, data model, API or page map, auth, hosting, environments.
3. Get input only from agents active for the track (see `.stackforce/tracks.json`): typically `database-specialist`, `security-lead`, `devops-lead`, and the stack specialist.
4. Have the `technical-director` review and approve. Record significant choices in `docs/decisions/`.
5. Show the user a short summary, not the whole document, and ask for approval.
6. **Gate:** on approval set gate `architecture` to `pass`. If the track needs `/ux` and gate `ux` is not `pass`, say so; otherwise set `phase` to `build`. Update `.stackforce/state.json` (set `updated` to now) when done.
