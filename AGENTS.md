# Agent notes for this repo

This repo holds the setup material for Trilium Symbiont: the `sb-*` skills, the rulebooks they install
(`skills/sb-init/assets/`) and the steering file. Everything must work unchanged in **Kiro**,
**Claude Code** and **Claude Desktop**, on **Windows and Linux/macOS**; a change that is better for one
client but breaks another is a regression (ADR 0008).

## Hard rules

Do not change any of these without asking the user first. `scripts/check_repo.py` / `.mjs` enforces the
ones marked ✓.

- **D1 ✓** `SKILL.md` front-matter has only `name` (= folder name) and `description`.
- **D2 ✓** `description` says what the skill does and "Use when …", max 200 characters, no slash syntax.
- **D3 ✓** No `$ARGUMENTS` in skills. End with `Input: the user's request (for a slash command, the text after it).`
- **D4 ✓** Every file exists once in the repo. A skill that uses another skill's file (`sb-daily`, `sb-hub`
  → `sb-init`'s templates) reads it from the sibling skill; `scripts/shared-assets.json` lists it and the build
  copies it into the Desktop ZIP. Never add a copy to the repo (ADR 0007).
- **D5** `sb-init` reads its assets from its own folder; `sb-sync` falls back to the installed `sb-init`'s `assets/`.
- **D6 ✓** Client-neutral wording in skills: no client tool names, no install paths.
- **D7 ✓** One steering file for all clients; its `inclusion: always` front-matter stays.
- **D8** `docs/install.md`: Kiro and Claude Code install skills as links, Desktop as ZIPs; every command for
  PowerShell and bash. The README keeps only the agent prompts (install, update), the first run and
  pointers to `docs/install.md`.
- **D9 ✓** Rulebooks, skills and steering are ID-free: no `#root/<noteId>` links.
- **D10 ✓** No `<…>` placeholders in text written into Trilium text notes (Trilium strips them).
- **D11** No ETAPI calls in skills; everything goes through the Trilium MCP tools (Trilium ≥ 0.107.0) (ADR 0008).
- **D12** Scope: the four spaces plus `_README` and `_Schema` under `root`. Writing under `root` only via
  `/sb-init` (create, empty instance) and `/sb-sync` (the notes the umbrella `_Schema` names). Skills
  must not widen this (ADR 0001).
- **D13 ✓** Board columns and card attributes are read from the Board, never hardcoded. No column means "done".
- **D14** `sb-init` defaults contain no personal data.
- **D15** Every icon in `skeleton.md` must exist in Boxicons; verify with the Trilium `search_icons` tool.
- **D16** `_Log` notes are append-only, oldest first.
- **D17** Repo → live is one-way (`/sb-sync`, same major version). No migration across major versions.
- **D18** Journal settings are read from the live Daily root, never hardcoded in skills.
- **D19 ✓** `skeleton.md` is the single build specification. `#sbVersion` (`major.minor.patch`) is
  stated there and in the umbrella `_Schema`, and must match; `CHANGELOG.md` has a heading for it.
- **D20** `#sbIgnore` is the only exclusion mechanism for Sources reference material (ADR 0002).
- **D21 ✓** LF line endings only (`.gitattributes`) (ADR 0008).
- **D22 ✓** Evidence lives only in in-text links (Trilium records them as `~internalLink`); no separate source
  relation (ADR 0003).
- **D23 ✓** Every script in `scripts/` exists as a Python and a Node twin with the same behavior and output.
  Change both together; shared data lives in `scripts/shared-assets.json`, not in either script.
  Exception: `scripts/install.sh` / `install.ps1` are shell on purpose, so installing needs no runtime; change
  both together, and only ever remove links with `.Delete()` in PowerShell (never `Remove-Item -Recurse`)
  (ADR 0006).
- **D24 ✓** Sensitive notes are protected only by Trilium's `#excludeFromLlm`; no agent-side secret label.
  Never try to reveal an excluded note; count secret-like matches with `limit: 0` (ADR 0005).

Decision records with the reasoning: `docs/adr/`. A rule whose reason is not obvious gets an ADR.

## Before you commit

1. Run `python3 scripts/check_repo.py` or `node scripts/check_repo.mjs` and fix every failure. If you
   changed a script, run both twins and compare their output. CI (`.github/workflows/check.yml`) runs the
   same checks, compares the twins and runs both installers on every push and pull request.
2. Keep `README.md` and `docs/install.md` consistent with changed skills, rulebooks or scripts. Add every
   user-visible change to `CHANGELOG.md` under `## [Unreleased]` at the top (create that section if it does
   not exist yet), with an **Upgrade** note when the user has to act (`/sb-sync`, re-run the install
   script, rebuild ZIPs, newer Trilium). On release, rename it to `## [x.y.z] — YYYY-MM-DD`.
3. Changed a rulebook or template in `skills/sb-init/assets/`? Bump minor/patch of `#sbVersion` in
   `skeleton.md` and the umbrella `_Schema` together when needed; a major bump needs the user's OK.
4. Changed a skill? Rebuild its Desktop ZIP with `build_dist.py` or `build_dist.mjs` (`<sb-name …>`) and tell the
   user which ZIPs to re-upload. A changed template in `sb-init` also needs `sb-daily` or `sb-hub` rebuilt.
