---
title: Calendar
description: Month, day, and list views of meetings, plus a proposal when a gap needs a decision.
keywords: calendar, meetings, timeline, gap, briefs, activities
section: features
order: 4
status: published
unlisted: false
---

# Calendar

## What it does

Calendar shows what was held and what is coming, so a missing note becomes a proposal instead of a silent hole.

Open **Calendar** (`/calendar`). Month, day, multi-day, and list are the same events. `/timeline` redirects here. The grid only calls one session route. Opening an event loads the fuller card. A gap action does not edit the event. It files a pending approval, and you resolve that card on [Approvals](/docs/features/approvals).

How meetings are extracted is in [Meetings and extraction](/docs/features/meetings). This page is the screen.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `meeting_brief_checkin` | `graph:write` | Attach a pre-call brief to a calendar activity. Does not change entities |
| `meeting_graph_checkin` | `graph:write` | Write the meeting, proposals, links, and notes in one call |
| `activity_timeline` | `activities:read` | Owner-wide feed, including calendar types |
| `timeline_for_entity` | `activities:read`, `mentions:read` | Activity timeline for one record |

The grid itself has no MCP twin. Agents write meetings with the check-in tools, then read them back with the timeline tools.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/calendar/grid` | Events for the visible range. Optional `from` and `to` |
| `GET` | `/cockpit/api/timeline` | Fuller card when an event is opened |
| `POST` | `/cockpit/api/timeline/link` | Attach a note to an event |
| `POST` | `/api/gap-action` | File a pending approval. Does not apply the action |

Gap actions are `log-call`, `generate-brief`, `not-held`, and `exclude`. Each one inserts a pending card. Nothing is sent and no note is written until that card is approved.

## Permissions

Token scopes come from one permission-set layer. Check-in tools need `graph:write`. Timeline reads need `activities:read`. The screen uses the signed-in session, including `/api/gap-action`.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `meeting_brief_checkin` with the calendar activity and the brief body.

```json
{
  "tool": "meeting_brief_checkin",
  "arguments": {
    "calendar_activity_id": "cal-activity-1",
    "run_id": "brief-run-1",
    "brief": {
      "summary": "Confirm scope and the decision owner before the call."
    }
  }
}
```

Expected result: the brief is stored on that calendar activity. Accounts, contacts, and deals are unchanged. A second call with the same `run_id` does not create a second brief.
