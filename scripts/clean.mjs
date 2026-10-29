import * as Fs from "node:fs"
import { glob } from "node:fs/promises"

const patterns = ["dist", "packages/*/dist", "packages/*/build", "packages/*/coverage", "packages/*/*.tsbuildinfo"]

for (const pattern of patterns) {
  for await (const path of glob(pattern)) {
    Fs.rmSync(path, { recursive: true, force: true })
  }
}
