# effect-loco

`CLAUDE.md` is a symlink to this file. Write UI components once with Effect, compile them to many UI frameworks. See `README.md` for the architecture.

## Layout

- `packages/loco` (`@thomasfosterau/effect-loco`): component DSL, IR (`Schema`-defined, serialisable) and the
  `Target` interface that framework packages implement.
- `packages/loco-cli` (`@thomasfosterau/effect-loco-cli`): the `loco` binary; loads config and component modules, runs
  targets, writes files.
- `packages/loco-<framework>`: one package per UI framework. Maps IR to a language AST from a codegen package.
- `packages/codegen` (`@thomasfosterau/effect-codegen`): language-agnostic printing and file emission.
- `packages/codegen-<language>` (`@thomasfosterau/effect-codegen-<language>`): a language AST and printer. These
  packages must stay generic: they must never depend on or mention effect-loco. The `boundaries` zones in
  `.fallowrc.json` fail `fallow` on an import that crosses this line.

## Design rules

- Component logic in the IR is limited to views, state and events. Side effects are declared as `Schema`-typed services
  and implemented by the host app natively on each platform. Do not try to translate arbitrary Effect code.
- Generated code should be idiomatic for its framework, not a runtime shim.

## Common pitfalls

- **Never edit a version in a `package.json`.** Every external version lives in the `pnpm-workspace.yaml` catalog
  (`catalogMode: strict`; published peer ranges under `catalogs.peers`); manifests carry only `catalog:`,
  `catalog:peers` or `workspace:^`. After editing the catalog, run `pnpm install` and commit `pnpm-lock.yaml`.
- **`vite-plus`, `@effect/tsgo` and `@typescript/native` move together.** `pnpm install`'s `prepare` step runs
  `effect-tsgo patch --typescript --oxlint`, which hard-errors on a `tsc` / `oxlint` / `oxlint-tsgolint` it has no
  build for; read the catalog comments first. Dependabot (`.github/dependabot.yml`) groups every lockstep set
  (`toolchain`, `effect`, `changesets`, `fallow`, `github-actions`) with a 1-day cooldown (pnpm's
  `minimumReleaseAge` is 480 minutes, 8 hours). By hand, on the matching PR's branch: the npm aliases (`vite`, equal to
  `vite-plus`; `typescript` and `@typescript/native`, a pairing `@effect/tsgo` supports), the `overrides` and
  `catalogs.peers`, as that file's header lists.
- **`effect` is a peer, never a dependency** of a published package: two copies break `Context` / `Layer` / `Schema`
  identity. The `effect` override forces one copy.
- **Development `exports` point at `src/`, published ones at `dist/`** (`publishConfig.exports`), so siblings and
  type-aware lint resolve each other from source and no task needs a build first.

## Conventions

- Effect 4 (`effect@^4`). Import modules by namespace from deep paths: `import * as Effect from "effect/Effect"`.
- ESM only, `.ts` extensions in relative imports, `erasableSyntaxOnly`.
- Every exported symbol gets a JSDoc comment with `@since` (and `@category` where useful).
- Tests live in `packages/*/test/**/*.test.ts` and use `@effect/vitest` (`it.effect` for effectful tests). Prefer
  snapshot tests for printers and generated output.
- Lint findings are fixed, not suppressed: no `oxlint-disable` comments; a rule is relaxed only in `vite.config.ts`,
  with a comment giving the reason.
- Add a changeset (`pnpm changeset`) for user-facing changes.

## Commands

- `pnpm install` — dependencies, the Vite+ git hooks (pre-commit runs `vp staged`: format with fixes, then lint
  without) and the `prepare` step that patches the native `tsc` / `oxlint` with `@effect/tsgo`.
- `vp check` — format + lint (Oxfmt + Oxlint with `@effect/tsgo`'s preset, `@enfect/oxlint`'s `recommended` Effect
  rules and oxlint's `correctness`, `suspicious` and `perf` categories). Lint is type-aware through oxlint-tsgolint
  (`typeAware` + `typeCheck`); each `packages/*/test/tsconfig.json` gives the suites the root `paths` there.
  `vp run check` — the type gate (`tsc -b tsconfig.json` with the Effect-patched native `tsc`). They are different
  commands.
- `vp run -r test:unit` — every package's suite.
- `vp run -r build` — `vp pack` (tsdown) → every package's `dist/`.
- `vp run test:coverage` — every suite under one Istanbul map at `coverage/coverage-final.json`, which `fallow audit`
  reads.
- `fallow` (`pnpm run fallow`) — dead code, duplication, complexity and the package boundaries (`.fallowrc.json`).
- `pnpm changeset` — add a changeset.

Invoke everything through `vp` (`vp exec` instead of `npx`). When adding a package: give it a `vite.config.ts` that
calls `packageConfig()` from `vite.package.ts`, add it to `tsconfig.packages.json`, add its path aliases to
`tsconfig.json`, reference its workspace dependencies in its `tsconfig.json`, add a `test/tsconfig.json` like its
siblings', and add a zone and rule in `.fallowrc.json`.

## Verification

Before you report work as done, run these in order (CI's order, `.github/workflows/ci.yml`) and quote each command
with its final pass/fail:

1. `vp check`
2. `vp run check`
3. `vp run -r test:unit`
4. `vp run -r build`
5. `pnpm audit --audit-level high` (network)
6. `vp run test:coverage`, then `fallow audit --format json --quiet --explain --gate-marker agent --base origin/main`
   (the fallow gate below; not a CI step).

CI runs steps 1–5 in one job with a read-only token and no secrets, so Dependabot PRs run it safely. Every action is
pinned to a commit SHA, checkout never persists credentials, and Node is `"*"` with `check-latest` (never `latest`,
which can resolve to a pre-release). `uvx zizmor --offline .github` audits the workflows (`.github/zizmor.yml`).

## Agent sessions

- The SessionStart hook (`.claude/hooks/session-start.sh`) installs dependencies against the lockfile and puts `vp`
  (a re-exec shim) and `fallow` on PATH for non-interactive shells. It hydrates no secrets.
- A PreToolUse hook (`.claude/hooks/fallow-gate.sh`) blocks `git commit` / `git push` when
  `fallow audit --base origin/main` fails; it reads the coverage map on disk, so run `vp run test:coverage` first. A
  PostToolUse hook runs `vp fmt` on every source, JSON, CSS or Markdown file you write or edit.
- `.claude/settings.json` enables the `@enfect/claude` plugin (Effect guidance, skills and post-write pattern checks),
  pinned by `ref` to a reviewed `mpsuesser/enfect` commit.

## Fallow local gate

Before any `git commit` or `git push`, run `fallow audit --format json --quiet --explain --gate-marker agent --base origin/main`. If the verdict is `fail`, fix the reported findings before retrying. Treat JSON runtime errors like `{ "error": true, ... }` as non-blocking. Audit defaults to `gate=new-only`: only findings introduced by the current changeset affect the verdict.

## Fallow task map

| When the agent is about to...                                     | Run                                          |
| ----------------------------------------------------------------- | -------------------------------------------- |
| delete an "unused" export or file                                 | `fallow dead-code --trace <file>:<export>`   |
| delete an "unused" dependency                                     | `fallow dead-code --trace-dependency <name>` |
| commit or open a PR                                               | `fallow audit --base origin/main`            |
| check which architecture rules apply to a file before changing it | `fallow guard <files>`                       |
| understand a finding                                              | `fallow explain <issue-type>`                |

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
