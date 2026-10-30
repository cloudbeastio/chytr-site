---
title: Users and members
description: Workspace roles, invites, and what a member can do.
keywords: users, members, roles, owner, admin, invite
section: features
order: 34
status: published
unlisted: false
---

# Users and members

## What it does

Users are the people who can sign in, so an owner can invite a teammate and a member cannot administer the workspace.

**Admin → Users** (`/settings/users`) lists the people in the current workspace. An owner or an admin can invite, change a role, and deactivate. A member cannot administer this screen. Calls go through workspace membership checks. A personal access token cannot administer users.

## Roles

| Role | What it is for |
|---|---|
| `owner` | The installing membership. The last owner cannot be removed or demoted by the membership trigger |
| `admin` | Can invite, change roles, and deactivate, same as an owner, on this screen |
| `member` | Can use chytr. Cannot administer members |

Invite by email. If the person already has an Auth user, they are added. If they do not, chytr sends an Auth invite and then adds the membership. The invite link returns them to `/login` on your app origin. They still sign in with a one-time code. The login form does not sign up a stranger who was never invited.

Deactivate revokes that person's personal access tokens, removes their permission-set grants, and disables the membership. An access token that was already issued stays valid until it expires.

`user_profiles.is_admin` is a database flag, separate from the workspace `admin` role. `extraction_threshold_set` checks it: `is_admin()` for a session, `is_admin_for` for a token. On a running workspace, the Users role is the membership control. Threshold and token behavior is in [Permissions and API keys](/docs/reference/permissions).

## What a member can see

Role decides what you can administer. Row-level security decides which records you see.

- **Admins and owners** see every row in the workspace.
- **Members** see the rows they created.
- A member can use the feature screens, but cannot administer people: the Users screen and Permission sets need an owner or admin.
- A personal access token sees what its scopes allow, and no more than the person who issued it.

If a record you expect is missing, the likely cause is that it belongs to someone else. Ask an admin.

## Domains

Labels live on [Domains](/docs/features/domains). They filter tasks and projects. They do not grant permissions.

## Permission sets on a person

[Permission sets](/docs/features/permission-sets) can attach sets to a user. One permission layer covers the app and a signed-in user's API token. The person's permission set is that layer. Agent MCP tokens stay separate and keep the sets and extras on the token.

**Status.** That attachment is behind `app_settings` key `feature.permission_sets_users`, and the flag defaults off. While it is off, the user-grant table is not the enforcement path. A user JWT on MCP holds the read floor. Tokens carry their own scopes. Details are in [Permissions and API keys](/docs/reference/permissions).

## Rows a member can see

A row belongs to the person who created it. Members see their own rows. Admins and owners see every row. Sharing comes later. The column is `owner_user_id`, stamped on insert.

**Status.** That creator rule is the model. Approvals already use it, plus `is_admin()` and a token scope. Core CRM policies are still wider than "rows I created." See [Row access](/docs/reference/permissions#row-access).

## Integrations

Provider connections are [Integrations](/docs/features/integrations). Connecting a provider does not create users.

## Notifications

The in-app inbox is [Notifications](/docs/features/notifications).

## MCP tools

No MCP tool invites, demotes, or deactivates a member. A personal access token cannot administer this screen. Every verb goes through workspace membership checks on the session.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/users` | List members, or invite, change a role, or deactivate |

`POST` is limited to an active workspace owner or admin. A member's call is rejected.

## Permissions

This screen is workspace role, not a token scope. Owner and admin can invite, change roles, and deactivate. A member cannot. Deactivate revokes that person's personal access tokens and permission-set grants.

Row access elsewhere is the creator model in [Permissions and API keys](/docs/reference/permissions#row-access). Approvals already follow it. Other CRM tables are still wider. Membership here is what makes someone an admin or a member. The workspace role is not `is_admin()`.

## Agent example

There is no tool call. A session client lists members.

```json
{
  "method": "GET",
  "path": "/cockpit/api/users"
}
```

Expected result for an owner or admin: the workspace members and their roles (`owner`, `admin`, `member`). A member's session is rejected. The payload does not include a token secret.

```json
{
  "ok": true,
  "members": [
    { "role": "owner" },
    { "role": "member" }
  ]
}
```
