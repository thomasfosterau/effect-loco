import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-loco-svelte"

describe("@thomasfosterau/effect-loco-svelte", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-loco-svelte")
  })
})
