import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-codegen-kotlin"

describe("@thomasfosterau/effect-codegen-kotlin", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-codegen-kotlin")
  })
})
