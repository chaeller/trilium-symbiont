# Skills must run unchanged in Kiro, Claude Code and Claude Desktop

The same `sb-*` skills, rulebooks and steering file are used by three AI clients — **Kiro**, **Claude
Code** and **Claude Desktop** — on **Windows and Linux/macOS**. The clients load skills differently: Kiro
and Claude Code read the skill folders from disk (linked into the repo), Claude Desktop gets one uploaded
ZIP per skill and has no repo on disk. Several rules in `AGENTS.md` look odd or redundant from a single
client's point of view; they exist because a change that is better for one client but breaks another is a
regression.

## Decision

- **Front-matter has only `name` and `description` (D1).** That is the Agent Skills format the Desktop ZIP
  upload expects; client-specific keys (`argument-hint`, `disable-model-invocation`, `inclusion`, …) do not
  belong in skills.
- **The description says what the skill does and "Use when …", at most 200 characters, no slash syntax
  (D2).** Claude Desktop and Claude Code pick a skill by its description; `Usage: /sb-x <args>` is a Claude
  Code idiom; 200 characters is the conservative limit of the Desktop upload.
- **No `$ARGUMENTS` (D3).** Claude Desktop does not substitute it — the literal placeholder would stay in
  the prompt. Skills refer to "the user's request" instead; Claude Code appends arguments on its own.
- **Client-neutral wording, no install paths in skills (D6).** "Your client's file-read tool", not Kiro's
  `read` or Claude's `Read`; paths like `~/.kiro/…` or `~/.claude/…` belong in `docs/install.md`.
- **One steering file for all clients; its `inclusion: always` front-matter stays (D7).** Kiro needs the
  front-matter, Claude Code imports the file from `~/.claude/CLAUDE.md` (the front-matter is harmless),
  Desktop users paste the text without it into the project instructions.
- **Assets resolve without the repo (D5), and shared files are bundled into the ZIP (ADR 0007).**
- **No ETAPI calls in skills (D11).** ETAPI needs a separate token outside the MCP server, which not every
  client has; everything goes through the Trilium MCP tools.
- **LF line endings only (D21).** CRLF from Windows editors (e.g. Kiro on Windows) made whole files look
  changed in diffs and leaked CR characters into Trilium notes written by `/sb-sync`.

## Why this shape

- **One source, three consumers.** Keeping one set of files that every client accepts is cheaper than
  per-client variants, which would drift.
- **Checked, not remembered.** `check_repo` enforces D1–D3, D6, D7 and D21, so a change made from one
  client's point of view fails before it reaches the others.
- **When a rule is changed** (with the user's OK), update its entry in `AGENTS.md` and, if the reason
  changed, this ADR — in the same commit.
