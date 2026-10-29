import { describe, expect, it } from "@effect/vitest"
import { packageName } from "@thomasfosterau/effect-codegen-typescript"

describe("@thomasfosterau/effect-codegen-typescript", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@thomasfosterau/effect-codegen-typescript")
  })
})
