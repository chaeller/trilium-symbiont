# Sensitive notes: Trilium's `#excludeFromLlm` replaces `#sbSecret`

Sensitive notes were marked `#sbSecret`: a rule the agent had to follow — never open, quote, index or
cite such a note, but it could still see its title and attributes. But a title-only search for `#sbSecret`
(`search_notes` with `fastSearch`) returns a **content preview** for every hit, so the content of exactly
those notes reaches the AI provider. A rule the agent follows cannot protect content that the tools hand
over before the agent decides anything. Trilium 0.107.0 offers a label it enforces itself:
`#excludeFromLlm` hides a note from every MCP tool and from Trilium's own AI chat.

## Decision

- Sensitive notes get **`#excludeFromLlm`** (inheritable on the root of a sensitive subtree). There is no
  agent-side secret label any more; `#sbSecret` was removed before 1.0.0 was released and is not listed as
  legacy. `check_repo` treats it as a leftover (D24).
- The agent **never tries to reveal** an excluded note, e.g. with search queries that test its title or
  content through a visible note — Trilium's search still evaluates such conditions.
- `/sb-capture` sets `#excludeFromLlm` on sensitive input as its **last** change; afterwards the note is
  invisible to the agent, so the user triages it by hand.
- `/sb-lint` **counts** likely secrets in visible notes with `search_notes` and `limit: 0` (only the count
  comes back, no previews) and offers a saved search the user opens in Trilium, instead of listing titles.

## Why this shape

- **Enforcement beats convention.** Only a boundary the server enforces holds against tool behaviour the
  agent does not control (previews in search, `get_note`, `append_to_note` results).
- **Invisibility is acceptable.** The agent loses the ability to list or lint excluded notes. That is the
  point: what it cannot see it cannot leak. `#sbIgnore` (ADR 0002) stays the soft, agent-side exclude for
  reference material.
- **Requires Trilium ≥ 0.107.0**, which the repo requires anyway (D11).
