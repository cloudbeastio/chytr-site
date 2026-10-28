---
title: Domains
description: The workspace label catalog for tasks, projects, and filters.
keywords: domains, labels, catalog, filters, tasks, projects
section: features
order: 36
status: published
unlisted: false
---

# Domains

## What it does

Domains are labels you define, so tasks, projects, and comments can be filtered by the same short code.

Open **Domains** (`/settings/domains`). A domain has a code, a label, a color, and a sort order. The code does not change after create. You can archive a code and restore it. Archiving hides it from pickers. It does not delete the tasks that used it.

A domain is not a permission and not an email domain. It does not grant scopes. The [Dash](/docs/features/dash) domain filter uses this catalog.

The screen only calls the session API. There is no MCP tool that creates labels. Agents pass a domain code that already exists, for example on `task_create`.

## MCP tools

No MCP tool administers this catalog. Tools that accept a domain code:

| Tool | Scope | Role |
|---|---|---|
| `task_create` | `tasks:write` | Optional `domain` on a new task |
| `task_list` | `tasks:read` | Filter `domain` |
| `comment_create` | `comments:write` | Optional `domain` on a comment |

An unknown code is not created on the fly.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/domains` | List the catalog |
| `POST` | `/cockpit/api/domains` | Create. Body includes `code`, `label`, `color`, `sort_order` |
| `PATCH` | `/cockpit/api/domains/:code` | Update label, color, sort, or `archived` |

Color is `#rrggbb`. Writes require an owner or admin session. A member gets 403.

## Permissions

Catalog writes are an owner or admin session, not a token scope. There is no domains scope on the permission-set layer. Tasks and comments still need their own scopes.

Row access is RLS by creator. Admins see all rows. Members see their own. The catalog itself is workspace-wide for people who can open the screen.

## Agent example

Call `task_list` with a code you read from this screen. Do not invent one.

```json
{
  "tool": "task_list",
  "arguments": {
    "domain": "delivery",
    "status": "todo",
    "limit": 20
  }
}
```

Expected result: todo tasks tagged `delivery` that this token may see. An empty list means nothing is in that label, not that the label is missing. Creating the label is the POST above, from an admin session.

```json
{
  "ok": true,
  "tasks": []
}
```
