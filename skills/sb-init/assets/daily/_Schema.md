# Daily — _Schema (space rulebook)

> `#sbType=schema` · Rules for the **Daily** space: the Trilium journal and the inbox for your own
> captures. The umbrella `_Schema` (the top-level `#sbType=schema`, file
> `skills/sb-init/assets/_Schema-umbrella.md`) applies first.
> Tracked source: `skills/sb-init/assets/daily/_Schema.md`. Live node: the `#sbType=schema` note within
> the Daily root (`#sbSpace=daily`).

## 0. Purpose

Daily is ordered by **time**. It is your journal (one note per day, grouped by year and week) and the
place where your own quick captures land first — what comes to mind belongs to a day before it belongs to
a topic. Foreign material (web clips, research) does **not** go here; it goes straight to Sources.

## 1. Structure

```
Daily                     #sbSpace=daily #calendarRoot #enableWeekNote #weekPattern #datePattern
│                         #sorted #sortDirection=desc ~dateTemplate ~weekTemplate
├── _Schema               #sbType=schema #readOnly         (this note)
├── _Templates            #top                              template container
│   ├── Day               #template                         → ~dateTemplate
│   └── Week              #template #sbControl=auto         → ~weekTemplate
└── 2026                  #yearNote
    └── 2026-W44          #weekNote                         week note = weekly review
        └── 2026-11-01 Sunday   #dateNote=2026-11-01        day note
            └── a capture       #sbUntriaged                your input, one note per capture
```

Day and week notes carry no `#sbType`; Trilium's own labels (`#dateNote`, `#weekNote`, `#yearNote`,
`#monthNote`) identify them. Their content is **yours** (effective control `manual`), except the week
note, whose `#sbControl=auto` comes from the Week template so the agent may write the weekly review.

## 2. Journal configuration (read it, don't assume it)

The journal is configured **on the Daily root**, and every skill reads the configuration from there
instead of assuming values. Defaults set by `/sb-init` (see `skeleton.md`):

| Label / relation on Daily | Default | Effect |
|---------------------------|---------|--------|
| `#calendarRoot` | — | Daily is the Trilium journal |
| `#enableWeekNote` | — | a week level between year and day |
| `#weekPattern` | `{year}-{shortWeek3}` | week title, e.g. `2026-W44` |
| `#datePattern` | `{isoDate} {weekDay}` | day title, e.g. `2026-11-01 Sunday` |
| `#monthPattern`, `#yearPattern` | Trilium defaults | only if a month level is used |
| `#sorted`, `#sortDirection=desc` | — | newest first |
| `~dateTemplate` → `_Templates/Day` | — | template for new day notes |
| `~weekTemplate` → `_Templates/Week` | — | template for new week notes |

You may change any of these in Trilium; the skills follow the live values.

## 3. Finding or creating a day note

**Find:** `search_notes` for `#dateNote=YYYY-MM-DD` with `ancestorNoteId = <Daily root>`. If Trilium
created the day (calendar widget), it is found here — use it.

**Create (only if not found).** The agent rebuilds what Trilium would create, so a later click in the
calendar finds the same note:

1. **Level chain.** Take the most recent existing note with `#dateNote` under Daily and walk its parents
   up to the Daily root; the labels on the way (`#yearNote`, `#monthNote`, `#weekNote`) give the chain
   (e.g. year → week → day, or year → month → week → day). If there is no day note yet, use year → week →
   day when `#enableWeekNote` is set, otherwise year → month → day.
2. **Parents.** For each level above the day, find the existing parent by its label within Daily
   (`#yearNote=YYYY`; `#monthNote=YYYY-MM`; for the week, prefer the week note that **already holds
   another day of the same Monday–Sunday week**, else `#weekNote` with the ISO week value). Create only
   the missing levels.
3. **Titles** come from the patterns on the Daily root (`#yearPattern`, `#monthPattern`, `#weekPattern`,
   `#datePattern`; Trilium defaults where a pattern is missing). `{weekDay}` is the English day name.
4. **Labels** on each created note: the Trilium label of its level with the value in the format already
   used by existing notes of that level (look at one first; defaults: `#yearNote=2026`,
   `#monthNote=2026-11`, `#weekNote=2026-W44`, `#dateNote=2026-11-01`).
5. **Templates:** set `~template` on a new day note to the target of the Daily root's `~dateTemplate`, on
   a new week note to the target of `~weekTemplate`, and seed the content from that template note.
6. **Sorting:** if the Daily root's `#sorted` is **not** inheritable (check the attribute with
   `get_attributes`), also set `#sorted` and `#sortDirection=desc` on every year, month and week note you
   create.
7. **Roll-over from the last working day** (only when creating a new day note). The Daily Stand-Up fields
   live under **📅 Meetings → ⏰ Daily Stand-Up**. From the most recent existing day note, copy as starting
   drafts (postfix ` (draft, copy from previous day)`, verbatim, never summarized; empty source → empty
   target):
   - its **"My plan for today:"** → the new day's **"What I did yesterday (last working day):"**;
   - its **"⏭️ For tomorrow"** section → the new day's **"My plan for today:"**.
   The new day's own **"⏭️ For tomorrow"** starts empty; it is filled during the day and consumed into the
   next day's plan. The previous plan is not copied into the new plan.
8. **Offer the previous week's review** (only when creating the day note **also created a new week note**).
   The week that just ended may never have been summarized: find the immediately preceding week note (the
   `#weekNote` before the new one, by date); if it exists and its review is still unwritten (its body is
   only the empty Week template), **offer** to write it (§6) — never write it unprompted. Skip the offer
   when that week note is missing or already holds a review.

Never create a second note for a date that already exists. Report the path you created.

## 4. Captures (the inbox as a view, not a place)

- A capture is a **child note of the day note** (not text in the day's body), so it can be moved and
  linked on its own. Title: short, proposed by the agent and stated.
- Every capture carries **`#sbUntriaged`** until it is processed.
- A thought or idea also gets **`#sbMaturity=seed`** (not a to-do, link or fact).
- `#sbOrigin` is omitted for your own input (`human` is the default for Daily).
- **Cockpit / Untriaged** is the saved search over all open captures of every day.
- Appending to a capture you just made in this conversation ("add this too"): append with a short divider
  instead of creating a new note. Never guess a capture from an earlier conversation.

**Temporary notes (not captures).** Short operational jottings tied to the day itself — above all
**time-recording** entries (e.g. a time-recording start/stop) — are **not** captures: they go
into the day note's **⏱️ Time tracking** section (a line in the day body), carry **no `#sbUntriaged`**,
and are **never triaged**. They are ephemeral day context, not durable input. Only make a child capture
when the input is something to process later (a to-do, an idea, a reference); when it is a mere
operational marker for the day, write the line into Time tracking instead. When unsure which it is, ask.

## 5. Triage of a capture

Each capture ends up in exactly one of these, and `#sbUntriaged` is removed in every case:

| Outcome | What the agent does |
|---------|---------------------|
| **Belongs to a topic** | move it under the hub, area or project (it becomes part of the topic) |
| **A task** | move it under its home (hub, area or project) and clone it onto the Board — or, without a topic, move it directly onto the Board; set `status` to the Board's first column (Cockpit `_Schema`) |
| **Stays in the journal** | leave it under the day and set `~sbAbout` → the hub it relates to |
| **Foreign material** | move it to Sources (Sources `_Schema`) |
| **Discard** | delete it — only after your explicit confirmation |

**Task vs. note:** make a capture a **task** only when it names a concrete action to *do* with real
commitment; information about a tool or thing, a link, a reference, or a soft "I should try this sometime"
**stays a plain note** under the topic. When the intent is soft or unscheduled, default to a note and ask
before making a task (a task + Board clone is not cleanly reversible over MCP).

Offer an existing fitting destination; never create a hub, area, project or grouping node on your own.
Moves into Hubs are logged in `Hubs/_Log`, into Sources in `Sources/_Log`. Daily has no `_Log`.

## 6. Weekly review (the week note)

On request (`/sb-daily`, "weekly review"), the agent writes the review **into the week note** — only if
its effective control is `auto` (from the Week template). The agent also **offers** this review when a new
week rolls over and the just-ended week was never summarized (§3 step 8); the offer is a prompt, never an
automatic write. Content, all with clickable links:
- the days of the week (links only),
- tasks done or moved and projects touched (from the Board / `status` changes),
- hubs touched (captures with `~sbAbout`, moved captures, new notes),
- captures still untriaged,
- thoughts of the week — **link and date only, no paraphrase** (umbrella principle 6),
- open questions / next week (from your day notes; ask what you can't infer).

Write in the sections of the Week template; append rather than overwrite what you wrote there yourself.

## 7. Golden rules (Daily)

1. Day notes are your journal: fill sections from what you tell the agent; never invent content.
2. Never duplicate a date; find before you create; follow the live journal configuration.
3. Captures are child notes with `#sbUntriaged`; the inbox is the view Cockpit / Untriaged.
4. Foreign material goes to Sources, not into the journal.
5. Reference, don't copy: the day links to tasks and notes in their places.

## Appendix — finding the notes

| To find… | How |
|----------|-----|
| Daily root | `#sbSpace=daily` |
| this `_Schema` | `#sbType=schema` within Daily |
| templates | `_Templates/Day`, `_Templates/Week` (title + position), or the targets of `~dateTemplate` / `~weekTemplate` on the Daily root |
| a day note | `#dateNote=YYYY-MM-DD` within Daily |
| the week of a day | the day note's parent carrying `#weekNote` |
| open captures | `#sbUntriaged` within Daily (= Cockpit / Untriaged) |
