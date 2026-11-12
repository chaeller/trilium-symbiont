# `/sb-sync` owns repo-seeded descriptions on selected skeleton notes

The four space roots (Daily, Cockpit, Hubs, Sources), the Sources grouping nodes
(`Articles & clips`, `Documentation`, `Research`), the two `_Templates` container notes (under Daily and
Hubs) and Cockpit's `Proposals` were created empty by `/sb-init` and had no way to receive a descriptive
intro on existing instances. We decided these notes carry a short human-facing description that is
**owned by the repo** (`skeleton.md`) and pushed to live instances by `/sb-sync`, exactly like `_README`
and the umbrella `_Schema` already are — same major version (no major bump; this is a content
correction, not a new major version), with the same per-note confirmation. This widens the `/sb-sync` exception
in the scope law beyond `_README`/`_Schema`.

## Why this shape

- **Scope law is the authority, `#readOnly` is cosmetic.** `/sb-sync`'s right to overwrite a note comes
  from the note being named in the scope law's `/sb-sync` exception — *not* from its `#readOnly` label.
  Per the umbrella `_Schema` §4, `#readOnly` is only a Trilium UI flag and does not block MCP writes. We
  apply `#readOnly` to these notes as the "don't hand-edit" marker, but removing it in the UI must not
  silently change what `/sb-sync` may touch.
- **Identified by title + position**, as listed in `skeleton.md` (option A), consistent with the repo's
  ID-free rule (D9). Renaming one in the UI breaks its sync — acceptable, because these are now
  repo-owned machinery the human is not meant to rename.
- **Overwrite, not seed-only.** On each sync the body is replaced with the `skeleton.md` version after
  per-note confirmation. Safe because the notes are `#readOnly` and not meant to be hand-edited; the
  confirmation is the backstop.

## Explicitly excluded

The **template leaf notes** (`Day`, `Week`, `Hub`, `Synthesis`) are *not* made `#readOnly` and keep their
current status: repo-tracked and `/sb-sync`-compared, but still hand-editable in Trilium (e.g. the
`Other things:` line added to the Day template). Only the `_Templates` **container** notes are in the new
repo-owned set, not their children.
