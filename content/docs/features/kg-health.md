---
title: KG Health
description: Counts and extraction gaps for the knowledge graph, not the review queue.
keywords: health, knowledge graph, extraction gaps, hygiene, counts
section: features
order: 38
status: published
unlisted: false
---

# KG Health

## What it does

KG Health shows whether the graph is intact, so you can see missing links and extraction gaps before they turn into bad proposals.

Open **KG Health** (`/health`). Tiles cover entity counts, hygiene, recent decisions, and extraction gaps. A gap is something the pipeline noticed and did not finish. This page does not resolve it. Resolution is an approval card. See [Approvals](/docs/features/approvals) and [Meetings and extraction](/docs/features/meetings).

The meeting ingest lane has its own panel on [Meeting pipeline](/docs/features/meeting-pipeline). Do not treat these counts as that lane's health.

The screen only reads one session route. It does not write.

## MCP tools

No MCP tool returns this page. `cockpit_get` (`cockpit:read`) includes knowledge-graph health counts inside the home aggregate. That is the agent-readable summary. It is not the full gap list on this screen. Extraction volume is `extraction_metrics` (`approvals:read`).

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/health` | `{ "ok": true, "kb_health": { ... } }` |

`kb_health` includes `entity_counts` or `hygiene.entity_counts`, `extraction_gaps` (`count` and `items`), and `decisions` (including `last_5`). Empty gaps mean nothing is waiting, not that the route failed.

## Permissions

The screen uses the signed-in session. `cockpit_get` needs `cockpit:read`. `extraction_metrics` needs `approvals:read`. Both come from one permission-set layer.

Row access is RLS by creator. Admins see all rows. Members see their own. Counts follow that scope.

## Agent example

Call `cockpit_get` when you need the summary an agent is allowed to see.

```json
{
  "tool": "cockpit_get",
  "arguments": {}
}
```

Expected result: an aggregate that includes health counts for the token's owner. It will not include another member's gaps. For the full gap list, a person opens `/health`. The tool does not clear a gap.

```json
{
  "kb_health": {
    "extraction_gaps": {
      "count": 0
    }
  }
}
```
