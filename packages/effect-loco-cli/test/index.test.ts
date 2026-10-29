import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-loco-cli"

describe("@thomasfosterau/effect-loco-cli", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-loco-cli")
  })
})
