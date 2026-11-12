#!/usr/bin/env node
// Build one ZIP per skill into dist/ for the Claude Desktop upload.
//
// Usage: node scripts/build_dist.mjs [sb-name ...]
// Without names, all skills are built and stale ZIPs of removed skills are deleted.
// Each ZIP is written fresh (no leftovers from earlier builds) and holds the skill folder with
// forward-slash paths, whatever the OS. No dependencies: plain Node (>= 18) with its built-in zlib.
//
// Shared assets: some skills use files whose single source is another skill (scripts/shared-assets.json).
// Linked installs (Kiro, Claude Code) read them from that sibling skill; a Desktop ZIP cannot, so the
// files are copied into the ZIP at <skill>/assets/<file>. The repo keeps one copy.
//
// Twin: scripts/build_dist.py does the same with Python. Change both together.

import { deflateRawSync } from "node:zlib";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");
const DIST = join(ROOT, "dist");
const SKIP_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const SKIP_DIRS = new Set(["__pycache__", ".git", "node_modules"]);
// skill -> { from: source skill, files: [paths relative to the source skill's assets/] }
const SHARED = JSON.parse(readFileSync(join(ROOT, "scripts", "shared-assets.json"), "utf8"));

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((Math.max(date.getFullYear(), 1980) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...listFiles(full));
    } else if (entry.isFile() && !SKIP_NAMES.has(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function zip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data, mtime } of files) {
    const nameBuf = Buffer.from(name, "utf8");
    const packed = deflateRawSync(data);
    const crc = crc32(data);
    const { time, day } = dosDateTime(mtime);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, packed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += local.length + nameBuf.length + packed.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, end]);
}

function entry(full, name) {
  return { name, data: readFileSync(full), mtime: statSync(full).mtime };
}

function build(name) {
  const files = listFiles(join(SKILLS, name)).map((full) => entry(full, relative(SKILLS, full).split(sep).join("/")));
  const { from: source, files: shared = [] } = SHARED[name] ?? {};
  for (const asset of shared) {
    const zipName = `${name}/assets/${asset}`;
    const full = join(SKILLS, source, "assets", ...asset.split("/"));
    if (!existsSync(full)) {
      console.error(`${name}: shared asset ${source}/assets/${asset} is missing`);
      process.exit(1);
    }
    if (files.some((f) => f.name === zipName)) {
      console.error(`${name}: ${zipName} exists in the skill itself; keep only the copy in ${source}`);
      process.exit(1);
    }
    files.push(entry(full, zipName));
  }
  const target = join(DIST, `${name}.zip`);
  rmSync(target, { force: true });
  writeFileSync(target, zip(files));
  return `dist/${name}.zip (${files.length} files)`;
}

const allSkills = readdirSync(SKILLS)
  .filter((d) => d.startsWith("sb-") && existsSync(join(SKILLS, d, "SKILL.md")))
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const names = process.argv.slice(2);
const unknown = names.filter((n) => !allSkills.includes(n));
if (unknown.length) {
  console.error(`Unknown skill(s): ${unknown.join(", ")}`);
  process.exit(1);
}
mkdirSync(DIST, { recursive: true });
if (!names.length) {
  for (const f of readdirSync(DIST)) {
    if (/^sb-.*\.zip$/.test(f) && !allSkills.includes(f.slice(0, -4))) {
      rmSync(join(DIST, f));
      console.log(`removed stale ${f}`);
    }
  }
}
for (const name of names.length ? names : allSkills) console.log(`built ${build(name)}`);
