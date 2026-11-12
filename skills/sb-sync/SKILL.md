---
name: sb-sync
description: "One-way update of a live Symbiont from the repo (same version): show diverged rulebooks, templates and icons, apply only what the user confirms. Use when the user asks to sync the instance."
---

# Sync — pull repo changes into a live instance (one-way, same version, opt-in)

You operate on an **existing** Trilium Symbiont via the Trilium MCP server, **and** you have filesystem
access (your client's file-read tool). This skill **compares the repo template to the live instance** and
lets the user **choose, item by item, what to pull from the repo into the live notes**. It is strictly
**one-way (repo → live)** — it never writes from the live instance back to the repo and never edits the
repo. It works **within one major version** (`#sbVersion` `1.x.y`).

**First**, load the umbrella `_Schema` (`#sbType=schema`, directly under `root`) and follow its scope law
(the top-level `_README` and `_Schema`, and the repo-owned skeleton descriptions, may be updated only
under the **`/sb-sync` exception**: repo content of the same major version, explicit per-note confirmation). **Repo assets** — resolve their folder in
this order:
1. A path in the user's request: a folder containing the assets, or the repo root (then use its
   `skills/sb-init/assets/`).
2. `skills/sb-init/assets/` under the current working directory (running from the repo).
3. The **installed `sb-init` skill's** `assets/` folder (a sibling of this skill's folder) — the case in
   Claude Desktop, which can't read the repo; it is as current as the last skill install/upload.

Say which source you used; if it has no `skeleton.md`, STOP (`🚫`).

## Preconditions

1. **An instance exists.** `search_notes` for `#sbSpace`; if no space root exists, STOP and point to
   `/sb-init`.
2. **Same major version.** Compare the live umbrella `_Schema`'s `#sbVersion` with the version in the
   repo's `skeleton.md` (semantic version, e.g. `1.0.0`). Missing or a different **major** version → STOP
   and report that this is an unsupported instance (`⚠️`); do not sync. Same major but a different
   minor/patch is a normal sync: list it as an item (`#sbVersion — live: x  repo: y`) and, when the user
   confirms, set the live label to the repo value.

## What is in scope — and what is not

**In scope (repo is the source of truth):**
1. **Rulebook text** — `_README` ↔ `assets/_README.md`; umbrella `_Schema` ↔
   `assets/_Schema-umbrella.md`; the `#sbType=schema` note within each space ↔
   `assets/daily/_Schema.md`, `assets/cockpit/_Schema.md`, `assets/hubs/_Schema.md`,
   `assets/sources/_Schema.md`.
2. **Templates** — `Daily/_Templates/Day` ↔ `assets/templates/day.md`, `Daily/_Templates/Week` ↔
   `assets/templates/week.md`, `Hubs/_Templates/Hub` ↔ `assets/templates/hub.md`,
   `Hubs/_Templates/Synthesis` ↔ `assets/templates/synthesis.md`.
3. **Skeleton descriptions** — the repo-owned description body of the notes `skeleton.md` marks
   `desc: …`: the four space roots (Daily, Cockpit, Hubs, Sources), the two `_Templates` **container**
   notes (under Daily and Hubs), Cockpit's `Proposals`, and the Sources groups `Articles & clips`,
   `Documentation`, `Research`. Each ↔ its description in `skeleton.md`. Find each by title + position as
   listed there (the human is not meant to rename them); if one is missing or renamed, report it and
   skip, don't guess. The template **leaf** notes stay hand-editable and are covered by item 2 only.
   (Authority to overwrite these comes from the scope law's `/sb-sync` exception naming them, **not** from
   their `#readOnly` label — `#readOnly` is a UI marker and does not gate sync. Background
   (optional reading): [ADR 0001](https://github.com/chaeller/trilium-symbiont/blob/main/docs/adr/0001-sync-owns-skeleton-descriptions.md).)
4. **Skeleton icons** — the `iconClass` of every note listed in `skeleton.md`, compared to the value
   there.
5. **Steering file (on disk, client-specific, optional)** — the installed steering file ↔ the repo's
   `steering/trilium-symbiont.md`. On Kiro/Claude Code the steering is meant to be a **live link** to
   the repo, so normally there is nothing to sync; this item only matters when the install degraded to a
   **plain copy** (e.g. a Windows symlink that needed admin and fell back to a copy) and that copy has
   drifted. Locate the installed file from the user's request, else the folder your client installs
   always-on steering into (see the repo's `docs/install.md` for where that is per client).
   **Skip this item silently** when the target does not exist (a client that pastes the steering into its
   instructions rather than onto disk has nothing to sync) or when it is already a
   **symlink/junction** (already live). Offer a pull **only** when it is a plain file whose content
   differs. When you apply it, also tell the user the durable fix — relink it (enable Windows Developer
   Mode or elevate once, then re-create the symlink) so future steering edits stay live and this check
   becomes a no-op.
6. **Installed skill copies (on disk, client-specific, optional)** — the installed `sb-*` skill folders
   ↔ the repo's `skills/sb-*/` (each `SKILL.md` and any `assets/` files). As with the steering file,
   clients that **link** the skills keep them live, so there is normally nothing to sync; this matters
   only where a skill was installed as a **plain copy** that has since drifted. Locate the installed
   skills from the user's request, else the folder your client installs skills into (see the repo
   `docs/install.md`). For **each** installed skill compare it to its repo namesake. **Skip
   silently** the skills that are **symlinks/junctions** (already live) and the whole item when there is
   nothing on disk to compare. **Report, don't touch,** skills a client holds in a form the agent cannot
   write (e.g. uploaded ZIP bundles): say which repo skills changed and that the bundle must be
   rebuilt/re-uploaded per `docs/install.md`. Offer a pull **only** for installed skills that are plain copies
   whose content differs; a repo skill with **no** installed counterpart is a **new** skill — report it
   as "not installed" and point to the install step in `docs/install.md` rather than creating it (the installed skill
   set is the user's choice). When you apply, name the durable fix (relink) as above.

**Not in scope — never auto-change (human-owned, instance-specific)**, only mention when different:
- Board columns and card attributes, the queries of the saved searches, the journal configuration on the
  Daily root (patterns, week level, sorting).
- The tree structure (which notes exist, their order and titles) and every content note (hubs, notes,
  syntheses, sources, journal notes, the Principles page).

**Not in scope — data migrations.** If an attribute's handling changed, the rulebook text updates here,
but existing notes keep the old attribute. `/sb-lint` reports such drift.

## Flow — report, confirm per item, apply

### 1. Report
For each in-scope item read the repo file and the live note and compare normalized content (ignore pure
whitespace and Markdown-vs-HTML rendering noise; ignore live-only in-text `#root/…` links — the repo is
ID-free). For each item say: identical, or **what differs** (which sections). For icons list
`Note — live: x  repo: y`. For the steering file, state whether it is a live link (nothing to do), absent
(skipped), or a diverged copy. For installed skill copies, do the same per skill and note any that are
links (skipped), ZIP-bundled (reported, not touched), or not installed (a new skill). Present a compact
**divergence report** grouped as Rulebooks / Templates / Icons / Steering file / Installed skills, plus a
short "instance-specific, left as-is" list.

### 2. Confirm (per item)
Offer each divergence and **wait for the user's choice** (per file and per icon, or "all rulebooks" /
"all icons" if the user says so). Nothing changes without an explicit yes. Keeping a live value (e.g. a
deliberately customized template) is a normal choice.

### 3. Apply (only what was confirmed)
- **Rulebooks and templates:** write the repo file content into the live note (`set_note_content`).
  Before replacing a note that holds live-only in-text links, ask whether to keep them.
- **Icons:** `set_attribute iconClass` to the repo value.
- **Version label:** `set_attribute sbVersion` on the umbrella `_Schema` to the repo value (same major only).
- **Steering file:** overwrite the installed **copy** on disk with the repo file's content (a filesystem
  write, not an MCP call). Only ever write the installed copy — never the repo file, and never when the
  target is a symlink/junction (that is already live).
- **Installed skill copies:** for each confirmed skill, overwrite the installed **copy** with the repo
  skill's files (`SKILL.md` and any `assets/`) — a filesystem write. Only ever write installed copies,
  never the repo, never a link. Do not create skills that are not installed, and do not attempt to write
  ZIP-bundled skills (report those for manual rebuild/re-upload).
- Touch nothing else. Do not write to a `_Log` (maintenance, not a content mutation). Do not reorder or
  rename anything.

## Boundaries
- One-way only: repo → live. Never edit repo files; never derive repo changes from the live instance.
  This holds for the on-disk artifacts too — only the installed **copies** (steering file, skill folders)
  are ever written, never the repo originals.
- Scope law applies: the four spaces, `_README`, `_Schema`, and the repo-owned skeleton descriptions
  (`skeleton.md` `desc: …` notes); everything else under `root` is off-limits. The installed steering
  file and installed skill copies are the **on-disk** items in scope (repo artifacts), and only to pull
  repo → installed copy.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
