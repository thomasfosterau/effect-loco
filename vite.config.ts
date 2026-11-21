import { recommended } from "@effect/tsgo/oxlint-presets"
import effect from "@enfect/oxlint"
import { defineConfig } from "vite-plus"

const ignored = ["**/dist/**", "**/build/**", "**/coverage/**", "**/*.tsbuildinfo"]

// Every package's `dist/`, which the release publishes.
const buildAll = [
  "codegen",
  "codegen-kotlin",
  "codegen-swift",
  "codegen-typescript",
  "loco",
  "loco-cli",
  "loco-compose",
  "loco-react",
  "loco-svelte",
  "loco-swiftui",
  "loco-uikit"
].map((name) => `@thomasfosterau/effect-${name}#build`)

export default defineConfig({
  // Format with fixes, lint without: a type-aware autofix at commit time would
  // make the commit differ from the tree that was verified.
  staged: {
    "*.{js,ts,tsx,mjs,json,md,yaml,yml}": [
      "vp check --fix --no-lint",
      "vp check --no-fmt --no-error-on-unmatched-pattern"
    ]
  },
  fmt: {
    semi: false,
    singleQuote: false,
    trailingComma: "none",
    printWidth: 120,
    arrowParens: "always",
    ignorePatterns: [...ignored, "**/CHANGELOG.md", "pnpm-lock.yaml"],
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
    // tsrs types a file with its nearest tsconfig.json, so each package's
    // `test/tsconfig.json` extends the root one to get its `paths`.
    // `typeCheck` is off: tsrs's type check reports the Effect language
    // service's warnings, which the `effecttsgo/*` rules already report, as
    // errors.
    // `vp run check` stays the type gate.
    options: {
      typeAware: true,
      typeCheck: false
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
      // The whole gate, in CI's order, stopping at the first failure.
      ci: {
        command: "vp check && vp run check && vp run -r test:unit && vp run -r build && pnpm audit --audit-level high",
        cache: false
      },
      // The type gate: every package's `src` (project references) plus the
      // suites and configs, under the Effect-patched native `tsc`.
      check: {
        command: "tsc -b tsconfig.json",
        cache: false
      },
      // Writes coverage/coverage-final.json, which `fallow audit` reads for
      // CRAP scores.
      "test:coverage": {
        command: "vp test run --coverage",
        cache: false
      },
      // Run by the pre-commit hook after `vp staged`.
      "fallow:audit": {
        command: "vp exec fallow audit --base origin/trunk --quiet",
        dependsOn: ["test:coverage"],
        cache: false
      },
      fallow: {
        command: "vp exec fallow --summary",
        cache: false
      },
      // Run by the Release workflow's version job.
      "changeset:version": {
        command: "changeset version && vp fmt && vp install --lockfile-only",
        cache: false
      },
      // The Release workflow's publish script, after every package's build:
      // pnpm publishes each public package whose version is not on npm yet, in
      // dependency order, under OIDC trusted publishing; then `changeset
      // git-tag` tags each version not tagged yet and reports the new tags to
      // `changesets/action` through `CHANGESETS_OUTPUT`, which pushes them and
      // creates the GitHub releases. A failed publish stops before tagging.
      release: {
        command: ["vp pm publish -r --access public --no-git-checks -- --ignore-scripts", "changeset git-tag"],
        dependsOn: buildAll,
        cache: false
      },
      // What `release` would publish, without publishing or tagging.
      "release:dry-run": {
        command: "vp pm publish -r --access public --dry-run --no-git-checks -- --ignore-scripts",
        dependsOn: buildAll,
        cache: false
      }
    }
  },
  test: {
    // Each package's own vite.config.ts is a vitest project.
    projects: ["packages/*/vite.config.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "istanbul",
      reporter: ["text-summary", "json-summary", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["**/*.d.ts", "packages/*/src/bin.ts"]
    }
  }
})
