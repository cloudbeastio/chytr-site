---
title: Logs
description: Heartbeat ticks and recent agent runs, plus hook stats for the last week.
keywords: logs, heartbeat, ticks, runs, hook stats, work_log
section: features
order: 26
status: published
unlisted: false
---

# Logs

## What it does

Logs show whether the clock fired and how the last runs finished, so a quiet agent is either idle or stuck and you can tell which.

Open **Logs** (`/logs`). Two reads share the page. One is heartbeat ticks and recent work-item runs. The other is hook stats over the last 168 hours: which tools were called, how many failed, and when the last call was. Filter ticks by kind (`tick`, `manual`, `bootstrap`, `dispatch`) and runs by status (`running`, `claimed`, `pending`, `done`, `failed`, `timed_out`, `skipped`).

The screen is read-only. Agents append lines on their own lease with `work_log`. That is the write path. This page is the read path.

## MCP tools

No MCP tool returns this page's tick history. The write an agent does have:

| Tool | Scope | Role |
|---|---|---|
| `work_log` | `work:write` | Append a line on a lease and bump the heartbeat |
| `work_status` | `work:read` | Read that lease |

Hook stats are session-only.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/logs` | Ticks and recent runs |
| `GET` | `/cockpit/api/agent-hook-stats?hours=168` | Tool-call stats. The screen asks for 168 hours |

Both are GET. A failed hook-stats call does not blank the tick list.

## Permissions

The screen uses the signed-in session. `work_log` needs `work:write` from one permission-set layer. There is no logs scope.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `work_log` on the lease you clocked in, not on the logs route.

```json
{
  "tool": "work_log",
  "arguments": {
    "work_item_id": "lease-1",
    "level": "info",
    "message": "Draft stored. Waiting on the approval."
  }
}
```

Expected result: the line is appended and the lease heartbeat moves forward. The Logs screen shows that run on refresh. A log call for a lease the token does not hold is rejected.

```json
{
  "ok": true,
  "level": "info"
}
```
