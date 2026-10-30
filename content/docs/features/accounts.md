---
title: Accounts
description: The company list, and how an agent proposes a company instead of inserting one.
keywords: accounts, companies, crm, enrichment, entity_field_write, approval_create
section: features
order: 5
status: published
unlisted: false
---

# Accounts

## What it does

Accounts keep every company in one list, so a deal, a contact, and a meeting all point at the same record.

Open **Accounts** (`/accounts`). Search by name, domain, or slug. The drawer edits fields. A person signed in to chytr can create a row directly. An agent does not. `entity_create` on MCP is deprecated and does not insert. The agent files an approval, and a person accepts it. Allowed fields are in [Entity fields](/docs/reference/entity-fields).

The screen only calls the session API. List, create, update, and merge go through the session API under the signed-in user, and row policies apply.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `approval_create` | `approvals:write` | Propose a company. `item_type` `graph_entity_create`, `table` `accounts` |
| `entity_field_write` | `graph:write` | Write one field through provenance |
| `accounts_due_for_enrichment` | `accounts:read` | Companies whose enrichment is stale |
| `entity_get` | none (token still required) | Full card by search-entity id |
| `entity_state_get` | none (token still required) | Read `agent_state` |
| `entity_state_set` | `accounts:write` | Replace `agent_state` |
| `entity_state_patch` | `accounts:write` | Shallow-merge `agent_state` |
| `entity_note_add` | `notes:write` | Append a note |
| `entity_notes_list` | `notes:read` | Recent notes |
| `scorecard_get` | `accounts:read` | Latest scorecard when `record_table` is `accounts` |

Do not call MCP `entity_create`. It returns deprecated and writes nothing.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/accounts` | List. `?q=` searches name, domain, and slug |
| `GET` | `/cockpit/api/accounts/search` | Picker lookup |
| `POST` | `/cockpit/api/entities/accounts` | Create from a signed-in session. Provenance source is `human` |
| `GET`, `PATCH`, `DELETE` | `/cockpit/api/entities/accounts/:id` | Drawer read, update, delete |
| `POST` | `/cockpit/api/entities/accounts/:id/merge` | Merge into the keeper |

## Permissions

Token scopes come from one permission-set layer. Reads need `accounts:read`. Field writes from an agent need `graph:write` or `accounts:write` as the table above shows. Creates that should wait for a person use `approvals:write`.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `approval_create` to propose a company. Do not send `owner_user_id`, `id`, or `slug` inside `fields`.

```json
{
  "tool": "approval_create",
  "arguments": {
    "item_type": "graph_entity_create",
    "title": "Create account: Example Co",
    "table": "accounts",
    "fields": {
      "name": "Example Co",
      "domain": "example-co.invalid",
      "industry": "software"
    }
  }
}
```

Expected result: a pending approval. The account row does not exist until a person approves the card. Rejecting the card leaves the list unchanged.

```json
{
  "status": "pending",
  "item_type": "graph_entity_create",
  "title": "Create account: Example Co"
}
```
