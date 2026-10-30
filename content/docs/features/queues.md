---
title: Queues
description: Queue depth, in-progress work, and the controls that repair or run a tick.
keywords: queues, heartbeat, ticks, jobs, runtimes, dispatch
section: features
order: 25
status: published
unlisted: false
---

# Queues

## What it does

Queues show whether work is waiting, running, or stuck, so you can repair the clock without reading a database.

Open **Queues** (`/queue`). The panel is the tick snapshot: queue depth, in-progress leases, and recent ticks. From here you can repair the heartbeat cron (`bootstrap`) or dispatch a tick now (`run_now`). You can also enable or disable a job on the cron plane. Binding a routine to a runtime is saved through the jobs route.

The screen only calls the session API. Agents do not administer the tick. They clock in when a task arrives. See [Work items](/docs/features/work-items) and [Routines](/docs/features/routines).

## MCP tools

No MCP tool reads or repairs this queue. The agent-facing lease tools are `work_status` (`work:read`) and `work_heartbeat` (`work:write`). They describe one lease, not the operator snapshot on this screen.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/queue` | Snapshot the screen renders |
| `POST` | `/cockpit/api/queue/heartbeat` | Body `action` is `bootstrap` or `run_now` |
| `GET` | `/cockpit/api/ops/jobs` | Jobs shown beside the queue |
| `POST` | `/cockpit/api/ops/jobs` | Enable or disable a job, or set a binding |

`POST /cockpit/api/queue/bind` exists for setting or clearing a job's primary runtime. This screen writes bindings through `/cockpit/api/ops/jobs`.

## Permissions

The screen uses the signed-in session. Job writes are admin-gated in the database, same as [Routines](/docs/features/routines). A token's permission sets do not grant this screen. Lease tools still use `work:read` and `work:write`.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

There is no queue tool. Call `work_status` for the lease you hold.

```json
{
  "tool": "work_status",
  "arguments": {
    "kind": "task",
    "ref": "desk-1:send-scope"
  }
}
```

Expected result: that lease's status and last heartbeat, or an empty result when nothing is claimed for that kind and ref. Send only one selector. Adding `run_id` in the same call is rejected.

```json
{
  "ok": true,
  "kind": "task",
  "ref": "desk-1:send-scope",
  "status": "claimed"
}
```
