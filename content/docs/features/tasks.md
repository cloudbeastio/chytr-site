---
title: Tasks
description: The board for work, from backlog to done, including the close gate.
keywords: tasks, backlog, todo, close gate, task_create, task_request_close
section: features
order: 17
status: published
unlisted: false
---

# Tasks

## What it does

Tasks are the unit of work on a board, so a person and an agent share one status line and one close rule.

Open **Tasks** (`/tasks`). Statuses are `backlog`, `todo`, `doing`, `review`, `stuck`, `done`, and `cancelled`. A task belongs to a desk (a project) and can be assigned to a person or a runtime. Moving it to `todo` is what wakes a runtime. The board only calls the session API: it lists and patches, and the stage changes go through the same transitions the MCP tools use.

`human_approval_to_close` is the close gate. On means a person must accept a close card. Off, the default, means the assignee can finish it. Set the flag when you create the task. Words in the description do not change it.

A close-gated task closes when a person approves its close card. Approving merges the linked pull requests, then closes the task. A task that is not close-gated merges a ready pull request when the assignee closes it. See [GitHub](/docs/features/github) for the merge rules.

Hidden tasks stay off the default list until `hidden_until`. Pass `include_hidden` to see them.

## Due dates and links

**Due dates.** Give a task a due date when you create it, or change it later with `task_set_due` or `task_update`. `YYYY-MM-DD` means the end of that day in Pacific time. A full ISO-8601 timestamp is used as given. Passing `null` clears it.

**Links.** A task can point at the records it is about: an account, a deal, a campaign, and contacts. Pass `account_id`, `deal_id`, `campaign_id`, and `contact_ids` on `task_create` or `task_update`. `related_entities` is the same thing as a list of `{ entity_type, entity_id }`. chytr checks each record exists before it links it. On `task_update`, a `contact_ids` list replaces the current set and an empty list clears it. Links show on the task in chytr and filter `task_list`.

A linked pull request is a link too. See [GitHub](/docs/features/github).

What you can see on the board follows [What a member can see](/docs/features/users#what-a-member-can-see).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `task_create` | `tasks:write` | Create a backlog task |
| `task_list` | `tasks:read` | List. Hidden rows stay out unless `include_hidden` is true |
| `task_hide` | `tasks:write` | Set or clear `hidden_until` |
| `task_claim` | `tasks:write` | Claim `todo` tasks for a runtime |
| `task_claim_work_item` | `tasks:write` | Claim the one task a work item points at |
| `task_pickup` | `tasks:write`, `comments:read` | Claim plus comments. Acks unread handoffs |
| `task_start` | `tasks:write` | `todo` to `doing` |
| `task_complete` | `tasks:write` | Finish a `todo` or `doing` task that is not close-gated |
| `task_request_close` | `tasks:write` | Close. A human gate opens a card. Otherwise the task can complete |
| `task_request_promote` | `tasks:write` | Ask a person to move backlog work up |
| `task_stuck` | `tasks:write` | Mark stuck |
| `task_resume` | `tasks:write` | `stuck` to `todo`. Refuses unmet dependencies |
| `task_demote` | `tasks:write` | `todo` back to `backlog` |
| `task_reopen` | `tasks:write` | Reopen a `done` task |
| `task_cancel` | `tasks:write` | Cancel from an active status. Reason required |
| `task_reassign` | `tasks:reassign` | Reassign. Handoff comment required |
| `task_set_due` | `tasks:write` | Set or clear a task's due date |
| `task_update` | `tasks:write` | Change title, description, priority, due date, hidden date, desk, metadata, parent, and linked records. Not status, close gate, or assignee |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/tasks` | List or create |
| `GET`, `PATCH` | `/cockpit/api/tasks/:id` | Read or update routing fields |
| `POST` | `/cockpit/api/tasks/:id/start` | `todo` to `doing` |
| `POST` | `/cockpit/api/tasks/:id/complete` | Complete when not close-gated |
| `POST` | `/cockpit/api/tasks/:id/request-close` | Open the close path |
| `POST` | `/cockpit/api/tasks/:id/promote` | Ask to move a backlog task up |
| `POST` | `/cockpit/api/tasks/:id/stuck` | Mark stuck |
| `POST` | `/cockpit/api/tasks/:id/resume` | `stuck` to `todo` |
| `POST` | `/cockpit/api/tasks/:id/demote` | `todo` to `backlog` |
| `POST` | `/cockpit/api/tasks/:id/reopen` | Reopen from `done` |
| `POST` | `/cockpit/api/tasks/:id/cancel` | Cancel |
| `POST` | `/cockpit/api/tasks/:id/archive` | Archive |
| `POST` | `/cockpit/api/tasks/:id/approve-review` | Accept a task in `review` |

The board also reads `/cockpit/api/runtimes`, `/cockpit/api/accounts`, and `/cockpit/api/projects` to fill the filters.

## Permissions

Token scopes come from one permission-set layer. Listing needs `tasks:read`. Stage changes need `tasks:write`. Reassign needs `tasks:reassign`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `task_list` for the desk you are working, then `task_request_close` only for a task you were assigned.

```json
{
  "tool": "task_list",
  "arguments": {
    "project_id": "desk-1",
    "status": "doing",
    "limit": 20
  }
}
```

Expected result: doing tasks on that desk that this token's owner is allowed to see. Hidden tasks are absent. Closing one of them with `task_request_close` returns `ok` true and moves it to `done` when `human_approval_to_close` is false. When the flag is true, the task stays open and a close card is pending.

```json
{
  "ok": true,
  "tasks": [
    {
      "title": "Send the revised scope",
      "status": "doing",
      "human_approval_to_close": false
    }
  ]
}
```
