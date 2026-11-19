#!/usr/bin/env bash
#
# Run by the Release workflow once the version PR has merged, after the build.
# `pnpm pack` rewrites `catalog:` / `workspace:` specifiers and applies
# `publishConfig`; `npm publish` of the tarball does the OIDC exchange. A
# version already on npm is skipped, so a partial run can be re-run.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="$root/.release"
rm -rf "$out"
mkdir -p "$out"

for dir in "$root"/packages/*/; do
  name="$(node -p "require('$dir/package.json').name")"
  version="$(node -p "require('$dir/package.json').version")"
  if npm view "$name@$version" version >/dev/null 2>&1; then
    echo "skip: $name@$version is already published"
    continue
  fi
  # `pnpm pack` has no `--ignore-scripts` flag, so it is passed as config.
  (cd "$dir" && pnpm pack --config.ignore-scripts=true --pack-destination "$out" >/dev/null)
  tarball="$(ls -t "$out"/*.tgz | head -1)"
  npm publish "$tarball" --access public
  rm -f "$tarball"
done

# Prints the `New tag:` lines the Changesets action reads to push tags and
# create GitHub releases.
pnpm exec changeset tag
