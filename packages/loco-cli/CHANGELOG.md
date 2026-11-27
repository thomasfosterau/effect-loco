# @thomasfosterau/effect-loco-cli

## 0.0.1

### Patch Changes

- [#30](https://github.com/thomasfosterau/effect-loco/pull/30) [`8e17609`](https://github.com/thomasfosterau/effect-loco/commit/8e1760964de386ed25577ae9ad5767c4702784f3) Thanks [@thomasfosterau](https://github.com/thomasfosterau)! - Declare the `effect` peer as `^4.1.2` (was `^4.0.7`), from its own catalog: the CLI's runtime dependency `@effect/platform-node` depends on `@effect/platform-node-shared`, whose current release requires `effect ^4.1.2`, so the CLI's range now says what a fresh install needs. The library packages it builds on stay at `^4.0.0`.
- Updated dependencies [[`8e17609`](https://github.com/thomasfosterau/effect-loco/commit/8e1760964de386ed25577ae9ad5767c4702784f3)]:
  - @thomasfosterau/effect-codegen@0.0.1
  - @thomasfosterau/effect-loco@0.0.1
