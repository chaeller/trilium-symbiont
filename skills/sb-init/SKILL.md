---
name: sb-init
description: Bootstrap the four-space Trilium Symbiont into an empty Trilium instance from the rulebooks bundled with this skill. Use only when the user explicitly asks to set it up.
---

# Init — build the Trilium Symbiont skeleton

You are operating on a (fresh) Trilium instance via the Trilium MCP server, **and** you have filesystem
access (your client's file-read tool). This skill **bootstraps the empty skeleton** — `_README`,
`_Schema` and the four spaces Daily, Cockpit, Hubs, Sources — and fills the rulebooks and templates from
the files bundled with it. It is the one-time setup for a new instance.

The files **ship with this skill**, in the `assets/` folder next to this `SKILL.md`. The **source
folder** is the folder whose `assets/` you read. Resolve it in this order:
1. A path in the user's request, if given — either a folder containing `assets/`, or the project repo root
   (then use its `skills/sb-init/`).
2. **This skill's own folder** (where this `SKILL.md` lives) — the normal case in every client.
3. `skills/sb-init/` under the current working directory (running from the repo).

Say which source you used. The build specification is **`assets/skeleton.md`**; read it in full. Every
asset it references must exist (`assets/_README.md`, `assets/_Schema-umbrella.md`,
`assets/daily/_Schema.md`, `assets/cockpit/_Schema.md`, `assets/hubs/_Schema.md`,
`assets/sources/_Schema.md`, `assets/templates/day.md`, `assets/templates/week.md`,
`assets/templates/hub.md`, `assets/templates/synthesis.md`). If any is missing, STOP (`🚫`).

## First — safety and idempotency (before creating anything)

1. **Idempotency guard.** `search_notes` for `#sbSpace` (any value). **If any space root exists, STOP**
   and report: the instance is already set up (use `/sb-sync`). Do not touch
   anything.
2. **Bootstrap exception and confirmation.** This skill may create notes directly under `root` (umbrella
   `_Schema` §3, exception `/sb-init`: create only, never edit/move/delete, never touch an existing
   note). **List** what you will create (the six top-level notes and the machinery under each space, from
   `skeleton.md`) and **ask the user to confirm**. If `root` already holds other notes, say so: you will
   only **add** siblings and never touch them.

**Capture the noteId returned by each `create_note`** and use it as the parent for that note's children
and as the target of relations (`~dateTemplate`, `~weekTemplate`, `~ancestor`). **Never hardcode a
noteId.** Create notes **in the order of `skeleton.md`** so the tree order matches. Set attributes with
`set_attribute` right after creating each note (flag labels take an empty value; `label:…` definitions
are labels whose name starts with `label:`).

## Build

Follow `skeleton.md` section by section:

1. **Top level** — `_README`, `_Schema` (with `#sbVersion` from `skeleton.md`), then Daily, Cockpit, Hubs, Sources.
2. **Under Daily** — `_Schema`, `_Templates` with `Day` and `Week`; then the journal labels on the Daily
   root, including `~dateTemplate` → Day and `~weekTemplate` → Week. Create no year, week or day notes.
3. **Under Cockpit** — `_Schema`, `Kanban Board` with its Board labels and promoted card definitions,
   then the saved searches (`type=search`, the query as content **and** as label `#searchString` — the MCP
   tool does not set the label itself — and `~ancestor` → the captured space root
   where `skeleton.md` says so) and `Proposals`.
4. **Under Hubs** — `_Schema`, `_Index`, `_Log`, `_Templates` with `Hub` and `Synthesis`, `Principles`.
5. **Under Sources** — `_Schema`, `_Index`, `_Log`, the three grouping nodes.

**Text templates:** the template files contain no angle-bracket placeholders (Trilium strips `<…>` from
text notes). Copy them as they are.

## Fill the rulebooks verbatim

`_README`, the five `_Schema` notes and the four templates are copied **verbatim** from their files (read
with the file-read tool, write with `create_note`). Do not paraphrase. For the `_Schema` code notes,
compare the content returned by `create_note` with the file; on any difference, fix it with
`set_note_content` before continuing.

## Inheritable attributes

Create these with `set_attribute` and `isInheritable: true`, then check with `get_attributes` that the
flag is set:
- on the **Kanban Board**: every `label:…` card definition (`label:status`, `label:startTime`,
  `label:topic`);
- on the **Daily** root: `#sorted` and `#sortDirection`.

## Verify

1. `get_subtree` from each space root (depth 2) and check the notes, labels, relations and icons against
   `skeleton.md`; check `_README` and `_Schema` directly under `root`.
2. Report what was created (count and tree). Tree order is human-owned — if a note did not land where
   wanted, the user reorders it by drag and drop.
3. Suggest `/sb-lint` as the real proof that the agent finds everything by label (ID-free).
4. Suggest a first `/sb-capture` or `/sb-daily` (creates today's journal note) and `/sb-hub` for the first
   hub.

Do **not** write to any `_Log` for the build itself (setup, not a content mutation).

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
