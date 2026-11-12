---
name: sb-research
description: Research a topic on the web and file it in Sources of the Trilium Symbiont, original excerpts separate from the AI summary. Use when the user asks to research something for the Symbiont.
---

# Research — fetch external knowledge into Sources

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Sources** `_Schema` (`#sbType=schema` within `#sbSpace=sources`).

**What this is:** `/sb-research` fetches **new external knowledge from the web** and files it in
**Sources** — foreign material never goes into the journal. It is distinct from `/sb-ingest` (compiles
sources into hub syntheses) and `/sb-query` (answers from what the system already holds).

**Task:** research the topic in the user's request.

1. **Gather** with web search / fetch. Prefer primary and authoritative sources; note every URL and the
   retrieval date. If the web yields little, say so — never fabricate.
2. **Original material** — one source note per substantial source page, in the fitting grouping node
   (default `Research`; `Articles & clips` or `Documentation` if clearly better; never create a new
   grouping node without asking). Content: URL and retrieval date at the top, then the relevant text
   **verbatim** (or key passages marked as excerpts). No `#sbOrigin` (external is the default in
   Sources). Respect copyright: excerpts, not whole paywalled works.
3. **Your summary** — a **separate** note as a child of the main original (or of a short container note
   titled after the topic, if there are several originals): `#sbOrigin=ai`, a clean factual summary in
   your own words, each statement linked to the original it comes from. Never mix your text into an
   original.
4. **Topic:** if the research belongs to an existing hub, set `~sbAbout` → that hub on the originals (ask
   if unclear; never create a hub).
5. Propose concise titles and **state them**. Leave `#sbIngested` unset — compiling into the hub is
   `/sb-ingest`.
6. Update `Sources/_Index` (one line per new source) and append one line per created note to
   `Sources/_Log`.

Report what you filed (links) and the URLs used; offer `/sb-ingest` to compile it into the hub.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
