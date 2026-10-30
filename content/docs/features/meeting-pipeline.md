---
title: Meeting pipeline
description: Health of the meeting ingest lane, including sync drift.
keywords: meeting pipeline, ingest, sync drift, extraction, health
section: features
order: 39
status: published
unlisted: false
---

# Meeting pipeline

## What it does

Meeting pipeline shows whether meetings are making it into chytr, so a gap in the lane is visible before you look for a missing note.

Open **Meeting Pipeline** (`/meeting-pipeline`). The panel is lane health: what synced, what is still drifting, and where extraction stands. Sync drift means meetings the calendar knows about that are not in the database yet. This page is not the review queue. Proposals wait on [Approvals](/docs/features/approvals). The extraction contract is [Meetings and extraction](/docs/features/meetings). Graph-wide counts are [KG Health](/docs/features/kg-health).

The screen only reads one session route. It does not ingest a meeting and it does not approve a card.

## MCP tools

No MCP tool returns this panel. Agents submit a meeting with `meeting_graph_checkin` (`graph:write`) and read extraction volume with `extraction_metrics` (`approvals:read`). Those calls do not replace the drift counts on this screen.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/pipeline-health` | `{ "ok": true, "pipeline_health": { ... } }` |

The route is GET only. Drift is reported as meetings not yet in the database. It is not a list you edit here.

## Permissions

The screen uses the signed-in session. Check-in needs `graph:write`. Extraction metrics need `approvals:read`. Both come from one permission-set layer.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `extraction_metrics` for the review backlog. Open this screen when you need drift.

```json
{
  "tool": "extraction_metrics",
  "arguments": {
    "days": 7
  }
}
```

Expected result: counts by extraction action type for that window. A zero count means no cards of that type in the window. It does not mean the calendar sync is healthy. Drift stays on `GET /cockpit/api/pipeline-health`.

```json
{
  "ok": true,
  "days": 7,
  "by_action": []
}
```
