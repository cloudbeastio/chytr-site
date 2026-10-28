---
title: Contacts
description: People on accounts, and the approval an agent uses to propose one.
keywords: contacts, people, crm, contact_intake, approval_create, notes
section: features
order: 6
status: published
unlisted: false
---

# Contacts

## What it does

Contacts keep the people you work with on the company they belong to, so a name in a meeting can become a real record only after you accept it.

Open **Contacts** (`/contacts`). The list and the drawer only call the session API. A signed-in person can create a contact. An agent proposes one with `approval_create` and waits. A single first name with no email and no account is not a confirmed person. Allowed fields are in [Entity fields](/docs/reference/entity-fields). Send `full_name`, not `name`.

`contact_intake` is the direct write for an intake payload that already has an email and a company. It is not a shortcut around a fuzzy name.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `approval_create` | `approvals:write` | Propose a person. `table` `contacts`, type `graph_entity_create` |
| `contact_intake` | `contacts:write`, `accounts:write` | Create a contact and account from an intake payload that includes `email` |
| `entity_field_write` | `graph:write` | Write one field through provenance |
| `entity_get` | none (token still required) | Full card by search-entity id |
| `entity_state_get` | none (token still required) | Read `agent_state` |
| `entity_state_set` | `contacts:write` | Replace `agent_state` |
| `entity_state_patch` | `contacts:write` | Shallow-merge `agent_state` |
| `entity_note_add` | `notes:write` | Append a note |
| `entity_notes_list` | `notes:read` | Recent notes |
| `scorecard_get` | `contacts:read` | Latest scorecard when `record_table` is `contacts` |
| `mention_add` | `mentions:write`, `activities:write` | Link an activity to this person |

Do not call MCP `entity_create`. It returns deprecated and writes nothing.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/contacts` | List |
| `POST` | `/cockpit/api/entities/contacts` | Create from a signed-in session. Provenance source is `human` |
| `GET`, `PATCH`, `DELETE` | `/cockpit/api/entities/contacts/:id` | Drawer read, update, delete |
| `POST` | `/cockpit/api/entities/contacts/:id/merge` | Merge into the keeper |

A duplicate email on create returns a conflict and names the contact that already holds it. The second row is not inserted.

## Permissions

Token scopes come from one permission-set layer. Reads need `contacts:read`. Intake needs both `contacts:write` and `accounts:write`. Proposals need `approvals:write`.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `approval_create` for a person you are not ready to treat as confirmed.

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

Expected result: a pending card. No contact row until a person approves it. `lifecycle_stage` `prospect` is stored as `lead`.

```json
{
  "status": "pending",
  "item_type": "graph_entity_create",
  "title": "Create contact: Jane Example"
}
```
