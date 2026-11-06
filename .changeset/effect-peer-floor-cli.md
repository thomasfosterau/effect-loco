---
"@thomasfosterau/effect-loco-cli": patch
---

Declare the `effect` peer as `^4.1.2` (was `^4.0.7`), from its own catalog: the CLI's runtime dependency `@effect/platform-node` depends on `@effect/platform-node-shared`, whose current release requires `effect ^4.1.2`, so the CLI's range now says what a fresh install needs. The library packages it builds on stay at `^4.0.0`.
