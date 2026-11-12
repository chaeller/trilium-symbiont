#!/usr/bin/env bash
# Install Trilium Symbiont for Kiro and/or Claude Code on Linux / macOS.
#
# Links every skills/sb-* folder and the steering file from this repo into the client's folders, so
# edits in the repo are live at once. Safe to run again. Windows: scripts/install.ps1.
# Not covered (see docs/install.md): the Trilium MCP server with your token, and Claude Desktop (ZIP upload).
#
# Usage: scripts/install.sh [--kiro] [--claude-code] [--dry-run]
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/install.sh [--kiro] [--claude-code] [--dry-run]

  --kiro         link skills into ~/.kiro/skills and the steering into ~/.kiro/steering
  --claude-code  link skills into ~/.claude/skills and import the steering in ~/.claude/CLAUDE.md
  --dry-run      only show what would change

Give at least one client. Run it again after pulling (new or removed skills) or after moving the repo.
EOF
}

KIRO=0 CLAUDE=0 DRY=0
for arg in "$@"; do
  case "$arg" in
    --kiro) KIRO=1 ;;
    --claude-code) CLAUDE=1 ;;
    --dry-run) DRY=1 ;;
    -h | --help) usage; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; usage >&2; exit 2 ;;
  esac
done
if [ "$KIRO" = 0 ] && [ "$CLAUDE" = 0 ]; then usage >&2; exit 2; fi

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
STEERING="$REPO/steering/trilium-symbiont.md"
[ -f "$STEERING" ] && [ -d "$REPO/skills" ] || { echo "Run this from a complete trilium-symbiont checkout." >&2; exit 1; }

run() { # execute unless --dry-run (the lines printed before each call say what happens)
  if [ "$DRY" = 0 ]; then "$@"; fi
}

link_skills() { # $1 = the client's skills folder
  local dst="$1" d l name target
  echo "Skills → $dst"
  run mkdir -p "$dst"
  for d in "$REPO"/skills/sb-*/; do
    d="${d%/}"; name="$(basename "$d")"; l="$dst/$name"
    if [ -L "$l" ] && [ "$(readlink "$l")" = "$d" ]; then
      echo "  ok       $name"; continue
    fi
    if [ -e "$l" ] && [ ! -L "$l" ]; then
      echo "  replace  $name (was a copied folder, now a link)"
      run rm -rf "$l"
    else
      echo "  link     $name"
    fi
    run ln -sfn "$d" "$l"
  done
  # remove links into this repo whose skill no longer exists; nothing else is touched
  for l in "$dst"/sb-*; do
    [ -L "$l" ] || continue
    target="$(readlink "$l")"
    case "$target" in "$REPO"/skills/*) [ -e "$target" ] || { echo "  remove   $(basename "$l") (skill was removed)"; run rm "$l"; } ;; esac
  done
}

if [ "$KIRO" = 1 ]; then
  echo "== Kiro"
  link_skills "$HOME/.kiro/skills"
  l="$HOME/.kiro/steering/trilium-symbiont.md"
  echo "Steering → $l"
  if [ -L "$l" ] && [ "$(readlink "$l")" = "$STEERING" ]; then
    echo "  ok"
  else
    run mkdir -p "$HOME/.kiro/steering"
    run ln -sfn "$STEERING" "$l"
    echo "  linked"
  fi
fi

if [ "$CLAUDE" = 1 ]; then
  echo "== Claude Code"
  link_skills "$HOME/.claude/skills"
  md="$HOME/.claude/CLAUDE.md"
  line="@$STEERING"
  echo "Steering → import in $md"
  if [ -f "$md" ] && grep -qxF "$line" "$md"; then
    echo "  ok"
  else
    if [ -f "$md" ] && grep -q 'steering/trilium-symbiont\.md' "$md"; then
      echo "  note: $md imports the steering from another path; check and remove the old line:"
      grep -n 'steering/trilium-symbiont\.md' "$md" | sed 's/^/    /'
    fi
    run mkdir -p "$HOME/.claude"
    if [ "$DRY" = 0 ]; then
      # start on a new line if the file does not end with one
      if [ -s "$md" ] && [ -n "$(tail -c1 "$md")" ]; then echo >>"$md"; fi
      echo "$line" >>"$md"
    fi
    echo "  added"
  fi
fi

echo
echo "Done$([ "$DRY" = 1 ] && echo ' (dry run, nothing changed)')."
echo "Next: connect the Trilium MCP server as 'trilium' (docs/install.md), start a new session, then /sb-lint"
echo "(or /sb-init on an empty Trilium instance)."
