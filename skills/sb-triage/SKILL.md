---
name: sb-triage
description: "Process open captures (Cockpit / Untriaged) of the Trilium Symbiont: file each under a hub, area or project, make it a task, keep it in the journal or discard it. Use when the user asks to triage."
---

# Triage — process open captures

You are operating on the user's **Trilium Symbiont** via the Trilium MCP server.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Daily** `_Schema` (triage rules, §5). Read the **Hubs**, **Cockpit** or **Sources**
`_Schema` when you file something there.

**Task:** go through the open captures — notes with **`#sbUntriaged`** within the Daily root (the same set
the saved search Cockpit / Untriaged shows; run your own space-bound search, don't rely on the saved
search). Oldest first unless the user names a day or a capture.

For each capture, **propose one outcome** (Daily `_Schema` §5) with the destination:

| Outcome | Action |
|---------|--------|
| **Belongs to a topic** | `move_note` under the hub, area or project |
| **A task** | move under its home (hub, area or project) and clone onto the Board — or, if it has no topic, move it directly onto the Board; set `status` to the Board's first column (read the Board's `label:status` options; Cockpit `_Schema` §2) |
| **Stays in the journal** | leave it under the day, set `~sbAbout` → the hub |
| **Foreign material** | move to a fitting grouping node in Sources (Sources `_Schema` §3) |
| **Discard** | delete — only after an explicit yes for this capture |

Then, for every outcome, **remove `#sbUntriaged`**. Keep `#sbMaturity` as it is (maturity changes are
proposed by `/sb-review`, not done here).

**Task vs. note — decide deliberately (don't over-task).** Make a capture a **task** only when it names a
concrete action the user intends to *do*, with real commitment ("fix X", "call Y", "renew Z by Friday").
A capture that is mainly **information** — what a tool or thing is, a link, a reference, "good to know", or
a soft/unscheduled "I should try this sometime" — **stays a plain note** under the topic ("Belongs to a
topic"), not a task. When the intent is soft or unscheduled, **default to a note and ask** before making a
task; never create a task + Board clone on assumption. This matters because making a task is **not cleanly
reversible over MCP** — the Board clone and the task nature cannot be removed by this agent without a
manual UI step — so when in doubt, file a note, not a task. (Example: "ShareX — teammates use it, I should
try it" is tool *information* with a vague intent → a note under the topic, not a task.)

**How to choose the destination:**
- Look for the fitting place by reading `Hubs/_Index` and the relevant hub pages (stage 0 → 1). Prefer the
  **most specific** hub, area or project.
- **Offer existing places only.** If nothing fits, say so and suggest creating a hub, area or project
  (`/sb-hub`, or the user creates it); never create one yourself. Leaving the capture untriaged is fine.
- If a capture mixes several things, propose to split it — and split only on a yes.
- Ask when a capture is ambiguous. Batch clear cases into one confirmation if the user prefers ("all as
  proposed").

**Logging:** moves into Hubs and new tasks → one line each in `Hubs/_Log`; moves into Sources → in
`Sources/_Log`. Captures that stay in Daily (with `~sbAbout`) and discards → a line in `Hubs/_Log` too
(they change topic membership or remove content).

**Rules:** move only within the four spaces; never touch notes outside the system. After a move into a
hub, offer to refresh that hub's page (`/sb-hub`). Summarize what went where, with links.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
