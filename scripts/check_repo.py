#!/usr/bin/env python3
"""Check the repo against the decisions in AGENTS.md. Exit code 1 on any failure.

Usage: python3 scripts/check_repo.py   (Windows: py scripts\\check_repo.py)
Twin: scripts/check_repo.mjs runs the same checks with Node. Change both together.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
failures = []


def in_order(paths):
    """Sorted by repo-relative POSIX path (same order as the Node twin)."""
    return sorted(paths, key=lambda f: f.relative_to(ROOT).as_posix())


def fail(msg):
    failures.append(msg)


def front_matter(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        return None
    fields = {}
    for line in m.group(1).splitlines():
        key, _, value = line.partition(":")
        fields[key.strip()] = value.strip()
    return fields


for skill_md in in_order(SKILLS.glob("*/SKILL.md")):
    name = skill_md.parent.name
    text = skill_md.read_text(encoding="utf-8")
    fm = front_matter(text)
    # D1
    if fm is None:
        fail(f"{name}: SKILL.md has no front-matter")
        continue
    if set(fm) != {"name", "description"}:
        fail(f"{name}: front-matter must be only name + description, found {sorted(fm)} (D1)")
    if fm.get("name") != name:
        fail(f"{name}: front-matter name '{fm.get('name')}' differs from folder name (D1)")
    # D2
    desc = fm.get("description", "")
    if len(desc) >= 2 and desc[0] == desc[-1] and desc[0] in "\"'":
        desc = desc[1:-1]  # strip the YAML quoting; D2's 200-char limit is on the content
    if len(desc) > 200:
        fail(f"{name}: description is {len(desc)} chars, max 200 (D2)")
    if "Usage:" in desc:
        fail(f"{name}: description contains 'Usage:' slash syntax (D2)")
    # D3
    if "$ARGUMENTS" in text:
        fail(f"{name}: uses $ARGUMENTS (D3)")
    # D6
    for path in ("~/.kiro", "~/.claude", "%USERPROFILE%"):
        if path in text:
            fail(f"{name}: contains install path '{path}' (D6)")
    if re.search(r"the `read` tool|`Read` tool", text):
        fail(f"{name}: names a client-specific read tool (D6)")
    # D10: angle-bracket placeholder in a heading written to a text note
    if re.search(r"prepend (the heading line|a heading) `# [^`]*<YYYY", text) and "actual date" not in text:
        fail(f"{name}: text-note heading placeholder uses <...> (D10)")

# D4: every file exists once. Skills that use another skill's files (scripts/shared-assets.json) must not
# keep their own copy; every template they name must exist in the source skill and be listed there.
SHARED = json.loads((ROOT / "scripts/shared-assets.json").read_text(encoding="utf-8"))
by_content = {}
for f in in_order(SKILLS.rglob("*")):
    if f.is_file():
        by_content.setdefault(f.read_bytes(), []).append(f.relative_to(ROOT).as_posix())
for paths in by_content.values():
    if len(paths) > 1:
        fail(f"duplicate files, keep one and share it via scripts/shared-assets.json: {', '.join(paths)} (D4)")
for skill, entry in SHARED.items():
    source, files = entry["from"], entry["files"]
    skill_md = SKILLS / skill / "SKILL.md"
    if not skill_md.exists():
        fail(f"shared-assets.json shares files into unknown skill {skill} (D4)")
        continue
    for asset in files:
        if not (SKILLS / source / "assets" / asset).exists():
            fail(f"{skill}: shared asset {source}/assets/{asset} is missing (D4)")
        if (SKILLS / skill / "assets" / asset).exists():
            fail(f"{skill}: keeps its own copy of {asset}; the only copy belongs in {source} (D4)")
    named = set(re.findall(r"`(templates/[a-z]+\.md)`", skill_md.read_text(encoding="utf-8")))
    for asset in sorted(named - set(files)):
        fail(f"{skill}: SKILL.md names {asset}, but shared-assets.json does not list it (D4)")

# D4/D5: assets referenced by sb-init and its skeleton spec exist
for ref_file in (SKILLS / "sb-init/SKILL.md", SKILLS / "sb-init/assets/skeleton.md"):
    text = ref_file.read_text(encoding="utf-8")
    for ref in sorted(set(re.findall(r"`assets/([^`]+\.md)`", text))):
        if not (SKILLS / "sb-init/assets" / ref).exists():
            fail(f"{ref_file.relative_to(ROOT)} references missing asset assets/{ref} (D4)")

# D9: ID-free rulebooks, skills and steering
for f in in_order(SKILLS.rglob("*.md")) + in_order((ROOT / "steering").rglob("*.md")):
    if re.search(r"#root/[A-Za-z0-9_]{6,}", f.read_text(encoding="utf-8")):
        fail(f"{f.relative_to(ROOT)}: contains a hard #root/<noteId> link (D9)")

# D13: no hardcoded legacy status set
for f in in_order(SKILLS.rglob("*.md")):
    if re.search(r"open\|doing\|blocked|status=open", f.read_text(encoding="utf-8")):
        fail(f"{f.relative_to(ROOT)}: hardcodes the old status set (D13)")

# D19: version in skeleton.md matches the umbrella _Schema
skeleton = (SKILLS / "sb-init/assets/skeleton.md").read_text(encoding="utf-8")
umbrella = (SKILLS / "sb-init/assets/_Schema-umbrella.md").read_text(encoding="utf-8")
versions = set(re.findall(r"#sbVersion=([0-9.]+[0-9])", skeleton))
if len(versions) != 1:
    fail(f"skeleton.md must state exactly one #sbVersion, found {sorted(versions)} (D19)")
else:
    v = versions.pop()
    if not re.fullmatch(r"\d+\.\d+\.\d+", v):
        fail(f"skeleton.md: #sbVersion={v} is not a semantic version major.minor.patch (D19)")
    if f"#sbVersion={v}" not in umbrella:
        fail(f"umbrella _Schema does not match #sbVersion={v} from skeleton.md (D19)")
    changelog = ROOT / "CHANGELOG.md"
    if not changelog.exists() or not re.search(rf"^## \[{re.escape(v)}\]", changelog.read_text(encoding="utf-8"), re.M):
        fail(f"CHANGELOG.md has no '## [{v}]' heading for #sbVersion={v} (D19)")

# no legacy spaces or attributes outside the lint skill (which detects them)
V2 = re.compile(r"#sbSpace=(inbox|nexus|fluxus|fundus|mentis)|#sbType=(task|note|resource|folder|entity|topic|source|daily)\b"
                r"|#sbCapture|#sbPinned|#sbSecret|~sbSource|~sbRelated|\b(Nexus|Fluxus|Fundus|Mentis)\b")
V2_ALLOWED = {"sb-lint"}
v2_files = [f for f in in_order(SKILLS.rglob("*.md")) if f.relative_to(SKILLS).parts[0] not in V2_ALLOWED]
v2_files += [ROOT / "steering/trilium-symbiont.md"]
for f in v2_files:
    for line in f.read_text(encoding="utf-8").splitlines():
        if V2.search(line) and "legacy" not in line.lower():
            fail(f"{f.relative_to(ROOT)}: legacy leftover: {line.strip()[:80]}" + (" (D24)" if "#sbSecret" in line else " (D22)" if "~sbSource" in line else ""))

# D21: LF line endings only (CRLF from Windows editors breaks diffs and syncs)
for f in [*in_order(SKILLS.rglob("*.md")), *in_order((ROOT / "steering").rglob("*.md")), ROOT / "README.md", ROOT / "AGENTS.md", ROOT / "CHANGELOG.md", ROOT / "docs/install.md",
          ROOT / "scripts/install.sh", ROOT / "scripts/install.ps1", *in_order((ROOT / "docs/adr").glob("*.md"))]:
    if f.exists() and b"\r" in f.read_bytes():
        fail(f"{f.relative_to(ROOT)}: contains CR (CRLF line endings); use LF (D21)")

# D7: steering keeps the Kiro front-matter
steering = ROOT / "steering/trilium-symbiont.md"
if not steering.read_text(encoding="utf-8").startswith("---\ninclusion: always\n---"):
    fail("steering file lost its 'inclusion: always' front-matter (D7)")

# ADR references in AGENTS.md, skills and steering point to an existing docs/adr/NNNN-*.md
ADR_REF = re.compile(r"\bADR (\d{4})\b|docs/adr/(\d{4})-")
adrs = {f.name[:4] for f in (ROOT / "docs/adr").glob("[0-9][0-9][0-9][0-9]-*.md")}
for f in [ROOT / "AGENTS.md", *in_order(SKILLS.rglob("*.md")), *in_order((ROOT / "steering").rglob("*.md"))]:
    for num in sorted({a or b for a, b in ADR_REF.findall(f.read_text(encoding="utf-8"))}):
        if num not in adrs:
            fail(f"{f.relative_to(ROOT).as_posix()}: references ADR {num}, which does not exist in docs/adr/")

# Twins: every repo script exists in Python and in Node
for base in ("check_repo", "build_dist"):
    for ext in (".py", ".mjs"):
        if not (ROOT / "scripts" / f"{base}{ext}").exists():
            fail(f"scripts/{base}{ext} is missing; keep both twins (D23)")

if failures:
    print("FAILED checks (see AGENTS.md):")
    for msg in failures:
        print("  - " + msg)
    sys.exit(1)
print(f"OK — {len(list(SKILLS.glob('*/SKILL.md')))} skills checked against AGENTS.md")
