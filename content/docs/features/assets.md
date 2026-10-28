---
title: Assets
description: Marketing files with versions, so the bytes live once and the identity stays stable.
keywords: assets, files, versions, marketing_asset_create, file_reserve, file_commit
section: features
order: 11
status: published
unlisted: false
---

# Assets

## What it does

Assets give a marketing file a stable name and a version history, so a one-pager can be updated without losing the copy you already shared.

Open **Assets** (`/assets`). You create an asset identity, then add versions that point at a committed file. The bytes are a file row. The asset is the name, kind, and current version. Sharing is recorded. It is not sent. The content calendar is a different list on [Content](/docs/features/content).

The screen only calls the session API. Agents use the same file and asset tools, and the board shows the rows those tools write.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `file_reserve` | `files:write` | Reserve a file row and an upload URL, deduped by hash |
| `file_commit` | `files:write` | Mark the upload ready |
| `file_signed_url` | `files:read` | Short-lived download URL |
| `marketing_asset_create` | `files:write` | Create the asset identity |
| `marketing_asset_version_add` | `files:write` | Add a version that points at a committed file |
| `marketing_asset_list` | `files:read` | List assets |
| `marketing_asset_get` | `files:read` | One asset and its versions |
| `marketing_asset_set_current` | `files:write` | Point the asset at a version |
| `file_link` | `files:write` | Link a file to a record |
| `files_for_entity` | `files:read` | Files on a record |

`file_share_record` records a share. It does not deliver the file.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/assets` | List or create an asset |
| `GET`, `PATCH` | `/cockpit/api/assets/:id` | Read or update one asset |
| `POST` | `/cockpit/api/assets/:id/versions` | Add a version |
| `POST` | `/cockpit/api/assets/:id/current` | Set the current version |
| `GET` | `/cockpit/api/brands` | Brand picker on the create form |
| `GET`, `POST` | `/cockpit/api/files` | File metadata |
| `GET` | `/cockpit/api/files/:id/url` | Short-lived download URL |

## Permissions

Token scopes come from one permission-set layer. Reads need `files:read`. Writes, including asset create and version add, need `files:write`. These writes are token-only on the MCP path. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `marketing_asset_create` after `file_commit` has a file id, then add a version.

```json
{
  "tool": "marketing_asset_create",
  "arguments": {
    "title": "Data quality one-pager",
    "slug": "data-quality-one-pager",
    "kind": "one-pager"
  }
}
```

Expected result: an asset row with no current file yet. `marketing_asset_version_add` with that asset id and a committed `file_id` attaches version 1. `marketing_asset_list` then returns the title. The bytes are never inlined in the tool result.

```json
{
  "ok": true,
  "title": "Data quality one-pager",
  "slug": "data-quality-one-pager"
}
```
