---
"@thomasfosterau/effect-codegen": patch
"@thomasfosterau/effect-codegen-kotlin": patch
"@thomasfosterau/effect-codegen-swift": patch
"@thomasfosterau/effect-codegen-typescript": patch
"@thomasfosterau/effect-loco": patch
"@thomasfosterau/effect-loco-compose": patch
"@thomasfosterau/effect-loco-react": patch
"@thomasfosterau/effect-loco-svelte": patch
"@thomasfosterau/effect-loco-swiftui": patch
"@thomasfosterau/effect-loco-uikit": patch
---

Declare the `effect` peer as `^4.0.0` (was `^4.0.7`), per the peer-range policy: no dependency of these packages requires a newer Effect, so the range only widens. The type gate and the unit suites pass with `effect` 4.0.0.
