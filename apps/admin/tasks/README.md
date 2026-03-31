# Ed & Sy Admin — Taskmaster tasks

Tasks live in `tasks.json` and align with [apps/admin/docs/prd.md](../docs/prd.md).

## Using Taskmaster

- **CLI (from repo root):** `task-master list -f apps/admin/tasks/tasks.json`
- **MCP:** Use `file`: `apps/admin/tasks/tasks.json` and `projectRoot`: repo root for get_tasks, next_task, set_task_status, etc.

## Status summary (March 2026)

| Area | Task IDs | Status |
|------|----------|--------|
| Landing, try flow, free limit, industry demos, style guides | 1–6 | done |
| Auth (Google), dashboard + Supabase prospects + CRM sync, CSV upload (header mapping) | 7–8, 6 | done |
| Legal (terms, privacy, etc.), demo track API | 9–10 | done |
| F1 demo generation, F1a confidence, F1b pain modal + sticky CTA | 11, 19–20 | done |
| F3 review queue, F4 templates, F5 intelligence dashboard | 13–15 | done |
| Plan limits, Stripe billing, Agency contact CTA | 16–17, 25 | done |
| **Backlog / not shipped** | | |
| F2 CSV AI mapping + auto-clean preview | 12 | pending |
| CRM depth (v1.1 connectors) | 18 | pending |
| F6 data refresh, F7 deliverability checklist | 21–22 | pending |
| 3-step onboarding | 23 | pending |
| Compliance polish (signup checkbox, Termly, unsubscribe on demos) | 24 | pending |

Metadata `updated` in `tasks.json` reflects the last pass that aligned tasks with the app and PRD.
