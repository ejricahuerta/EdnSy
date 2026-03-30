# AI Agents (apps/admin)

This folder contains AI agents used for GBP grading and website analysis. Each agent has a clear input/output and is orchestrated by server jobs.

## Overview

| Agent | Purpose | Input | Output | Used by |
|-------|---------|--------|--------|---------|
| **GBP agent** | Grade a business's Google Business Profile | GBP data (from Places API), optional prospect | Score (0–100), label, optional reasoning | `processGbpJob`, insights flow |
| **Website agent** | Fetch a prospect's website, analyze UI/UX/funnel/SEO, produce demo JSON | Website URL, prospect, optional GBP summary | UI/UX/funnel/SEO grades, overall grade, demo JSON | Insights job, demo creation |

## Structure

- **`shared/`** – Shared utilities: Gemini client (`callGemini`), JSON parser (`parseJsonFromResponse`), types (`AgentResult<T>`). Use these in every agent to avoid duplication.
- **`gbp-agent/`** – Grades GBP data. Called after fetching GBP via Places API; result is merged into the audit.
- **`website-agent/`** – Fetches the website at the prospect's URL, then runs AI analysis (UI, UX, funnel, SEO) and produces demo JSON for the create-demo step. Owns the fetch step.

## Pipelines

- **GBP pipeline**: Fetch GBP (server `gbp.ts`) → GBP agent grades → build audit → save to `demo_tracking.scraped_data`.
- **Website pipeline**: Website agent fetches URL → analyzes UI/UX/funnel/SEO → produces grades + demo JSON → store in `scraped_data` (e.g. `websiteAnalysis`, `demoJson`).

## Usage

Import agents and shared utils from `$lib/ai-agents`:

```ts
import { gbpAgent, websiteAgent } from '$lib/ai-agents';
import { callGemini, parseJsonFromResponse, type AgentResult } from '$lib/ai-agents';
```

## Adding a new agent

1. Add a folder under `ai-agents/` (e.g. `my-agent/`).
2. Use `shared/gemini.ts` and `shared/parseJson.ts` for all Gemini calls and JSON parsing.
3. Return `AgentResult<T>` from the agent's main function.
4. Re-export from `ai-agents/index.ts` and document in this README.
