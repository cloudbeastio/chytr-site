---
title: Work items
description: The lease an agent holds while it runs a task, from clock-in to clock-out.
keywords: work items, lease, clock in, heartbeat, work_clock_in, work_status
section: features
order: 18
status: published
unlisted: false
---

# Work items

## What it does

Work items are the lease an agent holds while it runs, so you can see who has the work and whether the lease is still alive.

Open **Work Items** (`/work-items`). The board is a read-only ledger: kind, ref, status, who claimed it, last heartbeat, repo, and branch. People read it. Agents write it. A second clock-in for the same kind and ref conflicts with the live lease instead of creating a twin.

The screen only reads one session route. Clock-in, heartbeat, log, block, and clock-out are MCP tools.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `work_clock_in` | `work:write` | Claim a lease. A live lease on the same kind and ref conflicts |
| `work_set_session` | `work:write` | Record repo, branch, and session URL |
| `work_heartbeat` | `work:write` | Extend the lease |
| `work_log` | `work:write` | Append a log line and bump the heartbeat |
| `work_block` | `work:write` | Mark blocked. `gap_type` is `policy`, `data`, or `tool` |
| `work_clock_out` | `work:write` | Release. Status `done`, `failed`, or `skipped` |
| `work_status` | `work:read` | Read by exactly one selector |

`work_status` takes `work_item_id`, or `kind` plus `ref`, or `run_id`. Send one selector.

`task_claim_work_item` and `task_pickup` claim the task the lease points at. They are task tools, listed on [Tasks](/docs/features/tasks).

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/work-items` | Ledger for this screen. Optional `status` and `limit` |

There is no POST on this route. Agents mutate leases only through the MCP tools.

## Permissions

Token scopes come from one permission-set layer. Reading a lease needs `work:read`. Clock-in and the rest of the write tools need `work:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `work_clock_in` when a run starts, then `work_status` with the same kind and ref.

```json
{
  "tool": "work_clock_in",
  "arguments": {
    "kind": "task",
    "ref": "desk-1:send-scope",
    "agent_id": "runtime-1",
    "run_id": "run-1",
    "lease_ttl_minutes": 30
  }
}
```

Expected result: a claimed lease. A second clock-in with the same kind and ref, while this lease is live, returns a conflict and does not replace it. `work_clock_out` with `status` `done` releases it, and the board shows that status after refresh.

```json
{
  "ok": true,
  "kind": "task",
  "ref": "desk-1:send-scope",
  "status": "claimed"
}
```
