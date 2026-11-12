# Maintenance scripts as Python/Node twins; installers in shell

The repo has two maintenance scripts — `check_repo` (checks the rules in `AGENTS.md`) and `build_dist`
(Claude Desktop skill ZIPs) — and two install scripts. Users run Windows or Linux/macOS and have Python or
Node, not necessarily both: Node comes with `mcp-remote` for Claude Desktop, Python with most Linux
systems. Requiring a specific runtime would exclude some of them.

## Decision

- **Every maintenance script exists twice**, as `scripts/<name>.py` and `scripts/<name>.mjs`, with the
  same behaviour and identical output (D23). Data both need lives in a shared file
  (`scripts/shared-assets.json`), never inside one of the scripts. `check_repo` fails if a twin is missing.
- **The installers are shell scripts on purpose:** `scripts/install.sh` (bash) and
  `scripts/install.ps1` (PowerShell). Installing for Kiro or Claude Code must need no runtime at all, and
  links (symlinks, directory junctions) are native in shell. No `.cmd` variant: PowerShell is on every
  supported Windows.
- In PowerShell, links are removed **only with `.Delete()`** — `Remove-Item -Recurse` on a junction deletes
  the target's contents in Windows PowerShell 5.1, i.e. the skill folders in the repo.

## Why this shape

- **Parity is testable.** Both check twins were verified by injecting one fault per rule into a copy of
  the repo and diffing their outputs; both build twins produce ZIPs with identical file lists and
  contents. Changing one twin without the other is a regression.
- **No package.json, no pyproject.** The scripts have no dependencies; a package manifest would suggest a
  Node project and give Python users nothing. Revisit when real dependencies or CI arrive.
- **The README prompt calls the installer** rather than letting an agent create links itself: the script
  is the tested, repeatable path (see the PowerShell junction trap above).
