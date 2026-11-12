# _Schema — umbrella rulebook "Trilium Symbiont"

> `#sbType=schema` · `#sbVersion=1.0.0` · The **shared rulebook** of the whole system. The AI agent reads this
> note **first, every session**, before doing anything (find it with `search_notes` for `#sbType=schema`
> and take the hit directly under `root`). Each space has its own `_Schema` (the `#sbType=schema` note
> **within** that space root) with the space-specific rules.
> Tracked source of this file: `skills/sb-init/assets/_Schema-umbrella.md`. Live node: the top-level
> `#sbType=schema` under `root`.

## 0. What this is

"Symbiont" is the whole system: **four spaces** plus two system notes directly under the Trilium
root. One agent works across all of it via the Trilium MCP server; every workflow is **triggered by the
human** (natural language or an `/sb-*` skill).

| Space | `#sbSpace` | Ordered by | Holds | Owner |
|-------|-----------|-----------|-------|-------|
| **Daily** | `daily` | time | the Trilium journal (year / week / day) and the inbox for your own captures | you; the agent writes weekly reviews |
| **Cockpit** | `cockpit` | views | Kanban Board, saved searches, the Proposals queue | clones, searches, proposals and home-less tasks only |
| **Hubs** | `hubs` | topic | hubs with areas, projects, tasks, notes, syntheses, concepts; `Principles` | you (structure); the agent maintains syntheses, concepts, indexes |
| **Sources** | `sources` | origin | immutable foreign sources | you curate, the agent reads |

The tree order is Daily, Cockpit, Hubs, Sources (from day-to-day to look-up).

**The LLM wiki** (Karpathy) is Hubs and Sources together: raw sources = **Sources**, compiled wiki =
syntheses and concepts in **Hubs**, index = `Hubs/_Index` and the hub pages, log = `_Log`, schema = the
`_Schema` notes.

**Three states of content:** knowledge (solid: facts, how-tos; truth lies in sources; the agent compiles),
state (liquid: areas, projects, tasks; truth lies in attributes; the agent manages and summarizes) and
unformed thoughts (gaseous: ideas, feelings, values in the making; truth lies in time; the agent mirrors
and suggests, never rewrites).

## 1. Session start (every session, in this order)

1. Read this note in full.
2. **Version check.** This note's `#sbVersion` is a semantic version (`major.minor.patch`) and must
   have major version `1` (e.g. `1.0.0`, `1.2.3`). If it does not (the label is missing or carries another
   major version), this is an **unsupported instance**: report that and stop (`⚠️`). Do not apply these
   rules to it and do not try to migrate it. Minor and patch releases are backward-compatible.
3. Read the **Principles** hub page (the `#sbType=hub` note titled `Principles` directly under the Hubs
   root) — its page only, not its child notes. Principles are guard rails for the agent: respect them when
   you prioritize, propose or file things.
4. For space-specific work, read that space's `_Schema`.

## 2. Guiding principles

1. **Keep Karpathy's mechanism:** immutable sources → compiled synthesis → index, log, lint.
2. **Position decides the topic; labels only for what position can't express.**
3. **The tree structure belongs to the human.** The agent writes on its own only where `#sbControl=auto`
   applies (§5); it never invents, renames, moves or deletes structure on its own.
4. **Separate sources, link the synthesis.** Origin is an attribute; every statement of a synthesis is
   backed by a source.
5. **Navigation is everywhere**, whoever owns the content.
6. **The agent interprets nothing personal as fact.** Interpretations of feelings or the unconscious stay
   in the conversation or are clearly marked as an AI hypothesis.
7. **Language:** attributes (`#sb*`), skeleton names, skeleton content (`_Schema`, `_README`, templates)
   and skills are English. Your own content (hub names, notes, journal entries) stays in your language.
8. **Scope is a hard boundary** (§3).
9. **Human-triggered:** all workflows run on request (`/sb-*` or plain language). No automation runs on
   its own yet.

## 3. Scope law (hard boundary)

**In scope** (the system):

| Area | Agent's rights |
|------|----------------|
| The four spaces (Daily, Cockpit, Hubs, Sources) and their subtrees | per `#sbControl` (§5) and the space `_Schema` |
| `_README` (directly under `root`) | read; change only via `/sb-sync`, or on explicit request with confirmation |
| `_Schema` (this note, directly under `root`) | read **first every session**; change only via `/sb-sync`, or on explicit request with confirmation (the human approves rule changes) |

**Off-limits** (hard-fail: refuse and report, never ask):
- **Everything else under `root`** — any note or folder the human keeps there, whatever its name.
- **`Hidden Notes`** (Trilium internal).

Rules:
- **Membership by position.** A note is in scope if a space root (`#sbSpace`) is one of its ancestors, or
  if it is `_README` / `_Schema` directly under `root`. A note cloned both inside and outside is in scope
  through its in-scope branch only.
- **Never search from `root`.** Every `search_notes` call passes `ancestorNoteId = <space root>`.
  Off-limits notes never appear in indexes, hubs, syntheses or lint reports. Read one only when the human
  explicitly points to it; never write to it.
- **Nothing is created under `root`**, except by the two exceptions below.

> **Exceptions under `root` (the only ones):**
> - **`/sb-init`** — on an instance with no `#sbSpace` root: **create** `_README`, this `_Schema` and the
>   four space roots, after one explicit confirmation. Create only; never touch an existing note.
> - **`/sb-sync`** — overwrite the **content and `iconClass`** of `_README` and this `_Schema`, and the
>   repo-owned **descriptions** of the skeleton notes `skeleton.md` marks `desc: …` (the four space roots,
>   the two `_Templates` container notes, Cockpit's `Proposals`, the Sources groups), with the repo
>   version of the **same major** `#sbVersion` (and the `#sbVersion` label itself), after a per-note confirmation. Nothing else. Authority comes from
>   this exception naming the notes — not from their `#readOnly` label, which is only a UI marker (§4).

## 4. Attributes (`#sb*`)

One `sb` prefix (never collides with your own attributes). **Truth by label or position, never by title**
(the leading `_` in `_Schema`, `_Index`, `_Log`, `_Templates` only controls sort order).

### `#sbType` — only where position isn't enough (8 values)

| Value | For |
|-------|-----|
| `hub` | a topic or sub-topic (a map for navigation, no end) |
| `area` | an ongoing responsibility, no end |
| `project` | an endeavour with a goal; ends with `#archived` |
| `synthesis` | the agent's compiled summary of a hub |
| `concept` | an agent-written concept page (wiki) |
| `schema`, `index`, `log` | machinery, found ID-free by label |

**No `#sbType`** where something else fixes the kind:
- **Task** — recognized by its `status` label (the Kanban column).
- **Note / resource** — anything without a type is an ordinary note.
- **Source** — its position in Sources.
- **Day and week notes** — Trilium sets `#dateNote` / `#weekNote` (and year/month labels) itself.
- **Proposal** — its position in Cockpit / Proposals.
- **Grouping nodes** — plain notes; the human owns them.

Notes carrying `#template` are templates, never content: exclude them from every search, index and lint.

### Other labels and relations

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `#sbSpace` | defines a space (space roots only) | `daily`, `cockpit`, `hubs`, `sources` |
| `#sbVersion` | system version (on this note only), semantic version | `1.0.0` (skills require major `1`) |
| `status` | task and Kanban column (Trilium board attribute) | the Board's columns — human-owned, read them off the Board |
| `#sbMaturity` | maturity of a thought | `seed`, `draft`, `mature` |
| `#sbUntriaged` | a capture not yet processed | flag |
| `#sbOrigin` | who authored the content | `external`, `human`, `ai`, `mixed` |
| `#sbControl` | who may change the note (§5) | `auto`, `propose`, `manual` (default `manual`) |
| `#sbIngested` | a source has been compiled into a synthesis or concept | flag |
| `#sbIgnore` | reference material in Sources: never ingested, compiled, indexed or lint-flagged; the agent reads it only on explicit request (soft exclude, inheritable; weaker than `#excludeFromLlm`) | flag |
| `~sbAbout` | topic membership from outside the hub (a capture, a source) | relation → hub |
| `~sbSupersededBy` | replacement (deprecate instead of delete) | relation → successor |
| `#archived` | done, hidden (Trilium-native) | replaces the old archive folder |
| `#readOnly` | opens in read mode (Trilium-native; a UI flag, does not block MCP writes) | machinery and agent-written notes |
| `#excludeFromLlm` | hidden from every MCP tool and Trilium's AI chat (Trilium-native, enforced by Trilium; §7) | sensitive notes; inheritable for a subtree |

Legacy, no longer used: `#sbCapture`, `#sbPinned`, `~sbRelated`, `#sbType` values `entity`, `topic`,
`folder`, `task`, `resource`, `note`, `source`, `daily`. An instance still carrying them is unsupported
legacy; `/sb-lint` reports them.

## 5. Control (`#sbControl`)

The **effective control** of a note is the `#sbControl` value on the note itself or, if absent, on its
nearest ancestor that has one (also via a `~template`); with none at all it is `manual`. The agent
resolves this itself by walking the parents — no Trilium inheritance flag is needed.

| Value | The agent may… |
|-------|----------------|
| `auto` | write on its own during a skill run (syntheses, concepts, indexes, weekly reviews) |
| `propose` | only create a proposal note in Cockpit / Proposals; it acts after your confirmation (`/sb-review`) |
| `manual` | change it only on your explicit request |

Your direct intervention is always possible — by hand or by prompt. **Navigation** (indexes, the link
sections of hub pages) is kept current whatever the control (principle 5), but the agent never edits a
human-written paragraph there. Corrections to agent-written notes are captured as a source with
`#sbOrigin=human` and win on the next compile (Hubs `_Schema`).

## 6. Logging, actors, trust

- **`_Log` notes** (`#sbType=log`, code notes) are append-only, oldest first. One line per **mutation**:
  `YYYY-MM-DD HH:MM · actor · [operation] what changed`. Reads (query, lint report) are not logged.
- **Where:** `Hubs/_Log` logs every agent mutation in Hubs and Cockpit (tasks, syntheses, hubs,
  proposals); `Sources/_Log` logs mutations in Sources. Daily has no `_Log`
  (it is your journal; Trilium revisions are the backstop).
- **Actors:** `human:<id>` for you, `<client>/<workflow>` for the agent (e.g. `claude/ingest`,
  `kiro/triage`).
- **Trust = traceability:** provenance (in-text links, recorded by Trilium as `~internalLink`) and answers
  that cite the notes they used. There is
  no "verified" flag.
- **Concurrency lock (dormant).** Workflows are human-triggered, so no lock is used; Trilium revisions are
  the backstop. Do not set or check `#sbLock` until automation arrives.
- **Concurrent edits (UI vs. agent).** Trilium's editor autosaves the **whole** note body, so a note open
  in the UI with unsaved edits can overwrite an agent `set_note_content` (last-writer-wins) — and vice
  versa. The agent cannot control the UI (no MCP/ETAPI command closes, refreshes or refocuses a tab).
  Therefore, on every **content rewrite** of an existing note:
  1. **Prefer `append_to_note`** when the change is additive (a new paragraph, a meeting note, a log
     line): it does not discard the user's concurrent text even if it races.
  2. **Verify after a full rewrite.** Immediately re-read the note and confirm the change is present. If
     it is **not** (a concurrent UI save clobbered it), do **not** report success: re-read the current
     body, re-apply the change onto it (merge, don't blindly re-push), retry, and report the collision.
  3. **Warn on a fresh edit.** If the note's `dateModified` is only seconds old (it looks actively
     edited), warn and suggest clicking away from the note before writing.
  This is the interactive counterpart to the dormant `#sbLock`; it needs no label and applies to every
  skill that rewrites a note body.

## 7. Security

- Secrets belong in a password manager, not in notes.
- **Sensitive notes get `#excludeFromLlm`** (Trilium-native). Trilium then hides the note from every MCP
  tool — search, child lists, reads, writes — and from its own AI chat, so it never reaches the agent or the
  AI provider. The label covers only that note unless it is **inheritable**: set it inheritable on the root
  of a sensitive subtree. A rule the agent merely follows is not enough: even a search returns content
  previews.
- **Never try to reveal an excluded note**, e.g. with search queries that test its title or content
  through a visible note (Trilium's search still evaluates such conditions).
- A Trilium protected note is unreadable over MCP only while the protected session is locked.
- To keep something out of the system entirely, put it outside the spaces directly under `root`.

## 8. Retrieval in stages

1. **Stage 0:** `Hubs/_Index` — one line per top-level hub.
2. **Stage 1:** a hub page — synthesis plus annotated links; enough for most questions.
3. **Stage 2:** a detail note — only when needed.

Additionally: **attribute queries** for state (`status`, `#sbType=area|project`, due dates) and **week
notes** as the entry point to the timeline instead of hundreds of day notes.

## 9. Golden rules

1. **Scope above all:** act only in the four spaces, `_README` and `_Schema`; hard-fail on anything else,
   never ask.
2. **Read first:** this note, then the Principles hub page, then the space `_Schema`.
3. **The tree is yours:** the agent never creates, renames, moves or deletes hubs, areas, projects or
   grouping nodes on its own — only on request (it may propose them).
4. **Respect `#sbControl`** on every write; never try to reach notes hidden by `#excludeFromLlm`.
5. **Log every mutation** in the right `_Log`; never rewrite a log.
6. **Link notes, don't name them:** content notes refer to other notes with a clickable Trilium link.
   (The rulebooks themselves stay ID-free.)
7. When unsure *inside* scope — ask. An action *outside* scope is never asked about; it is refused.

## Appendix — finding the notes (no hard IDs)

The system is **ID-free**: the agent finds notes by label and position, never by noteId, so the same
rulebooks work on every instance.

| To find… | Search |
|----------|--------|
| this umbrella `_Schema` | `#sbType=schema`, the hit directly under `root` |
| `_README` | the note titled `_README` directly under `root` |
| a space root | `#sbSpace=daily\|cockpit\|hubs\|sources` |
| a space's `_Schema` | `#sbType=schema` within that space root |
| `_Index` / `_Log` | `#sbType=index` / `#sbType=log` within Hubs or Sources |
| the Principles hub | `#sbType=hub` titled `Principles`, directly under the Hubs root |
| the Kanban Board | `#viewType=board` within Cockpit |
| templates | title + position: `Daily/_Templates/Day`, `Daily/_Templates/Week`, `Hubs/_Templates/Hub`, `Hubs/_Templates/Synthesis` |
| a day / week note | `#dateNote=YYYY-MM-DD` / `#weekNote` within Daily (see Daily `_Schema`) |
| Cockpit views | title + position: `Untriaged`, `Proposals`, `Areas`, `Due & blocked`, `Ideas & thoughts` |
