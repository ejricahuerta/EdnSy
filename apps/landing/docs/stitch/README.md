# Stitch: SMB Platform Redesign

Reference export for Google Stitch project used to guide the landing homepage layout.

| Field | Value |
| --- | --- |
| Project title | SMB Platform Redesign |
| Project ID | `7766973722114657998` |
| Primary layout screen | **Ed & Sy - Home Redesign** (`cdfeeba1773c42e3a3bd2e3cab2af18f`) |
| Reference screen | EDNSY - Home Redesign (`f436c9d779c94f24bfa99e4e03ff897f`) |
| Design system (UI stub id) | `asset-stub-assets-d733b72e56024fafb2c4bcef094388e9-1775414505065` (resolve via `list_design_systems`; see below) |

## Automated export (Cursor Stitch MCP)

In an environment where the **user-stitch** MCP is enabled and authorized:

1. `get_project` with `name`: `projects/7766973722114657998`
2. `list_screens` with `projectId`: `7766973722114657998`
3. `get_screen` with:
   - `name`: `projects/7766973722114657998/screens/cdfeeba1773c42e3a3bd2e3cab2af18f`
   - `projectId`: `7766973722114657998`
   - `screenId`: `cdfeeba1773c42e3a3bd2e3cab2af18f`
   - Repeat for screen `f436c9d779c94f24bfa99e4e03ff897f`.
4. `list_design_systems` with `projectId`: `7766973722114657998` — copy `designTokens`, `styleGuidelines`, and `theme` into `smb-platform-redesign/design-system/`.

From each `get_screen` response, copy `htmlCode.downloadUrl` and `screenshot.downloadUrl` into [`stitch-urls.json`](smb-platform-redesign/stitch-urls.example.json) (save as `stitch-urls.json` next to the example), then run:

```bash
pnpm stitch:download
```

from `apps/landing` (uses `curl`-equivalent `fetch` with redirects). If a screenshot URL returns an empty or wrong file, append FIFE sizing query parameters per Google image serving docs and retry; note the working URL in a short comment in `stitch-urls.json`.

## Layout source

Implementation on `/` follows **Ed & Sy - Home Redesign** for section structure, spacing, and card rhythm. The EDNSY screen folder is for comparison only.

## Contents

- [`smb-platform-redesign/project-metadata.json`](smb-platform-redesign/project-metadata.json) — stable IDs and resource names
- [`smb-platform-redesign/screens/`](smb-platform-redesign/screens/) — per-screen `metadata.json`; `screen.html` / screenshot after download
- [`smb-platform-redesign/design-system/`](smb-platform-redesign/design-system/) — tokens and theme notes after MCP export
