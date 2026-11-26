# Contributing

Read the [README](../README.md) first. Agents should also read [AGENTS.md](../AGENTS.md).

## Workflow

- Branch off `trunk` and open a pull request into `trunk`; never commit to `trunk` directly. Open a draft PR as soon as you start.
- One PR per change, however large. Getting it green, reviewed and conflict-free is the author's job. Rebase onto `origin/trunk` rather than merging `trunk` in; PRs are squash-merged with a conventional prefix (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- Found something out of scope? File an issue and carry on. Keep issue bodies evergreen: update the body rather than appending comments.
- Dependabot keeps dependencies current. Update by hand only when your change needs it or Dependabot can't (below).

## Toolchain

[Vite+](https://viteplus.dev) (`vp`) manages Node, pnpm and every tool: `vp exec <bin>` instead of `npx`, `vp run <task>` for the tasks in `vite.config.ts`. `vp install` installs dependencies, the git hooks and the `prepare` step that patches the native `tsc` / `oxlint` with `@effect/tsgo`.

| Command                | What it does                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| `vp check`             | Format + lint (Oxfmt, Oxlint with the Effect presets; type-aware)          |
| `vp run check`         | The type gate: `tsc -b` with the Effect-patched native `tsc`               |
| `vp run -r test:unit`  | Every package's suite; `vp test run <file>` inside a package runs one file |
| `vp run -r build`      | `vp pack` to each package's `dist/`                                        |
| `vp run ci`            | Everything CI runs, in order, stopping at the first failure                |
| `vp run test:coverage` | Every suite under one Istanbul map, read by the fallow audit               |

The pre-commit hook runs `vp staged` (format and lint the staged files) and then `vp run fallow:audit`. [Fallow](https://docs.fallow.tools) reports dead code, duplication, complexity and the package boundaries in `.fallowrc.json`, failing only on findings your change introduces. Treat it as advice, not dogma; CI doesn't run it.

### Dependencies

Dependabot ([dependabot.yml](../.github/dependabot.yml)) opens every update weekly, on Wednesday morning Melbourne time: the named runtime sets (`effect` and the like) each in one PR, and every other development dependency in the single `toolchain` group. Security updates skip the schedule and open as soon as an advisory lands, one PR each. Vite+ selects Node.js from `.node-version` and pnpm from `packageManager`; pnpm's own switching is off (`runtimeOnFail` / `pmOnFail`), so one version of each is installed and used.

Every version lives in the `pnpm-workspace.yaml` catalog; `package.json` files use `catalog:`, `catalog:peers` or `workspace:^` only. After editing the catalog, run `vp install` and commit `pnpm-lock.yaml`. Dependabot can't do these, so make them in a PR from a new branch started from its head (never push to a `dependabot/*` branch, which stops it rebasing), and it closes its own PR once yours merges:

- `vite` (an npm alias) equals `vite-plus`; `vitest` and `@vitest/coverage-istanbul` equal the vitest vite-plus pins. The devcontainer image tag equals `vite-plus` too.
- `@effect/tsgo`, `@typescript/native` (an npm alias) and vite-plus's oxlint must be a combination the `components` table in `node_modules/@effect/tsgo/dist/effect-tsgo.cjs` supports, or `vp install` fails.

### Adding a package

Give it a `vite.config.ts` calling `packageConfig()` from `vite.package.ts`, a `tsconfig.json` referencing its workspace dependencies, an entry in `tsconfig.packages.json` and path aliases in `tsconfig.json`, a `test/tsconfig.json` extending the root `tsconfig.json` (so type-aware lint sees the `paths`), and a zone and rule in `.fallowrc.json`.

## Coding guidelines

- Use Effect idioms throughout, and prefer Effect v4's own modules (`Option`, `Array`, `Match`, `Schema`, …) to re-inventing them; convert existing code where practical. Exceptions: non-Effect APIs, adapted at the edge, and hot paths where a measurement shows plain code is needed. Non-idiomatic code you can't fix trivially gets an issue listing the sites and the replacement.
- Read the installed `effect` package (`node_modules/effect/dist/*.d.ts`) rather than guessing at its API. Import modules by namespace from deep paths (`import * as Effect from "effect/Effect"`).
- Exports follow Effect v4's layout: one PascalCase module per concept, re-exported as a namespace from `index.ts` (`export * as Component from "./Component.ts"`) and importable through its own subpath (`./Component`, served by the `./*` export). Private code goes in `internal/`.
- `effect` is a peer of every published package (`^4.0.0` unless a dependency requires more), never a dependency: two copies break `Context` / `Schema` identity.
- Component logic in the IR is limited to views, state and events; side effects are `Schema`-typed services the host app implements. Generated code is idiomatic for its framework, not a runtime shim.
- The `codegen` packages stay generic: they never depend on or mention effect-loco.
- Fix lint findings rather than disabling rules; a rule is relaxed only in `vite.config.ts`, scoped and with its reason.

### Comments

- A file-level comment only when it adds non-obvious context (under 50 words).
- Doc comments on exports where they help someone reading IntelliSense, not restating the signature. Exports carry `@since` (and `@category` where useful).
- Inline comments only where the code can't explain itself: workarounds, performance, non-obvious decisions.
- Never reference GitHub issues, PRs or CI runs in code or docs; stable links to external documentation are fine.

### Tests

- Tests live in `packages/<name>/test/**/*.test.ts`, use `@effect/vitest` (`it.effect` for effectful tests) and import packages by name. Prefer snapshots for printers and generated output.
- Test logic, edge cases and regressions; don't test what the type system already enforces, or trivial code.

## Before you push

Run `vp run ci` (format, lint, type gate, tests, build, `pnpm audit`). The pre-commit hook already ran the fallow audit.

## Changesets

Every change to a published package's behaviour or its emitted `.d.ts` (doc comments included, as a `patch`) needs a changeset: run `pnpm changeset` and commit the file with the change. Docs, CI and tooling changes need none. While pre-1.0, a breaking change is a `minor`. The `effect-loco` packages version together. Never version or publish by hand: the Release workflow runs `vp run release` (`vp run release:dry-run` shows what it would publish); see [PUBLISHING.md](PUBLISHING.md).
