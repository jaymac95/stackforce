---
name: verify
description: Run every quality gate for this project's track.
disable-model-invocation: true
---

1. Read the gates for the current track from `.stackforce/tracks.json`. Set `phase` to `verify`.
2. Run each gate with its owner, in this order: `tests` (`/test`), `security` (`/security-check`), then the rest:
   - `a11y` → `/a11y-check`, `perf` → `/perf-check`
   - `seo` → `seo-content`: titles, descriptions, headings, sitemap, robots
   - `forms` → `test-engineer`: every form submits, validates and reports errors
   - `auth` → `security-lead` + `auth-specialist`: roles and permissions
   - `data` → `database-specialist`: migrations run clean up and down, indexes present
   - `store` → `app-store-release`: listing, privacy declarations, build settings
   - `offline` → `mobile-developer`: poor and no network behaviour
   - `crash` → `test-engineer`: full test run without crashes
   - `contracts` → `backend-lead`: endpoints match `docs/contracts/` and are versioned
   - `load` → `performance-specialist`: busiest endpoints under expected load
   - `errors` → `api-developer`: consistent error format and logging
3. Show one table: gate, status, note. Fix failures or create stories for them.
4. When all pass, say "Ready for `/release`." Update `.stackforce/state.json` (set `updated` to now) when done.
