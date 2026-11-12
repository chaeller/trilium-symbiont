# Cockpit — _Schema (space rulebook)

> `#sbType=schema` · Rules for the **Cockpit** space: the views onto the system. The umbrella `_Schema`
> (the top-level `#sbType=schema`, file `skills/sb-init/assets/_Schema-umbrella.md`) applies first.
> Tracked source: `skills/sb-init/assets/cockpit/_Schema.md`. Live node: the `#sbType=schema` note within
> the Cockpit root (`#sbSpace=cockpit`).

## 0. Purpose

Cockpit holds **views, not content**: the Kanban Board (clones of tasks), saved searches and the
Proposals queue. Content originals live in Hubs (tasks, notes), Daily (captures) and Sources. The only
originals in Cockpit are proposal notes and **tasks without a topic** (plain to-dos directly on the
Board).

## 1. Structure

```
Cockpit                   #sbSpace=cockpit
├── _Schema               #sbType=schema #readOnly          (this note)
├── Kanban Board          #viewType=board                    clones of all tasks
├── Untriaged             saved search: #sbUntriaged         (within Daily)
├── Proposals             queue of agent proposals           originals (like home-less tasks)
├── Areas                 saved search: #sbType=area          (within Hubs)
├── Due & blocked         saved search                        (within Hubs)
└── Ideas & thoughts      saved search: #sbMaturity seed + draft (all unformed ideas)
```

Saved searches are Trilium `search` notes (the query is their content, the scope an `~ancestor`
relation set at setup). They are **views for you**; the agent runs its own space-bound searches and never
relies on a saved search for scope. You may change their queries; the agent does not.

## 2. Kanban Board and tasks

- **Board:** `#viewType=board`, `#board:groupBy=status`; columns = values of `status`. The **column set
  and the card attributes are human-owned**: they are the promoted label definitions on the Board
  (`label:status`, `label:startTime`, …). Read them off the Board; never assume a set, never invent a
  column. The first `status` option is the default column for a new task. **No column means "done".**
- **A task** is a note with a `status` label — no `#sbType`. If it belongs to a topic, its **original
  lives in its home** — a hub, area or project in Hubs (tree position = membership; there is no project
  relation) — and the Board holds a **clone**. A plain to-do that belongs to no topic **may live directly
  on the Board** (no home needed). If the user names no home, offer a fitting one once; if none fits or
  the user declines, create it on the Board.
- **Subtasks (Model X):** a task may have child notes as its breakdown. Only the parent task is a card —
  subtasks carry **no `status`** and are **not** cloned onto the Board. If subtasks need their own cards,
  turn the parent into a `project`.
- **Priority = card order**, human-owned, set by drag-and-drop **per column**. The agent cannot reorder
  over MCP (no branch-position tool; `move_note` would re-parent the card) — it may only suggest an order.
- **Cards created in the Board UI** are home-less tasks on the Board — allowed. `/sb-task` can give one a
  home on request (move the original there, clone it back onto the Board); `/sb-lint` does not flag them.
- **Done:** a finished task is **deleted** or marked **`#archived`** (it then disappears from the Board,
  from `Open` and from `Due & blocked`). Which of the two is your call per task; the agent asks. A finished
  project gets `#archived`.
- Every task mutation is logged in `Hubs/_Log`.

**Board configuration** (set at setup): `#viewType=board`, `#board:groupBy=status`, `#board:showInbox`,
`#subtreeHidden` (cards stay out of the tree), `#hidePromotedAttributes`, and the promoted
card definitions, which must be **inheritable** (`set_attribute` with `isInheritable: true`).
The Board is not `#readOnly` — you drag cards on it.

## 3. Proposals

A proposal is how the agent asks for something it may not do on its own (effective control `propose`,
lint findings you asked to queue, a hub that has grown too big, a maturity transition, a Principle
candidate).

- **Where:** a child note of Cockpit / Proposals. Title: `Proposal: ` plus a short summary.
- **Body:** what to do (the exact action), why, the notes concerned (clickable links), and what changes
  if accepted. One proposal per decision.
- **Processing:** `/sb-review` presents the proposals one by one; on **accept** the agent executes the
  action, on **reject** it does nothing; in both cases it logs the decision in `Hubs/_Log` and deletes
  the proposal note. A proposal never executes itself.

## 4. Golden rules (Cockpit)

1. Clones and searches only — except proposals and home-less tasks on the Board.
2. Board columns and card attributes are human-owned; read them, never hardcode them.
3. Card order is yours; the agent only suggests.
4. A task with a topic lives in Hubs and the Board shows a clone; a plain to-do may live on the Board.
5. Log task and proposal mutations in `Hubs/_Log`.

## Appendix — finding the notes

| To find… | How |
|----------|-----|
| Cockpit root | `#sbSpace=cockpit` |
| this `_Schema` | `#sbType=schema` within Cockpit |
| Kanban Board | `#viewType=board` within Cockpit |
| columns | the options of the Board's `label:status` definition |
| Proposals | the note titled `Proposals` directly under Cockpit; its children are the queue |
| saved searches | title + position under Cockpit |
| tasks | `#status` within Hubs (originals) |
