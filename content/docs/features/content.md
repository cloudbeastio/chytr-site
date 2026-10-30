---
title: Content
description: A read-only board of marketing content items the engine has already produced.
keywords: marketing content, content calendar, channels, status, read-only
section: features
order: 9
status: published
unlisted: false
---

# Content

## What it does

Content shows every marketing piece and where it sits, so you can see what is drafted, scheduled, or published without editing the engine by hand.

Open **Content** (`/marketing-content`). The board is read-only. Filter by status, type, channel, and a date window. Statuses include `planned`, `drafted`, `review`, `scheduled`, `publishing`, `published`, `failed`, and `cancelled`. Opening a row uses the entity drawer. There is no New button and no MCP tool that writes `marketing_content_items`.

Generation stays headless. This screen only reads the result. Assets you upload as files are a different object on [Assets](/docs/features/assets).

## MCP tools

No MCP tool targets this board. Agents that need a file-backed piece use the asset tools on [Assets](/docs/features/assets). Do not invent a content-item tool. The session route below is the read path.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/marketing-content` | Paged list. This route is GET only |

Query parameters the screen sends: `status` and `type` as comma-separated lists, `channel`, `after`, `before`, `limit`, and `offset`. The body is `{ "ok": true, "items": [...], "has_more": true|false }`.

## Permissions

The screen uses the signed-in session. There is no content-item scope on the permission-set layer because there is no tool. Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

There is no tool call that lists these rows. A session client reads the same route the board uses.

```json
{
  "method": "GET",
  "path": "/cockpit/api/marketing-content?status=published&limit=50&offset=0"
}
```

Expected result: published items visible to that user, newest window first, with `has_more` when another page exists. A member does not receive another member's rows.

```json
{
  "ok": true,
  "items": [
    {
      "title": "Launch note",
      "status": "published"
    }
  ],
  "has_more": false
}
```
