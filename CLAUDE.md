# effect-loco

Write UI components once with Effect, compile them to many UI frameworks. See `README.md` for the architecture.

## Layout

- `packages/loco/core` (`@thomasfosterau/effect-loco`): component DSL, IR (`Schema`-defined, serialisable) and the
  `Target` interface that framework packages implement.
- `packages/loco/cli` (`@thomasfosterau/effect-loco-cli`): the `loco` binary; loads config and component modules, runs
  targets, writes files.
- `packages/loco/<framework>`: one package per UI framework. Maps IR to a language AST from a codegen package.
- `packages/codegen/core` (`@thomasfosterau/effect-codegen`): language-agnostic printing and file emission.
- `packages/codegen/<language>` (`@thomasfosterau/effect-codegen-<language>`): a language AST and printer. These
  packages must stay generic: they must never depend on or mention effect-loco.

## Design rules

- Component logic in the IR is limited to views, state and events. Side effects are declared as `Schema`-typed services
  and implemented by the host app natively on each platform. Do not try to translate arbitrary Effect code.
- Generated code should be idiomatic for its framework, not a runtime shim.

## Conventions

- Effect 4 (`effect@^4`). Import modules by namespace from deep paths: `import * as Effect from "effect/Effect"`.
- ESM only, `.ts` extensions in relative imports, `erasableSyntaxOnly`.
- Every exported symbol gets a JSDoc comment with `@since` (and `@category` where useful).
- Tests live in `packages/*/*/test/**/*.test.ts` and use `@effect/vitest` (`it.effect` for effectful tests). Prefer
  snapshot tests for printers and generated output.
- Add a changeset (`pnpm changeset`) for user-facing changes.

## Commands

Run these before pushing: `pnpm check`, `pnpm lint`, `pnpm vitest run`. `pnpm build` builds every package.

When adding a package: add it to `tsconfig.packages.json`, add its path aliases to `tsconfig.json`, and reference its
workspace dependencies in its `tsconfig.json`.
