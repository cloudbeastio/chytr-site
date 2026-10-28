---
title: Knowledge
description: The skill registry agents can read, update, and dispatch.
keywords: knowledge, skills, skill_create, skill_list, families, dispatch
section: features
order: 24
status: published
unlisted: false
---

# Knowledge

## What it does

Knowledge is the skill registry, so an agent can load the procedure you wrote instead of guessing it from a chat.

Open **Knowledge** (`/settings/knowledge`). A skill is a markdown document with a slug, a family, and an enabled flag. You can dispatch one from the screen. Creating or updating from MCP stores the markdown and queues a sync. That sync targets an external collection only when the project is configured for it. Without that configuration the row still exists here.

The screen only calls the skill routes. The list and the body are the same records `skill_get` returns.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `skill_list` | `approvals:read` | List skills. Filters: `enabled_only`, `action_type`, `family`, `project_id` |
| `skill_get` | `approvals:read` | One skill by slug |
| `skill_metrics` | `approvals:read` | Recommendation agreement rates |
| `skill_create` | `skills:write` | Create a skill and queue a collection sync |
| `skill_update` | `skills:write` | Update a skill and queue a re-sync |

List and get use `approvals:read` on purpose. Create and update use `skills:write`. Holding only `skills:write` does not list the registry.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/skills` | List or create |
| `GET`, `PATCH` | `/cockpit/api/skills/:id` | Read or update one skill |
| `POST` | `/cockpit/api/skills/:id/dispatch` | Dispatch the skill |
| `GET`, `POST` | `/cockpit/api/skill-families` | List or create a family |
| `PATCH` | `/cockpit/api/skill-families?id=` | Update a family |

## Permissions

Token scopes come from one permission-set layer, as the table shows. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `skill_get` with the slug before you follow the procedure.

```json
{
  "tool": "skill_get",
  "arguments": {
    "slug": "meeting-brief"
  }
}
```

Expected result: the skill's title, summary, and markdown body when that slug exists and is visible to the token. An unknown slug is an error, not an empty document. `skill_update` with `skill_id` queues a re-sync and does not require you to resend unchanged fields.

```json
{
  "ok": true,
  "slug": "meeting-brief",
  "title": "Meeting brief",
  "body_md": "Read the calendar row before you write the brief."
}
```
