# Stackforce

Turn one Claude Code session into a full software studio. Instead of a single general-purpose assistant, you get directors who guard the goal, leads who own each area, and specialists who do the hands-on work — organized into a workflow with quality gates at every step. **You make every decision; the studio does the work and asks at the right moments.**

Stackforce builds websites, web apps, mobile apps and APIs. It picks the right team, stack experts and quality checks for what you're building, so a marketing site doesn't drag along a database architect and an API doesn't carry an SEO specialist.

## Requirements
- [Claude Code](https://code.claude.com) (works in the terminal, the VS Code and JetBrains extensions, and Claude Desktop)
- Node.js 18+ (the hooks are Node scripts, so they run the same on Windows, macOS and Linux)
- Git, plus whatever your chosen stack needs (Node, PHP, Python, etc.)

## Start a new project
```bash
git clone <your-stackforce-repo> my-project
cd my-project
claude
```
Then, in Claude Code:
```
/start
```
`/start` interviews you, picks a track, recommends a stack (with a runner-up and the trade-offs), and sets everything up. From there you move through the phases.

## Add to an existing project
Copy the `.claude/`, `.stackforce/`, `stacks/` and `docs/templates/` folders into your repo, open Claude Code, and run `/adopt`. It reads your project, infers the track and stack, and sets up state without touching your code.

## Review a project you've already built
Run `/audit` to get an honest opinion of where a project stands. The track's reviewers (architecture, code, security, tests, performance, UX, accessibility, delivery, docs) each look at their area in parallel. You get a plain verdict, a scorecard, findings backed by file and line, and an improvement plan split into Now, Next and Later. Nothing in your code changes; you pick which plan items become stories. The full report is saved to `docs/audits/`.

`/audit quick` covers architecture, security and tests only. `/audit security` (or `performance`, `ux`, `tests` …) covers one area, and `/audit src/payments` limits the review to a path. It works whether or not you've run `/adopt`.

## The workflow
| Phase | Commands | Gate |
|---|---|---|
| Discover | `/brief` | Product director approves the brief |
| Plan | `/prd` · `/stories` | Scope fixed, every story testable |
| Design | `/architecture` · `/ux` | Technical director signs off architecture |
| Build | `/build-story` · `/team-feature` | Code review passes per story |
| Verify | `/verify` (→ `/test`, `/security-check`, `/a11y-check`, `/perf-check`, …) | Every track gate green |
| Ship | `/release` · `/handoff` | Quality director approves release |

`/status` shows where you are. `/stack` (re)chooses the platform. `/decide` resolves disagreements between agents. `/audit` reviews the whole project and plans improvements.

## Tracks and stacks
- **Website** — Next.js, WordPress, Shopify
- **Web app** — Next.js, Laravel, Django/FastAPI
- **Mobile app** — React Native/Expo, Flutter
- **API** — Laravel, Django/FastAPI, Next.js routes

The stack advisor can also recommend no-code platforms (Webflow, Framer) when code isn't the right tool. Stack options and packs live in `stacks/`.

## Built-in guardrails
Enforced automatically by hooks, so the studio can't skip them:
- Secrets (`.env`, keys) can't be read or committed; you document variable *names* in `.env.example`.
- No commits straight to `main`/`master` — work happens on `story/…` branches.
- Lint and tests run before every commit.
- Destructive commands (recursive deletes, force-push, `DROP TABLE`, `--no-verify`) are blocked and ask for your confirmation.
- A status line always shows the phase, current story and stack.

Configure protected branches and pre-commit checks in `.stackforce/config.json`.

## Layout
```
CLAUDE.md              Master config the studio reads first
.claude/
  agents/              Directors, leads, specialists (+ stack specialists)
  skills/              /start, /brief, /build-story, /verify, /release …
  hooks/               Secrets, tests, branch safety, status line (Node)
  rules/               Folder-scoped coding standards
  settings.json        Wires up hooks, permissions, status line
.stackforce/
  state.json           Current track, stack, phase, stories, gates
  tracks.json          Which agents and gates each track uses
  config.json          Protected branches, pre-commit checks
stacks/
  catalog.yaml         Options the stack advisor draws from
  packs/               Per-stack conventions and pitfalls
docs/
  templates/           Brief, PRD, story, architecture, decision, handoff, audit
  decisions/           Decision records, written as you go
  audits/              Reports from /audit
```

## License
MIT — see [LICENSE](LICENSE). Free to use and modify.

The studio structure (directors → leads → specialists, phase skills, hooks) is inspired by [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) by Donchitos, also MIT. Stackforce reworks that idea for general software projects, with its own tracks, agents, stack advisor and guardrails.

Stackforce is a template for use with Claude Code. It is not affiliated with or endorsed by Anthropic. "Claude" is a trademark of Anthropic.
