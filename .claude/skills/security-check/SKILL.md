---
name: security-check
description: Run the security review for the project or current changes.
argument-hint: [path, optional]
disable-model-invocation: true
---

1. Run the `security-lead` subagent on $ARGUMENTS or the whole project if the phase is `verify`.
2. Run the dependency audit from the stack pack (for example `npm audit --omit=dev`) and report only high and critical issues.
3. Check: access control on every protected action, input validation, secrets not committed, `.env.example` complete, rate limits on auth and forms.
4. Set gate `security` to `pass` or `fail` with the list of blocking issues. Update `.stackforce/state.json` (set `updated` to now) when done.
