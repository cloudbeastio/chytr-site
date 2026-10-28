---
title: Notifications
description: The in-app inbox, and the same read and dismiss calls an agent can make.
keywords: notifications, inbox, unread, cockpit_notifications_list, dismiss
section: features
order: 40
status: published
unlisted: false
---

# Notifications

## What it does

Notifications are the in-app inbox, so a pending decision or a finished run reaches you without another channel.

Open **Notifications** (`/notifications`). The list is yours. Mark an item read or dismissed. Those are the two terminal states the screen writes. The inbox is per user. Another member's items are not in it.

The screen only calls the session API. Agents use the same two operations through MCP, scoped to the token owner.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `cockpit_notifications_list` | `cockpit:read` | List. `status` defaults to `unread`. `limit` up to 100 |
| `cockpit_notification_resolve` | `cockpit:write` | Set `status` to `read` or `dismissed` |

`cockpit_get` (`cockpit:read`) includes notifications in the home aggregate. Use the list tool when you only want the inbox.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/notifications` | Inbox for the signed-in user. Returns `unread` and `items` |
| `PATCH` | `/cockpit/api/notifications/:id` | Body `{ "status": "read" }` or `{ "status": "dismissed" }` |

## Permissions

Token scopes come from one permission-set layer: `cockpit:read` to list, `cockpit:write` to resolve. The screen uses the signed-in session and only returns that user's rows.

Row access is RLS by creator. Admins see all rows on shared CRM objects. This inbox stays the signed-in user's. An admin does not read another member's notifications through this screen.

## Agent example

Call `cockpit_notifications_list`, then resolve one id from that result.

```json
{
  "tool": "cockpit_notifications_list",
  "arguments": {
    "status": "unread",
    "limit": 20
  }
}
```

Expected result: unread items for the token owner. Resolving an id with `cockpit_notification_resolve` and `status` `read` removes it from the unread list. Resolving an id that belongs to someone else is rejected.

```json
{
  "ok": true,
  "notifications": [
    {
      "id": "notice-1",
      "status": "unread",
      "title": "Approval waiting"
    }
  ]
}
```
