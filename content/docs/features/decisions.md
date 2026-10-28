---
title: Decisions
description: The audit of activity-quality classification, separate from the approval queue.
keywords: decisions, quality class, shadow, gates, rank1, activity.quality
section: features
order: 30
status: published
unlisted: false
---

# Decisions

## What it does

Decisions show how activity quality was classified, so a shadow result can disagree with the live label without silently changing it.

Open **Decisions** (`/decisions`). Each row is one classification: when it ran, the activity, shadow versus live quality, confidence, and the gate (`auto`, `hold`, `escalate`, or `blocked_by_rule`). Filter by gate, or by whether the shadow agrees with the live label. The row links to the decision record and, when one exists, the approval.

This page does not approve extraction cards. That queue is [Approvals](/docs/features/approvals). Configuring the flow is [Decision flows](/docs/features/decision-flows). How extraction files cards is [Meetings and extraction](/docs/features/meetings).

The screen only reads one session route. There is no MCP tool for this audit.

## MCP tools

No MCP tool lists these rows. Agents that review extraction proposals use `extraction_pending` and `extraction_review` (`approvals:read` and `approvals:write`). Those tools resolve cards. They do not rewrite this audit.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/decisions/rank1?limit=200` | Rows for this screen |

The screen loads up to 200 rows and filters gate and agreement in the browser. The route is GET only.

## Permissions

The screen uses the signed-in session. There is no decisions-audit scope on the permission-set layer. Extraction review, if you use it, needs `approvals:write`.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

There is no tool call for this table. A session client reads the same route.

```json
{
  "method": "GET",
  "path": "/cockpit/api/decisions/rank1?limit=200"
}
```

Expected result: `{ "ok": true, "rows": [ ... ] }`. A row's gate is one of `auto`, `hold`, `escalate`, or `blocked_by_rule`. An empty `rows` array means nothing has been classified into this audit. It does not mean extraction is off.

```json
{
  "ok": true,
  "rows": [
    {
      "gate_verdict": "hold",
      "shadow_disagreement": true,
      "live_quality_class": "substantive",
      "quality_class": "transactional"
    }
  ]
}
```
