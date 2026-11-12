# Evidence lives in the in-text links

The Hubs `_Schema` required one `~sbSource` relation from a synthesis or concept to **each** note it
draws on. During the first ingest on a live instance this turned out to be impossible: the Trilium MCP
`set_attribute` **updates** an existing attribute of the same type and name instead of adding a second
one. Setting `~sbSource` twice leaves only the last value.

## Decision

- **Evidence = in-text links.** Every statement of a synthesis or concept carries a clickable link to the
  note it draws on. Trilium records each such link as an `~internalLink` relation, so the set of cited
  notes stays queryable without any extra attribute.
- **`~sbSource` = main source**, set once per synthesis or concept. It is a convenience pointer, not the
  evidence record.
- `/sb-lint` checks staleness and dangling evidence against the cited notes (the `~internalLink`
  targets), plus `~sbSource`.

## Why this shape

- It works with the tools every client has (no ETAPI, D11) and needs no workaround such as numbered
  relation names (`~sbSource1`, `~sbSource2`), which would be noisy and fragile.
- The in-text links were already required ("put an in-text link next to the statement"); they now carry
  the meaning on their own.
- No version bump: existing syntheses stay valid; `/sb-sync` carries the rulebook text.

## Update 2026-11-12 (Trilium 0.107.0)

The MCP limitation that motivated this ADR is fixed upstream: `set_attribute` has `mode: "add"` for
several same-name attributes (issue #12078). The decision stays, now for its own sake: the in-text links
are the complete evidence list, and a parallel `~sbSource` list would drift from the text. Also fixed in
0.107.0: links in content written by the MCP tools were not recorded as `~internalLink` (PR #12487), so
syntheses written earlier have none; `/sb-lint` reports them for a re-save.

## Update: `~sbSource` retired

With the links recorded reliably (Trilium ≥ 0.107.0), `~sbSource` added nothing: the `~internalLink`
targets already list every cited note, the stale check uses them, and the "main source" of a hub synthesis
was an arbitrary pick nobody consumed. It was removed before 1.0.0 was released; `check_repo` treats it as
a leftover (D22). Dangling evidence is found by comparing the note IDs in the text with existing notes —
Trilium deletes the relations to a deleted note, so neither `~internalLink` nor a source relation could
show it.
