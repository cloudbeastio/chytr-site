---
title: Products
description: The catalog you attach to a deal or a campaign, with create and rename gated for agents.
keywords: products, catalog, product_upsert, product_list, line items, pricing
section: features
order: 15
status: published
unlisted: false
---

# Products

## What it does

Products are the catalog, so a deal line and a campaign link both point at one definition of what you sell.

Open **Products** (`/products`). Filter by status and product line, search by name, and create or archive from the board. A signed-in person creates a product directly on this screen. An agent does not get that shortcut. `product_upsert` files a human-only approval for a create (`product_create`) or a rename (`product_rename`). Other field updates can go through in the same tool.

Line items on a deal are edited from the deal, with `deal_line_item_set`. Linking a product to a campaign is `campaign_product_link`.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `product_list` | `products:read` | List. Filters: `status`, `product_line`, `q`, `limit` |
| `product_get` | `products:read` | One product by id or slug |
| `product_upsert` | `products:write` | Create, rename, or update. Create and rename file a human-only card |
| `deal_line_item_set` | `deals:write` | Upsert a line on a deal |
| `deal_line_items_list` | `deals:read` | Lines on a deal |
| `campaign_product_link` | `campaigns:write` | Link or unlink a product on a campaign |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/products` | List, or create from a signed-in session (no approval card) |
| `GET`, `PATCH` | `/cockpit/api/products/:id` | Read, or update fields such as status |

`GET` accepts `status`, `product_line`, and `q`. The session POST is the human path. Agents use `product_upsert`.

## Permissions

Token scopes come from one permission-set layer. Reads need `products:read`. Agent writes need `products:write`, and a create or rename still waits on a person because those card types are human-only. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `product_upsert` with a new name and no id.

```json
{
  "tool": "product_upsert",
  "arguments": {
    "name": "Quality assessment",
    "slug": "quality-assessment",
    "product_line": "assess",
    "status": "active"
  }
}
```

Expected result: no catalog row yet. A pending `product_create` card is filed. The product appears on `/products` after a person approves it. A later `product_upsert` that changes the description on the existing id updates the row. A later call that changes the name files `product_rename` instead.

```json
{
  "ok": true,
  "approval": {
    "item_type": "product_create",
    "status": "pending"
  }
}
```
