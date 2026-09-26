---
description: Standards for UI components
paths: ["**/components/**", "**/app/**/*.tsx", "**/src/**/*.tsx", "**/lib/**/*.tsx"]
---
- One component per file; keep them small and focused.
- Handle loading, empty and error states for anything async.
- No business logic or data fetching inside presentational components.
- Every interactive element is keyboard-usable with a visible focus state.
- Reuse an existing component before writing a new one.
