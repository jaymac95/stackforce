---
name: test
description: Run the test suite and fill gaps for the current story.
disable-model-invocation: true
---

1. Run every command in `.stackforce/config.json` `checks`. If none are set, ask the stack specialist for the right commands and save them.
2. If tests fail, show the failing output (trimmed) and have the owning developer fix them.
3. Have the `test-engineer` check the current story's acceptance criteria all have tests.
4. Set gate `tests` to `pass` or `fail` with a one-line note. Update `.stackforce/state.json` (set `updated` to now) when done.
