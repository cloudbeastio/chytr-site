---
title: Permission sets
description: Named bundles of scopes, which are the only authorization layer on a token.
keywords: permission sets, scopes, pat, grants, mcp-readonly, built-in admin set
section: features
order: 35
status: published
unlisted: false
---

# Permission sets

## What it does

Permission sets bundle scopes so a token carries one list of what it may call, and you do not keep a second permission system beside it.

Open **Perm Sets** (`/settings/permission-sets`). A set has a slug, a name, and a list of scopes from `pat_scopes`. Seeded slugs include `mcp-readonly`, `cockpit-ops`, and `crm-read`. You can change them after install. A retired scope stays in the catalog so old tokens can be understood, and it is not offered for new grants.

Creating, editing, and archiving a set requires an admin session. The built-in `admin` set cannot be renamed or archived. Attaching a set directly to a user, instead of to a token, is behind `app_settings` key `feature.permission_sets_users`. That flag defaults off. While it is off, the user-grant table is not the enforcement path. Tokens are.

The screen only calls the session API. MCP checks the scopes on the token at call time. It does not read a second role table.

The catalog and the human-only approval rule are in [Permissions and API keys](/docs/reference/permissions). Issuing a key is [API keys](/docs/features/api-keys).

## MCP tools

No MCP tool edits permission sets. A token cannot widen itself. Admin changes happen on this screen.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/permission-sets` | List sets and the scope catalog. `?archived=1` includes archived sets |
| `POST` | `/cockpit/api/permission-sets` | Create a set |
| `PATCH` | `/cockpit/api/permission-sets` | Update or archive a set |
| `GET`, `POST` | `/cockpit/api/permission-sets/admin` | User-grant operations when that flag is on |

Writes return 403 when the session is not an admin. Renaming or archiving the built-in `admin` set is refused even for an admin.

## Permissions

This screen is the permission-set layer. Scopes on a token are the union of its sets plus extra scopes. There is no parallel profile or graph role for MCP. User grants stay off unless you turn the flag on.

Data the token then reads is still RLS by creator. Admins see all rows. Members see their own. A broad scope does not override that.

## Agent example

There is no tool call that edits a set. After an admin puts `approvals:read` on the set attached to your key, call `approval_list`.

```json
{
  "tool": "approval_list",
  "arguments": {
    "status": "pending",
    "limit": 1
  }
}
```

Expected result: the call succeeds when the set includes `approvals:read`. The same call without that scope is rejected. Changing the set does not change rows you are not allowed to see under RLS.

```json
{
  "ok": true,
  "approvals": []
}
```
