# Concurrent edits: verify-after-write, prefer append, warn on fresh edits

On a live instance an agent write disappeared: `/sb-daily` wrote meeting notes into the day note
with `set_note_content`, reported success, but the content was gone on the next read. The note was open
in the Trilium editor, whose autosave pushes the **whole** note body; its save landed after the agent's
write and overwrote it (last-writer-wins). The agent had no way to know, because it did not re-read.

This race is **not** specific to one skill: it exists for every full-body rewrite (`set_note_content`) of
any note that is simultaneously open in the UI with unsaved edits — day notes, weekly reviews, syntheses,
concepts, hub pages, indexes, proposals, and the rulebooks themselves. The agent cannot prevent it from
its side: the MCP server (and ETAPI, which skills may not use — D11) is a data API with no command to
close, refresh or refocus a UI tab.

## Decision

A system-level rule in the umbrella `_Schema` §6 (the shared rulebook every skill reads first), so it
applies everywhere by construction rather than being duplicated per skill. On every content rewrite of an
existing note:

1. **Prefer `append_to_note`** for additive changes — it does not discard the user's concurrent text even
   if it races (logs already work this way, D16).
2. **Verify after a full rewrite** — re-read the note, confirm the change is present; on a clobber do not
   report success, re-read the current body, merge the change onto it, retry, and report the collision.
3. **Warn on a fresh edit** — if `dateModified` is only seconds old, warn and suggest clicking away before
   writing.

It is the interactive counterpart to the dormant `#sbLock` and supersedes it for human-triggered work.

## Why this shape

- **Detect-and-recover, not prevent.** Trilium offers no lock and no UI control over MCP; the only robust
  safeguard the agent owns is to make a clobber loud (verified) and recoverable (merge-and-retry) instead
  of a silent "✅ Done".
- **One place.** Putting it in the umbrella keeps it DRY: no per-skill copy to drift, and it covers
  skills added later.
- **No major version bump.** It is a clarification/safety rule, backward-compatible with every existing
  note (like `#sbIgnore` in ADR 0002); `/sb-sync` carries the rulebook text into live instances.
