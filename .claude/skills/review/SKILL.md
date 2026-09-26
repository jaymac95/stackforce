---
name: review
description: Run a code review on the current changes.
argument-hint: [path or story, optional]
disable-model-invocation: true
---

1. Review scope: $ARGUMENTS if given (path or story), otherwise the diff between the current branch and the default branch.
2. Run the `code-reviewer` subagent with the relevant story and `.claude/rules/`.
3. Report findings grouped as **must fix**, **should fix**, **nitpick**. Only must-fix items block.
