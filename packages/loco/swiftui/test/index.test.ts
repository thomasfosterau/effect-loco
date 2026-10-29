import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-loco-swiftui"

describe("@thomasfosterau/effect-loco-swiftui", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-loco-swiftui")
  })
})
