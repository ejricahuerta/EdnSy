# Changelog — Website Template (`apps/website-template`)

Notable changes to the **demo HTML generator** service (Express API, Claude pipeline, dental renderer, Supabase upload).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version in `package.json` is the reference when you cut releases.

---

## [Unreleased]

### Added

- **`docs/architecture.md`** — stack, Claude vs dental renderer, Admin callback integration.
- **README** link to architecture doc.

### Changed

- **Environment naming (monorepo):** Legacy “Pitch Rosetta” cron/env aliases removed; use **`DEMO_GENERATOR_API_KEY`** / **`WEBSITE_TEMPLATE_API_KEY`** and related names documented in README. Cron worker uses **Website Template** health URL.

### Notes

- Contract with Ed & Sy Admin: [`apps/admin/docs/demo-payload-website-template.md`](../../admin/docs/demo-payload-website-template.md). Master hub: [`docs/CHANGELOG.md`](../../../docs/CHANGELOG.md).
