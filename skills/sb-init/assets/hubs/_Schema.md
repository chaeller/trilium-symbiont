# Hubs — _Schema (space rulebook)

> `#sbType=schema` · Rules for the **Hubs** space: topics with their areas, projects, tasks, notes,
> syntheses and concepts — the compiled half of the LLM wiki. The umbrella `_Schema` (the top-level
> `#sbType=schema`, file `skills/sb-init/assets/_Schema-umbrella.md`) applies first.
> Tracked source: `skills/sb-init/assets/hubs/_Schema.md`. Live node: the `#sbType=schema` note within
> the Hubs root (`#sbSpace=hubs`).

## 0. Purpose

Hubs are the **map** (navigation by topic) across all three states of content: knowledge, state and
unformed thoughts. A hub is the counterpart of Karpathy's index page. Areas and projects are what you
**do**. The agent compiles syntheses and concepts from sources and keeps the indexes current; the
structure is yours.

## 1. Structure

```
Hubs                      #sbSpace=hubs
├── _Schema               #sbType=schema #readOnly               (this note)
├── _Index                #sbType=index #sbControl=auto #readOnly   one line per top-level hub
├── _Log                  #sbType=log #readOnly                   audit trail (Hubs, Cockpit)
├── _Templates            template container
│   ├── Hub               #template
│   └── Synthesis         #template
├── Principles            #sbType=hub #sbControl=manual           your values and rules
└── a hub                 #sbType=hub
    ├── Synthesis         #sbType=synthesis #sbControl=auto #readOnly
    ├── Open              saved search: open tasks below the hub
    ├── an area           #sbType=area
    │   ├── a project     #sbType=project
    │   │   └── a task    status=…
    │   └── a note
    ├── a sub-hub         #sbType=hub
    ├── a concept         #sbType=concept #sbControl=auto #readOnly
    └── a note            (no type)
```

## 2. Hub, area, project, task, note

| Kind | Marker | What it is | Ends | Lives under | Contains |
|------|--------|-----------|------|-------------|----------|
| **Hub** | `#sbType=hub` | a topic, a map | no | Hubs or a hub | sub-hubs, areas, projects, notes |
| **Area** | `#sbType=area` | a responsibility | no | a hub | projects, tasks, notes |
| **Project** | `#sbType=project` | an endeavour with a goal | yes → `#archived` | a hub or an area | tasks, notes |
| **Task** | `status` label | a to-do, cloned onto the Board | yes | an area, a project or a hub — or directly on the Board if it has no topic | subtasks (no `status`) |
| **Note** | no type | resource, how-to, thought | — | anywhere | — |

- **Sub-hubs** are for sub-topics (e.g. "Concerts"), **areas** for responsibilities (e.g. "Members").
- Only **hubs** get a synthesis and an `_Index` line; areas and projects appear in their hub's synthesis.
- If a project becomes permanent, only the label changes (`project` → `area`); the note stays put.
- **Hubs, areas and projects are created by you.** The agent creates one only on explicit request
  (`/sb-hub`, or "new project X under Y"); it proposes one when a hub grows too big.
- **Nesting:** hubs may have sub-hubs (2–3 levels recommended). A note sits under the **most specific**
  hub; parent hubs aggregate upwards. Multi-membership via Trilium clones, sparingly.
- **Membership:** a note belongs to a topic if it lies **under the hub** or **points to it with
  `~sbAbout`** (journal captures, sources, notes during migration).
- Task mechanics (Board, columns, clones, priority): Cockpit `_Schema`.

## 3. The hub page

A hub note's own content is its page — stage 1 of retrieval. It is created from the **Hub** template:

| Section | Written by | Content |
|---------|-----------|---------|
| **Purpose** | you | one or two sentences on what the hub is about |
| **Knowledge** | agent (navigation) | links to notes, concepts and sources (`~sbAbout`), each with a one-line description |
| **State** | agent (navigation) | links to areas and projects, and a link to the hub's `Open` search |
| **Thoughts** | agent (navigation) | links to thoughts and captures with their date — **no paraphrase** |
| **Related hubs** | agent (navigation) | links to hubs that share notes or sources |

The navigation sections are kept current by `/sb-hub` and `/sb-ingest` whatever the hub's control
(umbrella §5); the agent never edits the Purpose paragraph.

**Open** is a saved search child of each hub: notes with `status` below the hub that are not archived
(query `#status #!archived`, `~ancestor` → the hub). A finished task is deleted or archived, never moved
to a "done" column (Cockpit `_Schema` §2), so this query does not depend on the Board's columns.

## 4. Synthesis and concepts (the compiled wiki)

- **Synthesis:** one per hub, the child note titled `Synthesis`, created from the **Synthesis**
  template; `#sbType=synthesis`, `#sbControl=auto`, `#readOnly`. It summarizes the hub across knowledge,
  state and thoughts, in the agent's own words.
- **Concept:** a page on one idea or entity worth its own note; `#sbType=concept`, `#sbControl=auto`,
  `#readOnly`; lives under the most specific hub; a sub-concept is a child of its concept; clone it for a
  second hub.
- **Evidence:** every statement is backed by an **in-text link** to the note it draws on — sources in
  Sources **and** your own notes in the hub (everything you own is a source). The in-text links are the
  evidence: Trilium records each one as an `~internalLink` relation, so the set of cited notes is
  queryable. There is no separate source relation: a second list next to the text would drift from it.
  Agent-written summaries in Sources (`#sbOrigin=ai`) are reading aids, not evidence: cite their original.
- **Thoughts** (`#sbMaturity` notes) are linked with their date, never paraphrased or interpreted
  (umbrella principle 6).
- **Corrections:** if something in a synthesis or concept is wrong, you add a note with
  `#sbOrigin=human` as a **child of the note it corrects** (title `Correction: …`). The next compile
  reads all corrections first; they win over other sources, and the corrected statement cites them.
- **Hands off:** if you set the effective control of a synthesis or concept to `propose` or `manual`
  (e.g. after editing it by hand), the agent does not overwrite it — it proposes changes instead.
- **Deprecate, don't delete:** a concept with a successor gets `~sbSupersededBy` → the successor and
  stays visible. Delete only on your explicit request.
- **Never** draw on anything outside the system.

## 5. `_Index`

`Hubs/_Index` (`#sbType=index`, `#sbControl=auto`, `#readOnly`): **one line per top-level hub** — a
clickable link and a one-line description. Sub-hubs are listed on their parent's hub page, not here.
Updated whenever a hub is created, renamed, archived or its synthesis changes its gist. It is stage 0 of
retrieval: keep it short.

## 6. Principles

- **What:** matured personal values, rules and attitudes (e.g. "Family comes first at weekends", "Self-host
  rather than cloud", "No passwords in notes").
- **How they arise:** a thought appears as a capture (`#sbMaturity=seed`) → it returns or is developed
  (`draft`) → the agent proposes adopting it as a Principle (a proposal) → you decide and word it → it
  lives as a note under the Principles hub (`mature`).
- **The hub page lists every Principle as one sentence**, with a link to its note; reasons and examples
  live in the child notes. The agent reads this page at the start of every session (umbrella §1).
- `#sbControl=manual`: the agent never writes to the Principles hub or its notes itself, only via
  proposals. The Principles hub has no synthesis and no `Open` search.
- Each Trilium instance has its own Principles.

## 7. Maturity

Unformed content carries `#sbMaturity` (`seed` → `draft` → `mature`). The agent **proposes** transitions,
it never performs them on its own:
- idea → **project** (state),
- experience / insight → **knowledge** (a note in the fitting hub),
- recurring value → **Principle** (§6).

## 8. Operations

| Trigger | Does |
|---------|------|
| ingest (`/sb-ingest`) | compile sources into syntheses and concepts; cite with in-text links; `#sbIngested` on the sources; update hub pages and `_Index`; log |
| query (`/sb-query`) | stage 0 → 1 → 2 retrieval, answer with citations; a worthwhile answer may become a concept (on request, logged) |
| hub (`/sb-hub`) | create a hub on request (template + Synthesis + Open), propose a split, refresh a synthesis |
| review (`/sb-review`) | process proposals, review areas, propose maturity transitions |
| lint (`/sb-lint`) | health check (see the skill); report, don't auto-fix |
| task (`/sb-task`) | task mechanics (Cockpit `_Schema`) |

## 9. Golden rules (Hubs)

1. The structure is yours: hubs, areas, projects and grouping nodes only on request.
2. Every synthesis statement is backed by an in-text link to its source.
3. Respect the effective control; corrections win; deprecate, don't delete.
4. Thoughts are linked, never paraphrased or interpreted.
5. Navigation (hub pages, `_Index`) stays current.
6. Log every mutation in `Hubs/_Log`.

## Appendix — finding the notes

| To find… | How |
|----------|-----|
| Hubs root | `#sbSpace=hubs` |
| this `_Schema` / `_Index` / `_Log` | `#sbType=schema` / `index` / `log` within Hubs |
| all hubs / areas / projects | `#sbType=hub` / `area` / `project` within Hubs (exclude `#template`) |
| a hub's synthesis | `#sbType=synthesis` among the hub's children |
| Principles | `#sbType=hub` titled `Principles` directly under Hubs |
| notes about a hub from elsewhere | notes with `~sbAbout` → the hub (search within Daily and Sources) |
| templates | `_Templates/Hub`, `_Templates/Synthesis` (title + position) |
