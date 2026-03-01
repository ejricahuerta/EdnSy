# Versioning (Lead Rosetta / EdnSy Marketing)

## Current version

**App version:** see `package.json` → `version` (e.g. `1.0.0`).

This app uses [Semantic Versioning](https://semver.org/):

- **MAJOR** – Breaking changes (e.g. auth or API changes that require migration).
- **MINOR** – New features, backward compatible.
- **PATCH** – Bug fixes and small improvements, backward compatible.

## Version split (March 2026)

- **v1.0.0** (2026-03-01) is the **baseline (pre–first-send)**: dashboard, CRM integrations, industry demos, Supabase, Stripe, Google auth, and the send pipeline (Resend/Twilio) are in place, but **no message has been successfully sent yet**. The next milestone is a verified successful send (then cut 1.1.0).
- All development **after** this point is tracked in [CHANGELOG.md](../CHANGELOG.md) under `[Unreleased]` until the next version is released.

## Where version is used

- **package.json** – Single source of truth for the app version.
- **CHANGELOG.md** – Human-readable history of what changed in each version.
- **PRD** (`docs/prd.md`) – Product requirements; has its own document version (e.g. PRD v0.2).

When you add features or fix bugs, update `CHANGELOG.md` under `[Unreleased]`. When you decide to cut a new release, add a new `## [x.y.z] - date` section and move the relevant entries there.
