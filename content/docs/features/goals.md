---
title: Goals
description: Charters and the metrics that show whether a goal is moving.
keywords: goals, charters, metrics, scorecard, charters:read, metrics:read
section: features
order: 2
status: published
unlisted: false
---

# Goals

## What it does

Goals turn a written charter into numbers you can check, so a target is either moving or it is blocked for a named reason.

Open **Goals** (`/goals`). The board lists charters and the metric catalog. A charter is the goal: scope, title, sections, and the measures tied to catalog metrics. Publishing a new version waits on an approval. The screen can draft one. It does not skip that card.

Metrics are computed, not typed in. If a metric is not available yet, the board says so instead of showing a fake number.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `charter_list` | `charters:read` | List charters. Filters: `scope`, `status`, `slug` |
| `charter_get` | `charters:read` | One charter, sections, and measures. `charter_id` or `slug` |
| `charter_propose_version` | `charters:write` | Draft a version. Publishing waits on an approval |
| `metric_catalog_list` | `metrics:read` | Built-in catalog. Filters: `owning_role`, `availability` |
| `metric_query` | `metrics:read` | Compute one metric. Arguments: `key`, optional `filters` and `period` |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/goals/charters` | List charters, or propose a draft |
| `GET` | `/cockpit/api/goals/charters/:id` | One charter |
| `GET` | `/cockpit/api/goals/metrics` | Metric catalog |
| `GET` | `/cockpit/api/goals/metrics/query` | Compute one metric. Query `key` |

The screen reads the catalog, queries each metric it shows, and posts a charter draft to the list route. Agents use the MCP tools for the same records.

## Permissions

Token scopes come from one permission-set layer. Reading goals needs `charters:read` and `metrics:read`. Proposing a charter version needs `charters:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `metric_query` with a catalog key. `period` is `week`, `month`, or `quarter`.

```json
{
  "tool": "metric_query",
  "arguments": {
    "key": "cro.demos_held_weekly",
    "period": "week"
  }
}
```

Expected result when the metric is built: `ok` true, `availability` `available`, and a `value`. A metric that is not built yet returns `ok` true with `availability` `not_yet_available` and a `blocked_reason`, not a zero. An unknown key returns `ok` false and `error` `unknown_metric`.

```json
{
  "ok": true,
  "key": "cro.demos_held_weekly",
  "availability": "available",
  "value": 2
}
```

Propose a charter only with `charter_propose_version`. The published row appears after the approval is accepted.
