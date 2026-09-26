---
name: perf-check
description: Measure performance and fix the biggest problems.
disable-model-invocation: true
---

1. Run the `performance-specialist` subagent.
2. Web tracks: measure the main pages (Lighthouse or the stack's tools if available): load time, largest contentful paint, bundle size. Mobile: startup time and list scrolling. API: response times for the busiest endpoints.
3. Fix the top one or two issues only if the fix is small; otherwise create a story for it.
4. Set gate `perf` to `pass` or `fail` with the key numbers. Update `.stackforce/state.json` (set `updated` to now) when done.
