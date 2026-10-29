import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-codegen-swift"

describe("@thomasfosterau/effect-codegen-swift", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-codegen-swift")
  })
})
