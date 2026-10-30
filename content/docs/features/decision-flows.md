---
title: Decision flows
description: The trigger, decide, gate, and act configuration for a declared decision flow.
keywords: decision flows, gates, thresholds, activity.quality, decisions graph
section: features
order: 29
status: published
unlisted: false
---

# Decision flows

## What it does

Decision flows declare how a classification becomes an action, so a gate can hold, escalate, or do nothing without hiding that choice in code.

Open **Decision Flows** (`/settings/decision-flows`). The list loads every flow from `GET /cockpit/api/decisions/graph`. **+ New flow** (admins) creates a disabled flow with one yes/no question and thresholds at 1.0. The act allowlist starts empty: mint, enqueue, and patch stay unchecked until an admin opts in on the saved flow. **Configure** opens the editor at `/decisions/<flowKey>`.

The editor loads the flow, model bindings, thresholds, and the action on each gate (`auto`, `hold`, `escalate`, `blocked_by_rule`). Fields stay read-only unless `can_edit` is true, and nothing is saved until you press Save.

The path canvas is one vertical column: trigger, then decide, then gate, then act, with an arrow between each step. A recorded run highlights that path as one line. **Test** dry-runs the saved thresholds against a confidence fixture and highlights the path it took. Test does not call a provider, write a run, or fire the act.

This object is not a [Workflow](/docs/features/workflows) template. The audit of what already ran is [Decisions](/docs/features/decisions).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `decision_flow_list` | `decisions:read` | Every flow, plus `can_create` |
| `decision_flow_get` | `decisions:read` | One flow and its `live_path` |
| `decision_flow_create` | `decisions:write` | Admin create. Lands disabled. Does not run it |
| `decision_flow_test` | `decisions:read` | Dry-run fixture answers. Returns the path highlight |

`decision_flow_test` and the HTTP test route share one eval. Both set `dry_run: true` and `executed: false`.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/decisions/graph` | List flows. Includes `can_create` |
| `POST` | `/cockpit/api/decisions/graph` | Create `{ flow_key, description }`. Optional `questions` |
| `GET` | `/cockpit/api/decisions/graph/:flowKey` | Load the editor. Includes `can_edit` and `live_path` |
| `PATCH` | `/cockpit/api/decisions/graph/:flowKey` | Save enabled flag, act policy, allow list, and binding toggles |
| `POST` | `/cockpit/api/decisions/graph/:flowKey/test` | Dry-run `{ answers: [{ question_key, confidence }] }` |

`GET` on an unknown key returns 404. `PATCH` and create return 403 when the session cannot edit or create. A duplicate `flow_key` returns 409.

## Permissions

The screen uses the signed-in session. Any signed-in user can list and open a flow. `can_edit` is admin or the flow owner. `can_create` is admin. MCP uses the existing `decisions:read` and `decisions:write` scopes. Test is a read: it writes nothing.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

List, then dry-run the seeded flow at the boundary confidence.

```json
{
  "tool": "decision_flow_list"
}
```

```json
{
  "tool": "decision_flow_test",
  "arguments": {
    "flow_key": "activity.quality",
    "answers": [{ "question_key": "quality_class", "confidence": 1 }]
  }
}
```

Expected result: `verdict` is `auto` when confidence is at least the saved threshold, otherwise `hold`. `path` is `trigger`, `decide`, `gate:<verdict>`, `act:<type>`. `executed` is false. Nodes with `live: true` are the highlighted path.
