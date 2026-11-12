---
name: sb-task
description: "Manage tasks in the Trilium Symbiont: create under a hub, area or project with a Board clone, set status, move. Use when the user wants a new task or to change one. Card order stays human-owned."
---

# Task — task mechanics (Hubs + Cockpit Board)

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Cockpit** `_Schema` (Board, tasks, Model X) and the **Hubs** `_Schema` (homes).

**A task** is a note with a `status` label (no `#sbType`). Its **original lives in its home** — a hub,
area or project in Hubs; the Kanban Board (`#viewType=board` within Cockpit) holds a **clone**. The
columns are the options of the Board's `label:status` definition — read them, never assume them.

**Operations:**

- **New task:** find the home the user names (search `#sbType=hub|area|project` within Hubs; confirm if
  several match). **No home named →** offer a fitting one once (from `Hubs/_Index` and the Principles);
  if none fits or the user declines, create the task **directly on the Board** (a plain to-do needs no
  home). Never create a hub, area or project unless the user asks for it.
  Create the note under the home or on the Board (`type=text`, the user's wording as title, details as content), set
  `status` = the Board's **first** column, set other card attributes the user gives (e.g. due date →
  `startTime`, only attributes the Board defines), icon `bx bx-task`; then `clone_note` it into the Board.
- **New subtask (Model X):** a child note under the parent task — **no `status`, no Board clone**. If
  subtasks need their own cards, suggest turning the parent into a project.
- **Set status / move column:** set `status` to one of the Board's columns. Unknown column → ask, never
  invent one.
- **Done:** a finished task is **deleted** or gets **`#archived`** — never a "done" column (Cockpit
  `_Schema` §2). Ask which one if the user doesn't say; delete only after an explicit yes. Archiving or
  deleting the original also removes its Board card.
- **Move home:** `move_note` the original under the new hub, area or project (tree position = membership)
  and make sure the Board clone still exists (re-clone if the move detached it).
- **Give a Board task a home** (on request): move the original under the hub, area or project and clone
  it back onto the Board. Home-less tasks on the Board are allowed; never move one without a request.
- **Reorder / reprioritize:** card order is priority and **human-owned** — drag and drop per column. The
  agent cannot reorder over MCP (no branch-position tool; `move_note` would re-parent the card). Suggest
  an order, considering the Principles, and never attempt it.
- **Project ↔ area:** changing `#sbType=project` to `area` (or finishing a project with `#archived`) only
  on explicit request.

**Rules:** respect `#sbControl` of the home (umbrella §5) — with effective control `propose`, file a
proposal instead of changing an existing task; creating a task the user explicitly asks for is always
allowed. Log every mutation as one line in `Hubs/_Log`. Link the task (clickable) in your answer.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
