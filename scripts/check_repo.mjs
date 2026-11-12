#!/usr/bin/env node
// Check the repo against the decisions in AGENTS.md. Exit code 1 on any failure.
//
// Usage: node scripts/check_repo.mjs   (same command on Windows, with \)
// Twin: scripts/check_repo.py runs the same checks with Python. Change both together.
// No dependencies: plain Node (>= 18).

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");
const failures = [];
const fail = (msg) => failures.push(msg);

const byString = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const posix = (p) => p.split(sep).join("/");
const rel = (p) => posix(relative(ROOT, p));
const read = (p) => readFileSync(p, "utf8");
const pyList = (items) => `[${items.map((i) => `'${i}'`).join(", ")}]`;
const chars = (s) => [...s]; // count and slice by code point, as Python does

// All files below dir, sorted by their repo-relative POSIX path (same order as the Python twin).
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}
const sortedFiles = (files) => files.sort((a, b) => byString(rel(a), rel(b)));
const mdBelow = (dir) => sortedFiles(walk(dir).filter((f) => f.endsWith(".md")));
const skillDirs = readdirSync(SKILLS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(SKILLS, d.name, "SKILL.md")))
  .map((d) => d.name)
  .sort(byString);

function frontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    const key = (i < 0 ? line : line.slice(0, i)).trim();
    fields[key] = i < 0 ? "" : line.slice(i + 1).trim();
  }
  return fields;
}

for (const name of skillDirs) {
  const text = read(join(SKILLS, name, "SKILL.md"));
  const fm = frontMatter(text);
  // D1
  if (fm === null) {
    fail(`${name}: SKILL.md has no front-matter`);
    continue;
  }
  const keys = Object.keys(fm).sort(byString);
  if (keys.join("\n") !== "description\nname") {
    fail(`${name}: front-matter must be only name + description, found ${pyList(keys)} (D1)`);
  }
  if (fm.name !== name) fail(`${name}: front-matter name '${fm.name ?? "None"}' differs from folder name (D1)`);
  // D2
  let desc = fm.description ?? "";
  if (desc.length >= 2 && desc[0] === desc.at(-1) && `"'`.includes(desc[0])) desc = desc.slice(1, -1);
  if (chars(desc).length > 200) fail(`${name}: description is ${chars(desc).length} chars, max 200 (D2)`);
  if (desc.includes("Usage:")) fail(`${name}: description contains 'Usage:' slash syntax (D2)`);
  // D3
  if (text.includes("$ARGUMENTS")) fail(`${name}: uses $ARGUMENTS (D3)`);
  // D6
  for (const path of ["~/.kiro", "~/.claude", "%USERPROFILE%"]) {
    if (text.includes(path)) fail(`${name}: contains install path '${path}' (D6)`);
  }
  if (/the `read` tool|`Read` tool/.test(text)) fail(`${name}: names a client-specific read tool (D6)`);
  // D10: angle-bracket placeholder in a heading written to a text note
  if (/prepend (the heading line|a heading) `# [^`]*<YYYY/.test(text) && !text.includes("actual date")) {
    fail(`${name}: text-note heading placeholder uses <...> (D10)`);
  }
}

// D4: every file exists once. Skills that use another skill's files (scripts/shared-assets.json) must not
// keep their own copy; every template they name must exist in the source skill and be listed there.
const SHARED = JSON.parse(read(join(ROOT, "scripts", "shared-assets.json")));
const byContent = new Map();
for (const f of sortedFiles(walk(SKILLS))) {
  const key = createHash("sha256").update(readFileSync(f)).digest("hex");
  if (!byContent.has(key)) byContent.set(key, []);
  byContent.get(key).push(rel(f));
}
for (const paths of byContent.values()) {
  if (paths.length > 1) {
    fail(`duplicate files, keep one and share it via scripts/shared-assets.json: ${paths.join(", ")} (D4)`);
  }
}
for (const [skill, { from: source, files }] of Object.entries(SHARED)) {
  const skillMd = join(SKILLS, skill, "SKILL.md");
  if (!existsSync(skillMd)) {
    fail(`shared-assets.json shares files into unknown skill ${skill} (D4)`);
    continue;
  }
  for (const asset of files) {
    if (!existsSync(join(SKILLS, source, "assets", ...asset.split("/")))) {
      fail(`${skill}: shared asset ${source}/assets/${asset} is missing (D4)`);
    }
    if (existsSync(join(SKILLS, skill, "assets", ...asset.split("/")))) {
      fail(`${skill}: keeps its own copy of ${asset}; the only copy belongs in ${source} (D4)`);
    }
  }
  const named = new Set([...read(skillMd).matchAll(/`(templates\/[a-z]+\.md)`/g)].map((m) => m[1]));
  for (const asset of [...named].filter((a) => !files.includes(a)).sort(byString)) {
    fail(`${skill}: SKILL.md names ${asset}, but shared-assets.json does not list it (D4)`);
  }
}

// D4/D5: assets referenced by sb-init and its skeleton spec exist
for (const refFile of [join(SKILLS, "sb-init", "SKILL.md"), join(SKILLS, "sb-init", "assets", "skeleton.md")]) {
  const refs = new Set([...read(refFile).matchAll(/`assets\/([^`]+\.md)`/g)].map((m) => m[1]));
  for (const ref of [...refs].sort(byString)) {
    if (!existsSync(join(SKILLS, "sb-init", "assets", ...ref.split("/")))) {
      fail(`${rel(refFile)} references missing asset assets/${ref} (D4)`);
    }
  }
}

// D9: ID-free rulebooks, skills and steering
for (const f of [...mdBelow(SKILLS), ...mdBelow(join(ROOT, "steering"))]) {
  if (/#root\/[A-Za-z0-9_]{6,}/.test(read(f))) fail(`${rel(f)}: contains a hard #root/<noteId> link (D9)`);
}

// D13: no hardcoded legacy status set
for (const f of mdBelow(SKILLS)) {
  if (/open\|doing\|blocked|status=open/.test(read(f))) fail(`${rel(f)}: hardcodes the old status set (D13)`);
}

// D19: version in skeleton.md matches the umbrella _Schema
const skeleton = read(join(SKILLS, "sb-init", "assets", "skeleton.md"));
const umbrella = read(join(SKILLS, "sb-init", "assets", "_Schema-umbrella.md"));
const versions = [...new Set([...skeleton.matchAll(/#sbVersion=([0-9.]+[0-9])/g)].map((m) => m[1]))].sort(byString);
if (versions.length !== 1) {
  fail(`skeleton.md must state exactly one #sbVersion, found ${pyList(versions)} (D19)`);
} else {
  const v = versions[0];
  if (!/^\d+\.\d+\.\d+$/.test(v)) fail(`skeleton.md: #sbVersion=${v} is not a semantic version major.minor.patch (D19)`);
  if (!umbrella.includes(`#sbVersion=${v}`)) fail(`umbrella _Schema does not match #sbVersion=${v} from skeleton.md (D19)`);
  const changelog = join(ROOT, "CHANGELOG.md");
  const esc = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!existsSync(changelog) || !new RegExp(`^## \\[${esc}\\]`, "m").test(read(changelog))) {
    fail(`CHANGELOG.md has no '## [${v}]' heading for #sbVersion=${v} (D19)`);
  }
}

// no legacy spaces or attributes outside the lint skill (which detects them)
const V2 = new RegExp(
  String.raw`#sbSpace=(inbox|nexus|fluxus|fundus|mentis)|#sbType=(task|note|resource|folder|entity|topic|source|daily)\b` +
    String.raw`|#sbCapture|#sbPinned|#sbSecret|~sbSource|~sbRelated|\b(Nexus|Fluxus|Fundus|Mentis)\b`,
);
const V2_ALLOWED = new Set(["sb-lint"]);
const v2Files = mdBelow(SKILLS).filter((f) => !V2_ALLOWED.has(posix(relative(SKILLS, f)).split("/")[0]));
v2Files.push(join(ROOT, "steering", "trilium-symbiont.md"));
for (const f of v2Files) {
  for (const line of read(f).split(/\r\n|\r|\n/)) {
    if (V2.test(line) && !line.toLowerCase().includes("legacy")) {
      fail(`${rel(f)}: legacy leftover: ${chars(line.trim()).slice(0, 80).join("")}` + (line.includes("#sbSecret") ? " (D24)" : line.includes("~sbSource") ? " (D22)" : ""));
    }
  }
}

// D21: LF line endings only (CRLF from Windows editors breaks diffs and syncs)
for (const f of [...mdBelow(SKILLS), ...mdBelow(join(ROOT, "steering")), join(ROOT, "README.md"), join(ROOT, "AGENTS.md"), join(ROOT, "CHANGELOG.md"), join(ROOT, "docs", "install.md"),
  join(ROOT, "scripts", "install.sh"), join(ROOT, "scripts", "install.ps1"),
  ...mdBelow(join(ROOT, "docs", "adr"))]) {
  if (existsSync(f) && readFileSync(f).includes(0x0d)) fail(`${rel(f)}: contains CR (CRLF line endings); use LF (D21)`);
}

// D7: steering keeps the Kiro front-matter
if (!read(join(ROOT, "steering", "trilium-symbiont.md")).startsWith("---\ninclusion: always\n---")) {
  fail("steering file lost its 'inclusion: always' front-matter (D7)");
}

// ADR references in AGENTS.md, skills and steering point to an existing docs/adr/NNNN-*.md
const adrDir = join(ROOT, "docs", "adr");
const adrs = new Set(existsSync(adrDir) ? readdirSync(adrDir).filter((n) => /^\d{4}-.*\.md$/.test(n)).map((n) => n.slice(0, 4)) : []);
for (const f of [join(ROOT, "AGENTS.md"), ...mdBelow(SKILLS), ...mdBelow(join(ROOT, "steering"))]) {
  const nums = new Set([...read(f).matchAll(/\bADR (\d{4})\b|docs\/adr\/(\d{4})-/g)].map((m) => m[1] ?? m[2]));
  for (const num of [...nums].sort(byString)) {
    if (!adrs.has(num)) fail(`${rel(f)}: references ADR ${num}, which does not exist in docs/adr/`);
  }
}

// Twins: every repo script exists in Python and in Node
for (const base of ["check_repo", "build_dist"]) {
  for (const ext of [".py", ".mjs"]) {
    if (!existsSync(join(ROOT, "scripts", base + ext))) fail(`scripts/${base}${ext} is missing; keep both twins (D23)`);
  }
}

if (failures.length) {
  console.log("FAILED checks (see AGENTS.md):");
  for (const msg of failures) console.log("  - " + msg);
  process.exit(1);
}
console.log(`OK — ${skillDirs.length} skills checked against AGENTS.md`);
