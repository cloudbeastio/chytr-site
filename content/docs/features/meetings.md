---
title: Meetings and extraction
description: Headless extraction contract — review calls, thresholds, statuses, and how a proposal is filed.
keywords: meetings, extraction, graph check-in, thresholds, calendar, activities
section: features
order: 41
status: published
unlisted: false
---

# Meetings and extraction

## What it does

Extraction is headless. There is no extraction screen. Review, thresholds, and metrics are API calls. The app is a thin client over the same approval rows and the same permission layer.

A proposal is an approval whose `item_type` is `extraction.<action_type>`. It uses the approvals queue. Quality-classification audits and decision-flow graphs are different objects. See [Decisions](/docs/features/decisions) and [Decision flows](/docs/features/decision-flows).

Adjacent screens read the same rows. They are not the review contract:

| Screen | What it shows |
|---|---|
| [Calendar](/docs/features/calendar) | Events. `/timeline` redirects here |
| [Activities](/docs/features/activities) | Ingested mail, calendar, meetings, and other activity |
| [Meeting pipeline](/docs/features/meeting-pipeline) | Health of the ingest lane |
| [KG Health](/docs/features/kg-health) | Counts and extraction gaps |
| [Approvals](/docs/features/approvals) | The queue where extraction proposals wait |

## MCP tools

| Tool | Scope | Inputs | Output |
|---|---|---|---|
| `extraction_pending` | `approvals:read` | `action_type` (optional), `limit` (default 20, max 100), `offset` (default 0) | Array of pending rows: `id`, `item_type`, `title`, `summary`, `proposed_payload`, `agent_irac`, `agent_skill_versions`, `created_at` |
| `extraction_review` | `approvals:write` | `approval_id`, `decision` (`approved` or `rejected`), `note` (optional) | `resolve_approval` object: `resolved`, `id`, `item_type`, `status`, `decided_by`, `decided_by_kind`, `human_only` |
| `extraction_review_bulk` | `approvals:write` | `action_type`, `decision`, `note` (optional), `limit` (default 20, max 100) | `{ ok, action_type, decision, updated, results }`. `updated` is how many ids were resolved |
| `extraction_threshold_set` | `approvals:write` | `action_type`, `threshold` (0 to 1) | `{ ok, action_type, threshold }` |
| `extraction_metrics` | `approvals:read` | `days` (default 30) | One object per action type: `pending`, `approved`, `rejected`, `agent_agreed`, `total_resolved`, `agreement_rate` |

Extraction is headless. These tools are the API. The screens above only show the rows the tools write.

`extraction_pending`, `extraction_review_bulk`, and `extraction_metrics` add `owner_user_id =` the caller when the token has an owner. They do not widen the list for an admin.

`action_type` on the list and bulk tools matches `item_type` exactly as `extraction.<action_type>`. Omit it on the list to return every pending `extraction.%` row.

`agreement_rate` is the share of resolved rows whose `agent_irac.recommendation` equals the final status, as a two-decimal string, or null when nothing is resolved.

`extraction_review` and `extraction_review_bulk` call `resolve_approval`. A user session records `auth.uid()` as human. A personal access token records the token as agent. Approve runs the card's `on_approve`. Reject applies nothing. A failed `extraction_apply` aborts the approve and leaves the card `pending`.

`approval_list` and `approval_resolve` are the general tools for the same table. Human-only types stay on a person. See [Approvals](/docs/features/approvals) and [Permissions and API keys](/docs/reference/permissions).

### What approve and reject do

| Decision | Effect |
|---|---|
| `rejected` | The approval leaves `pending`. Nothing is applied |
| `approved` | `on_approve` runs. Router cards use kind `extraction_apply` |

A router card stores `proposed_payload` `{ extraction, activity_id }` and `on_approve` `{ kind: "extraction_apply", action_type, activity_id, extraction }`. A `merge` item with winner, loser, and table uses kind `entity_merge` instead. Approving runs that payload. The direct-apply path below runs before a card exists, and only for two action types.

### Thresholds

Thresholds live in `extraction_thresholds`, one row per `action_type`, from 0 to 1. Lookup is the row for that action, then a row whose action is `*`, then `1.0`.

Seeded rows, all `1.0`: `mention_promote`, `new_record`, `enrich_fact`, `new_mention`.

A proposal auto-applies only when its confidence is greater than or equal to the threshold **and** the threshold is below `1.0`. A threshold of `1.0` queues every proposal of that type. Lower a threshold only for an action you trust.

`extraction_threshold_set` requires an admin in the database as well as `approvals:write`. A session must pass `is_admin()`. A `cbpat_` call must pass `is_admin_for` for the token owner. There is no chytr screen for editing thresholds.

### Action types

The activity pass emits these `action_type` values. Each queued card is `item_type` `extraction.<action_type>`. Approve applies them through `extraction_apply`. Direct apply, before a card exists, handles only two of them.

| `action_type` | On approve | Direct apply when the gate passes |
|---|---|---|
| `link` | Link the activity to an existing contact, account, deal, campaign, or project | Queued. The direct executor does not handle it |
| `enrich_fact` | Write one allow-listed field on an existing contact or account | Applied when the target exists and the field is allowed. Otherwise queued |
| `new_mention` | Ensure the contact or account, then insert a mention | Applied when that entity exists and the mention is new. Otherwise queued |
| `new_record` | Same apply as `new_mention`: find or create, then mention | Queued |
| `action_item` | Create a follow-up task | Queued |
| `quality_refine` | Set `activities.quality_class` | Queued |
| `deal_proposal` | Insert a deal when that owner has no deal of the same name | Queued |

`enrich_fact` may write, on contacts: `title`, `phone_primary`, `linkedin_url`, `lifecycle_stage`, `seniority`. On accounts: `industry`, `employee_count_range`, `annual_revenue_range`, `headquarters_city`, `headquarters_country`, `website`. `job_title` maps to `title`. `phone` maps to `phone_primary`.

Direct applies are written to `extraction_auto_apply_audit`. A repeat approve is a no-op when the row already matches. Apply failure leaves the card `pending`.

### How a proposal is filed

**Status.** Ingest does not call the router. The orchestrator sets extraction to not-run. The classifier writes `quality_class` and a `classifier` object onto `activities.extraction_result`. It does not insert `extraction.*` approvals.

A transcript can mint a workflow task. That task calls `extraction-route`, which calls the router. No transcript, or no stored extractions, skips the task. The review tools above operate on rows that already have type `extraction.%`.

When the router does run, each item becomes either a direct apply or a pending approval:

- `item_type`: `extraction.<action_type>`
- `status`: `pending`
- `proposed_payload`: `{ extraction, activity_id }`
- `on_approve`: `{ kind: "extraction_apply", ... }` (or `entity_merge` for a complete merge item)
- `owner_user_id`: the activity owner
- `requested_by`: `extraction-route`
- `assigned_to`: `human`

Activity quality classes are `substantive`, `transactional`, `notification`, `digest`, and `noise`. Digest and noise stop before extraction and stay out of the embedding index. Transactional rows are marked skipped for extraction.

### Meeting check-in

An agent files a meeting with `meeting_graph_checkin` (scope `graph:write`). Required input is `activity` with `type` `meeting_note` and `source_id`. Optional: `run_id`, `actor`, `work_item_id`, `entities`, `links`, `notes`, `flags`.

The call writes the activity, links, and notes, and returns a report with `run_id`, `activity_id`, `activity_inserted`, `applied_fields`, `flags_created`, `links_created`, `notes_created`, plus `lane`. Creates, and any update that touches identity fields, become pending approvals in that same call. A recognized auto-pass tier on a plain update applies immediately. `graph_checkin` is the deprecated alias and adds `deprecated: true` and `use_instead: meeting_graph_checkin`. `graph_checkin_revert` undoes one run by `run_id`.

`meeting_brief_checkin` (scope `graph:write`) attaches a pre-call brief to a calendar activity. It does not change entities. Required: `calendar_activity_id` and `brief`.

`activity_create` (scope `activities:write`) upserts a single activity when you are not sending a whole meeting.

### Identity rules on create cards

These apply when a create is filed through `approval_create` or a check-in flag, which is the path that still waits on a person:

- A contact whose name is a single token, with no email and no account, is stored with lifecycle stage `needs-review`.
- `prospect` on a lifecycle field is normalized to `lead`.
- `graph_entity_create` is human-only. An agent may file the card. `approval_resolve` will not approve it.

## HTTP endpoints

These routes use the signed-in session cookie. Responses are `{ "ok": true, ... }` or `{ "ok": false, "error": "..." }`. There is no `/extraction` resource.

| Method | Path | Body | Result |
|---|---|---|---|
| `GET` | `/cockpit/api/approvals` | — | `{ ok, approvals }`. Pending rows, up to 500, every type. Filter `item_type` starting with `extraction.` |
| `GET` | `/cockpit/api/approvals/:id` | — | `{ ok, approval }`. Any status |
| `PATCH` | `/cockpit/api/approvals/:id` | `{ "status": "approved" \| "rejected", "note": "..." }` | `{ ok, id, status, updated }` where `updated` is the row count |
| `POST` | `/cockpit/api/approvals/bulk` | `{ "ids": ["..."], "status": "approved" \| "rejected", "note": "..." }` | `{ ok, updated, status }`. `ids` length 1 to 200 |

A session update records that user as human. Approve still runs `on_approve`. An update with no session user is refused. See [Approvals](/docs/features/approvals).

## Permissions

Token scopes come from one permission-set layer, as the table shows. `extraction_threshold_set` also requires an admin (`is_admin()` for a session, `is_admin_for` for a token). The screens use the signed-in session.

List, bulk review, and metrics stay on the caller's `owner_user_id`. They do not widen for an admin.

Approval rows use creator RLS: the row owner, `is_admin()`, or a token with the matching approvals scope. A workspace role is not `is_admin()`. Creator-only access on every CRM table is still the target. See [Row access](/docs/reference/permissions#row-access).

## Agent example

Call `extraction_pending` before you approve anything.

```json
{
  "tool": "extraction_pending",
  "arguments": {
    "action_type": "link",
    "limit": 10
  }
}
```

Expected result: an array of pending rows, or `[]`. `extraction_review` with `decision` `approved` runs that card's `on_approve` (`extraction_apply` on a router card). A failed apply leaves the card pending. `rejected` applies nothing.

```json
[
  {
    "item_type": "extraction.link",
    "title": "Link contact"
  }
]
```
