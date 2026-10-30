---
title: Campaigns
description: The motions that group members, products, and ICP profiles.
keywords: campaigns, motions, members, outbound, campaign_list, campaign_member_add
section: features
order: 12
status: published
unlisted: false
---

# Campaigns

## What it does

Campaigns group a sales motion so members, products, and the ICP you are aiming at stay on one record.

Open **Campaigns** (`/campaigns`). `campaign_type` is `outbound_marketing` or `internal_initiative`. Status is `draft`, `active`, `paused`, `completed`, or `archived`. People on the motion, and the intake queue, are on [Pipeline](/docs/features/pipeline). Deals that belong to the motion are on [Deals](/docs/features/deals).

The list only calls the session API. A signed-in person can create a campaign through the entity route. Agents change membership, products, and ICP with the tools below.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `campaign_list` | `campaigns:read` | List campaigns |
| `campaign_members_list` | `campaigns:read` | Members of one campaign |
| `campaign_member_add` | `campaigns:write` | Add a contact or an account |
| `campaign_member_update` | `campaigns:write` | Change member status and merge SDR metadata |
| `campaign_products_list` | `campaigns:read` | Products linked to the campaign |
| `campaign_product_link` | `campaigns:write` | Link or unlink a product |
| `campaign_icp_set` | `campaigns:write` | Attach ICP profiles |

`campaign_member_update` merges `metadata_sdr`. It does not replace that object blindly.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/campaigns` | List on this screen |
| `POST` | `/cockpit/api/entities/campaigns` | Create from a signed-in session |
| `GET`, `PATCH`, `DELETE` | `/cockpit/api/entities/campaigns/:id` | Drawer read, update, delete |
| `GET`, `POST` | `/cockpit/api/campaigns/:id/products` | Products on the campaign |
| `DELETE` | `/cockpit/api/campaigns/:id/products/:productId` | Unlink a product |

## Permissions

Token scopes come from one permission-set layer. Reads need `campaigns:read`. Membership, product, and ICP writes need `campaigns:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `campaign_member_add` with the campaign and either a contact or an account, not both as a guess.

```json
{
  "tool": "campaign_member_add",
  "arguments": {
    "campaign_id": "campaign-1",
    "contact_id": "contact-1"
  }
}
```

Expected result: one member row. Listing with `campaign_members_list` returns that contact. Adding the same pair again does not create a second membership.

```json
{
  "ok": true,
  "campaign_id": "campaign-1",
  "contact_id": "contact-1"
}
```
