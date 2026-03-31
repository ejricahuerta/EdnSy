# EdnSy monorepo — changelog index

This file is the **master changelog hub**: it points to each application’s changelog under that app’s `**docs/`** folder. **Do not** duplicate full release notes here; update the app-specific file when you ship changes.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). **Ed & Sy Admin** uses app semver from `apps/admin/package.json`. Other apps may use `[Unreleased]`-only notes until you adopt version tags per app.

---

## Applications


| App                                  | Changelog                                                                               | Version source                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Ed & Sy Admin** (product)          | `[apps/admin/docs/CHANGELOG.md](../apps/admin/docs/CHANGELOG.md)`                       | `apps/admin/package.json`                       |
| **Marketing site**                   | `[apps/landing/docs/CHANGELOG.md](../apps/landing/docs/CHANGELOG.md)`                   | `apps/landing/package.json` (currently `0.0.1`) |
| **Website Template** (generator API) | `[apps/website-template/docs/CHANGELOG.md](../apps/website-template/docs/CHANGELOG.md)` | `apps/website-template/package.json`            |


---

## Monorepo-wide notes

- **2026-03:** Renamed `apps/lead-rosetta` → `**apps/admin`**, product naming **Ed & Sy Admin**; generator app standardized as `**apps/website-template`**. Legacy “Pitch Rosetta” env naming removed in favor of `DEMO_GENERATOR_*` / Website Template. See Admin and Website Template changelogs.
- **Documentation:** Master index at `[README.md](README.md)`; root `docs/` holds cross-app docs only.

---

## Related

- [Master documentation index](README.md)
- [Admin versioning policy](../apps/admin/docs/VERSION.md)

