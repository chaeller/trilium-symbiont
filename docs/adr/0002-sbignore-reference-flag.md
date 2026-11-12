# `#sbIgnore` — a reference flag for sources the agent must not compile

Sources sometimes hold **reference material that should never be ingested** — e.g. the built-in Trilium
demo tree (~360 notes), imported as a sandbox to look at, not as curated knowledge. There was no flag for
this: `#sbIngested` would mean "already compiled" (a lie, and it would make lint's stale-check misfire on
any edit), and `#sbSecret` would hard-exclude it from being opened at all (wrong — the demo is not
sensitive). We added **`#sbIgnore`**.

## Decision

`#sbIgnore` is a **bare flag**, **inheritable down the subtree** (set once on a grouping node, covers all
children), **Sources-scoped**. It means: *reference material the agent processes only on explicit request*
— never in the ingest queue, never auto-compiled or cited as evidence, never listed in `Sources/_Index`,
never flagged by `/sb-lint`. It is a **soft** exclude: unlike `#sbSecret`, the agent **may** still open and
read an ignored note when the user points at it directly (e.g. `/sb-query` with a direct reference).

| Flag | Meaning | Agent may open? | In ingest queue? | In `_Index`? | Lint flags it? |
|------|---------|-----------------|------------------|--------------|----------------|
| `#sbSecret` | sensitive; hard exclude | never | no | no | no |
| `#sbIgnore` | reference; soft exclude | only on explicit request | no | no | no |
| `#sbIngested` | already compiled | yes | no | yes | no |
| *(none)* | normal source | yes | yes | yes | yes |

`#sbIgnore` ≠ `#sbIngested`: *ignore* = "never compile this"; *ingested* = "already compiled." No synthesis
cites an ignored note, so the stale-check never fires on it.

## Why this shape

- **Soft, not secret:** the demo should stay visible and openable on demand; only the proactive machinery
  skips it.
- **Inheritable:** one label on `Trilium - Demo` is enough; no need to touch every child.
- **Sources-only:** the only current use-case is in Sources; the effect is described in the Sources
  `_Schema` §4. Widen to other spaces only if a real need appears.
- **No major version bump:** adding a flag is backward-compatible — notes without it behave exactly as before,
  so the instance keeps its major version and `/sb-sync` carries the rulebook text.

## Update: `#sbSecret` retired

The comparisons with `#sbSecret` above are historical. Sensitive notes are now protected by Trilium's own
`#excludeFromLlm`, which hides them from every MCP tool (ADR 0005). `#sbIgnore` stays the soft,
agent-side exclude for reference material: weaker than `#excludeFromLlm`, and the agent may still open an
ignored note when the user points at it.
