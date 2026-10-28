---
title: Overview
description: What chytr is, who it is for, and how the screens are organized.
keywords: cockpit, control plane, agents, approvals, sidebar
section: getting-started
order: 1
status: published
unlisted: false
---

# Overview

chytr is the control plane for a workspace where agents do the work and people decide. Agents propose records, drafts, and task changes. A person approves or rejects those proposals. The database keeps the decision.

Cloudbeast.io LLC publishes chytr for technical operators and builders. There is no managed service in this version. You run it yourself: a Next.js app on top of your own Supabase project (Postgres, Auth, and Edge Functions). Feature behavior is the same on every install. There are no edition splits.

## What you use it for

- Review a queue of agent proposals, one card at a time or as a list.
- Track tasks across a board, assign them to people or agent runtimes, and close them with an explicit human gate when you want one.
- Keep accounts, contacts, deals, campaigns, and projects in one place, with an activity history behind them.
- Connect agents over MCP with personal access tokens, and wake them from desks and routines.
- Search records by name from the top bar, and ask questions over indexed text from chat.

## The app

After you sign in, the sidebar is the map. The home redirect sends an authenticated session to `/dash` unless the deploy sets `COCKPIT_HOME`.

| Section | Screens |
|---|---|
| Quick | Dash, Goals, Approvals, Calendar |
| Relationships | Accounts, Contacts, Activities, Territories |
| Marketing | Content, ICP, Assets |
| Sales | Campaigns, Pipeline, Deals, Products |
| Work | Desks, Tasks, Work Items, Pull requests |
| Support | Cases |
| Agents | Agents, Routines, Knowledge, Queues, Logs |
| Automations | LLMs, Classifiers, Decision flows, Decisions, Workflows |
| Admin | Integrations, API keys, Users, Permission sets, Domains, Approval types, KG Health, Meeting pipeline, Notifications |

A few surfaces are not in the sidebar. `/chat` is the knowledge-graph chat. Comments are the handoff inbox between people and agents. Most lists open an entity drawer for the record you click.

**LLMs** is the provider and named-instance registry. **Classifiers** edits flow definitions and question sets, and shows usage stats. **Decision flows** lists and creates flows. A new flow starts disabled, thresholds at 1.0, and the act allowlist empty (mint, enqueue, and patch stay off until an admin opts in). The path canvas and dry-run are on `/decisions/<flowKey>`.

## How the pieces fit

chytr is a Next.js app. You can host it on Vercel (a service that runs web apps) or any Node host. Its data lives in your own Supabase project (Postgres, Auth, and Edge Functions).

The app never writes the database tables directly from the browser. It calls a session API under `/cockpit/api`. Agents call a separate MCP endpoint with a bearer token. Both sides land on the same Postgres functions, so a card you approve in the UI is the same row an agent created.

Extraction is headless. There is no extraction screen. Review is the approvals API and the extraction MCP tools, on the same permission layer. See [Meetings and extraction](/docs/features/meetings) and [Permissions and API keys](/docs/reference/permissions).

Read [Core concepts](/docs/getting-started/core-concepts) for the object model, then [Quickstart](/docs/getting-started/quickstart) for the first session. Self-host install is in preview and is not linked from these pages.
