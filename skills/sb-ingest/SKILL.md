---
name: sb-ingest
description: Compile Sources of the Trilium Symbiont into hub syntheses and concepts with evidence. Use when the user asks to ingest sources or update a hub's synthesis from them (none named = the queue).
---

# Ingest — compile sources into hub syntheses and concepts

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Sources** `_Schema` (queue, immutability) and the **Hubs** `_Schema` (synthesis,
concepts, evidence, corrections). Scope every search to a space root.

**Task:** compile sources into the compiled layer in Hubs.

1. **Scope from the request:**
   - **Nothing named** → the queue (Sources `_Schema` §4: `#!sbIngested` within Sources, minus machinery,
     pure grouping nodes, `#template`, `#sbOrigin=ai` and `#sbIgnore` notes). List it and compile what the
     user confirms.
   - **Sources named or described** → only the matching ones; if several match, list and confirm.
   - **A hub named** ("update the synthesis of X") → that hub's sources: notes under the hub, notes and
     sources with `~sbAbout` → the hub, and the sources its synthesis already cites.
2. **Target hub.** Each source compiles into the hub it belongs to: its `~sbAbout`, or the hub the user
   names. If unclear, propose one from `Hubs/_Index` and ask; never create a hub (offer `/sb-hub`).
3. **Read** each source read-only; a source with children is one document. PDF/image: use
   `get_attachment_content`; without text, ask for a caption. Skip anything outside
   the system. Read the hub's **corrections** (child notes `#sbOrigin=human` under its synthesis and
   concepts) first — they win.
4. **Check control** before writing (umbrella §5): the synthesis or concept must have effective control
   `auto`. If it is `propose` or `manual`, create a proposal in Cockpit / Proposals with the intended
   change instead.
5. **Write the synthesis** (create it from `Hubs/_Templates/Synthesis` if the hub has none — child titled
   `Synthesis`, `#sbType=synthesis`, `#sbControl=auto`, `#readOnly`, icon `bx bx-book-open`): integrate
   the new sources into the existing text, in your own words; every statement with an in-text link to its
   source. Thoughts (`#sbMaturity`) are linked with date, never paraphrased.
6. **Concepts** — only for an idea or entity that deserves its own page: `#sbType=concept`,
   `#sbControl=auto`, `#readOnly`, icon `bx bx-bulb`, under the most specific hub (a sub-concept as a
   child of its concept). Prefer extending an existing concept over creating a near-duplicate; a
   replaced concept gets `~sbSupersededBy`.
7. **Evidence:** every statement carries an in-text link to the note it draws on (originals, not
   `#sbOrigin=ai` summaries) — these links are the evidence; Trilium records them as `~internalLink`, so
   no extra source relation is set. Set `~sbAbout` → the hub on sources that lack it.
8. **Mark** each compiled source `#sbIngested`.
9. **Navigation:** update the hub page's Knowledge section (new concepts and sources, one line each) and,
   if the hub's gist changed, its line in `Hubs/_Index`; add new sources to `Sources/_Index`.
10. **Log** one line per synthesis/concept written in `Hubs/_Log`, and one line per source marked
    `#sbIngested` in `Sources/_Log`.

Summarize what changed (links), what you skipped and why, and any contradictions between sources (listed
under the synthesis's Open questions).

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
