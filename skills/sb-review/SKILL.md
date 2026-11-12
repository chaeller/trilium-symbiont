---
name: sb-review
description: "Work through the Trilium Symbiont's review queue: decide proposals one by one, review areas, suggest maturity transitions and Principle candidates. Use when the user asks for a review."
---

# Review — proposals, areas, maturity

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Cockpit** `_Schema` (§3 proposals) and the **Hubs** `_Schema` (§6 Principles, §7
maturity).

Do the parts the user asks for; with no specific request, do A, then offer B and C.

## A. Proposals

1. List the children of Cockpit / Proposals, oldest first (title, age, one line each).
2. Present **one proposal at a time**: what it would do, why, the notes concerned (links). Check that it
   is still valid (the notes exist, nothing changed in a way that makes it moot) and say so if not.
3. **Wait for the decision:** accept, reject, edit (change the action, then accept), or skip (leave it in
   the queue).
4. **Accept:** carry out exactly the described action, within scope and the umbrella rules (a proposal
   never widens scope; structure changes are allowed because the user just approved them). **Reject:**
   change nothing.
5. After accept or reject: one line in `Hubs/_Log` (`[review] accepted|rejected: …`), then delete the
   proposal note. Skipped proposals stay.

## B. Areas review (PARA weekly review)

Go through the areas (`#sbType=area #!archived` within Hubs — the same set as Cockpit / Areas), one at a
time, with: its projects (open / done / stalled), open tasks per Board column, notes changed recently, and
the date of the last change. Ask the user per area: still active? anything to add, close or archive? Act
only on explicit answers (new task → as in `/sb-task`; archive a project → `#archived`; a project that
became permanent → `area`), each logged in `Hubs/_Log`.

## C. Maturity and Principles

1. **Transitions:** find `#sbMaturity=seed|draft` notes (within Daily and Hubs). Suggest — never perform
   on your own — `seed` → `draft` for thoughts that recur or were developed, and `draft` → a target:
   idea → **project**, experience/insight → **knowledge note** in a fitting hub, recurring value →
   **Principle**. Quote nothing personal as fact; show the notes as links with dates.
2. **Principle candidates:** for a value-like `draft`, create a proposal (`Proposal: adopt Principle …`)
   or, if the user decides right away, let the user **word** the Principle; then — with the user's
   explicit go — create the note under the Principles hub (`#sbMaturity=mature`) and add its one-sentence
   line with a link to the Principles hub page. The Principles hub is `#sbControl=manual`: write there
   only with this explicit go, never on your own.
3. Apply each confirmed transition (`#sbMaturity` change, move, or new project) and log it in `Hubs/_Log`.

Summarize the decisions at the end.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
