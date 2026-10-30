---
title: Routines
description: Scheduled and instant jobs bound to a runtime, separate from workflow templates.
keywords: routines, jobs, cron, runtimes, schedules, ops jobs
section: features
order: 23
status: published
unlisted: false
---

# Routines

## What it does

Routines wake an agent on a schedule, so recurring work has a clock and a runtime without turning into a workflow template.

Open **Routines** (`/settings/routines`). A routine is a cron or instant job bound to a desk and a runtime. Enable it before it can mint work. A disabled routine does not. `/settings/jobs` redirects here.

This screen is not [Workflows](/docs/features/workflows). Templates instantiate tasks when they are applied. Routines are the other scheduler. `task_scheduled_create` attaches a cron to a task. It is not this registry.

The screen only calls the session API. There is no MCP tool that creates or enables a routine. An admin session does that here. Agents receive the tasks the routine mints.

## MCP tools

No MCP tool administers this registry. After a routine inserts a `todo`, the agent uses the task and work tools:

| Tool | Scope | Role |
|---|---|---|
| `task_claim` | `tasks:write` | Claim the `todo` the routine minted |
| `task_pickup` | `tasks:write`, `comments:read` | Claim plus the handoff comments |
| `task_scheduled_create` | `schedules:write` | A different object: a cron on a task. Token only |
| `task_scheduled_enable` | `schedules:write` | Enable that scheduled task. Token only |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/ops/jobs` | List or upsert. The screen calls this path |
| `GET`, `POST` | `/cockpit/api/ops/routines` | Same handlers as `/ops/jobs` |

`GET` returns both job planes and whether the master tick is on. Writes are admin-gated in the database. A non-admin session gets an admin-only error. The screen also reads `GET /cockpit/api/runtimes?all=1` when you bind a runtime.

## Permissions

Changing a routine requires an admin session. A personal access token cannot administer this screen. Task pickup still uses `tasks:write` from one permission-set layer. `schedules:write` is token-only and applies to scheduled tasks, not to this registry.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Do not look for a routine tool. Call `task_claim` for the runtime the routine dispatches.

```json
{
  "tool": "task_claim",
  "arguments": {
    "assignee_id": "runtime-1",
    "claimed_by": "runtime-1",
    "limit": 5
  }
}
```

Expected result: zero or more `todo` tasks assigned to that runtime, now claimed. An empty list means nothing is waiting. It does not mean the routine failed. Check the routine's enabled flag on this screen if work you expected never arrives.

```json
{
  "ok": true,
  "claimed": 1
}
```
