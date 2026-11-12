# Trilium Symbiont — README

**Agent-assisted personal knowledge management with Trilium.** You connect Trilium to your AI agent
through Trilium's built-in MCP server (enable it and create a token); an initial note structure and a
rulebook then let the agent capture, compile and **query** your knowledge efficiently — inspired by
Andrej Karpathy's **LLM Wiki** (immutable sources, compiled synthesis, index, log, lint).

Directly under the Trilium root sit
two system notes — this `_README` and the `_Schema` rulebook — and **four spaces**. A single AI agent
(via the Trilium MCP server) works across them, governed by the `_Schema` (the top-level
`#sbType=schema`). Everything else under the root is yours alone: the agent never touches it.

## The four spaces

- **Daily** — your journal (year / week / day, Trilium's calendar) and the inbox for your own captures.
  A capture is a child note of the day with `#sbUntriaged` until it is processed. The week note holds the
  weekly review.
- **Cockpit** — views only: the Kanban Board (clones of your tasks), saved searches (Untriaged, Areas, Due
  & blocked, Ideas & thoughts) and the Proposals queue.
- **Hubs** — your topics. A hub holds its areas (responsibilities), projects (with tasks), notes, and a
  **Synthesis** the agent compiles. `Hubs/_Index` lists every top-level hub; **Principles** holds your
  values and rules.
- **Sources** — foreign material, kept unchanged: articles, documentation, research.

Hubs and Sources together are the **LLM wiki** (Karpathy's pattern): immutable sources → compiled
synthesis → index, log, lint.

## How things flow

1. **Capture** your own input into today's journal (`/sb-capture`); put foreign material into Sources
   (`/sb-research` or by hand).
2. **Triage** open captures (`/sb-triage`, the view Cockpit / Untriaged): move each under a hub, area or
   project, turn it into a task, leave it in the journal pointing to a hub (`~sbAbout`), or discard it.
3. **Ingest** sources into hub syntheses (`/sb-ingest`); **ask** the system (`/sb-query`).
4. **Review** the proposals and your areas (`/sb-review`); write the **weekly review** (`/sb-daily`).

## Who changes what

- **The tree structure is yours.** The agent never creates, renames, moves or deletes hubs, areas,
  projects or folders on its own; it proposes them.
- **`#sbControl`** says how the agent may change a note: `auto` (on its own during a skill run —
  syntheses, concepts, indexes, weekly reviews), `propose` (it files a proposal in Cockpit / Proposals),
  `manual` (only on your request; the default).
- **Sources are immutable** for the agent; its own summaries are separate notes marked `#sbOrigin=ai`.
- **Corrections:** if a synthesis is wrong, add a child note `Correction: …` with `#sbOrigin=human`; it
  wins on the next compile.
- **`#excludeFromLlm`** (Trilium's own label; make it inheritable for a subtree) hides a note from the agent
  altogether — use it for anything sensitive. Secrets belong in a password manager, not in notes.

## Attributes

Position decides the topic; labels only for what position can't express.

- `#sbSpace` = `daily|cockpit|hubs|sources` — only on the four space roots.
- `#sbType` = `hub|area|project|synthesis|concept|schema|index|log` — only where position isn't enough.
  A task is recognized by `status` (the Board column), a source by its place in Sources, an ordinary note
  by having no type.
- `#sbMaturity` (`seed|draft|mature`), `#sbUntriaged`, `#sbOrigin`, `#sbControl`, `#sbIngested`,
  `#sbIgnore` (reference material in Sources, never ingested); relations `~sbAbout`
  (topic membership), `~sbSupersededBy` (replacement). Evidence is linked in the text. `#sbVersion` on the `_Schema` says which version the instance runs.

## Commands

All workflows are triggered by you — with a slash skill (prefix `sb-`) or in plain language, in any
language ("remember this …", "what's open in …"). In Claude Desktop say "use sb-…". Each run ends with a
status marker (`✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused`).

| Command | What it does | Typical examples |
|---------|--------------|------------------|
| `/sb-capture` | Quick input into **today's journal** as a child note with `#sbUntriaged` — don't sort yet. | `/sb-capture call the plumber about the leak` · "remember this: idea for the club newsletter" |
| `/sb-triage` | Process open captures: file under a hub/area/project, turn into a task, keep in the journal (`~sbAbout`), move to Sources, or discard. | `/sb-triage` · "sort my captures from this week" |
| `/sb-task` | Create a task (in its hub/area/project, or on the Board if it has no topic), set status, move it, give it a home. | `/sb-task renew passport in Family, due Friday` · "set 'Fix DNS issue' to doing" · "give 'Budget review' a home in Finances" |
| `/sb-daily` | Create or fill **today's day note**, or write the **weekly review** into the week note. | `/sb-daily` · "start today's daily" · "write the weekly review" |
| `/sb-query` | Answer from the system with links to the notes used (hub index → hub page → details). | `/sb-query what is open in Garden?` · "what do I know about the home server backup?" · "what did I do last week?" |
| `/sb-research` | Research on the web; file verbatim excerpts in Sources plus a separate AI summary. | `/sb-research moving a domain to another registrar` |
| `/sb-ingest` | Compile sources and hub notes into a hub's **Synthesis** (and concepts), every statement linked. | `/sb-ingest` (the Sources queue) · `/sb-ingest Symbiont` · "update the synthesis of Home IT" |
| `/sb-hub` | Create a hub/area/project **on request**, refresh a hub page's navigation, propose a split. | `/sb-hub refresh the page of House` · "new hub Concerts under Music Club" · "Family has grown too big" |
| `/sb-review` | Decide **proposals** one by one, review your areas, suggest maturity steps and Principle candidates. | `/sb-review` · "review my areas" · "which thoughts could become principles?" |
| `/sb-lint` | Health check — report only, nothing changes without your yes. | `/sb-lint` · "check the Symbiont for secrets" |
| `/sb-sync` | Pull rulebook/template updates from the repo into this instance (same major version, per-item confirmation). | `/sb-sync` |
| `/sb-init` | Set up the skeleton in an **empty** Trilium instance (once). | `/sb-init` |

## Rulebooks

- **`_Schema`** (top level) — scope, spaces, attributes, control, security; read first in every session,
  followed by the Principles hub page.
- One **`_Schema` per space** (the `#sbType=schema` note within each space root) with its own rules.
- The system is **ID-free**: the agent finds every note by label and position, so the same rulebooks work
  on every Trilium instance.

## Updates and help

- **Source:** [github.com/chaeller/trilium-symbiont](https://github.com/chaeller/trilium-symbiont) — the
  rulebooks, templates and skills. Run `/sb-sync` to pull updates into this instance; it applies only what
  you confirm.
- **Questions, bugs, ideas:** [GitHub Issues](https://github.com/chaeller/trilium-symbiont/issues).
