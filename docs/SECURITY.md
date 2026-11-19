# Security

Report vulnerabilities privately with GitHub's [**Report a vulnerability**](https://github.com/thomasfosterau/effect-loco/security/advisories/new) button, not in a public issue. Include a description, reproduction steps and the affected version.

Supply chain: packages are published through npm trusted publishing from a protected environment (see [PUBLISHING.md](PUBLISHING.md)); workflows default to `permissions: {}` and pin actions to release tags locked in `.github/workflows/actions.lock`; installs use the committed lockfile, and `minimumReleaseAge` holds new versions for 24 hours.
