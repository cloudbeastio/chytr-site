---
title: Pipeline
description: Campaign members, CRM prospects, and the inbound intake queue.
keywords: pipeline, campaign members, prospects, intake, campaign_member_add, sdr
section: features
order: 13
status: published
unlisted: false
---

# Pipeline

## What it does

Pipeline shows who is in a motion, so a member, a prospect, and an inbound intake row stay distinct.

Open **Pipeline** (`/pipeline`). Three tabs:

- **Members** — contacts or accounts on a campaign, with a member status.
- **Prospects** — CRM leads in the campaign motion.
- **Intake** — inbound rows. This tab has no New button. It is a queue you read.

This is not the deal board. Deal stages live on [Deals](/docs/features/deals). The motion itself is a [Campaign](/docs/features/campaigns).

The screen only calls the session API. It reads one session route. Adding a member is `campaign_member_add`.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `campaign_members_list` | `campaigns:read` | Members of one campaign |
| `campaign_member_add` | `campaigns:write` | Add a contact or an account |
| `campaign_member_update` | `campaigns:write` | Update status and merge SDR metadata |
| `contact_intake` | `contacts:write`, `accounts:write` | Create a contact and account from an intake payload |

`campaign_member_update` merges `metadata_sdr`. It does not replace that object.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/pipeline` | Members, prospects, and intake for this screen |

The response is `{ "ok": true, "members": [], "prospects": [], "intake": [] }`. There is no POST on this route. Writes go through the member tools or the entity drawer.

## Permissions

Token scopes come from one permission-set layer. Reading members needs `campaigns:read`. Adding or updating a member needs `campaigns:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `campaign_member_update` to move a member forward without wiping SDR notes already stored.

```json
{
  "tool": "campaign_member_update",
  "arguments": {
    "member_id": "member-1",
    "member_status": "working",
    "metadata_sdr": {
      "last_touch": "intro-sent"
    }
  }
}
```

Expected result: that member's status is `working`, and `metadata_sdr.last_touch` is set. Keys you did not send stay as they were.

```json
{
  "ok": true,
  "member_id": "member-1",
  "member_status": "working"
}
```
