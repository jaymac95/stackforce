---
name: audit
description: Review an already-built project end to end and give an honest verdict, findings with evidence, and a plan to improve it.
argument-hint: [quick | area such as security, performance, ux | path, optional]
disable-model-invocation: true
---

Audit the project as it stands. This is a read-only review: never change application code, config or dependencies here.

## 1. Orient
1. Read `.stackforce/state.json`. If `phase` is `start` (not set up), infer the track and stack from package files, framework config and folder layout, state them in one line, and carry on. Don't write state; suggest `/adopt` at the end.
2. Read whatever exists of `docs/brief.md`, `docs/prd.md`, `docs/architecture.md` and `docs/decisions/`. These are what the project *meant* to be; the code is what it *is*. Gaps between the two are findings.
3. Map the project cheaply: top-level folders, package/dependency files, test folders, CI config, README, `.env.example`. Note size (files, main languages). Don't read every file.
4. Scope from $ARGUMENTS:
   - empty: full audit for the track
   - `quick`: only `technical-director`, `security-lead` and `qa-lead`
   - an area (`security`, `performance`, `ux`, `a11y`, `tests`, `seo`, `devops`, `code`, `docs`, `product`): only that reviewer
   - a path: every relevant reviewer, limited to that path

## 2. Review in parallel
Run the reviewers for the track (only agents listed for it in `.stackforce/tracks.json`) as parallel subagents. Give each the project map, the track and stack, the docs from step 1, and the stack pack from `stacks/packs/<slug>.md` if there is one.

| Area | Agent | Looks at |
|---|---|---|
| Architecture | `technical-director` | structure, boundaries, dependencies, tech debt, fit with `docs/architecture.md` |
| Code | `code-reviewer` | a sample of the most important and most-changed files: correctness, clarity, duplication, error handling |
| Security | `security-lead` | auth, input handling, secrets, dependency risks, data exposure |
| Tests | `qa-lead` | what's tested, what isn't, whether tests run and pass (run the `checks` in `.stackforce/config.json` or the project's test script) |
| Performance | `performance-specialist` | obvious hot spots: bundle size, N+1 queries, missing indexes, slow startup |
| UX | `ux-lead` | flows, empty/loading/error states, confusing paths (skip for `api`) |
| Accessibility | `ui-accessibility` | WCAG AA basics in components and pages (skip for `api`) |
| SEO | `seo-content` | titles, metadata, headings, sitemap (`website` only) |
| Delivery | `devops-lead` | CI, environments, deploy path, logging, backups |
| Docs | `docs-handoff` | could a new developer set it up and ship a change from the docs alone? |
| Product | `product-director` | does what's built serve the goal in the brief? (only if `docs/brief.md` or `docs/prd.md` exists) |

Tell every reviewer:
- **Be honest, not kind.** The user asked for a real opinion. Don't soften, pad or praise by default. If something is fine, say so in one line and move on.
- **Evidence or it didn't happen.** Every finding cites `file:line` or a command and its output. Mark anything unconfirmed as *suspected*.
- **Rate the area**: `strong`, `okay`, `weak` or `missing`, with one sentence why.
- **Up to 5 findings**, each with severity (`critical`, `high`, `medium`, `low`), the risk in plain words, the fix, and effort (`S` under an hour, `M` about a day, `L` several days).
- **Up to 2 things done well**, only if genuinely good.
- Read only what the area needs. Stay read-only.

## 3. Synthesize
1. Merge duplicates. Where reviewers contradict each other, settle it with the `/decide` ladder (documents, then owner). Only bring it to the user if it changes scope, cost or deadline.
2. Keep calibration honest: don't inflate severity to look thorough, and don't bury a real problem to seem encouraging. `critical` means data loss, a security breach, or the product not working for its main users.
3. Write the report to `docs/audits/YYYY-MM-DD-audit.md` using `docs/templates/audit.md`.
4. Build the improvement plan from the findings:
   - **Now**: critical and high items, plus quick wins (high value, effort `S`)
   - **Next**: medium items that reduce risk or unblock future work
   - **Later**: low items and larger refactors worth doing only if the project keeps growing
   Each item names its owner agent and effort. Order within each group by value for effort.

## 4. Report to the user
Reply in this shape, short:
1. **Verdict**: two or three plain sentences. Would you ship it, hand it to a client, or build on it? Say which, and why.
2. **Scorecard**: one line per area with its rating.
3. **Top 3 problems**, each with evidence and fix.
4. **Plan**: the Now items, with a count of Next and Later.
5. Link to the full report.

Then ask which plan items to turn into stories. For the ones chosen, have `product-manager` write them to `docs/stories/` using `docs/templates/story.md`. If the project was never set up, suggest `/adopt` first so the stories have somewhere to live. If state exists, record the audit date as `lastAudit` in `.stackforce/state.json` and set `updated` to now.
