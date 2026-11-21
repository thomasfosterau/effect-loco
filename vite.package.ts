/**
 * The Vite+ configuration every workspace package instantiates from its own
 * `vite.config.ts`. Development `exports` point at `src/`, so no task needs a
 * sibling's build first.
 */
import { defineConfig } from "vite-plus"

// Auto tracking minus node_modules churn (pnpm rewrites `.modules.yaml` on
// every install), with the lockfile so an upgrade still invalidates the cache.
const cacheInputs = [
  { auto: true },
  "!node_modules/**",
  { pattern: "!node_modules/**", base: "workspace" as const },
  { pattern: "pnpm-lock.yaml", base: "workspace" as const }
]

const setupFile = new URL("./vitest.setup.ts", import.meta.url).pathname

export const packageConfig = () =>
  defineConfig({
    run: {
      tasks: {
        // `unbundle`: `dist/` mirrors `src/`, so `publishConfig`'s
        // `./*` → `./dist/*.js` export map resolves.
        build: {
          command: "vp pack",
          cache: { input: cacheInputs, output: ["dist/**"] }
        },
        "test:unit": {
          command: "vp test run",
          cache: { env: ["NODE_OPTIONS"], input: cacheInputs, output: [] }
        }
      }
    },
    pack: {
      entry: ["src/**/*.ts"],
      format: "esm",
      platform: "node",
      unbundle: true,
      // `.js` / `.d.ts`, the extensions `publishConfig.exports` names.
      fixedExtension: false,
      dts: true,
      sourcemap: true,
      outDir: "dist",
      clean: true,
      deps: {
        // tsdown <0.23 compatibility: resolve external dependency subpaths.
        // Remove to preserve subpath imports as written (the new default).
        // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
        resolveDepSubpath: true
      }
    },
    resolve: {
      // Tests import packages by name; the root tsconfig.json maps each to `src/`.
      tsconfigPaths: true
    },
    test: {
      setupFiles: [setupFile],
      sequence: {
        concurrent: true
      },
      include: ["test/**/*.test.{ts,tsx}"],
      // The scaffolds have no tests yet.
      passWithNoTests: true
    }
  })
