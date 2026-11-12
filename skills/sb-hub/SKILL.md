---
name: sb-hub
description: Create a hub in the Trilium Symbiont on request, refresh a hub page or its synthesis, or propose a split when a hub grows too big. Use when the user asks for a new hub or to update one.
---

# Hub — create, refresh, propose

You operate on the **Trilium Symbiont** via the Trilium MCP server, and you have filesystem access
(your client's file-read tool).

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Hubs** `_Schema` (`#sbType=schema` within `#sbSpace=hubs`) — §2 kinds, §3 hub page, §4
synthesis, §5 `_Index`.

Pick the operation from the user's request:

## A. Create a hub (only on explicit request)

The tree is human-owned: create a hub only when the user asks for it (by name), never on your own.

1. **Place:** directly under the Hubs root, or under the parent hub the user names (sub-hub; warn if this
   makes more than three hub levels). Check that no hub of the same name exists there.
2. **Hub note:** `type=text`, the user's title (in the user's language), `#sbType=hub`, icon
   `bx bx-network-chart`, `~template` → `Hubs/_Templates/Hub`; content seeded from that template note
   (fallback: the template file `templates/hub.md`, see *Template files* below). Note: setting
   `~template` on an **empty** note makes Trilium copy the template text in by itself — check the content before adding
   it again. Ask the user for the **Purpose**
   sentence(s) and write them in; never invent the purpose.
3. **Synthesis:** child titled `Synthesis`, `#sbType=synthesis`, `#sbControl=auto`, `#readOnly`, icon
   `bx bx-book-open`, `~template` → `Hubs/_Templates/Synthesis`, content seeded from it (fallback:
   `templates/synthesis.md`).
4. **Open search:** child titled `Open`, `type=search`, icon `bx bx-task`; query `#status #!archived`,
   as content and as label `#searchString`
   (finished tasks are deleted or archived, so no column needs excluding); relation `~ancestor` → the new
   hub. (Not for the Principles hub.)
5. **Index:** a top-level hub gets one line in `Hubs/_Index` (link + one-line description from the
   purpose); a sub-hub gets a link on its parent's hub page (State or Knowledge section).
6. **Log** the creation in `Hubs/_Log`. Offer to move fitting notes, captures (`#sbUntriaged`) or sources
   to the new hub — each move only on a yes (`/sb-triage` for captures).

Areas and projects are created the same way **only on request** (`#sbType=area` / `project`, icon
`bx bx-area` / `bx bx-briefcase`, under the hub or area the user names; no synthesis, no Open search),
logged in `Hubs/_Log` and linked in the hub page's State section.

## B. Refresh a hub page

Rebuild the **navigation sections** of the named hub page (Hubs `_Schema` §3) — whatever its control,
never the Purpose section:
- **Knowledge:** child notes, concepts, and sources / notes with `~sbAbout` → the hub (search within
  Sources and Daily), each as a link with a one-line description.
- **State:** areas and projects (non-archived first) and the link to `Open`.
- **Thoughts:** notes with `#sbMaturity` under the hub or pointing to it, link and date only.
- **Related hubs:** hubs that share clones, sources or `~sbAbout` targets.
Skip `#template` notes. Sub-hubs aggregate upwards: a parent lists its sub-hubs,
not their contents. Log the refresh in `Hubs/_Log`.

## C. Refresh a synthesis

Run the compile for this hub as `/sb-ingest` describes for a named hub (corrections first, control check,
evidence via in-text links, `#sbIngested` on newly used sources), then update the hub's `_Index` line if
its gist changed.

## D. Propose a split

When a hub has grown too big (many direct children of mixed kinds, or distinct clusters of notes), do not
restructure. Create **one proposal** in Cockpit / Proposals (`Proposal: split hub …`): the suggested
sub-hubs or areas, which notes would move where (links), and why. It is executed only through
`/sb-review` after the user accepts it. Log the proposal in `Hubs/_Log`.

## Template files

The template files have a single source, the `sb-init` skill. Look for `templates/<name>.md` in this
order and use the first one found:
1. `assets/templates/<name>.md` next to this `SKILL.md` (present when the skill was installed as a
   bundle, which carries its own copy);
2. `assets/templates/<name>.md` in the `sb-init` skill folder next to this skill's folder.

If neither exists, say so and continue with the live template note only.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
