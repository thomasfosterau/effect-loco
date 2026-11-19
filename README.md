# effect-loco

Write apps and components once with [Effect](https://effect.website), then compile them to idiomatic code for many UI frameworks: React, Svelte, SwiftUI, UIKit, Jetpack Compose and more.

> [!CAUTION]
> Experimental and pre-1.0, largely written with Claude Code. Nothing works yet, and every API may change.

## How it works

```
component modules ──▶ effect-loco (DSL) ──▶ IR ──▶ effect-loco-cli ──▶ target package ──▶ effect-codegen-<lang> ──▶ files
```

Components describe props, state, views and events with the DSL. Side effects are declared as `Schema`-typed services that each target emits as a native interface for the host app to implement. The `loco` CLI builds the IR and hands it to each target, which prints source through a codegen package. The codegen packages know nothing about effect-loco and suit any Effect-based code generation.

## Install

Not on npm yet. Once released, a project adds the CLI and its targets as dev dependencies beside `effect`:

```sh
pnpm add -D @thomasfosterau/effect-loco-cli @thomasfosterau/effect-loco-react
pnpm add @thomasfosterau/effect-loco effect
```

## Packages

| Package                                                                                                                                                                                                  | Description                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`@thomasfosterau/effect-loco`](packages/loco)                                                                                                                                                           | Component DSL, IR and target interface                          |
| [`@thomasfosterau/effect-loco-cli`](packages/loco-cli)                                                                                                                                                   | The `loco` command line interface                               |
| [`@thomasfosterau/effect-loco-react`](packages/loco-react), [`-svelte`](packages/loco-svelte), [`-swiftui`](packages/loco-swiftui), [`-uikit`](packages/loco-uikit), [`-compose`](packages/loco-compose) | Framework targets                                               |
| [`@thomasfosterau/effect-codegen`](packages/codegen)                                                                                                                                                     | Language-agnostic codegen primitives (documents, printing, I/O) |
| [`@thomasfosterau/effect-codegen-typescript`](packages/codegen-typescript), [`-swift`](packages/codegen-swift), [`-kotlin`](packages/codegen-kotlin)                                                     | Language ASTs and printers                                      |

## More

- [Contributing](docs/CONTRIBUTING.md), [publishing](docs/PUBLISHING.md), [security](docs/SECURITY.md)
- [MIT licence](LICENSE.md)
