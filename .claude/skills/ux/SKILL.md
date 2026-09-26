---
name: ux
description: Design user flows and screens.
disable-model-invocation: true
---

1. Skip for the `api` track.
2. Have the `ux-lead` write `docs/ux.md`: every flow as numbered user steps, the screen inventory, and empty, loading and error states.
3. Have the `ui-accessibility` specialist add accessibility notes per screen.
4. Show the user and revise until approved.
5. **Gate:** on approval set gate `ux` to `pass`. If gate `architecture` is `pass`, set `phase` to `build`. Update `.stackforce/state.json` (set `updated` to now) when done.
