#!/usr/bin/env python3
"""Build one ZIP per skill into dist/ for the Claude Desktop upload.

Usage: python3 scripts/build_dist.py [sb-name ...]   (Windows: py scripts\\build_dist.py)
Without names, all skills are built and stale ZIPs of removed skills are deleted.
Each ZIP is written fresh (no leftovers from earlier builds) and holds the skill folder with
forward-slash paths, whatever the OS. No dependencies: Python 3.8+ standard library only.

Shared assets: some skills use files whose single source is another skill (scripts/shared-assets.json).
Linked installs (Kiro, Claude Code) read them from that sibling skill; a Desktop ZIP cannot, so the
files are copied into the ZIP at <skill>/assets/<file>. The repo keeps one copy.

Twin: scripts/build_dist.mjs does the same with Node. Change both together.
"""
import json
import re
import sys
import time
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
DIST = ROOT / "dist"
SKIP_NAMES = {".DS_Store", "Thumbs.db", "desktop.ini"}
SKIP_DIRS = {"__pycache__", ".git", "node_modules"}
# skill -> {"from": source skill, "files": [paths relative to the source skill's assets/]}
SHARED = json.loads((ROOT / "scripts" / "shared-assets.json").read_text(encoding="utf-8"))


def list_files(folder):
    out = []
    for entry in sorted(folder.iterdir(), key=lambda p: p.name):
        if entry.is_dir():
            if entry.name not in SKIP_DIRS:
                out.extend(list_files(entry))
        elif entry.is_file() and entry.name not in SKIP_NAMES:
            out.append(entry)
    return out


def add(zf, full, name):
    t = time.localtime(full.stat().st_mtime)
    info = zipfile.ZipInfo(name, date_time=(max(t.tm_year, 1980), *t[1:6]))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.create_system = 0  # same as the Node build: no Unix permission bits
    zf.writestr(info, full.read_bytes())


def build(name):
    files = [(f, f.relative_to(SKILLS).as_posix()) for f in list_files(SKILLS / name)]
    shared = SHARED.get(name, {})
    for asset in shared.get("files", []):
        zip_name = f"{name}/assets/{asset}"
        full = SKILLS / shared["from"] / "assets" / asset
        if not full.is_file():
            sys.exit(f"{name}: shared asset {shared['from']}/assets/{asset} is missing")
        if any(n == zip_name for _, n in files):
            sys.exit(f"{name}: {zip_name} exists in the skill itself; keep only the copy in {shared['from']}")
        files.append((full, zip_name))
    target = DIST / f"{name}.zip"
    target.unlink(missing_ok=True)
    with zipfile.ZipFile(target, "w") as zf:
        for full, zip_name in files:
            add(zf, full, zip_name)
    return f"dist/{name}.zip ({len(files)} files)"


all_skills = sorted(d.name for d in SKILLS.iterdir() if d.name.startswith("sb-") and (d / "SKILL.md").exists())
names = sys.argv[1:]
unknown = [n for n in names if n not in all_skills]
if unknown:
    sys.exit(f"Unknown skill(s): {', '.join(unknown)}")
DIST.mkdir(exist_ok=True)
if not names:
    for f in sorted(DIST.iterdir()):
        if re.fullmatch(r"sb-.*\.zip", f.name) and f.name[:-4] not in all_skills:
            f.unlink()
            print(f"removed stale {f.name}")
for name in names or all_skills:
    print(f"built {build(name)}")
