---
inclusion: always
---

# Steering — Trilium Symbiont (Daily · Cockpit · Hubs · Sources)

> **Role:** always-on rules + natural-language routing for the **"Trilium Symbiont"** — an
> agent-assisted personal knowledge-management system with **four spaces** plus the system notes
> `_README` and `_Schema` directly under the Trilium root `root`. This file only routes; authoritative are
> the **umbrella `_Schema`** (`#sbType=schema`, top level) and the `_Schema` note inside each space.
>
> **Install:** always-on, per client — see the repo's `docs/install.md` (Kiro: `~/.kiro/steering/`; Claude Code:
> imported from `~/.claude/CLAUDE.md`; Claude Desktop: project instructions).
> **Prerequisite:** Trilium MCP server connected.

---

## The four spaces

| Space | `#sbSpace` | Purpose |
|-------|-----------|---------|
| **Daily** | `daily` | the Trilium journal (year / week / day) and the inbox for your own captures |
| **Cockpit** | `cockpit` | views: Kanban Board (clones), saved searches, Proposals queue |
| **Hubs** | `hubs` | topics with areas, projects, tasks, notes, syntheses, concepts; Principles |
| **Sources** | `sources` | immutable foreign sources |

## Trigger

When I mention my **"Symbiont"** (or my **"Second Brain"**), a space name (**Daily/Cockpit/Hubs/Sources**),
a hub, or ask to capture / triage / research / ingest / query / lint / manage tasks / review, **first**:

1. Load the umbrella rulebook: `search_notes` for `#sbType=schema` and take the hit **directly under
   `root`**. Read it in full.
2. Check its `#sbVersion`: major version `1` (e.g. `1.0.0`) → continue. Anything else (missing, or
   another major version) → this is an unsupported instance: follow the umbrella's session-start rule,
   report that and stop.
3. Read the **Principles** hub page (the `#sbType=hub` note titled `Principles` directly under Hubs) —
   the page only. Principles are guard rails for prioritizing and proposing.
4. For space-specific work, read that space's `_Schema` (the `#sbType=schema` note within the space root).
5. Follow those rulebooks for the whole task.

If you cannot find an umbrella `_Schema`, say so and stop — do not improvise a structure.

## Scope (hard rule)

- In scope: the **four spaces** and their subtrees, plus `_README` and `_Schema` directly under `root`
  (both read-only except via `/sb-sync` or my explicit request with confirmation).
- **Everything else under `root`** (any note or folder I keep there) and `Hidden Notes` are off-limits:
  **hard-fail** (refuse + report) on any create/edit/move/delete there. Never ask, never cross the
  boundary.
- Never search from `root`; always `ancestorNoteId = <space root>`.
- Respect `#sbControl` (`auto` / `propose` / `manual`, default `manual`) and never try to reveal notes
  hidden by `#excludeFromLlm` (Trilium keeps them from you).

## Intent routing

| I say something like… | Workflow |
|-----------------------|----------|
| "remember this", "capture this", "note this down" | **`/sb-capture`:** child note of today's journal day with `#sbUntriaged`. Don't classify yet. |
| "triage", "sort my captures / inbox" | **`/sb-triage`:** open captures → hub/area/project, task, stays in the journal (`~sbAbout`), Sources, or discard. |
| "research X", "look this up on the web for the Symbiont" | **`/sb-research`:** verbatim originals into Sources, separate `#sbOrigin=ai` summary. |
| "ingest", "update the synthesis of X" | **`/sb-ingest`:** compile Sources into hub syntheses and concepts, every statement linked to its source. |
| "what do I know about X", "what's open in X" | **`/sb-query`:** staged retrieval (`Hubs/_Index` → hub page → details), with citations. |
| "new task", "set status", "move the task to X" | **`/sb-task`:** task under a hub/area/project, clone on the Board; ask for a home if none is named. |
| "today's daily", "journal", "weekly review" | **`/sb-daily`:** today's day note, or the weekly review in the week note. |
| "new hub X", "refresh the hub page", "this hub is too big" | **`/sb-hub`:** create on request, refresh navigation or synthesis, propose a split. |
| "review", "proposals", "areas review" | **`/sb-review`:** decide proposals one by one, areas review, maturity and Principle candidates. |
| "lint", "check the Symbiont" | **`/sb-lint`:** health check, report only. |
| "set up / sync the instance" | **`/sb-init`** (empty instance), **`/sb-sync`** (repo → live, same major version). |

When ambiguous, **ask** (within scope) before writing or moving.

## Defaults

- **The tree is human-owned:** hubs, areas, projects and grouping nodes are created only on my request;
  the agent proposes them.
- **Priority** = card order on the Board (I drag; the agent only suggests).
- **Every agent mutation** goes into the right `_Log` (`Hubs/_Log`, or `Sources/_Log` for Sources); logs
  are append-only. Daily has no `_Log`.
- **The agent interprets nothing personal as fact.** Thoughts are linked with their date, never
  paraphrased.
- **Link notes, don't name them.** When a note you write refers to another note in the system, insert a
  **clickable Trilium link** — Markdown `[Title](#root/<noteId>)` — not a plain name or path. It is
  clickable, follows the target on rename/move, and shows in backlinks. **Exception:** the rulebooks
  (`_Schema`, `_README`, this steering, skills) stay **ID-free** — they reference notes by label/position
  only, so they work on every instance.

## End-of-run status marker

End **every** `/sb-*` skill run (and any Symbiont task) with **exactly one** status marker on its own
final line, so I can see at a glance whether you're done or waiting on me:

| Marker | Use when |
|--------|----------|
| `✅ Done` | finished; nothing is required from me |
| `❓ Needs your answer` | you asked a question and are waiting for my reply before continuing |
| `⏸️ Awaiting confirmation` | you proposed an action and need my "yes" before executing it |
| `⚠️ Done with caveats` | finished, but with warnings/partial results I should read |
| `🚫 Refused (out of scope)` | a requested target was outside the system — refused per the scope law |

Pick the single marker that matches the run's actual end state. If you both did something **and** now need
my input, use the marker for what you're **waiting on** (`❓`/`⏸️`), not `✅`.

---

### Natural language vs. slash

This file makes plain-text prompts work. For deliberate invocation, operation-centric slash skills exist
(installed per client, all under the **`sb-`** prefix): **`/sb-capture`**, **`/sb-triage`**,
**`/sb-research`**, **`/sb-ingest`**, **`/sb-query`**, **`/sb-lint`**, **`/sb-task`**, **`/sb-daily`**,
**`/sb-hub`**, **`/sb-review`**, and for setup and maintenance **`/sb-init`** and **`/sb-sync`**.
Each loads the umbrella `_Schema` and the Principles page first, plus the relevant
space `_Schema`.
