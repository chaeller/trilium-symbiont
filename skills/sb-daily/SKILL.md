---
name: sb-daily
description: Create or fill today's journal note in Daily of the Trilium Symbiont, or write the weekly review into the week note. Use when the user asks for the daily, today's journal or a weekly review.
---

# Daily — the journal day and the weekly review

You operate on the **Trilium Symbiont** via the Trilium MCP server, and you have filesystem access
(your client's file-read tool). Daily is the **Trilium journal** (`#calendarRoot`): year → week → day,
plus captures as child notes of the day. Durable items live in Hubs and Sources; the journal **links**
to them.

**First** (umbrella `_Schema` §1): load the umbrella `_Schema` (`#sbType=schema` directly under `root`)
and read it fully; check that `#sbVersion` has major version `1` (e.g. `1.0.0`); read the **Principles** hub page;
then read the **Daily** `_Schema` (`#sbType=schema` within `#sbSpace=daily`) — §2 configuration, §3 day
notes, §6 weekly review. The user's request may name a date (`YYYY-MM-DD`) or a week; default to
**today** / the current week.

## A. Today's journal note (default)

1. **Find** the day note: `#dateNote=YYYY-MM-DD` within the Daily root.
   - **Found:** this is an update — read it and fill its sections; never wipe what's there.
   - **Not found:** create it and any missing year/week parents exactly as Daily `_Schema` §3 says
     (level chain from existing journal notes, titles from the patterns on the Daily root, Trilium labels,
     `~template` → the Daily root's `~dateTemplate` target, sorting rule). Seed the content from that
     template note; if it cannot be read, use the template file `templates/day.md` (see *Template
     files*). Icon `bx bx-calendar-event` (week `bx bx-calendar-week`, year `bx bx-calendar`). Report what you created.
     - **Roll over from the last working day.** After seeding, read the most recent existing day note (the
       one whose chain you walked) and copy, as starting drafts (append ` (draft, copy from previous day)`
       to each copied value; copy verbatim, never summarize or invent; if the source field is empty, leave
       the target empty):
       - its **"My plan for today:"** → the new day's **"What I did yesterday (last working day):"**;
       - its **"⏭️ For tomorrow"** section → the new day's **"My plan for today:"**.
       The new day's own **"⏭️ For tomorrow"** starts **empty** (it is filled during the day and consumed
       into the next day's plan). Do not copy the previous day's plan into the new plan.
     - **Offer the previous week's review.** If creating this day note also created a **new week note** (a
       week rolled over), the week that just ended may never have been summarized. Find the **immediately
       preceding** week note (the `#weekNote` before the new one, by date). If it exists and its review is
       still **unwritten** (its body is only the empty Week template — no links were added under the review
       sections), **offer** to write it now (section B) — do not write it silently. Skip the offer when the
       preceding week note is missing or already carries a review. This is only an offer; the weekly review
       is still never written without the user's go-ahead (umbrella principle 9).
2. **Fill the cross-section** with clickable links `[Title](#root/<noteId>)` — reference, don't copy:
   - **✅ Tasks** — tasks whose `status` changed today or that the user worked on (`#status` within Hubs,
     recent `dateModified`).
   - **💡 Captures** — list today's child captures (links); new input from the user becomes a **new
     capture child note** with `#sbUntriaged` (as in `/sb-capture`), not text in the day's body.
   - **⏱️ Time tracking** — short operational jottings tied to the day (above all time-recording
     start/stop) are **not** captures: write them as a line in this day-body section, with
     **no `#sbUntriaged`**, and never triage them (Daily `_Schema` §4). Only make a capture when the input
     is something to process later; when unsure which it is, ask.
   - **📅 Meetings** — the day's meetings, each as a `###` sub-section. **⏰ Daily Stand-Up** is the first
     and is always present (it holds the "What I did yesterday" / "My plan for today" fields the roll-over
     uses); add other meetings — recurring or ad hoc — only on the days they happen, each as a plain
     `###` sub-section titled the way the user names it.
   - **📝 Notes / 📊 Reflection / 🎯 Goal / ⏭️ For tomorrow / ❓ Open Questions** — from what the user
     tells you; for "yesterday" you may read the previous day note.
   - Ask for what you can't infer. Never invent content; never interpret feelings (umbrella principle 6).

## B. Weekly review (on request: "weekly review", "review the week")

1. Find the week note: the parent with `#weekNote` of a day note of that week (create the day/week per
   §3 if the week has no note yet).
2. **Check control:** the week note's effective control must be `auto` (it comes from the Week
   template). If not, show the review in the answer and offer a proposal instead of writing.
3. **Gather** (all as links): the week's day notes; tasks finished or moved and projects touched
   (`status` changes, `Hubs/_Log` lines of that week); hubs touched (captures with `~sbAbout`, moved
   captures, new notes and syntheses); captures of the week still `#sbUntriaged`; thoughts
   (`#sbMaturity`) — **link and date only, no paraphrase**; open questions from the day notes.
4. **Write** into the sections of the Week template (seed from the template note, or
   the template file `templates/week.md`, if the note is empty). Append below what is already there;
   never delete the user's own text. Mention captures to triage and proposals to review (`/sb-triage`, `/sb-review`).

## Template files

The template files have a single source, the `sb-init` skill. Look for `templates/<name>.md` in this
order and use the first one found:
1. `assets/templates/<name>.md` next to this `SKILL.md` (present when the skill was installed as a
   bundle, which carries its own copy);
2. `assets/templates/<name>.md` in the `sb-init` skill folder next to this skill's folder.

If neither exists, say so and continue with the live template note only.

## Boundaries

- The journal is **your** content: the agent writes day notes only on request and the weekly review only
  where `#sbControl=auto` applies.
- No `_Log` for Daily (Trilium revisions are the backstop). Do not log the day note's creation.
- Tree order is human-owned; never reorder siblings. Never create a second note for an existing date.

**End your output with exactly one status marker** on its own final line (see steering "End-of-run status
marker"): `✅ Done` / `❓ Needs your answer` / `⏸️ Awaiting confirmation` / `⚠️ Done with caveats` /
`🚫 Refused (out of scope)`.

Input: the user's request (for a slash command, the text after it).
