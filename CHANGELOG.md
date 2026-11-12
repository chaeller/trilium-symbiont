# Changelog

All notable changes to Trilium Symbiont. The version is the system version `#sbVersion` (in
`skeleton.md` and on the umbrella `_Schema` note); it follows [semantic versioning](https://semver.org):

- **patch / minor** (`1.0.1`, `1.1.0`): backward-compatible — `git pull`, then `/sb-sync` brings an
  existing instance up to date;
- **major** (`2.0.0`): not compatible with existing instances — see [docs/install.md](docs/install.md#e--updating).

Each release lists what changed and, under **Upgrade**, what you have to do. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — 2026-11-12

**Initial release.** Trilium Symbiont turns a Trilium instance into an agent-assisted personal knowledge
base: an AI agent maintains the wiki and workspace through Trilium's built-in MCP server, and you edit
and override at any time — inspired by Andrej Karpathy's LLM Wiki.

### What's in it
- **Four spaces** under the Trilium root — Daily (journal and captures), Cockpit (Kanban Board, saved
  searches, proposals), Hubs (topics with areas, projects, tasks, syntheses, concepts, Principles) and
  Sources (immutable foreign material) — plus the system notes `_README` (user guide) and `_Schema`
  (rulebook). `/sb-init` builds them from `skills/sb-init/assets/skeleton.md`.
- **Twelve skills:** `/sb-capture`, `/sb-triage`, `/sb-task`, `/sb-daily`, `/sb-query`, `/sb-research`,
  `/sb-ingest`, `/sb-hub`, `/sb-review`, `/sb-lint`, and for setup and maintenance `/sb-init` and
  `/sb-sync` (one-way repo → instance update within a major version).
- **A steering file** for natural-language routing, the scope boundary and the end-of-run status marker.
- **Three clients:** Kiro, Claude Code and Claude Desktop, on Windows and Linux/macOS.
- **Installation** by agent prompt (README) or by `scripts/install.sh` / `scripts/install.ps1`; every step
  by hand in `docs/install.md`.
- **Security by Trilium:** sensitive notes get `#excludeFromLlm` and never reach the agent or the AI
  provider; `/sb-lint` counts likely secrets in visible notes without displaying them.
- **For contributors:** rules in `AGENTS.md`, their reasoning in `docs/adr/` (0001–0008), and the
  maintenance scripts `check_repo` and `build_dist` in Python and Node, checked by CI on every push.

### Requirements
- **Trilium ≥ 0.107.0** with the built-in MCP server enabled and an ETAPI token.

### Getting started
- Follow *Installing* in the README, then run `/sb-init` on an empty Trilium instance.
