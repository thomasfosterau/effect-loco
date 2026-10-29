import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-loco-uikit"

describe("@thomasfosterau/effect-loco-uikit", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-loco-uikit")
  })
})
