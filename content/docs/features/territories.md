---
title: Territories
description: Coverage slices for a channel partner, proposed by an agent and accepted by a person.
keywords: territories, coverage, partners, regions, approval_create, entity_field_write
section: features
order: 8
status: published
unlisted: false
---

# Territories

## What it does

Territories show who covers a slice of a partner's map, so a campaign can target a patch instead of a loose list of accounts.

Open **Territories** (`/territories`). A territory is a coverage slice on a partner account: region, industry, and segment, with the people who cover it. The list and the drawer only call the session API. A signed-in person can create a row. An agent proposes one and waits for approval. There is no MCP tool that lists or inserts territories directly.

Allowed fields are in [Entity fields](/docs/reference/entity-fields).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `approval_create` | `approvals:write` | Propose a territory. `table` `territories`, type `graph_entity_create` |
| `entity_field_write` | `graph:write` | Write one field through provenance |
| `entity_note_add` | `notes:write` | Append a note |
| `entity_notes_list` | `notes:read` | Recent notes |
| `entity_get` | none (token still required) | Full card when a search entity exists for the row |

Do not call MCP `entity_create`. It returns deprecated and writes nothing.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/territories` | List |
| `POST` | `/cockpit/api/entities/territories` | Create from a signed-in session. Provenance source is `human` |
| `GET`, `PATCH`, `DELETE` | `/cockpit/api/entities/territories/:id` | Drawer read, update, delete |
| `POST` | `/cockpit/api/entities/territories/:id/merge` | Merge into the keeper |

## Permissions

Token scopes come from one permission-set layer. A proposal needs `approvals:write`. A field write needs `graph:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `approval_create` with the territory's name and the partner it hangs on. Send a slug or an id for the partner foreign key, not a display name alone.

```json
{
  "tool": "approval_create",
  "arguments": {
    "item_type": "graph_entity_create",
    "title": "Create territory: West Manufacturing",
    "table": "territories",
    "fields": {
      "name": "West Manufacturing",
      "partner": "example-partner"
    }
  }
}
```

Expected result: a pending card. The territory does not appear on `/territories` until a person approves it.

```json
{
  "status": "pending",
  "item_type": "graph_entity_create",
  "title": "Create territory: West Manufacturing"
}
```
