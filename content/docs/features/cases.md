---
title: Cases
description: Support cases on an account, with outcomes that a person confirms.
keywords: cases, support, outcomes, case_create, case_update, accounts
section: features
order: 21
status: published
unlisted: false
---

# Cases

## What it does

Cases keep a customer problem on the account it belongs to, so the outcome is something you can confirm instead of a note that disappears.

Open **Cases** (`/cases`). A case needs an account. A project is optional. You can open one from the board and mark it resolved. Outcomes are the committed results on a deal or a project. An agent can create and update an outcome. Setting it achieved files a human-only card (`engagement_outcome_achieve`). The agent cannot flip that itself.

The screen only calls the case routes. Agents use the case and outcome tools and see the same rows.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `cases_list` | `cases:read` | List. Filters: `status`, `account_id`, `project_id`, `limit` |
| `case_create` | `cases:write` | Open a case. `account_id` is required |
| `case_update` | `cases:write` | Update a case and link or unlink an outcome |
| `outcomes_list` | `engagement_outcomes:read` | List outcomes |
| `outcome_create` | `engagement_outcomes:write` | Create an outcome. Cannot set achieved |
| `outcome_update` | `engagement_outcomes:write` | Update fields. Does not confirm or achieve |
| `outcome_confirm` | `engagement_outcomes:write` | `confirm`, `reject`, or `achieve`. Achieved files a human-only card |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/cases` | List or create. Create requires `title` and `account_id` |
| `GET`, `PATCH` | `/cockpit/api/cases/:id` | Read or update, including status `resolved` |
| `GET`, `POST` | `/cockpit/api/cases/:id/outcomes` | Outcomes on the case |

List filters: `status`, `account_id`, `project_id`, `outcome_id`, and `q`.

## Permissions

Token scopes come from one permission-set layer. Case reads need `cases:read`. Case writes need `cases:write`. Outcomes use `engagement_outcomes:read` and `engagement_outcomes:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `case_create` with the account the issue belongs to.

```json
{
  "tool": "case_create",
  "arguments": {
    "title": "Nightly load failed twice",
    "description": "The second run stopped on the same file.",
    "account_id": "account-1",
    "status": "open"
  }
}
```

Expected result: an open case on that account. `cases_list` with `status` `open` includes it. `outcome_confirm` with `action` `achieve` does not mark the outcome achieved. It files a pending card a person has to accept.

```json
{
  "ok": true,
  "title": "Nightly load failed twice",
  "status": "open"
}
```
