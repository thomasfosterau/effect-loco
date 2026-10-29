import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-loco"

describe("@thomasfosterau/effect-loco", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-loco")
  })
})
