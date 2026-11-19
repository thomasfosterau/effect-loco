# Publishing

The packages are released with [Changesets](https://github.com/changesets/changesets) and published to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC); there is no `NPM_TOKEN`.

## Flow

1. Each change that needs one carries a changeset (see [CONTRIBUTING.md](CONTRIBUTING.md#changesets)).
2. On `trunk`, the [Release workflow](../.github/workflows/release.yml) opens or updates the `chore: version packages` PR (the `changeset:version` task).
3. Merging it runs the `publish` job in the protected `release` environment. After approval it builds every `dist/` and runs [`scripts/release.sh`](../scripts/release.sh): `pnpm pack` per package (rewriting `catalog:` / `workspace:` specifiers), `npm publish` of each tarball not yet on npm, then `changeset tag`.

Every job in the workflow first verifies `.github/workflows/actions.lock`. The release jobs install with `--ignore-scripts`, so no dependency lifecycle script runs where `id-token: write` is held. npm adds provenance itself; don't pass `--provenance`.

## One-time setup (owner)

- **Settings → Actions → General**: allow GitHub Actions to create and approve pull requests.
- **Settings → Environments → `release`**: a required reviewer; deployments limited to `trunk`.
- **npmjs.com**: trusted publishing for each package (GitHub Actions, `thomasfosterau/effect-loco`, workflow `release.yml`, environment `release`). A package that doesn't exist on npm yet may need a first publish by hand before a trusted publisher can be attached.
- **Rulesets on `trunk`**: require pull requests and the `CI` check.
