---
title: Deals
description: The deal board, the campaign pipeline, and the fields on a deal.
keywords: deals, stages, forecast, scorecard, line items, deal_scorecard_set
section: features
order: 14
status: published
unlisted: false
---

# Deals

## What it does

Deals show every opportunity by stage, so you can see what is moving and update the forecast from the same board.

Two screens use the word pipeline. They are different objects.

| Screen | Route | What it shows |
|---|---|---|
| **Deals** | `/sales` | Deal records, as a board by stage or as a table |
| **Pipeline** | `/pipeline` | Campaign members, CRM prospects, and intake |

**Campaigns** (`/campaigns`) are the motions those members belong to. **Products** (`/products`) are the catalog you can hang on a deal or a campaign.

## Deals

The board columns are the stage check constraint, in order:

1. Lead
2. Qualification
3. Discovery
4. Value Proposition
5. Proposal
6. Negotiate
7. Contract
8. Closed Won
9. Closed Lost

Stage values are Title Case. A deal also has `status`: `open`, `won`, `lost`, or `stalled`. `closed` becomes true for Closed Won and Closed Lost.

You can filter by domain, campaign, and account, hide closed deals, and hide deals whose campaign is excluded from the board. **New deal** creates a record. Dragging a card changes its stage. The drawer edits the rest.

Forecast fields:

| Field | Values |
|---|---|
| `forecast_category` | `pipeline`, `best_case`, `most_likely`, `commit` |
| `forecast_percentage` | 0–100 |

Narrative fields on the deal are `deal_summary`, `deal_details`, `product_offering`, `strategic_questions`, and `next_steps`. `scorecard` is a JSON object. Agents write that pack with `deal_scorecard_set` (scope `deals:write`). People edit the same fields in the drawer.

Line items are `deal_line_item_set` / `deal_line_items_list`, and in the app under the deal's line-item routes. Each line has a product, name, quantity, and unit amount.

Creating or renaming a **product** files a human-only approval (`product_create`, `product_rename`). Updating other product fields can go through `product_upsert`. The catalog screen is [Products](/docs/features/products).

## Proposals from activity

Ingest can store a proposed deal name on an activity without creating the deal. `deal_proposals` lists those names. `deal_proposal_resolve` approves or dismisses one. Approving is what creates the deal path. The agent does not insert the deal row on its own.

## Campaign pipeline

Members, prospects, and intake are [Pipeline](/docs/features/pipeline). The motion those members belong to is a [Campaign](/docs/features/campaigns). ICP definitions are [ICP](/docs/features/icp).

## Accounts behind the deal

Deal cards can name `account_id` plus `end_customer_account_id`, `bill_to_account_id`, and `referring_partner_account_id`. Send an id or a slug. The allowed deal fields are listed in [Entity fields](/docs/reference/entity-fields).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `deals_list` | `deals:read` | List deals, including forecast and scorecard fields |
| `deal_scorecard_set` | `deals:write` | Write scorecard JSON and the narrative fields |
| `deal_line_items_list` | `deals:read` | Lines on a deal |
| `deal_line_item_set` | `deals:write` | Upsert one line |
| `deal_proposals` | `deals:read` | Proposed names that are not deals yet |
| `deal_proposal_resolve` | `deals:write` | Approve or dismiss a proposed name |

The board itself reads the session route below. Stage changes from a drag are a session PATCH, not a separate tool.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/sales` | Deal list for this screen. The board asks for `limit=500` |
| `PATCH` | `/cockpit/api/entities/deals/:id` | Stage change and drawer edits |
| `GET`, `POST` | `/cockpit/api/deals/:id/line-items` | Lines |
| `PATCH`, `DELETE` | `/cockpit/api/deals/:id/line-items/:itemId` | Update or remove a line |

## Permissions

Token scopes come from one permission-set layer. Reads need `deals:read`. Scorecard, line, and proposal writes need `deals:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `deal_scorecard_set` with the narrative you want on the deal. Omit fields you are not changing.

```json
{
  "tool": "deal_scorecard_set",
  "arguments": {
    "deal_id": "deal-1",
    "next_steps": "Send the revised scope."
  }
}
```

Expected result: those fields update on the deal the token may see. `deals_list` returns the new `next_steps`. A deal outside the caller's RLS scope is not updated.

```json
{
  "ok": true,
  "deal_id": "deal-1",
  "next_steps": "Send the revised scope."
}
```
