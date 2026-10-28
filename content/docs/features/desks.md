---
title: Desks
description: Projects as the home for tasks, shown as a team or as a list.
keywords: desks, projects, org structure, tasks, workflow templates, routines
section: features
order: 16
status: published
unlisted: false
---

# Desks

## What it does

Desks are the projects work hangs on, so a task, a routine, and a workflow template all have a home.

Open **Desks** (`/desks`). **Team** is the org view. **List** is the project table. `?view=team` or `?view=list` picks one, and the choice is remembered in the browser. A desk is a project row. Routines and workflow templates bind to a desk so scheduled work has somewhere to land.

The screen only calls the project routes. A desk is still a project row. Desk memory is its own append-only table (`desk_memory`). The scratch pad is `projects.agent_state.scratchpad`. Agents pass `project_id` on tasks and templates, and `desk_id` (the same project id) on the desk tools below.

Desk isolation is a convention, not a security boundary. An admin sees every desk. A member sees desks they own. The database does not bind a runtime to a single desk.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `task_list` | `tasks:read` | Tasks on a desk. Filter `project_id` |
| `task_create` | `tasks:write` | Create a backlog task on a desk |
| `entity_field_write` | `graph:write` | Write one project field through provenance |
| `entity_state_get` | none (token still required) | Read `agent_state` on `projects` |
| `entity_state_set` | `projects:write` | Replace `agent_state` |
| `entity_state_patch` | `projects:write` | Shallow-merge `agent_state` |
| `workflow_template_create` | `workflows:write` | Save a template bound to `project_id` |
| `workflow_apply` | `workflows:write` | Instantiate that template into tasks on a desk |
| `desk_scratchpad_get` | `projects:read` | Read the scratch pad |
| `desk_scratchpad_set` | `projects:write` | Overwrite the scratch pad (16 KiB, `expected_updated_at` conflict check) |
| `desk_memory_append` | `projects:write` | Append a desk memory row. Nothing is deleted |
| `desk_memory_list` | `projects:read` | Pinned rows plus the last 30 days (`days`, `include_all`) |
| `desk_memory_pin` | `projects:write` | Pin or unpin a memory row |
| `desk_context_get` | `projects:read` | Scratch pad and memory together |
| `task_pickup` | `tasks:write`, `comments:read` | Claim, comments, and `desk_context` |

`entity_notes` is for entity and meeting notes. Desk memory is not written there. A daily job sets `archived_at` on unpinned rows older than 30 days. Pinned rows stay. A list does not archive. The session user is the actor. A caller-supplied user id is trusted only for the service client. The server stamps who wrote the pad. Memory rows do not take a caller-supplied runtime id.

The scratch pad and the memory list are dedicated Scratch and Memory tabs on the project entity drawer. Admins and the desk owner can read and write them. Anyone else sees a no-access state. An empty scratch pad says so. An empty memory list says so.

`workflow_apply` takes `context_project_id` for the desk the new tasks should land on.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/projects` | List view |
| `PATCH` | `/cockpit/api/projects/:id` | Update a project from the list or the team view |
| `GET` | `/cockpit/api/org-structure` | Team view |
| `GET`, `PATCH` | `/cockpit/api/entities/projects/:id` | Drawer read and update |
| `GET`, `POST` | `/cockpit/api/projects/:id/desk` | Drawer scratch pad and desk memory |
| `POST` | `/cockpit/api/entities/projects` | Create from a signed-in session |

Project actions also live under `/cockpit/api/projects/:id` for child counts and for convert, delete, merge, owner, and undo-delete.

## Permissions

Token scopes come from one permission-set layer. Task reads need `tasks:read`. Project field state needs `projects:write`. Template writes need `workflows:write` and are token-only. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `task_create` with the desk you want the work on. Set `human_approval_to_close` on purpose. The default is false.

```json
{
  "tool": "task_create",
  "arguments": {
    "title": "Send the revised scope",
    "project_id": "desk-1",
    "human_approval_to_close": true
  }
}
```

Expected result: a backlog task on that project. It does not wake a runtime until it moves to `todo`. Because the flag is true, closing it later opens a card instead of finishing on its own.

```json
{
  "ok": true,
  "status": "backlog",
  "title": "Send the revised scope",
  "human_approval_to_close": true
}
```
