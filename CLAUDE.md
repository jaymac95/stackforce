# Stackforce

This project runs as a Stackforce studio: a set of specialized agents, guided by phase skills and enforced by hooks, that take a software project from idea to launch. The user makes every decision; the studio does the work and asks at the right moments.

## First thing, every session
Read `.stackforce/state.json`. It holds the track, stack, phase, story progress and gate results. Act within the current phase unless the user asks otherwise. If it doesn't exist or `phase` is `start`, this project hasn't been set up: suggest `/start` (new) or `/adopt` (existing).

## The workflow
Six phases, each ending in a gate that must pass before the next begins:
1. **Discover** — `/brief`
2. **Plan** — `/prd`, `/stories`
3. **Design** — `/architecture`, `/ux`
4. **Build** — `/build-story`, `/team-feature`
5. **Verify** — `/verify` (runs `/test`, `/security-check`, `/a11y-check`, `/perf-check` and the track's other gates)
6. **Ship** — `/release`, `/handoff`

`/status` any time. `/stack` to (re)choose the platform. `/decide` when agents disagree. `/audit` for an honest review and improvement plan of an already-built project. `/dashboard` to watch the agents work live.

## The team
Agents live in `.claude/agents/`, grouped as directors (guard the goal, architecture and release), leads (own one area each) and specialists (do the hands-on work). Only the agents for the current track are used; see `.stackforce/tracks.json`.

Delegate real work to the owning subagent via the Agent tool rather than doing it inline. Each agent's file lists what it owns and what it only advises on.

## Resolving conflicts
Agents don't talk to each other; this main session coordinates them. When two agents return contradictory recommendations:
1. Documents decide first, in order: brief > PRD > architecture > `docs/decisions/` > story.
2. If unresolved, the owner of that decision decides (see each agent's "You own").
3. If ownership is split, escalate once: specialists to their lead, leads to the matching director.
4. Anything that changes scope, cost or deadline, or a director-vs-director split, goes to the user as a short decision card.
Run `/decide` to do this. Record the outcome in `docs/decisions/`.

## Hard rules (also enforced by hooks)
- Never read or print secrets. `.env` and key files are blocked; document variable *names* in `.env.example`.
- Never commit straight to a protected branch. Work on `story/NNN-name` branches.
- Never use `--no-verify`, force-push shared branches, or run destructive commands without asking the user.
- Never deploy or publish without the user's explicit go-ahead.
- Keep context lean: read the files a task needs, not the whole repo. This pairs well with keeping token use low.

## Keep docs honest
`docs/` is the source of truth: `brief.md`, `prd.md`, `architecture.md`, `ux.md`, `stories/`, `decisions/`, `audits/`, `handoff.md`. Update state and gates as you finish each step so `/status` and the status line stay accurate.
