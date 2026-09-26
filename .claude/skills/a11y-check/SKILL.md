---
name: a11y-check
description: Check accessibility against WCAG AA.
disable-model-invocation: true
---

1. Skip for the `api` track.
2. Run the `ui-accessibility` subagent. If Playwright and `@axe-core/playwright` are available, run an automated scan of the main pages; otherwise use the manual checklist.
3. Manual checklist: keyboard-only navigation, visible focus, labels on every input, colour contrast, alt text, headings in order, no content that only works on hover.
4. Set gate `a11y` to `pass` or `fail`. Update `.stackforce/state.json` (set `updated` to now) when done.
