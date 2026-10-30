/**
 * Root workspace config. Owns the repo-wide format / lint / staged passes (read
 * statically by `vp fmt` / `vp lint` / `vp staged`), the root task aggregates
 * (`check`, `test:coverage`) and the vitest project list. Every package's own
 * tasks (`build`, `test:unit`) and its `vp pack` settings are defined once in
 * `vite.package.ts` and instantiated by each `packages/<name>/vite.config.ts`.
 */
import { recommended } from "@effect/tsgo/oxlint-presets"
import effect from "@enfect/oxlint"
import { defineConfig } from "vite-plus"

const ignored = ["**/dist/**", "**/build/**", "**/docs/**", "**/coverage/**", "**/*.tsbuildinfo"]

export default defineConfig({
  // Staged-file checks run by `vp staged` (the pre-commit hook). Format with
  // fixes, lint without: with type-aware lint on, `vp check --fix` would apply
  // the autofixes of type-aware rules (even ones at `warn`) to staged files at
  // commit time, so the commit would differ from the tree that was verified.
  // `--no-error-on-unmatched-pattern` keeps a commit that stages only files
  // the linter skips (Markdown, JSON) from failing the lint step.
  staged: {
    "*.{js,ts,tsx,mjs,json,md,yaml,yml}": [
      "vp check --fix --no-lint",
      "vp check --no-fmt --no-error-on-unmatched-pattern"
    ]
  },
  // The repo's established style (carried over from its dprint config): no
  // semicolons, double quotes, no trailing commas, 120 columns.
  fmt: {
    semi: false,
    singleQuote: false,
    trailingComma: "none",
    printWidth: 120,
    arrowParens: "always",
    ignorePatterns: [...ignored, "packages/**/CHANGELOG.md", "pnpm-lock.yaml"],
    overrides: [
      {
        files: ["**/*.md"],
        options: {
          proseWrap: "preserve"
        }
      }
    ]
  },
  lint: {
    ignorePatterns: [...ignored, "**/node_modules/**"],
    // `@effect/tsgo`'s preset (the `effecttsgo/*` rules, run by the patched
    // oxlint) and `@enfect/oxlint`'s `recommended` Effect rules. Every
    // `effect/*` rule stays at the preset's `error`, with no override.
    extends: [recommended, effect.configs.recommended],
    plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "promise", "vitest", "jsdoc"],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error"
    },
    rules: {
      "eslint/no-console": "error",
      "import/no-cycle": "error",
      "typescript/consistent-type-imports": "error",
      "typescript/no-explicit-any": "off",
      // Every export documents `@since` and `@category` (AGENTS.md).
      "jsdoc/check-tag-names": ["error", { definedTags: ["since", "category"] }],
      // `_tag` is the discriminant of every Effect tagged value and error.
      "eslint/no-underscore-dangle": ["error", { allow: ["_tag"] }],
      "eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "vite-plus/prefer-vite-plus-imports": "error"
    },
    overrides: [
      // The `loco` executable is the CLI's entry point: it provides the
      // platform layer at the boundary, where the rule says to.
      {
        files: ["packages/loco-cli/src/bin.ts"],
        rules: {
          "effecttsgo/strict-effect-provide": "off"
        }
      },
      {
        files: ["**/{test,examples,scripts}/**"],
        rules: {
          "eslint/no-console": "off"
        }
      }
    ],
    // Type-aware linting through oxlint-tsgolint (bundled with Vite+, patched
    // by `effect-tsgo patch --oxlint`): `typeAware` turns on the rules that
    // need type information, `typeCheck` reports TypeScript diagnostics in
    // `vp check` too. The `check` task (the native, Effect-patched `tsc -b`)
    // stays the type gate of record. tsgolint types a file with its nearest
    // `tsconfig.json`, so each package's `test/tsconfig.json` (extending the
    // root one) is what gives the suites the root `paths`.
    options: {
      typeAware: true,
      typeCheck: true
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin"
      }
    ]
  },
  run: {
    tasks: {
      // The type gate: every package's `src` (tsconfig.packages.json's project
      // references) plus the suites and configs (tsconfig.json), under the
      // native, Effect-patched `tsc`.
      check: {
        command: "tsc -b tsconfig.json",
        cache: false
      },
      // Every package's suite under one Istanbul coverage map
      // (`coverage/coverage-final.json`), which `fallow audit` reads for exact
      // per-function CRAP scores (`health.coverage` in .fallowrc.json).
      // Without it fallow scores every function as uncovered. Run this before
      // `fallow audit` (the PreToolUse fallow gate runs the audit on
      // `git commit` / `git push` but never refreshes this map).
      "test:coverage": {
        command: "vp test run --coverage",
        cache: false
      }
    }
  },
  test: {
    // Each package's own vite.config.ts is a vitest project.
    projects: ["packages/*/vite.config.ts"],
    coverage: {
      provider: "istanbul",
      // `json` writes coverage-final.json (see `test:coverage` above).
      reporter: ["text-summary", "json-summary", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["**/*.d.ts", "packages/*/src/bin.ts"]
    }
  }
})
