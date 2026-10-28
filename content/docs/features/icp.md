---
title: ICP
description: Ideal-customer profiles, fit scores, and the approval that activates a new version.
keywords: icp, fit, intent, win rate, icp_propose_version, account_fit_score
section: features
order: 10
status: published
unlisted: false
---

# ICP

## What it does

ICP defines who a motion is for, so fit scores and win rate sit on the same profile instead of in a slide.

Open **ICP** (`/marketing-icp`). Three blocks share the page: profile versions, a fit-and-intent grid, and a win-rate card. Drafting a new version does not activate it. Activation waits on an approval, the same pattern as a charter. The screen only calls the session routes. Agents call the MCP tools and land on the same rows.

Attaching profiles to a campaign is `campaign_icp_set`, documented with the tools below and on [Campaigns](/docs/features/campaigns).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `icp_list` | `icp:read` | List versions. Filters: `status`, `slug`, `include_criteria`, `limit` |
| `icp_get` | `icp:read` | One profile and its version history |
| `icp_propose_version` | `icp:write` | Draft a version. Activation waits on an approval |
| `account_fit_score` | `icp:write` | Score an account and write the fit fields |
| `accounts_by_tier` | `icp:read` | Accounts in a fit tier |
| `campaign_icp_set` | `campaigns:write` | Attach profiles to a campaign |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/icp-profiles` | List, or propose a version. `?slug=&history=1` loads history |
| `GET` | `/cockpit/api/icp-fit-intent` | Fit and intent grid |
| `GET` | `/cockpit/api/icp-win-rate` | Win-rate summary |

The fit and win-rate routes are read-only. Scoring an account is the MCP tool, not a button that bypasses it.

## Permissions

Token scopes come from one permission-set layer. Reading needs `icp:read`. Proposing a version or writing a fit score needs `icp:write`. Linking a campaign needs `campaigns:write`. The screen uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `icp_propose_version` with a slug. Reusing a slug drafts the next version. It does not publish.

```json
{
  "tool": "icp_propose_version",
  "arguments": {
    "slug": "mid-market-ops",
    "name": "Mid-market operations",
    "summary": "Operators who own data quality for more than one system.",
    "criteria": {
      "industry": ["software"],
      "segment": ["mid-market"]
    }
  }
}
```

Expected result: a draft version and a pending approval. The fit grid does not use that version until the card is approved.

```json
{
  "ok": true,
  "status": "draft",
  "slug": "mid-market-ops"
}
```
