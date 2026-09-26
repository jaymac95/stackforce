---
name: release
description: Prepare and approve a release.
disable-model-invocation: true
---

1. Require every gate for the track to be `pass` (run `/verify` if any are missing or older than the last change).
2. `devops-lead`: work through `docs/templates/release-checklist.md` and save the filled copy to `docs/release.md`.
3. `quality-director`: approve or block with a specific list.
4. **Never deploy or publish without the user's explicit go-ahead.** Show the exact deploy command or steps first.
5. After release: set `phase` to `ship`, log the release in `docs/decisions/` with the date and version. Update `.stackforce/state.json` (set `updated` to now) when done.
