/**
 * The Vite+ configuration every package in this workspace shares: its task
 * graph (`build`, `test:unit`), the `vp pack` (tsdown) settings and the
 * vitest settings. Each `packages/<name>/vite.config.ts` is a one-call
 * instantiation of it, and the root `vite.config.ts` lists those files as its
 * vitest projects.
 *
 * Development `exports` point at `src/` (`publishConfig.exports` swaps in
 * `dist/` at publish), so a package consumes its siblings from source: no task
 * here needs a sibling's build first.
 */
import { defineConfig } from "vite-plus"

/**
 * Input fingerprint for the cached tasks: auto tracking minus node_modules
 * bookkeeping churn (pnpm rewrites `.modules.yaml` on every install), with the
 * lockfile back explicitly so a dependency upgrade still invalidates a cached
 * build or test run.
 */
const cacheInputs = [
  { auto: true },
  "!node_modules/**",
  { pattern: "!node_modules/**", base: "workspace" as const },
  { pattern: "pnpm-lock.yaml", base: "workspace" as const }
]

const setupFile = new URL("./vitest.setup.ts", import.meta.url).pathname

/** The shared configuration of one workspace package. */
export const packageConfig = () =>
  defineConfig({
    run: {
      tasks: {
        // The published artifact: one ESM module and declaration file per
        // source module (`unbundle`), so `dist/` mirrors `src/` and the
        // `./*` → `./dist/*.js` export map in `publishConfig` resolves.
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
      clean: true
    },
    resolve: {
      // Tests import the package by its own name; the root tsconfig.json's
      // `paths` map every workspace package to its `src/`.
      tsconfigPaths: true
    },
    test: {
      setupFiles: [setupFile],
      sequence: {
        concurrent: true
      },
      include: ["test/**/*.test.{ts,tsx}"]
    }
  })
