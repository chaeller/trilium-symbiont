# Sources — _Schema (space rulebook)

> `#sbType=schema` · Rules for the **Sources** space: immutable foreign sources — the raw half of the
> LLM wiki. The umbrella `_Schema` (the top-level `#sbType=schema`, file
> `skills/sb-init/assets/_Schema-umbrella.md`) applies first.
> Tracked source: `skills/sb-init/assets/sources/_Schema.md`. Live node: the `#sbType=schema` note within
> the Sources root (`#sbSpace=sources`).

## 0. Purpose

Sources holds material **you did not write**: articles, web clips, documentation, research results. It
is ordered by **origin**, not by topic — the topic map is Hubs. You curate it; the agent reads it and
compiles it into syntheses and concepts in Hubs (Hubs `_Schema` §4).

## 1. Structure

```
Sources                   #sbSpace=sources
├── _Schema               #sbType=schema #readOnly           (this note)
├── _Index                #sbType=index #sbControl=auto #readOnly
├── _Log                  #sbType=log #readOnly
├── Articles & clips      web articles, clippings
├── Documentation         manuals, specs, reference works
└── Research              research results: original material + agent summary (#sbOrigin=ai)
```

The grouping nodes are yours; add, rename or nest them as you like. A source carries no `#sbType` — its
position in Sources makes it a source.

## 2. Immutability and origin

- **The agent never edits or deletes an original source.** You may edit or delete your sources freely;
  an edited source makes its syntheses stale (`/sb-lint` finds it), a deleted one leaves dangling
  evidence links — for compiled knowledge, edit and re-ingest rather than delete.
- **What the agent may create here, on request:** a new source note (pasted text, a fetched page,
  research material), and a **summary note** of its own, which is always a **separate** note with
  `#sbOrigin=ai` (a child of the original it summarizes) — never mixed into the original.
- **`#sbOrigin`:** a note in Sources without the label is `external`. Set `ai` on agent-written
  summaries, `mixed` on material that combines a foreign original with your annotations. A correction you
  write (`#sbOrigin=human`) lives next to the note it corrects in Hubs (Hubs `_Schema` §4), not here.
- **Topic:** set `~sbAbout` → the hub a source is about (on request or during ingest/triage).

## 3. Adding a source

1. **Pasted text or a text file:** create the note yourself — plain text → `text`; Markdown → `code`
   with `mime=text/markdown`; HTML/CSS/JS/CSV → `code` with the matching mime. Store foreign text
   verbatim; put the URL and the retrieval date at the top.
2. **PDF or image:** the agent cannot upload files over MCP. Ask the human to import the file into the
   right grouping node (Trilium "Import into note" or drag and drop). To compile it later, read its
   extracted text with `get_attachment_content`; if there is none, ask for a caption — never invent the
   content of an image.
3. **A web page:** fetch it, store the relevant text verbatim (or the key passages, marked as excerpts)
   with the URL; your own summary goes into a separate `#sbOrigin=ai` child.
4. **An existing note** elsewhere in the system: clone it into Sources (default) or move it on request.

File into an existing fitting grouping node; never create one on your own (ask). Propose a concise title
and state it. Log every creation in `Sources/_Log`.

## 4. The ingest queue

- **Queue:** notes in Sources **without `#sbIngested`**, excluding machinery (`#sbType`), grouping nodes
  that only hold other sources, `#template` notes, `#sbOrigin=ai` summaries, and anything under
  **`#sbIgnore`** (reference material, below).
- `/sb-ingest` compiles them into Hubs and sets **`#sbIngested`** on each source it used. With no
  argument it shows the queue and compiles what you confirm; with an argument only the matching sources.
- A source with child notes (a cloned subtree) is read as one document.
- A source changed after ingest (its `dateModified` is newer than the synthesis or concept that cites it)
  is stale: `/sb-lint` reports it and proposes a re-ingest.

**Reference material (`#sbIgnore`).** Material kept in Sources only to look at — not to compile — carries
**`#sbIgnore`** (e.g. an imported demo or sandbox tree). The label is **inheritable**: set it once on the
grouping node and the whole subtree is covered. An ignored note is **never** in the ingest queue, never
compiled or cited as evidence, never listed in `Sources/_Index`, and never flagged by `/sb-lint`. It is a
**soft** exclude, weaker than `#excludeFromLlm`: the agent may still open and read it when you point at it
directly (e.g. `/sb-query` with an explicit reference), it just never acts on it unprompted. `#sbIgnore`
is not `#sbIngested`: *ignore* = "never compile this"; *ingested* = "already compiled."

## 5. `_Index`

`Sources/_Index` (`#sbType=index`, `#sbControl=auto`, `#readOnly`): one line per grouping node and per
source not yet listed — link, one-line description, and the hub(s) it is about. Updated on every source
the agent adds and on ingest.

## 6. Golden rules (Sources)

1. Originals are immutable for the agent; summaries are separate `#sbOrigin=ai` notes.
2. Foreign text verbatim, with URL and date; never fabricate.
3. Agent summaries are reading aids, not evidence — syntheses cite the original.
4. The grouping is yours; file into what exists, ask before anything new.
5. Log every mutation in `Sources/_Log`.

## Appendix — finding the notes

| To find… | How |
|----------|-----|
| Sources root | `#sbSpace=sources` |
| this `_Schema` / `_Index` / `_Log` | `#sbType=schema` / `index` / `log` within Sources |
| the ingest queue | `#!sbIngested` within Sources, minus the exclusions in §4 (incl. `#sbIgnore`) |
| reference material | `#sbIgnore` within Sources (and its subtree) |
| sources about a hub | `~sbAbout` → the hub, within Sources |
