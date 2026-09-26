# Next.js stack pack

**Checks:** `["npm run lint", "npm run typecheck", "npm test -- --run"]` (adjust to the project's scripts)

## Conventions
- App Router. Server Components by default; add `"use client"` only when you need interactivity.
- Data fetching in Server Components or route handlers, never by exposing secrets to the client.
- Keep server-only code (DB, keys) out of client components. Use `server-only` where helpful.
- Validate all input with zod at the boundary (route handlers, server actions).

## Pitfalls
- Don't put secrets in `NEXT_PUBLIC_*` — those ship to the browser.
- Avoid large client bundles: check what's pulled into client components.
- Caching defaults changed across versions; check the installed version before relying on fetch cache behaviour.

## Testing
- Vitest for units, Playwright for end-to-end. `@axe-core/playwright` for accessibility scans.
