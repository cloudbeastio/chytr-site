---
title: Approvals
description: How agent cards work, and how to approve or reject them.
keywords: approvals, deck, review queue, on_approve, approval_create, approval_resolve
section: features
order: 3
status: published
unlisted: false
---

# Approvals

## What it does

Approvals give you one queue for every proposal an agent files, so the database applies a change only when you accept it.

Approvals are the decision queue. An agent, a workflow, or an ingest job inserts a `pending` row. You resolve it. The database runs the card's `on_approve` action only when the status becomes `approved`.

Open **Approvals** (`/approvals`). **Deck** is one card at a time: approve, reject, or skip. **List** is the same pending queue with a domain filter, type tabs, and bulk approve or reject. `/deck` redirects to the deck view. The list and the deck call the same resolve API.

You can also open a card's chat from the deck. That chat can search indexed text. It does not resolve the card for you.

## By desk

Approvals are also grouped by desk (project), so you can decide the cards that belong to the work you are looking at.

- **Dash** shows **Approvals by desk**. Each desk lists its cards, with an **Open / All** switch. Desks with nothing to show are hidden.
- A desk's own page shows **Open Approvals** for that desk only.
- The task drawer shows the cards linked to that task.

Pending rows have inline **Approve** and **Reject** buttons, so you do not have to open the deck. They use the same decision routes as the deck and list. Approving a close card here merges the linked pull request, and rejecting a proposed task cancels it, exactly as in the deck. See [GitHub](/docs/features/github).

What you can decide follows [What a member can see](/docs/features/users#what-a-member-can-see).

## Statuses

| Status | Meaning |
|---|---|
| `pending` | Waiting |
| `approved` | Accepted. `on_approve` has run, or has recorded its result |
| `rejected` | Declined. `on_approve` does not run |
| `deferred` | Set aside. The deck and list resolve actions use approve and reject |
| `expired` | No longer actionable |
| `delegated` | Handed to someone else |

The chytr resolve buttons send `approved` or `rejected`. Other statuses exist on the row for agents and for bulk tools.

An approve must be attributed. A session in chytr, or `resolve_approval` from a token, stamps who decided. A raw update that sets `approved` with no actor is refused.

## What approve does

`on_approve.kind` selects the action. The kinds you will see on entity cards:

| Kind | Effect |
|---|---|
| `entity_create` | Insert one row in `accounts`, `contacts`, `deals`, `projects`, `campaigns`, or `territories` |
| `entity_update` | Write the listed fields and record who changed them |
| `entity_merge` | Merge the loser into the keeper. Needs the merge decision on the card |
| `entity_alias_add` | Add an alias |
| `task_status` | Move the linked tasks from one status to another |
| `row_status` | Flip an allow-listed marketing or campaign-member status |
| `enqueue` | Send a job to an allow-listed queue |

Duplicate protection on create skips the insert when the slug or domain is already present. Keys that are not in the entity shape are dropped. Shapes are editable under **Admin → Approval types** (`/settings/approvals`).

## What you send on a create card

Agents call `approval_create` (scope `approvals:write`) or include the entity on a graph check-in. For a create, send `item_type` `graph_entity_create` and either `on_approve` or `table` plus `fields`.

A contact example, with no address on purpose:

```json
{
  "item_type": "graph_entity_create",
  "title": "Create contact: Jane Example",
  "table": "contacts",
  "fields": {
    "full_name": "Jane Example",
    "title": "VP Operations",
    "lifecycle_stage": "lead"
  }
}
```

Required and allowed fields are in [Entity fields](/docs/reference/entity-fields). Do not send `tags`, `domain_wall`, `references`, `slug`, `id`, or `owner_user_id`. Do not send `name` on a contact. Foreign keys accept an id or a slug.

`graph_entity_update` is the matching type for a field change. `project_create` is a project-shaped create.

## Human-only cards

These types stay with a person. `approval_resolve` from an agent token refuses them:

- `graph_entity_merge`
- `graph_entity_rename`
- `graph_entity_create`
- `graph_entity_alias`
- `merge_proposal`
- `stage2_identity`
- `product_create`
- `product_rename`
- `engagement_outcome_achieve`
- `workflow_cross_desk_grant`

Agents may still **propose** a create. A person approves it in chytr. Agents may resolve types that are not on this list, including `graph_entity_update` and extraction cards, when the token has `approvals:write`.

Fuzzy name matches are not auto-merged. The card should show the candidates. You confirm.

## Task cards

Promoting a backlog task and closing a task that has `human_approval_to_close` set both show up here (`task_promote`, `task_close_ack`). Rejecting a proposed task cancels the linked task. It does not promote it. Approving a `task_close_ack` card merges the task's linked pull requests with a merge commit, then closes the task. If a pull request is not ready, the approval is refused and the card stays pending. See [GitHub](/docs/features/github).

## Where else cards come from

Meeting and activity extraction uses this same queue. The type is `extraction.<action>`. There is no extraction screen and no second inbox. A router card's `on_approve` is `extraction_apply` (or `entity_merge` for a complete merge). Approve runs that action. A failed apply leaves the card pending. Reject applies nothing. The contract is in [Meetings and extraction](/docs/features/meetings). Shapes for create cards are edited on [Approval types](/docs/features/approval-types).

A workflow trigger go-live files `workflow_trigger_go_live`. Approving it is what sets `trigger_mode` to `live`. See [Workflows](/docs/features/workflows).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `approval_create` | `approvals:write` | File a pending card |
| `approval_list` | `approvals:read` | List cards. Filter `status` |
| `approval_resolve` | `approvals:write` | Resolve through `resolve_approval`. A session records human. A PAT records agent. Human-only approve needs owner or admin |
| `extraction_pending` | `approvals:read` | Extraction cards in this same queue |
| `extraction_review` | `approvals:write` | Approve or reject one extraction card |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/approvals` | Pending queue |
| `GET`, `PATCH` | `/cockpit/api/approvals/:id` | Read, or set `approved` / `rejected` |
| `POST` | `/cockpit/api/approvals/bulk` | Bulk resolve |
| `POST` | `/cockpit/api/approvals/:id/merge-approve` | Approve a merge card |
| `GET` | `/cockpit/api/approvals/:id/merge-context` | Merge context |
| `GET` | `/cockpit/api/approvals/by-desk` | Cards grouped by desk. Query `include=open` or `all`, optional `project_id` |
| `POST` | `/cockpit/api/approvals/:id/close-approve` | Approve a close card |
| `POST` | `/cockpit/api/approvals/:id/reject-cancel` | Reject and cancel the linked work |
| `GET`, `PATCH` | `/cockpit/api/approval-shapes` | Shapes. The editor is [Approval types](/docs/features/approval-types) |

Deck helpers, same session: `POST /cockpit/api/deck/chat`, `POST /cockpit/api/deck/graph-chat`, `GET /cockpit/api/deck/context`, `GET /cockpit/api/deck/ground`, `POST /cockpit/api/deck/events`.

The screen only calls these routes. Agents use the MCP tools. Both land on the same rows.

## Permissions

Token scopes come from one permission-set layer. Listing needs `approvals:read`. Filing or resolving needs `approvals:write`. Human-only types stay with a person even when the token has that scope. A session can resolve a card it owns, or any card when `is_admin()` is true. A workspace role is not that flag.

Row access on this table is creator-based RLS. A member sees rows they own (`owner_user_id` is the signed-in user). `is_admin()` sees all rows. A personal access token with `approvals:read` can select, and `approvals:write` can insert or update, through the token scope check, including rows that person did not create. A session that sets `approved`, `rejected`, or `deferred` records that user as human. A PAT with no session records the token as agent through `resolve_approval`. A session cannot forge the agent identity.

## Agent example

Call `approval_list` for what is waiting, then `approval_resolve` only for a type that is not human-only.

```json
{
  "tool": "approval_list",
  "arguments": {
    "status": "pending",
    "limit": 10
  }
}
```

Expected result: pending cards visible to the token owner. Resolving a `graph_entity_create` with `approval_resolve` is refused. Resolving an extraction card or a `graph_entity_update` with `status` `approved` runs that card's `on_approve`. An extraction card's apply is `extraction_apply`. A failed apply leaves the card pending. `rejected` does not apply.

```json
{
  "ok": true,
  "approvals": [
    {
      "title": "Create contact: Jane Example",
      "status": "pending",
      "item_type": "graph_entity_create"
    }
  ]
}
```

