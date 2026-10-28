---
title: Dash
description: The home screen for what needs a person today.
keywords: dash, home, needs attention, pending approvals, tasks, deals
section: features
order: 1
status: published
unlisted: false
---

# Dash

## What it does

Dash shows the work that needs a person, so the next decision is obvious when you open chytr.

It is the default home after sign-in unless the deploy sets `COCKPIT_HOME`. The board only calls the session API: the browser calls one session route and renders the tiles. It does not write records. You act on the screen the tile links to — Approvals, Tasks, Deals, or Pull requests.

Tiles group into what needs attention (overdue tasks, stalled deals, pending approvals, open pull requests), motions (campaigns and the deal funnel), delivery (tasks and work by desk), and recent CRM changes. A domain filter limits the tiles to one label from Admin → Domains. `all` clears it.

**Approvals by desk** lists pending cards grouped by desk, with inline Approve and Reject. See [Approvals](/docs/features/approvals#by-desk).

## MCP tools

| Tool | Scope | Role on this screen |
|---|---|---|
| `cockpit_get` | `cockpit:read` | Agent read of the home aggregate: pending approvals, notifications, and summaries |

`cockpit_get` calls `cockpit_data`. The screen calls `cockpit_dash` through the route below. Use the tool for an agent's picture of the workspace. Use the route for the tiles you see.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/dash` | Tile payload. Optional `domain` is a catalog code, or `all` |

The response is `{ "ok": true, "data": { ... } }` with `needs_attention`, `motions`, `delivery`, and `crm`.

## Permissions

Scopes come from one permission-set layer: the sets on a personal access token, plus any extra scopes on that key. This screen uses the signed-in session, not a token. `cockpit_get` needs `cockpit:read`.

Row access is RLS by creator. Admins see all rows. Members see their own. Dash counts follow that same scope, so a member does not see another member's tasks in the tiles.

## Agent example

Call `cockpit_get` with an empty argument object.

```json
{
  "tool": "cockpit_get",
  "arguments": {}
}
```

Expected result: an object whose pending-approval count and notification list match what that token's owner would see. A token with no owner returns an auth error and no tiles.

```json
{
  "pending_approvals": [],
  "notifications": []
}
```

The live payload also includes timeline and summary keys. Read those keys from the response rather than assuming this sketch is exhaustive.
