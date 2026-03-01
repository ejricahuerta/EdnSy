# Lead Rosetta Legal Integration Guide

This directory contains the core legal and compliance documents for **Lead Rosetta**, operated by **Ed & Sy Inc.**

## 1. File Mapping & Placement

| File | Frontend Location (URL) | Primary Purpose |
| :--- | :--- | :--- |
| `privacy-policy.md` | `/privacy` | PIPEDA/GDPR compliance for users and leads. |
| `terms-of-service.md` | `/terms` | The contract between Ed & Sy Inc. and the subscriber. |
| `cookie-policy.md` | `/cookies` | Transparency regarding tracking and Stripe security. |
| `acceptable-use-policy.md` | `/aup` | Anti-spam rules for the outreach features. |
| `data-processing-addendum.md` | `/dpa` | Contractual requirement for B2B/Enterprise clients. |
| `security-overview.md` | `/security` | Sales enablement and trust-building. |

*Note: Live content is rendered from the route components under `src/routes/` (e.g. `privacy/+page.svelte`). The `.md` filenames above are the canonical document names; you may add corresponding markdown files in this directory as the source of truth for copy if desired.*

## 2. Integration Requirements

### A. The Global Footer

The following links must be present in the footer of every page on the Lead Rosetta marketing site and web app:

- Privacy Policy
- Terms of Service
- Security Overview
- **Corporate Text:** `© 2026 Ed & Sy Inc. All rights reserved.`

Additional links (Cookies, DPA, AUP) are also included for transparency.

### B. User Registration (Signup)

At the point of account creation, include a mandatory checkbox or a clear statement:

> "By creating an account, you agree to Ed & Sy Inc.'s [Terms of Service](/terms) and [Acceptable Use Policy](/aup), and acknowledge our [Privacy Policy](/privacy)."

*Implemented on the Sign in (Google) page, since account creation occurs via OAuth.*

### C. Outreach Tool (Email Interface)

Before a user sends their first lead generation email, the UI should display a one-time confirmation or a tooltip:

> "I confirm that my outreach complies with the [Acceptable Use Policy](/aup) and that I will honor all unsubscribe requests."

*Implemented as a required checkbox on the Send form on the dashboard Clients page.*

### D. Automated Email Footers

Every email sent via Lead Rosetta must programmatically include the legal footer (see `acceptable-use-policy.md` for the template) including:

- A valid unsubscribe instruction (e.g. reply "Unsubscribe" or "STOP").
- The registered/physical address of **Ed & Sy Inc.**

*Implemented in `src/lib/server/send.ts` via `buildEmailBody()`. Company address is configured in `src/lib/constants.ts` (`LEGAL_COMPANY_ADDRESS`).*

## 3. Sub-processor Opt-Outs

Ensure the development team has configured the **OpenAI API** settings to **Opt-Out of Data Training**. This is required to maintain the validity of the **Data Processing Addendum (DPA)** and our privacy promises to customers.

- In the OpenAI API usage (e.g. request options or account settings), enable the option to opt out of having data used for training public models.
- Document the setting in runbooks or env docs so new deployments preserve it.

## 4. Maintenance

These files should be reviewed annually or whenever the app introduces new third-party sub-processors (e.g. changing from SendGrid to Postmark).

- When adding or changing sub-processors, update the Privacy Policy, DPA, and Cookie Policy as needed.
- Keep the Security Overview in sync with actual encryption, hosting, and compliance measures.
