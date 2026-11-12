---
name: sb-lint
description: "Health-check the Trilium Symbiont: hubs, syntheses, areas, maturity, secrets, untriaged captures, stale sources, legacy attributes. Use when the user asks to lint or check the Symbiont."
---

# Lint — health-check the system

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; read the **Principles** hub page; read the four space `_Schema` notes as needed.
**Version:** if the umbrella `_Schema` does not carry a `#sbVersion` with major version `1` (missing, or another
major version), report as
the first finding that this is an **unsupported legacy instance** and stop — there is no migration path.

Search only with `ancestorNoteId = <space root>`; never report off-limits notes. Exclude `#template`
notes. Notes with `#excludeFromLlm` are invisible to you; never try to reveal them.

**Checks** (report findings grouped, with links):

**System**
- Version state (above); missing machinery (any `_Schema`, `_Index`, `_Log`, `_Templates`, Principles,
  Board, Cockpit views listed in the umbrella appendix); the Daily root's journal configuration
  (`#calendarRoot`, patterns, `~dateTemplate`, `~weekTemplate`) present.

**Daily**
- Captures with `#sbUntriaged` older than 7 days (count, oldest first).
- Day notes that break the journal rule: a `#dateNote` outside the level chain, two notes for one date,
  a week note holding days from different weeks.
- Foreign-looking material in the journal (pasted articles, clips) → propose a move to Sources.

**Cockpit**
- **Originals in Cockpit** other than proposals and tasks on the Board (e.g. a note filed there): propose
  a place. Home-less tasks on the Board are allowed — do not flag them.
- Tasks in Hubs without a Board clone; subtasks carrying `status`.
- Proposals older than 14 days (offer `/sb-review`).

**Hubs**
- Hubs without a Synthesis (except Principles); hubs missing from `Hubs/_Index` or index lines pointing
  to a missing or archived hub; hub pages whose navigation sections miss children.
- Areas or projects not under a hub; projects with no open task and no change for 60 days (propose
  `#archived` or `area`); archived projects with open tasks.
- Hubs that have grown too big (e.g. many direct children of mixed kinds) → propose a sub-hub or area
  split (`/sb-hub`).
- Syntheses and concepts: statements without an evidence link; in-text links (`#root/…`) to a note that
  no longer exists (dangling — Trilium deletes the relations to a deleted note, so compare the note IDs in
  the text with existing notes, not the relations); a linked source newer than the synthesis citing it
  (stale — propose re-ingest; the cited notes are the synthesis's `~internalLink` targets); uncompiled
  corrections (`#sbOrigin=human` newer than their synthesis).
- Unrecorded evidence: a synthesis or concept whose text has in-text links (`#root/…`) but which has
  **no** `~internalLink` relations (written before Trilium recorded links written over MCP). The stale
  and dangling checks cannot see its sources; propose re-saving it (`/sb-hub`, refresh the synthesis).
  Check this with `search_notes` (e.g. `#sbType=synthesis ~internalLink`): `get_attributes` does **not**
  list `~internalLink` relations, so an empty attribute list proves nothing.
- Maturity: `seed` thoughts untouched for 90 days, `draft` thoughts that recur (propose a transition via
  `/sb-review`); Principles hub page missing a one-sentence line for one of its notes.

**Sources**
- Ingest queue length; sources without `~sbAbout`; agent text inside an original (an original edited by
  the agent, or an AI summary not marked `#sbOrigin=ai`). Exclude `#sbIgnore` material from all three
  (it is reference, not part of the queue) — report its count separately if non-empty.

**Security**
- Likely secrets in visible notes (passwords, tokens, keys, IBANs — match patterns, don't quote them):
  propose moving them to a password manager and changing the credentials, or at least `#excludeFromLlm`
  (inheritable when the note has children). They have already reached the AI provider; say so.
  **Count, don't list:** `search_notes` returns a content preview for every hit, so run the keyword
  searches with `limit: 0` (only the count comes back; one search per keyword, e.g. `passwort`, `token`,
  `iban`, or one `note.content *=* …` expression joined with `or`). To let the user go through the hits,
  offer a saved search they open in Trilium, rather than listing titles yourself.

**Legacy and unknown attributes**
- Notes with `#sb*` / `~sb*` attributes the umbrella §4 does not define — especially the legacy ones
  (`#sbCapture`, `#sbPinned`, `~sbRelated`, `#sbType=entity|topic|folder|task|resource|note|source|daily`).
  List note + attribute and flag it (such an instance is unsupported legacy; there is no migration path).

**Do not flag** a missing `#sbType` on tasks, notes, sources, journal notes, proposals or grouping nodes —
there the position or another label fixes the kind.

**Report findings; do not auto-fix.** Propose fixes; on the user's request, file selected findings as
proposals in Cockpit / Proposals or apply confirmed fixes (those are mutations and get logged in
`Hubs/_Log` or `Sources/_Log`). The lint run itself is a read and is not logged.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
