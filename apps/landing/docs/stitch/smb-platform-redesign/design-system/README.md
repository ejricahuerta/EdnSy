# Design system export

Populate this folder from Stitch **`list_design_systems`** (`projectId`: `7766973722114657998`).

Suggested files after export:

| File | Source |
| --- | --- |
| `tokens.json` | Parse `designSystem.designTokens` (DTCG JSON string) from the matching asset |
| `theme-summary.json` | Serialize `designSystem.theme` (fonts, namedColors, roundness, typography map) |
| `style-guidelines.md` | `designSystem.styleGuidelines` if present |

The canvas stub id `asset-stub-assets-d733b72e56024fafb2c4bcef094388e9-1775414505065` may align with an `assets/{id}` name in the API response; if not, keep all returned assets and pick the one labeled Design System in Stitch UI.
