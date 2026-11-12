---
name: sb-query
description: Answer a question from the Trilium Symbiont with citations, using staged retrieval (hub index, hub page, detail notes). Use when the user asks what the Symbiont knows about something.
---

# Query — answer from the system, with citations

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
read the **Hubs** `_Schema` for knowledge questions and the **Daily** `_Schema` for questions about time.
Respect the scope law: search only with `ancestorNoteId = <space root>`.

**Task:** answer the user's question with the least context necessary (umbrella §8).

1. **Pick the route:**
   - **Knowledge** ("what do I know about X") → stage 0: `Hubs/_Index`; stage 1: the relevant hub page
     and its Synthesis; stage 2: only the detail notes, concepts or sources you need (follow the synthesis's
     in-text links and the hub page's links).
   - **State** ("what is open in X", "which areas") → attribute queries within Hubs: `#status` (columns
     from the Board), `#sbType=area|project`, `#!archived`, due dates (`#startTime`).
   - **Time** ("what happened last week / in October") → week notes first (`#weekNote` within Daily),
     then the day notes they point to.
   - **Unclear** → start at stage 0 and say which route you took.
2. **Never open** anything outside the system. If the answer would need one, say so.
3. **Answer** with **citations** — clickable links to the notes you used. Mark what comes from an
   agent-written synthesis or concept versus a source or your own note. Thoughts are reported as
   thoughts (linked, with date), never as facts or interpretations.
4. **Gaps:** if the system holds little, say so; offer `/sb-research` (deep) or a web search for this
   answer only.
5. **Keep it?** If the answer is worth keeping, **offer** to file it as a concept under the fitting hub
   (`#sbType=concept`, `#sbControl=auto`, `#readOnly`, in-text links to the notes used) — only on a yes,
   then log it in `Hubs/_Log`. The query itself is a read and is not logged.

Depth: *quick* (stage 0–1), *standard* (up to stage 2), *deep* (plus web search, clearly separated from
what the system holds).

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
