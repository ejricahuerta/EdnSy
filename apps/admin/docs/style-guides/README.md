# Ed & Sy Admin Style Guides

## Canonical theme: landing app + `globals.css`

**Public marketing** lives in **`apps/landing`**. The admin app’s **shadcn-svelte** theme (CSS variables for `bg-primary`, `text-foreground`, charts, sidebar, etc.) is defined in **`apps/admin/src/globals.css`** and is aligned with **`apps/landing/src/app.css`** (same `:root` / `.dark` / `@theme inline` tokens: primary **`#3a00ff`**, neutrals, sidebar, charts).

`style-guide.html` remains a historical component reference. When you change product branding, update **landing `app.css` and admin `globals.css` together**, then adjust **`.admin-app` shell tokens** in **`apps/admin/src/app.css`** (legacy names like `--sage` still map to the purple primary for existing selectors).

### How it maps in the admin app

1. **Dashboard (`/dashboard/*`)**  
   Uses **`globals.css`** only. Shell aliases are in **`apps/admin/src/styles/dashboard.css`** on **`.admin-app-dashboard`** (e.g. `--sage` → `var(--primary)`). shadcn components read `--primary`, `--background`, `--sidebar-*`, etc.

2. **`.admin-app` shell** (root pages, auth, branded non-dashboard UI)  
   Marketing-aligned tokens live under **`.admin-app`** in **`app.css`** (cream/ink/sage names kept for backward compatibility; values match the landing palette).

3. **Typography**  
   **Inter** is loaded from **`app.html`** and applied in **`globals.css`** (`body`) and **`.admin-app`**. **Marck Script** is available for brand moments (same as landing). Dashboard typography classes (e.g. **`.lr-type-display`**) use **Inter** in the current stylesheet.

4. **JS/TS**  
   For charts or code that needs fixed values, use **`$lib/style-guide-tokens.ts`** (`chartColors` matches **`--chart-1` … `--chart-5`** in `globals.css`).

### Summary

| Where | What |
|-------|------|
| `apps/landing/src/app.css` | Reference for marketing + shadcn tokens |
| `apps/admin/src/globals.css` | Admin shadcn theme (keep in sync with landing) |
| `apps/admin/src/styles/dashboard.css` | Dashboard-only aliases onto globals |
| `apps/admin/src/app.css` | `.admin-app` shell + layout CSS |
| `$lib/style-guide-tokens.ts` | Hex / chart colors for JavaScript |

When you update branding, update **landing `app.css`**, **admin `globals.css`**, and **`.admin-app` tokens in `app.css`** together.
