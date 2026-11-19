# AGENTS.md

Read [README.md](README.md) and [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) first; this file only adds what is specific to agents.

- You may open pull requests in this repository (GitHub MCP tools or `gh`). Say which gates ran and which couldn't.
- Out-of-scope work you notice: file an issue and move on.
- Write idiomatic Effect v4 (see docs/CONTRIBUTING.md); non-idiomatic code that isn't a trivial fix gets an issue listing the sites and the replacement.
- The `codegen-<language>` packages must never depend on or mention effect-loco; `.fallowrc.json`'s boundaries enforce the imports, review enforces the wording.
- `vp check` and `vp run check` are different commands: format + lint, and the type gate.
