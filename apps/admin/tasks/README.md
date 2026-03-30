# Lead Rosetta — Taskmaster tasks

Tasks for the Ed & Sy Admin app are in `tasks.json`. They are aligned with [apps/admin/docs/prd.md](../docs/prd.md).

## Using Taskmaster

- **CLI:** From repo root: `task-master list -f apps/admin/tasks/tasks.json`
- **MCP:** Use `file`: `apps/admin/tasks/tasks.json` and `projectRoot`: repo root when calling get_tasks, next_task, set_task_status, etc.

## Status summary

- **Done (1–10):** Landing, Try free flow, free limit, industry demos, style guides, CSV upload, dashboard + CRM integrations, auth (Google), Privacy/Terms, demo track API.
- **Pending (11–18):** AI demo generation (F1), CSV validation/Pro (F2), review queue (F3), Resend/Twilio send (F4), open tracking dashboard (F5), Pro enforcement, Stripe, CRM connectors.
