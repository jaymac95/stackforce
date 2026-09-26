# WordPress stack pack

**Checks:** `["composer run lint"]` if PHP tooling is set up; otherwise manual review.

## Conventions
- Prefer a well-supported theme + minimal custom plugin over piles of plugins.
- Custom code in a child theme or a small plugin, never edited core.
- Sanitize on input, escape on output. Use nonces for forms.

## Pitfalls
- Plugin sprawl is the main risk to speed and security; justify each one.
- Keep PHP, themes and plugins updated; a stale plugin is the usual breach.
- Use a caching layer and an image optimizer for performance.

## Handoff
- Non-technical clients edit via the admin; write the content guide for that.
