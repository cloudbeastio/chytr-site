---
title: Permissions and API keys
description: One permission-set layer for the app and the API, agent tokens, and who a row belongs to.
keywords: permission sets, api keys, scopes, rls
section: reference
order: 2
status: published
unlisted: false
---

# Permissions and API keys

One permission layer, built on permission sets, covers the app and the API. A permission set is a named bundle of scopes from the catalog `pat_scopes`. The app and a signed-in user's API token use that person's set. An agent token is a separate credential.

## Status

**Planned.** A signed-in user's API token inherits that user's full permission set, the same set the app uses.

**Today.** `app_settings.feature.permission_sets_users` defaults to off. While it is off:

- Grants in `user_permission_sets` are empty. `user_effective_scopes` returns the read-only floor (`pat_scopes.oauth_default`) and nothing from the user's sets.
- A user JWT on `POST /api/mcp` is gated by that floor. If the resolver fails, the server falls closed to the same read list.
- The chytr session is a Supabase session cookie. Row access is the database policies described under [Row access](#row-access). The session does not load the user's permission set.
- Assigning a set to a user raises while the flag is off.

Agent personal access tokens are live and are not waiting on this flag. See [Agent tokens](#agent-tokens).

## User API tokens

A user API token is a bearer for a signed-in person (a user JWT on `/api/mcp`, or a session cookie on `/cockpit/api`).

Planned behavior: the token's scopes are the user's permission set, the same set the UI is checked against. Issuing the token does not pick a second, smaller set.

Today, that inheritance is the flag above. Until it is on, a user JWT holds the read floor, and writes that are token-only stay on an agent token. Those token-only writes include `files:write`, `schedules:write`, and `workflows:write`.

## Agent tokens

An agent calls MCP with a personal access token. The value starts with `cbpat_` and is shown once at **Admin → API Keys** (`/settings/keys`). Store it outside the repo. The caller may be an agent, so the token does not inherit the user's permission set.

When you create one you set:

- a name
- one or more permission sets attached to **this token**
- extra scopes, as individual checkboxes
- a TTL: 1 hour, 24 hours, 7 days (the form default), 30 days, or forever

Effective scopes are the union of the token's active sets plus the extras, stored on `api_tokens.scopes` and recomputed when membership or extras change. That union is what the MCP server checks. You can replace set membership or edit the extras later. Revoke is immediate for new calls.

The same routes issue and edit tokens:

| Method | Path | Purpose |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/tokens` | List, or issue. Plaintext is in the create response only |
| `POST` | `/cockpit/api/tokens/:id/revoke` | Revoke |
| `POST` | `/cockpit/api/tokens/:id/scopes` | Replace extra scopes |
| `POST` | `/cockpit/api/tokens/:id/sets` | Replace permission-set membership |

Workflow trigger tools take the workspace from this token's binding. Do not pass `workspace_id`. A token bound to one workspace cannot name another.

## Permission sets

**Admin → Perm Sets** edits named bundles of scopes. Seeded slugs are `mcp-readonly`, `cockpit-ops`, and `crm-read`. You can change them after install. A retired scope stays in the catalog so old tokens can be understood, and it is not offered for new grants.

`GET`, `POST`, and `PATCH /cockpit/api/permission-sets` list, create, and archive sets. `GET` and `POST /cockpit/api/permission-sets/admin` are the admin operations.

## Scope catalog

A tool runs only when the caller's scopes are a superset of `required_scopes` in the MCP manifest. Dynamic tools check the table at call time (`contacts:read` versus `deals:read`, for example).

| Area | Scopes |
|---|---|
| CRM | `accounts:read` `accounts:write` `contacts:read` `contacts:write` `deals:read` `deals:write` `campaigns:read` `campaigns:write` `projects:read` `projects:write` |
| Activity | `activities:read` `activities:write` `mentions:read` `mentions:write` |
| Approvals and notes | `approvals:read` `approvals:write` `notes:read` `notes:write` |
| Search | `rag:read` |
| Tasks | `tasks:read` `tasks:write` `tasks:reassign` |
| chytr shell | `cockpit:read` `cockpit:write` `comments:read` `comments:write` |
| Work and dispatch | `work:read` `work:write` `schedules:write` `workflows:read` `workflows:write` `graph:write` |
| Files and products | `files:read` `files:write` `products:read` `products:write` |
| Goals and ICP | `charters:read` `charters:write` `metrics:read` `icp:read` `icp:write` |
| Cases and outcomes | `cases:read` `cases:write` `engagement_outcomes:read` `engagement_outcomes:write` |
| Agents | `agent_bus:read` `agent_bus:write` `skills:read` `skills:write` |
| Other catalog entries | `analysis:write` `capture:write` `decision:write` `decisions:read` `decisions:write` `voice:read` `voice:write` `marketing:analytics:read` `marketing:ig:read` `marketing:tiktok:read` `marketing:x:read` |

`leads:read` and `leads:write` are retired. Some catalog scopes have no tool on this MCP server. Holding the scope does not create a tool.

Tools with an empty `required_scopes` list (`entity_get`, `entity_state_get`) still require a valid token. Empty means no extra scope string.

## Who can approve

| Actor | Can approve |
|---|---|
| Person in chytr whose session owns the card, or `is_admin()` | That card, including human-only types. A workspace role is not `is_admin()` |
| Agent token with `approvals:write`, via `approval_resolve` or `extraction_review` | Types that are not human-only. The call stamps the actor as `agent` |

Human-only types: `graph_entity_merge`, `graph_entity_rename`, `graph_entity_create`, `graph_entity_alias`, `merge_proposal`, `stage2_identity`, `product_create`, `product_rename`, `engagement_outcome_achieve`, `workflow_cross_desk_grant`.

`is_admin()` is `user_profiles.is_admin`. It is a database flag, separate from the workspace `admin` role. It is not implied by a token scope. `extraction_threshold_set` requires it: `is_admin()` for a session, `is_admin_for` for a token. See [Meetings and extraction](/docs/features/meetings).

## Row access

A row belongs to the person who created it. Members see their own rows. Workspace admins and owners see every row. Sharing comes later. Legacy rows are backfilled with their creator.

The field that carries "created by" is `owner_user_id`. On insert, `set_owner_user_id()` stamps it from the session user when the column is null. Tables that have `team_id` get that filled in the same trigger. Tables without `team_id` use `set_owner_user_id_owner_only()`, which stamps `owner_user_id` only. A writer may set `owner_user_id` explicitly. The extraction router, when it runs, sets it to the activity's owner.

Some tables also have `created_by` as text (tasks, briefs). That string is attribution. It is not the access column. Do not send `owner_user_id` on a create card. The server stamps it. See [Entity fields](/docs/reference/entity-fields).

**Status.** This creator rule is the model. It is not the policy on every table yet.

- `approvals` uses it. A session sees or updates a row when `owner_user_id` is that user, or `is_admin()` is true, or the caller holds the matching approvals scope. Null owners were backfilled. A token with that scope can still see rows that person did not create.
- Core CRM tables (`accounts`, `contacts`, `deals`, `activities`, and the same family) still allow a row when `is_owner()` or `is_admin()` is true, or when the caller holds the matching PAT scope. That is wider than "rows I created."
- Some later tables already use `owner_user_id =` the caller, or `is_admin()` (files, and parts of the task and comment spine).
- `resolve_approval` refuses a session user who is not the row's `owner_user_id` and is not `is_admin()`. chytr's resolve routes update the row directly. The same RLS applies, and the chokepoint records the session user as human. An approve with no session, and not through `resolve_approval`, is refused.
- Extraction list, bulk review, and metrics filter to the caller's `owner_user_id` inside the tool. They do not widen for an admin.

## Workspace membership

Member administration is not an MCP scope. It is a chytr session of a workspace `owner` or `admin`. See [Users and members](/docs/features/users).
