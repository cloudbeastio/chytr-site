---
title: Approval types
description: The field shapes and type contracts that decide what a create card may contain.
keywords: approval types, shapes, entity fields, approval-shapes, graph_entity_create
section: features
order: 37
status: published
unlisted: false
---

# Approval types

## What it does

Approval types define the shape of a create or update card, so an agent can send only the fields you allow and the rest are dropped.

Open **Approval types** (`/settings/approvals`). You edit entity shapes and the contract for each card type. The queue that uses those shapes is [Approvals](/docs/features/approvals). The field lists are also in [Entity fields](/docs/reference/entity-fields).

Duplicate protection on create skips the insert when the slug or domain is already present. Keys that are not in the shape are dropped. This screen is where you change the shape. It does not resolve cards.

The page only calls one pair of session routes. There is no MCP tool that edits shapes. An agent that needs a new field asks a person to add it here, then sends that field on the next card.

## MCP tools

No MCP tool edits shapes. Agents file cards with `approval_create` (`approvals:write`) and must stay inside the shape this screen stores. `approval_list` (`approvals:read`) shows the pending cards. It does not show the shape editor.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/approval-shapes` | Shapes and type contracts |
| `PATCH` | `/cockpit/api/approval-shapes` | Save an edit |

Both use the signed-in session. The queue itself is `/cockpit/api/approvals`, documented on [Approvals](/docs/features/approvals).

## Permissions

Editing shapes uses the signed-in session. Filing a card needs `approvals:write` from one permission-set layer. Changing a shape does not grant an agent permission to approve a human-only type.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `approval_create` with fields the shape allows. Leave out keys the shape does not list.

```json
{
  "tool": "approval_create",
  "arguments": {
    "item_type": "graph_entity_create",
    "title": "Create contact: Jane Example",
    "table": "contacts",
    "fields": {
      "full_name": "Jane Example",
      "title": "VP Operations",
      "lifecycle_stage": "lead"
    }
  }
}
```

Expected result: a pending card. Fields not in the contact shape are dropped, not stored on the side. The contact row appears only after a person approves the card.

```json
{
  "status": "pending",
  "item_type": "graph_entity_create"
}
```
