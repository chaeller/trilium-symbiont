---
name: sb-capture
description: Capture your own text, thoughts or to-dos as a child note of today's journal day in the Trilium Symbiont (untriaged). Use when the user says "remember this", "capture this" or "note this down".
---

# Capture — your input into today's journal

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Daily** `_Schema` (`#sbType=schema` within `#sbSpace=daily`). Follow them, especially the
scope law.

**Task:** capture the user's input with the lowest friction, as a **child note of today's day note**. Do
**not** classify or move it — that is `/sb-triage`.

1. **Find today's day note** (Daily `_Schema` §3): `#dateNote=YYYY-MM-DD` within Daily. If it does not
   exist, create it (and any missing year/week parents) exactly as Daily `_Schema` §3 describes —
   patterns, labels, template and sorting read from the Daily root. Say that you created it.
2. **Create the capture** under the day note: `type=text`, a short title you propose and state, the
   user's input as content (URLs and pasted text as they are). Set **`#sbUntriaged`**. If it is a thought
   or idea (not a to-do, link or fact), also set **`#sbMaturity=seed`**. No `#sbType`, no `#sbOrigin`
   (own input is the default in Daily).
3. **Several items** in one request → one capture note each.
4. **"Add this too"** for a capture you made **in this conversation** → `append_to_note` to that note with
   a short dated divider. Never guess a capture from an earlier conversation; if unsure, create a new one.
5. **Foreign material** (an article, a web clip, someone else's text) does not belong in the journal: say
   so and offer to file it in Sources instead (`/sb-research`, or as a source note — Sources `_Schema` §3).
6. **Sensitive input:** if the user marks the input as sensitive, set `#excludeFromLlm` on the capture as
   the **last** change (after it, Trilium hides the note from you). Do not repeat its
   content in your answer, and tell the user the capture is now invisible to the agent, so they triage it
   by hand.
7. **No `_Log`** — Daily has none; Trilium revisions are the backstop.

Confirm what you captured (title and link). Offer `/sb-triage` when the user wants to sort captures.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
