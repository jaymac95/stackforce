---
name: decide
description: Resolve a disagreement between agents and get a decision.
disable-model-invocation: true
---

Use when agents disagree or a review loops.

1. State the question in one sentence and name the two (or more) positions and their owners.
2. Check the documents in order: brief, PRD, architecture, `docs/decisions/`. If they settle it, apply that and stop.
3. Find the owner of the decision (see each agent's "You own"). If one owner exists, they decide.
4. Otherwise escalate once: specialists → their lead; leads → the matching director. Each side gets **one** short statement of position and trade-offs. No back-and-forth.
5. Anything that changes scope, cost or deadline, or a director-vs-director split, goes to the user as a decision card:
   **Decision needed:** one sentence
   **Option A:** … (consequence)
   **Option B:** … (consequence)
   **Recommendation:** who leans which way, and why
6. Record the outcome in `docs/decisions/NNNN-short-name.md` from `docs/templates/decision.md`.
