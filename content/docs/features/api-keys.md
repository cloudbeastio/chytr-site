---
title: API keys
description: Personal access tokens, the permission sets on them, and the one-time secret.
keywords: api keys, personal access tokens, cbpat, permission sets, scopes, revoke
section: features
order: 33
status: published
unlisted: false
---

# API keys

## What it does

API keys let an agent call MCP as you, with only the scopes you put on the key, so a leaked token can be revoked without changing your password.

Open **API Keys** (`/settings/keys`). A key is a personal access token. The value starts with `cbpat_` and is shown once. Store it outside the repo and outside the chat. Effective scopes are the union of the permission sets you attach plus any extra scopes. That union is what MCP checks. You can replace the sets or the extras later. Revoke is immediate for new calls.

TTL choices are 1 hour, 24 hours, 7 days (the form default), 30 days, or forever. OAuth sessions do not use this string. They use the signed-in user's scopes. Some writes, including `files:write`, `schedules:write`, and `workflows:write`, are token-only.

The screen only calls the session API. Nothing in MCP issues a key. You create the key here, then the agent sends it as `Authorization: Bearer`.

How scopes map to tools is in [Permissions and API keys](/docs/reference/permissions). Connecting the runtime that receives work is in [Connecting agents](/docs/features/agents).

## MCP tools

No MCP tool creates, lists, or revokes tokens. A token is the credential that calls every other tool. Issuing one from inside a tool would hide the one-time secret in a log.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/tokens` | List your keys, or issue one. Plaintext is only in the create response |
| `POST` | `/cockpit/api/tokens/:id/revoke` | Revoke |
| `POST` | `/cockpit/api/tokens/:id/scopes` | Replace extra scopes |
| `POST` | `/cockpit/api/tokens/:id/sets` | Replace permission-set membership |

`GET` also returns the scope catalog and the active permission sets so the form can render checkboxes.

## Permissions

Any signed-in member can issue and revoke their own keys. The sets they attach are the one permission-set layer. There is no second role matrix inside the token. A revoked key fails the next MCP call. A key that was already exchanged for a short-lived access token stays valid until that access token expires.

Row access on the data the key reads is still RLS by creator. Admins see all rows. Members see their own. The key does not widen RLS. Workflow trigger tools take the workspace from this token's binding. Do not pass `workspace_id`.

## Agent example

Create the key in the screen, then call MCP with it. This example lists approvals. It does not create a key.

```json
{
  "tool": "approval_list",
  "arguments": {
    "status": "pending",
    "limit": 5
  }
}
```

Expected result with `approvals:read` on the key: pending cards for that owner, up to five. The token string is not echoed back. A revoked key returns an auth error and an empty list is not the same thing. An empty list with `ok` true means there is nothing pending.

```json
{
  "ok": true,
  "approvals": []
}
```
