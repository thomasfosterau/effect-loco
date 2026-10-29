import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-loco-react"

describe("@thomasfosterau/effect-loco-react", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-loco-react")
  })
})
