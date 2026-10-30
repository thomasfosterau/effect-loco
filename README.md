# effect-loco

> [!WARNING]
> effect-loco is a highly experimental project. Nothing here works yet, and every API is subject to change.

Write apps and components **once** with [Effect](https://effect.website), then compile them to idiomatic code for many UI
frameworks: React, Svelte, SwiftUI, UIKit, Jetpack Compose and more.

## How it works

```
component modules ──▶ effect-loco (DSL) ──▶ IR ──▶ effect-loco-cli ──▶ target package ──▶ effect-codegen-<lang> ──▶ files
                                                                       (e.g. swiftui)     (e.g. swift)
```

1. **Author** components with the `@thomasfosterau/effect-loco` DSL. A component describes its props, state, view tree
   and events using Effect and `Schema`.
2. **Side effects are declared, not implemented.** Anything effectful (fetching data, storage, navigation, ...) is
   declared as a `Schema`-typed service. Each target emits a native interface for it (a TypeScript interface, a Swift
   protocol, a Kotlin interface), which the host app implements on each platform.
3. **The CLI** (`loco`) imports your component modules, builds the framework-agnostic IR and hands it to each configured
   target.
4. **Target packages** (`effect-loco-react`, `effect-loco-swiftui`, ...) map the IR onto a language AST provided by a
   **codegen package** (`effect-codegen-typescript`, `effect-codegen-swift`, ...), which prints the final source files.

The codegen packages are deliberately generic: they know nothing about effect-loco and can be used for any Effect-based
code generation.

## Packages

| Package                                                                    | Description                                                     |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`@thomasfosterau/effect-loco`](packages/loco)                             | Component DSL, IR and target interface                          |
| [`@thomasfosterau/effect-loco-cli`](packages/loco-cli)                     | The `loco` command line interface                               |
| [`@thomasfosterau/effect-loco-react`](packages/loco-react)                 | React target                                                    |
| [`@thomasfosterau/effect-loco-svelte`](packages/loco-svelte)               | Svelte target                                                   |
| [`@thomasfosterau/effect-loco-swiftui`](packages/loco-swiftui)             | SwiftUI target                                                  |
| [`@thomasfosterau/effect-loco-uikit`](packages/loco-uikit)                 | UIKit target                                                    |
| [`@thomasfosterau/effect-loco-compose`](packages/loco-compose)             | Jetpack Compose target                                          |
| [`@thomasfosterau/effect-codegen`](packages/codegen)                       | Language-agnostic codegen primitives (documents, printing, I/O) |
| [`@thomasfosterau/effect-codegen-typescript`](packages/codegen-typescript) | TypeScript/TSX AST and printer                                  |
| [`@thomasfosterau/effect-codegen-swift`](packages/codegen-swift)           | Swift AST and printer                                           |
| [`@thomasfosterau/effect-codegen-kotlin`](packages/codegen-kotlin)         | Kotlin AST and printer                                          |

## Development

Requires Node.js 22+ and pnpm 10. The toolchain is [Vite+](https://viteplus.dev) (`vp`).

```sh
pnpm install            # dependencies, git hooks and the Effect-patched tsc / oxlint
vp check                # format + lint (Oxfmt + Oxlint, type-aware)
vp run check            # type-check everything (TypeScript project references)
vp run -r test:unit     # run every package's tests
vp run -r build         # build all packages to dist/ (vp pack)
vp run test:coverage    # all tests under one coverage map (read by fallow)
pnpm changeset          # describe a change for the next release
```

## License

[MIT](LICENSE)
