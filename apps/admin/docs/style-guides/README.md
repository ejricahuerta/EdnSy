# Lead Rosetta Style Guides

## style-guide.html → app + dashboard (shadcn-svelte)

**`style-guide.html`** is the canonical Component Style Guide for Lead Rosetta (colors, typography, buttons, forms, badges, etc.).

### How it’s merged into the app

1. **Tokens**  
   The palette (`--cream`, `--ink`, `--sage`, `--amber`, etc.) is defined in **`apps/admin/src/app.css`** under `.leadrosetta-app`. Keep those values in sync with `style-guide.html` when you change the guide.

2. **Dashboard + shadcn-svelte**  
   The dashboard uses **shadcn-svelte** for UI (Card, Button, Select, Dialog, Table, etc.). Theme mapping is in `app.css` in the block **`.leadrosetta-app-dashboard`**:
   - `--primary` → sage  
   - `--background` → cream  
   - `--muted` → surface  
   - `--destructive` → error  
   - etc.

   So all shadcn components in the dashboard automatically use the style guide palette.

3. **Typography in the dashboard**  
   Use these classes inside dashboard pages (under `.leadrosetta-app-dashboard`):
   - **`.lr-type-display`** – Instrument Serif, large display
   - **`.lr-type-h1`**, **`.lr-type-h2`** – Instrument Serif headings
   - **`.lr-type-eyebrow`** – uppercase label (amber)
   - **`.lr-type-body`**, **`.lr-type-body-muted`** – DM Sans body
   - **`.lr-type-small`**, **`.lr-type-label`** – DM Sans small/label

   Card titles (`.lr-dash-card-title`) already use Instrument Serif.

4. **JS/TS**  
   For charts or any code that needs hex values, use **`$lib/style-guide-tokens.ts`**. It exports the same palette and a `chartColors` array aligned with the CSS chart variables.

### Summary

| Where            | What |
|------------------|------|
| `style-guide.html` | Canonical reference; design decisions and component specs |
| `app.css`         | Live tokens + shadcn mapping + typography classes |
| `$lib/style-guide-tokens.ts` | Token hex values for JavaScript |

When you update the style guide, update `app.css` (and optionally `style-guide-tokens.ts`) so the dashboard and landing stay in sync.
