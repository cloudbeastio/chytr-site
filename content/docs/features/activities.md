---
title: Activities
description: Mail, calendar, and meeting rows, and the feed an agent reads.
keywords: activities, email, meetings, quality_class, activity_timeline, mentions
section: features
order: 7
status: published
unlisted: false
---

# Activities

## What it does

Activities are the timeline behind every account and contact, so a proposal can point at the message or meeting that caused it.

Open **Activities** (`/activities`). Filter by type (mail, calendar, meetings, other), quality, whether the row is linked to a record, and date. The list is read-only. Extraction proposals from these rows show up on [Approvals](/docs/features/approvals), not as a second inbox. The rules are in [Meetings and extraction](/docs/features/meetings).

Quality classes are `substantive`, `transactional`, `notification`, `digest`, and `noise`. Digest and noise stay out of the embedding index.

The screen only calls the session API. It only reads the session route. Agents write rows with MCP, and the same list shows them after the write commits.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `activity_timeline` | `activities:read` | Owner-wide feed. Keyset via `cursor`. `exclude_noise` drops low-value rows |
| `activity_create` | `activities:write` | Create or upsert one activity |
| `timeline_for_entity` | `activities:read`, `mentions:read` | Feed for one CRM record |
| `mention_add` | `mentions:write`, `activities:write` | Link an activity to an entity |
| `meeting_graph_checkin` | `graph:write` | Write a meeting plus proposals, links, and notes |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/activities` | Paged list for this screen |

Query parameters the screen sends:

| Param | Values |
|---|---|
| `type` | `all`, `email`, `calendar`, `meetings`, `other`, or a concrete `activities.type` |
| `quality` | Comma-separated quality classes |
| `linked` | `all`, `yes`, `no` |
| `range` | `today`, `this_week`, `this_month`, `all` |
| `q` | Summary substring |
| `limit`, `offset` | Page controls |

Future `occurred_at` rows are excluded. `after` and `before` override `range` when both are set.

## Permissions

Token scopes come from one permission-set layer. Reading the feed needs `activities:read`. Writing a row needs `activities:write`. Linking it needs `mentions:write` as well. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `activity_create` for a note you already know is real.

```json
{
  "tool": "activity_create",
  "arguments": {
    "type": "meeting_note",
    "summary": "Scoped the rollout to one region.",
    "source": "agent",
    "source_id": "note-run-1",
    "occurred_at": "2026-10-09T15:00:00Z"
  }
}
```

Expected result: one activity row. Calling again with the same `source` and `source_id` updates that row instead of inserting a second one. The Activities screen shows it after a refresh, inside the owner's RLS scope.

```json
{
  "ok": true,
  "type": "meeting_note",
  "summary": "Scoped the rollout to one region."
}
```
