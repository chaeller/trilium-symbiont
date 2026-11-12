# Skeleton — the tree (build specification)

> The single source for the tree `/sb-init` builds and the icons `/sb-sync` compares.
> Version: `#sbVersion=1.0.0`. Asset paths are relative to this file's folder.
> Notes are listed **in build order**; build order = tree order. Flag labels (e.g. `readOnly`) take an
> empty value. Relations point to notes created earlier in the build (use the captured noteIds — never a
> hard ID in this file).

## Top level (directly under `root`)

| # | Title | Type | Content | Labels / relations | Icon |
|---|-------|------|---------|--------------------|------|
| 1 | `_README` | text | `assets/_README.md` | `#readOnly` | `bx bx-info-circle` |
| 2 | `_Schema` | code, `text/markdown` | `assets/_Schema-umbrella.md` | `#sbType=schema`, `#sbVersion=1.0.0`, `#readOnly` | `bx bx-paragraph` |
| 3 | `Daily` | text | `desc: Daily` (below) | `#sbSpace=daily`, `#readOnly`, journal labels (below) | `bx bx-calendar` |
| 4 | `Cockpit` | text | `desc: Cockpit` (below) | `#sbSpace=cockpit`, `#readOnly` | `bx bx-tachometer` |
| 5 | `Hubs` | text | `desc: Hubs` (below) | `#sbSpace=hubs`, `#readOnly` | `bx bx-network-chart` |
| 6 | `Sources` | text | `desc: Sources` (below) | `#sbSpace=sources`, `#readOnly` | `bx bx-library` |

Trilium stores text notes as HTML and shifts headings one level down (`#` → `##`); that is expected.

### Descriptions (repo-owned, synced by `/sb-sync`)

The notes marked `desc: …` below carry a short, human-facing intro whose text is **owned by the repo**:
`/sb-init` seeds it, `/sb-sync` keeps it current (same major `#sbVersion`, per-note confirmation), and each such
note carries `#readOnly` as the "don't hand-edit" marker. Background (optional reading):
[ADR 0001](https://github.com/chaeller/trilium-symbiont/blob/main/docs/adr/0001-sync-owns-skeleton-descriptions.md).
Identify each note by title + position (as listed here); the human is not meant to rename them. The
template **leaf** notes (`Day`, `Week`, `Hub`, `Synthesis`) are **not** in this set — they stay
hand-editable.

| Key | Note | Description content |
|-----|------|---------------------|
| `desc: Daily` | `Daily` | Your journal, ordered by time: year → week → day, plus the captures that land here first. Durable knowledge lives in Hubs and Sources; the journal links to it. |
| `desc: Cockpit` | `Cockpit` | Views onto the system, not content: the Kanban Board, saved searches and the Proposals queue. |
| `desc: Hubs` | `Hubs` | The topic map: hubs with their areas, projects, tasks, notes, syntheses and concepts, plus the Principles. The compiled half of the wiki. |
| `desc: Sources` | `Sources` | Material you did not write — articles, documentation, research — kept immutable and ordered by origin. The raw half of the wiki. |
| `desc: _Templates` | `_Templates` (Daily and Hubs) | Templates for the notes this space creates. The container is repo-owned; the individual templates inside are yours to adjust. |
| `desc: Proposals` | `Proposals` (Cockpit) | Pending agent proposals for notes under `#sbControl=propose`. Decide them with `/sb-review`. |
| `desc: Articles & clips` | `Articles & clips` (Sources) | Web articles and clippings, stored verbatim with their URL and retrieval date. |
| `desc: Documentation` | `Documentation` (Sources) | Manuals, specs and reference works. |
| `desc: Research` | `Research` (Sources) | Research results: the original material alongside the agent's `#sbOrigin=ai` summary. |

## Under Daily

| Title | Type | Content | Labels / relations | Icon |
|-------|------|---------|--------------------|------|
| `_Schema` | code, `text/markdown` | `assets/daily/_Schema.md` | `#sbType=schema`, `#readOnly` | `bx bx-paragraph` |
| `_Templates` | text | `desc: _Templates` | `#top`, `#readOnly` | `bx bx-layout` |
| ↳ `Day` (under `_Templates`) | text | `assets/templates/day.md` | `#template` | `bx bx-calendar-event` |
| ↳ `Week` (under `_Templates`) | text | `assets/templates/week.md` | `#template`, `#sbControl=auto` | `bx bx-calendar-week` |

**Journal labels on the Daily root** (the defaults — the human may change them; skills read the live
values, Daily `_Schema` §2):

| Attribute | Value |
|-----------|-------|
| `#calendarRoot` | (flag) |
| `#enableWeekNote` | (flag) |
| `#weekPattern` | `{year}-{shortWeek3}` |
| `#datePattern` | `{isoDate} {weekDay}` |
| `#sorted` | (flag) — **inheritable** (`set_attribute` with `isInheritable: true`). If a human makes it non-inheritable, skills set `#sorted` per journal level (Daily `_Schema` §3). |
| `#sortDirection` | `desc` — inheritable, like `#sorted` |
| `~dateTemplate` | → `_Templates/Day` |
| `~weekTemplate` | → `_Templates/Week` |

No year, week or day notes are created at setup; the first `/sb-daily` or `/sb-capture`, or a click in
Trilium's calendar, creates them.

## Under Cockpit

| Title | Type | Content (search query for `search` notes) | Labels / relations | Icon |
|-------|------|------------------------------------------|--------------------|------|
| `_Schema` | code, `text/markdown` | `assets/cockpit/_Schema.md` | `#sbType=schema`, `#readOnly` | `bx bx-paragraph` |
| `Kanban Board` | book | empty | Board labels (below) | `bx bxs-customize` |
| `Untriaged` | search | `#sbUntriaged` | `~ancestor` → Daily | `bx bxs-inbox` |
| `Proposals` | text | `desc: Proposals` | `#readOnly` | `bx bx-message-square-dots` |
| `Areas` | search | `#sbType=area #!archived` | `~ancestor` → Hubs | `bx bx-area` |
| `Due & blocked` | search | `#status #!archived (#status = blocked OR #startTime <= TODAY+7)` | `~ancestor` → Hubs | `bx bx-alarm-exclamation` |
| `Ideas & thoughts` | search | `#sbMaturity #sbMaturity != mature #!archived` | — | `bx bx-leaf` |

For every `search` note, set the query both as content and as the label `#searchString` (the MCP tool
does not add the label).

The `Due & blocked` query names the column `blocked`; if your Board has no such column, change the query
(human-owned). Finished tasks are deleted or `#archived`, so no "done" column is needed. Boxicons has no outline `bx-inbox`, only `bxs-inbox`.

**Board labels** on `Kanban Board`: `#viewType=board`, `#board:groupBy=status`, `#board:showInbox`,
`#subtreeHidden`, `#hidePromotedAttributes`, plus the default promoted card definitions —
all **inheritable** (`set_attribute` with `isInheritable: true`). The Board is **not**
`#readOnly`: you drag cards on it, and its view is machinery rendered from the children, not a repo-owned
prose body — so it is not in the synced description set (ADR 0001). The saved-search notes below are
likewise not `#readOnly`: their content is a human-owned query.

| Attribute | Value |
|-----------|-------|
| `label:status` | `promoted,alias=Status,single,select,options=open;doing;blocked` |
| `label:startTime` | `promoted,alias=Due,single,datetime` |
| `label:topic` | `promoted,alias=Topic,single,select,options=household;work;hobby` |

These are seeds only: columns and card attributes are human-owned and adapted per instance.

## Under Hubs

| Title | Type | Content | Labels / relations | Icon |
|-------|------|---------|--------------------|------|
| `_Schema` | code, `text/markdown` | `assets/hubs/_Schema.md` | `#sbType=schema`, `#readOnly` | `bx bx-paragraph` |
| `_Index` | text | `# Hubs Index` + "One line per top-level hub: link and a one-line description. Kept current by the agent." | `#sbType=index`, `#sbControl=auto`, `#readOnly` | `bx bx-list-ul` |
| `_Log` | code, `text/markdown` | `# Hubs — _Log` + "Append-only, oldest first. One line per agent mutation in Hubs and Cockpit. Reads are not logged." | `#sbType=log`, `#readOnly` | `bx bx-time` |
| `_Templates` | text | `desc: _Templates` | `#readOnly` | `bx bx-layout` |
| ↳ `Hub` (under `_Templates`) | text | `assets/templates/hub.md` | `#template` | `bx bx-network-chart` |
| ↳ `Synthesis` (under `_Templates`) | text | `assets/templates/synthesis.md` | `#template` | `bx bx-book-open` |
| `Principles` | text | `# Principles` + "One sentence per principle, each linking to its note. Written by you; the agent only proposes." | `#sbType=hub`, `#sbControl=manual` | `bx bx-compass` |

Templates carry no `#sb*` labels except where noted (a template's labels are inherited by every note
created from it); skills set the labels on the new note.

## Under Sources

| Title | Type | Content | Labels / relations | Icon |
|-------|------|---------|--------------------|------|
| `_Schema` | code, `text/markdown` | `assets/sources/_Schema.md` | `#sbType=schema`, `#readOnly` | `bx bx-paragraph` |
| `_Index` | text | `# Sources Index` + "One line per source group and source: link, one-line description, hub(s). Kept current by the agent." | `#sbType=index`, `#sbControl=auto`, `#readOnly` | `bx bx-list-ul` |
| `_Log` | code, `text/markdown` | `# Sources — _Log` + "Append-only, oldest first. One line per agent mutation in Sources. Reads are not logged." | `#sbType=log`, `#readOnly` | `bx bx-time` |
| `Articles & clips` | text | `desc: Articles & clips` | `#readOnly` | `bx bx-news` |
| `Documentation` | text | `desc: Documentation` | `#readOnly` | `bx bx-book` |
| `Research` | text | `desc: Research` | `#readOnly` | `bx bx-search-alt` |

## Icons by kind (for notes the skills create later)

| Kind | Icon |
|------|------|
| hub | `bx bx-network-chart` |
| area | `bx bx-area` |
| project | `bx bx-briefcase` |
| synthesis | `bx bx-book-open` |
| concept | `bx bx-bulb` |
| task | `bx bx-task` |
| hub `Open` search | `bx bx-task` |
| proposal | `bx bx-message-square-dots` |
| year / week / day note | `bx bx-calendar` / `bx bx-calendar-week` / `bx bx-calendar-event` |
| source | `bx bx-file` |
