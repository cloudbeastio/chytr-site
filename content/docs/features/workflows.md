---
title: Workflows
description: Workflow templates, what a trigger does today, and how to run one.
keywords: workflows, templates, triggers, workflow_apply, workflow_trigger, tasks
section: features
order: 31
status: published
unlisted: false
---

# Workflows

## What it does

Workflows turn a named recipe into tasks on a desk, so a repeated motion starts the same way every time.

A workflow template is a named recipe: a desk, a description, steps, and an optional trigger. Applying it creates a parent task and child tasks on that desk. It does not run arbitrary code inside the template step. The shipped step type creates tasks.

Open **Automations → Workflows** (`/settings/workflows`). You can list templates, filter by status, and edit one in the drawer. The API is under `/cockpit/api/workflows`.

This screen is not **Decision flows**. Decision flows are a different object, on `/settings/decision-flows`.

## Applying a template

`workflow_apply` (scope `workflows:write`) instantiates a template into tasks. In the product this is how a person or an agent starts the recipe against a project. Pass the template id and the context project (the desk the tasks should land on).

`workflow_template_create` upserts the template and its steps.

## Triggers

A template can carry a declarative trigger: a predicate, a JSON `input_schema`, and a `trigger_mode`.

| Mode | Behavior |
|---|---|
| `shadow_match` | Default. The predicate is evaluated and a `would_start` event is recorded. No tasks are created. `workflow_trigger_enable` applies this mode immediately |
| `live` | The trigger may start the template, but only after a go-live approval. `workflow_trigger_enable` with `mode` `live` mints a pending card of type `workflow_trigger_go_live` and leaves `trigger_mode` unchanged until that card is approved. A second live request while the card is pending returns the same card. `activities` triggers and `engine=pgflow` refuse live and mint nothing |

So a saved trigger does not start work until that template is live and the go-live card is approved. Inspect events with `GET /cockpit/api/workflows/<id>/trigger/events`. Dry-run with `POST …/trigger/dry-run`. Enqueue a manual run with `POST …/trigger`, or with MCP `workflow_trigger`.

`workflow_trigger_describe` returns the input contract for a template. Workspace for the trigger tools comes from the personal access token binding. Do not pass `workspace_id`. The caller needs a token bound to the template's workspace.

Older activity-matching filters (`metadata.filter`) still exist on the classic enqueue path. New triggers should use the declarative trigger and input schema. Both can be present during this phase.

`flow_start` and `flow_run_status` are the lower-level pgflow run controls (scope `workflows:write`). Use the template tools unless you are operating a registered flow slug directly.

## Scheduled tasks

`task_scheduled_create` and `task_scheduled_enable` (scope `schedules:write`, personal access token only) attach a cron schedule to a task, optionally pointing it at a workflow template. Enable it before the schedule fires. Routines under **Agents → Routines** are the other scheduler: a cron or instant job bound to a runtime. They are not workflow templates.

## What is not in the product yet

Schedule-shaped and webhook-shaped triggers beyond the activity predicate, and a full retirement of the older per-flow doors, are not the behavior the app ships. If the drawer does not show a control, it is not a supported way to start work. Named models are [LLMs](/docs/features/llms). That registry does not configure these templates. Routines are [Routines](/docs/features/routines). Classifiers are [Classifiers](/docs/features/classifiers).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `workflow_template_create` | `workflows:write` | Create or update a template and its steps. Token only |
| `workflow_apply` | `workflows:write` | Instantiate tasks on a desk. Token only |
| `workflow_trigger_describe` | `workflows:read` | Input contract. Workspace comes from the token binding |
| `workflow_trigger` | `workflows:write` | Enqueue a trigger with validated input. Workspace comes from the token binding |
| `workflow_trigger_objects` | `workflows:read` | Tables a trigger can watch. Workspace comes from the token binding |
| `workflow_trigger_list` | `workflows:read` | Triggers in the token's workspace |
| `workflow_trigger_events` | `workflows:read` | Recent trigger events |
| `workflow_trigger_test` | `workflows:read` | Dry-run against an existing row. Writes nothing |
| `workflow_trigger_save` | `workflows:write` | Create or update a trigger. Saved disabled. Token only |
| `workflow_trigger_enable` | `workflows:write` | Enable, or set `shadow_match` now. `live` mints `workflow_trigger_go_live` and does not flip the mode. Token only |
| `flow_start` | `workflows:write` | Start a registered flow by slug |
| `flow_run_status` | `workflows:write` | Poll a run and its steps |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/workflows` | List or create templates |
| `GET`, `PATCH` | `/cockpit/api/workflows/:id` | Read or edit |
| `POST` | `/cockpit/api/workflows/:id/trigger` | Enqueue a trigger |
| `POST` | `/cockpit/api/workflows/:id/trigger/dry-run` | Validate without starting |
| `GET` | `/cockpit/api/workflows/:id/trigger/events` | Trigger event log |

The screen only calls these routes. Applying a template from an agent uses `workflow_apply`.

## Permissions

Token scopes come from one permission-set layer. Reads need `workflows:read`. Writes need `workflows:write` and are token-only. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `workflow_trigger_describe` before you enqueue.

```json
{
  "tool": "workflow_trigger_describe",
  "arguments": {
    "template": "calendar-brief"
  }
}
```

Expected result: the input contract for that template. `workflow_trigger` with a body that fails the contract does not start tasks. A template still in `shadow_match` records a `would_start` event and does not create tasks. `workflow_trigger_enable` with `mode` `live` returns a pending `workflow_trigger_go_live` card and leaves the mode unchanged.

```json
{
  "ok": true,
  "template": "calendar-brief",
  "trigger_mode": "shadow_match"
}
```

