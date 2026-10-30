---
title: Integrations
description: Connect Google, GitHub, and X for the workspace, plus Cursor Cloud.
keywords: integrations, google, github, cursor, connect, revoke
section: features
order: 32
status: published
unlisted: false
---

# Integrations

## What it does

Integrations connect the providers chytr already knows how to sync, so mail, calendar, pull requests, and posts show up without pasting a secret into a prompt.

Open **Integrations** (`/settings/integrations`). You can connect or disconnect Google, GitHub, and X, and store the Cursor Cloud settings the runtime uses. Disconnect revokes the stored connection. Connecting a provider does not create users and does not grant MCP scopes.

Secrets stay on the server. The screen never returns a refresh token to the browser after connect. The page only calls the session routes below. There is no MCP tool that connects a provider. What chytr does with a connected GitHub, such as merging a task's pull requests when it closes, is on [GitHub](/docs/features/github).

## MCP tools

No MCP tool connects or revokes an integration. Agents call chytr with a personal access token from [API keys](/docs/features/api-keys). That token is not a Google, GitHub, or X credential. Provider access stays on this screen.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/integrations` | Connection status for the workspace |
| `POST` | `/cockpit/api/integrations/connect` | Start a provider connect |
| `POST` | `/cockpit/api/integrations/revoke` | Disconnect a provider |
| `GET`, `POST` | `/cockpit/api/integrations/cursor` | Read or save Cursor Cloud settings |
| `GET`, `POST` | `/cockpit/api/integrations/chytr` | Log-drain settings |
| `POST` | `/cockpit/api/integrations/chytr/test` | Test the drain |
| `POST` | `/cockpit/api/integrations/chytr/backfill` | Backfill the drain |

## Permissions

The screen uses the signed-in session for the workspace. A personal access token cannot connect a provider. Permission sets do not include a provider-admin scope. After a provider is connected, data it syncs still follows RLS: admins see all rows, members see their own.

## Agent example

There is no tool call. A session client reads status.

```json
{
  "method": "GET",
  "path": "/cockpit/api/integrations"
}
```

Expected result: active connections, without stored secrets. Each item names a `provider` (`google`, `github`, or `x`). `revoke` removes that connection. Later syncs stop. Rows already imported stay until you delete them.

```json
{
  "ok": true,
  "connections": [
    { "provider": "google", "label": "Workspace" }
  ]
}
```
