# Every file exists once; shared templates are bundled at build time

`sb-daily` and `sb-hub` need template files (`day.md`, `week.md`, `hub.md`, `synthesis.md`) as a fallback
when the live template note in Trilium cannot be read. Claude Desktop installs each skill as a separate ZIP
and cannot read sibling skills, so each skill used to carry its own copy of the `sb-init` templates, and
`check_repo` compared the copies. Kiro and Claude Code, however, install the skills as links into the repo,
where the sibling `sb-init` folder is always present.

## Decision

- The templates exist **only in `skills/sb-init/assets/templates/`** (D4). `sb-daily` and `sb-hub` look for
  a template file first in their own `assets/` (present only in a ZIP bundle), then in the sibling
  `sb-init` skill.
- `scripts/shared-assets.json` lists which skill uses which files of another skill; `build_dist` copies
  them into the Desktop ZIP at the same relative path (`<skill>/assets/templates/…`).
- `check_repo` fails on any duplicate file under `skills/`, on a skill keeping its own copy of a shared
  file, and on a template a skill names that `shared-assets.json` does not list. `build_dist` refuses to
  build if a copy reappears.

## Why this shape

- **Copies drift.** A rule "change all copies together" relies on discipline; a single source cannot drift.
- **Only the ZIP needs the copy**, and the ZIP is generated — so the copy belongs in the build, not in the
  repo.
- **Linked installs keep working without a build:** the sibling lookup finds the single source directly.
