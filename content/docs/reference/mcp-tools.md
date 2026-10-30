---
title: MCP tools
description: Every MCP tool, its scope, and the parameters you pass.
keywords: mcp, tools, scopes, bearer token
section: reference
order: 1
status: published
unlisted: false
---

# MCP tools

Agents call `POST /api/mcp` with a bearer token. This page lists every tool in the MCP manifest: name, required scope, what it is for, and the parameters that matter. Scopes are copied from the manifest. A tool runs only when the token includes every required scope.

Empty scopes are written as `none`. The call still needs a valid token. Dynamic scopes are checked against the table you pass.

Human-only approval types cannot be approved here. See [Permissions and API keys](/docs/reference/permissions). How to connect a runtime is in [Connecting agents](/docs/features/agents).

Parameter lists are the fields callers actually send. Optional fields are included when they change behavior. Servers ignore unknown keys.

## Search

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `rag_search` | `rag:read` | Hybrid keyword and vector search over indexed chunks. | `query`, `match_count`, `source_tables`, `since`, `until` |
| `entity_match_search` | `rag:read` | Resolve a person, company, or campaign name to candidates. Does not merge. | `query`, `limit`, `entity_types` |
| `search` | `rag:read` | Scoped hybrid search with an intent router and optional dimension filters. | `query`, `match_count`, `offset`, `source_tables`, `domain_name`, `deal_name`, `project_name`, `skip_router` |
| `entity_search_diag` | `rag:read` | Explain why a name did not resolve. | `canonical_name` |
| `entity_context_query` | `rag:read` | Pack one entity's card, scoped chunks, and optional tasks and notes for a question. | `question`, `entity_type`, `entity_id` or `entity_name`, `include_tasks`, `include_activities`, `include_notes` |

## Activities

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `timeline_for_entity` | `activities:read, mentions:read` | Activity timeline for one CRM record. | `entity_type`, `entity_id`, `limit`, `occurred_after`, `occurred_before` |
| `activity_timeline` | `activities:read` | Owner-wide activity feed with keyset pagination. | `occurred_after`, `occurred_before`, `type`, `work_type`, `source`, `exclude_noise`, `limit`, `cursor` |
| `activity_create` | `activities:write` | Create or upsert an activity. | `type`, `summary`, `content`, `source`, `source_id`, `occurred_at`, `raw_payload` |
| `mention_add` | `mentions:write, activities:write` | Link an activity to an entity. | `activity_id`, `entity_type`, `entity_id` |

## Contacts and accounts

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `contact_intake` | `contacts:write, accounts:write` | Create a contact and account from an intake payload. | `email`, `company_name`, `full_name`, `campaign_id`, `metadata` |
| `scorecard_get` | `<dynamic: contacts:read\|accounts:read\|deals:read>` | Latest scorecard for a contact, account, or deal. Scope depends on the table. | `record_table`, `record_id` |
| `accounts_due_for_enrichment` | `accounts:read` | Accounts whose enrichment is stale, oldest first. | `limit` |
| `entity_get` | `none` | Full entity card by search-entity id. | `entity_id` |
| `entity_create` | `graph:write` | Deprecated. Returns deprecated and does not insert. | `table`, `fields` (ignored) |
| `entity_field_write` | `graph:write` | Write one field through the provenance path. | `table`, `id`, `field`, `value`, `confidence`, `src`, `actor` |

## Entity state and notes

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `entity_state_get` | `none` | Read `agent_state` on a contact, account, deal, or project. | `entity_table`, `entity_id` |
| `entity_state_set` | `<dynamic: contacts:write\|accounts:write\|deals:write\|projects:write>` | Replace `agent_state`. Scope matches the table. | `entity_table`, `entity_id`, `agent_state`, `expected_updated_at` |
| `entity_state_patch` | `<dynamic: contacts:write\|accounts:write\|deals:write\|projects:write>` | Shallow-merge a patch into `agent_state`. | `entity_table`, `entity_id`, `patch`, `expected_updated_at` |
| `entity_note_add` | `notes:write` | Append a note. | `entity_table`, `entity_id`, `body`, `author`, `source_activity_id` |
| `entity_notes_list` | `notes:read` | List recent notes, newest first. Long bodies are truncated. | `entity_table`, `entity_id`, `limit` |

## Campaigns

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `campaign_list` | `campaigns:read` | List campaigns. | `limit` |
| `campaign_members_list` | `campaigns:read` | List members of one campaign. | `campaign_id` |
| `sdr_member_add_dedupe_check` | `campaigns:read` | Campaign-scoped name and domain check before minting an account or adding a member. Includes disqualified and suppressed members. Returns `new`, `reuse`, `skip_existing_member`, or `uncertain`. Never auto-merges. | `campaign_id`, `name`, `domain`, `account_id` |
| `campaign_member_add` | `campaigns:write` | Add a contact or an account to a campaign. | `campaign_id`, `contact_id` or `account_id` |
| `campaign_member_update` | `campaigns:write` | Update member status and merge SDR metadata. | `member_id` or campaign plus contact or account, `member_status`, `metadata_sdr` |
| `campaign_product_link` | `campaigns:write` | Link or unlink a product. | `campaign_id`, `product_id`, `unlink` |
| `campaign_products_list` | `campaigns:read` | Products linked to a campaign. | `campaign_id` |
| `campaign_icp_set` | `campaigns:write` | Attach ICP profiles to a campaign. | `campaign_id`, `icp_ids`, `replace` |

## Approvals

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `approval_create` | `approvals:write` | Create a pending approval. Entity creates must send `on_approve` or `table` and `fields`. | `item_type`, `title`, `summary`, `table`, `fields`, `on_approve`, `metadata` |
| `approval_list` | `approvals:read` | List approvals. | `limit`, `status` |
| `approval_resolve` | `approvals:write` | Resolve an approval. A user session records that user as human. A PAT records the token as agent. A session cannot forge the agent identity. Human-only types can be approved only by an owner or admin. | `id`, `status` (`approved`, `rejected`, `deferred`), `decision_notes` |

## Extraction

Extraction is headless. These tools are the review contract. Inputs, outputs, thresholds, and the approve path are in [Meetings and extraction](/docs/features/meetings).

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `extraction_pending` | `approvals:read` | List pending `extraction.%` rows for the caller. Returns an array of `id`, `item_type`, `title`, `summary`, `proposed_payload`, `agent_irac`, `agent_skill_versions`, `created_at`. | `action_type`, `limit` (default 20, max 100), `offset` |
| `extraction_review` | `approvals:write` | Approve or reject one card through `resolve_approval`. A session records human. A PAT records agent. Approve runs `on_approve`. Reject applies nothing. | `approval_id`, `decision`, `note` |
| `extraction_review_bulk` | `approvals:write` | Resolve up to `limit` pending rows of one action type for the caller (default 20, max 100). Returns `{ ok, action_type, decision, updated, results }`. | `action_type`, `decision`, `note`, `limit` |
| `extraction_threshold_set` | `approvals:write` | Set the auto-pass threshold (0 to 1). Also requires an admin: `is_admin()` for a session, `is_admin_for` for a token. | `action_type`, `threshold` |
| `extraction_metrics` | `approvals:read` | Counts and agreement rate by action type, for the caller, over `days` (default 30). | `days` |

List, bulk, and metrics filter `owner_user_id` to the caller. A router card's `on_approve` is `extraction_apply`, so approve applies the proposal. A failed apply leaves the card pending. Direct apply, before a card exists, is limited to `enrich_fact` and `new_mention`, and only when the threshold is below `1.0`.

## Deals and products

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `deal_proposals` | `deals:read` | Proposed deal names from ingest that are not deals yet. | `limit` |
| `deals_list` | `deals:read` | List deals, including forecast and scorecard fields. | `limit`, `status`, `closed`, `id`, `name` |
| `deal_scorecard_set` | `deals:write` | Write the scorecard JSON and narrative fields. | `deal_id`, `scorecard`, `deal_summary`, `deal_details`, `product_offering`, `strategic_questions`, `next_steps` |
| `deal_proposal_resolve` | `deals:write` | Approve or dismiss a proposed deal name. | `proposed_deal_name`, `approve`, `domain_id` |
| `deal_line_item_set` | `deals:write` | Upsert one deal line item. | `deal_id`, `product_id`, `name`, `description`, `quantity`, `unit_amount`, `sort_order`, `id` |
| `deal_line_items_list` | `deals:read` | Line items on a deal. | `deal_id` |
| `product_list` | `products:read` | List catalog products. | `status`, `product_line`, `q`, `limit` |
| `product_get` | `products:read` | One product by id or slug. | `id` |
| `product_upsert` | `products:write` | Create or update a product. Create and rename file a human-only approval. | `id`, `name`, `slug`, `description`, `product_line`, `status`, `list_price`, `pricing_model`, `url` |

## Tasks

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `task_create` | `tasks:write` | Create a backlog task. Set `human_approval_to_close` on purpose. Default is false. Takes a due date and links to an account, deal, campaign, or contacts. | `title`, `description`, `project_id`, `assignee_type`, `assignee_id`, `domain`, `human_approval_to_close`, `priority`, `hidden_until`, `due_date`, `account_id`, `deal_id`, `campaign_id`, `contact_ids`, `related_entities`, `links`, `tag_slugs` |
| `task_list` | `tasks:read` | List tasks. Hidden tasks stay out unless `include_hidden` is true. | `domain`, `status`, `assignee_type`, `assignee_id`, `project_id`, `limit`, `include_hidden` |
| `task_hide` | `tasks:write` | Set or clear `hidden_until`. | `task_id`, `hidden_until` |
| `task_set_due` | `tasks:write` | Set or clear a task's `due_date`. `YYYY-MM-DD` means end of day America/Los_Angeles, or pass ISO-8601. Omit or null clears. | `task_id`, `due_date`, `actor` |
| `task_claim` | `tasks:write` | Claim `todo` tasks for a runtime. | `assignee_id`, `claimed_by`, `limit` |
| `task_claim_work_item` | `tasks:write` | Claim the one task a work item points at. | `work_item_id`, `claimed_by` |
| `task_pickup` | `tasks:write, comments:read` | Claim plus task and project comments, and `desk_context` (scratch pad and desk memory). Acks unread handoffs. | `work_item_id`, `claimed_by` |
| `task_reassign` | `tasks:reassign` | Reassign to a runtime or user. Handoff comment required. | `task_id`, `assignee_type`, `assignee_id`, `handoff_note` |
| `task_complete` | `tasks:write` | Complete a `todo` or `doing` task that is not close-gated. | `task_id`, `result` |
| `task_stuck` | `tasks:write` | Mark a task stuck. | `task_id`, `reason` |
| `task_start` | `tasks:write` | Move `todo` to `doing`. | `task_id` |
| `task_resume` | `tasks:write` | Move `stuck` to `todo`. Refuses unmet dependencies. | `task_ids`, `note` |
| `task_demote` | `tasks:write` | Move `todo` back to `backlog`. | `task_id`, `note` |
| `task_reopen` | `tasks:write` | Reopen a `done` task to an active status. | `task_id`, `to_status`, `note` |
| `task_cancel` | `tasks:write` | Cancel from an active status. Reason required. | `task_id`, `reason` |
| `task_request_promote` | `tasks:write` | Open a promote approval. | `task_ids`, `note`, `domain` |
| `task_request_close` | `tasks:write` | Close. Human gate opens a card. Otherwise the task can complete, and a linked green pull request can merge. | `task_ids`, `note`, `pr_url`, `work_item_id`, `work_result` |
| `task_scheduled_create` | `schedules:write` | Create or update a scheduled task. Token only. | `project_id`, `title`, `schedule_cron`, `scheduled_workflow_template_id`, `assignee_type`, `assignee_id` |
| `task_scheduled_enable` | `schedules:write` | Enable a scheduled task and its job binding. Token only. | `task_id` |
| `task_get` | `tasks:read` | Get one task with readiness, dependency edges, and parent. | `task` |
| `task_update` | `tasks:write` | Update mutable task fields. Only keys you pass change. Cannot set status, `human_approval_to_close`, or assignee. Cycles in the parent are rejected. A `contact_ids` list replaces the linked contacts. | `task`, `title`, `description`, `priority`, `due_date`, `hidden_until`, `project_id`, `metadata`, `parent_task_id`, `account_id`, `deal_id`, `campaign_id`, `contact_ids`, `related_entities`, `actor` |
| `task_dependency_set` | `tasks:write` | Create or update a dependency edge where the predecessor blocks the successor. Cycles are rejected. | `successor`, `predecessor`, `kind`, `require_predecessor_done`, `require_predecessor_merged`, `actor` |
| `task_dependency_remove` | `tasks:write` | Delete a dependency edge and its mirrored `blocked_by` link. | `successor`, `predecessor`, `actor` |
| `task_dependency_list` | `tasks:read` | List a task's predecessors and successors with status and gate flags. | `task` |

## Desks

`desk_id` is the project id. Desk isolation is a convention, not a security boundary: an admin sees every desk, and a member sees desks they own. The scratch pad is overwritten in place (16 KiB). Desk memory is append-only. A daily job archives unpinned rows older than 30 days. Nothing is deleted. `entity_notes` is not used for desk memory. The server stamps the writer. Callers do not pass a runtime id or a written-by name. A member who passes another user's id is refused.

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `desk_scratchpad_get` | `projects:read` | Read the scratch pad and its `updated_at`. | `desk_id` |
| `desk_scratchpad_set` | `projects:write` | Overwrite the scratch pad. Stale `expected_updated_at` returns `conflict`. The server stamps the writer. | `desk_id`, `text`, `expected_updated_at` |
| `desk_memory_append` | `projects:write` | Append one memory row. The server leaves the runtime id empty. | `desk_id`, `body` |
| `desk_memory_list` | `projects:read` | Pinned rows plus the last `days` (default 30). `include_all` adds archived rows. | `desk_id`, `days`, `include_all` |
| `desk_memory_pin` | `projects:write` | Pin or unpin one row. Pinning keeps it out of the archive. | `desk_id`, `memory_id`, `pinned` |
| `desk_context_get` | `projects:read` | Scratch pad and memory list together. Same shape `task_pickup` returns. | `desk_id`, `days`, `include_all` |

## Comments and notifications

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `comment_create` | `comments:write` | Create a comment and link it to records. | `body`, `domain`, `assignee_runtime_id`, `related` |
| `comment_list` | `comments:read` | List comments for a runtime, status, or related record. | `assignee_runtime_id`, `status`, `domain`, `related_type`, `related_id`, `limit` |
| `comment_ack` | `comments:write` | Acknowledge a comment. | `comment_id` |
| `comment_applied` | `comments:write` | Mark a comment applied. | `comment_id` |
| `comment_dismiss` | `comments:write` | Dismiss a comment. | `comment_id` |
| `cockpit_get` | `cockpit:read` | Aggregate payload: pending approvals, notifications, and summaries. | none |
| `cockpit_notifications_list` | `cockpit:read` | In-app notifications for the token owner. | `status`, `limit` |
| `cockpit_notification_resolve` | `cockpit:write` | Mark a notification read or dismissed. | `id`, `status` |

## Work lease

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `work_clock_in` | `work:write` | Claim a work item. A live lease on the same kind and ref conflicts. | `kind`, `ref`, `agent_id`, `run_id`, `lease_ttl_minutes` |
| `work_set_session` | `work:write` | Record the session, repo, and branch on a claimed item. | `work_item_id`, `repo`, `branch`, `session_url` |
| `work_heartbeat` | `work:write` | Extend the lease. | `work_item_id` |
| `work_log` | `work:write` | Append a log line and bump the heartbeat. | `work_item_id`, `level`, `message` |
| `work_block` | `work:write` | Mark the item blocked. | `work_item_id`, `gap_type` (`policy`, `data`, or `tool`), `reason` |
| `work_clock_out` | `work:write` | Release the item. | `work_item_id`, `status` (`done`, `failed`, `skipped`), `result`, `error` |
| `work_status` | `work:read` | Read by exactly one selector. | `work_item_id`, or `kind` plus `ref`, or `run_id` |

## Meetings and graph check-in

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `meeting_graph_checkin` | `graph:write` | Write a meeting activity plus entity proposals, links, notes, and flags. | `activity`, `run_id`, `entities`, `links`, `notes`, `flags` |
| `meeting_brief_checkin` | `graph:write` | Attach a pre-call brief to a calendar activity. Does not change entities. | `calendar_activity_id`, `brief`, `run_id` |
| `entity_graph_checkin` | `graph:write` | Check in entities for a lane without an activity. | `lane`, `run_id`, `entities`, `links`, `notes`, `flags` |
| `graph_checkin` | `graph:write` | Deprecated alias of `meeting_graph_checkin`. | same as `meeting_graph_checkin` |
| `graph_checkin_revert` | `graph:write` | Revert a check-in by run id. | `run_id` |
| `resolve_meeting_desk` | `graph:write` | Pick the desk for meeting task proposals: calendar tag, then `meeting_desk_rules`, else CoS. Copy the returned `assignment` onto every `wiki_task_proposed` flag. | `activity_id`, `calendar_event_id`, `title`, `body`, `attendee_emails` |
| `calendar_event_desk_tag_set` | `graph:write` | Set or remove the calendar desk tag on one `calendar_event` (`metadata.desk_project_id`), the tag `resolve_meeting_desk` reads first. Merges into metadata only: does not replace metadata or `raw_payload`, and does not write `activities.project_id`. Refuses a non-calendar row and an unknown or inactive project (`completed`, `paused`, `cancelled`). Setting the same project again returns `changed: false`. A tag this tool did not set (no agent provenance, or a `role=desk` link) stays unless `force` is true. `remove` clears the metadata tag; `force` also drops conflicting `role=desk` links. `actor` defaults to the caller. | `activity_id`, `project_id`, `reason`, `actor`, `remove`, `force` |

## Files and marketing assets

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `file_reserve` | `files:write` | Reserve a file row and an upload URL, deduped by hash. | `sha256`, `file_name`, `mime_type`, `size_bytes`, `domain` |
| `file_commit` | `files:write` | Mark an upload ready after the bytes land. | `file_id` |
| `file_link` | `files:write` | Link a file to a record. | `file_id`, `entity_type`, `entity_id`, `link_kind` |
| `file_unlink` | `files:write` | Remove one link. | `file_id`, `entity_type`, `entity_id`, `link_kind` |
| `file_share_record` | `files:write` | Record that a file was shared. Does not send it. | `file_id`, `contact_id`, `account_id`, `shared_via`, `note` |
| `files_for_entity` | `files:read` | Files and optional share history for a record. | `entity_type`, `entity_id`, `limit`, `include_shares` |
| `file_signed_url` | `files:read` | Short-lived download URL. | `file_id`, `ttl_seconds`, `download` |
| `marketing_asset_create` | `files:write` | Create a marketing asset identity. Bytes stay on a file row. | `title`, `slug`, `kind`, `domain`, `campaign_id` |
| `marketing_asset_version_add` | `files:write` | Add a version that points at a committed file. | `asset_id`, `file_id`, `version`, `set_current` |
| `marketing_asset_list` | `files:read` | List assets. | `kind`, `domain`, `campaign_id`, `project_id`, `limit` |
| `marketing_asset_get` | `files:read` | One asset and its versions. | `asset_id` |
| `marketing_asset_set_current` | `files:write` | Point the asset at a version. | `asset_id`, `version` |

## Workflows

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `workflow_template_create` | `workflows:write` | Create or update a template and its steps. | `slug`, `name`, `project_id`, `description`, `steps`, `status` |
| `workflow_apply` | `workflows:write` | Instantiate a template into tasks on a desk. | `template_id`, `context_project_id`, `trigger` |
| `workflow_trigger_describe` | `workflows:read` | Return the trigger input contract. Workspace comes from the PAT binding. Do not pass `workspace_id`. | `template` |
| `workflow_trigger` | `workflows:write` | Enqueue a trigger with validated input. Workspace comes from the PAT binding. | `template`, `input`, `dedupe_key` |
| `workflow_trigger_objects` | `workflows:read` | List the tables a trigger can watch, with allowed ops, hook state, and matchable columns. Workspace comes from the PAT binding. | none |
| `workflow_trigger_list` | `workflows:read` | List declarative triggers with enabled state, mode, action kind, and event counts. Workspace comes from the PAT binding. | `object` |
| `workflow_trigger_events` | `workflows:read` | List recent trigger events. `limit` is 1-500, default 50. Workspace comes from the PAT binding. | `template_id`, `status`, `limit` |
| `workflow_trigger_test` | `workflows:read` | Dry run a trigger against an existing row. Writes nothing. Workspace comes from the PAT binding. | `template_id`, `row_id`, `op`, `old` |
| `workflow_trigger_save` | `workflows:write` | Create or update a declarative trigger. Action kinds: `start_workflow`, `approval_create`, `task_create`, `notify`. Saved disabled. Token only. Workspace comes from the PAT binding. | `slug`, `name`, `trigger`, `input_schema`, `template_id` |
| `workflow_trigger_enable` | `workflows:write` | Enable, or set `shadow_match` immediately. `live` mints a pending `workflow_trigger_go_live` card and does not change `trigger_mode` until that card is approved. Token only. Workspace comes from the PAT binding. | `template_id`, `enabled`, `mode` |
| `flow_start` | `workflows:write` | Start a registered flow by slug. | `slug`, `input` |
| `flow_run_status` | `workflows:write` | Poll a flow run and its steps. | `run_id` |

## Decision flows

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `decision_flow_list` | `decisions:read` | List every decision flow and whether the caller can create one. | none |
| `decision_flow_get` | `decisions:read` | Load one flow and the live path from the newest recorded run. Does not execute. | `flow_key` |
| `decision_flow_create` | `decisions:write` | Create a disabled flow. Admin only. Empty act allowlist. Does not run it. | `flow_key`, `description`, `questions` |
| `decision_flow_test` | `decisions:read` | Dry-run saved thresholds against fixture answers. Writes nothing and calls no provider. | `flow_key`, `answers` |

See [Decision flows](/docs/features/decision-flows).

## Classifiers

Question sets are content-hashed. An edit appends a version. `bool` is stored as `noul`. New flows start disabled. Archiving a flow is a soft delete; a flow with no owner can only be archived by an admin session. Usage stats stay on the signed-in HTTP route and have no MCP tool.

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `classifier_flows_list` | `classifiers:read` | List flows and question-set versions. `can_edit` is true when the caller may write. Archived flows are hidden unless `include_archived` is true. | `include_archived` |
| `classifier_flow_get` | `classifiers:read` | Read one flow and its versions. | `flow_key` |
| `classifier_flow_create` | `classifiers:write` | Create a flow and its first pinned question set. Closed answers only: choice, score, or bool. | `flow_key`, `description`, `questions`, `enabled`, `retrieval_spec`, `act_policy`, `act_allowlist` |
| `classifier_flow_update` | `classifiers:write` | Edit description, enabled, act policy, or the act allow list. Does not change the pinned set. | `flow_key`, `description`, `enabled`, `act_policy`, `act_allowlist` |
| `classifier_flow_archive` | `classifiers:write` | Archive (soft delete) a flow, or restore it with `archived` false. Archiving forces the flow disabled, so it stops running. Runs and versions are kept. Restore leaves it disabled. The caller must own the flow or be an app admin. | `flow_key`, `archived` |
| `classifier_question_set_create` | `classifiers:write` | Append a version. Identical content returns the existing version. `pin` true points the flow at it. | `flow_key`, `questions`, `retrieval_spec`, `pin` |
| `classifier_question_set_pin` | `classifiers:write` | Pin a version that already belongs to the flow. | `flow_key`, `question_set_id` |

See [Classifiers](/docs/features/classifiers).

## Skills

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `skill_list` | `approvals:read` | List skills. | `enabled_only`, `action_type`, `family`, `project_id` |
| `skill_get` | `approvals:read` | One skill by slug. | `slug` |
| `skill_metrics` | `approvals:read` | Recommendation agreement rates. | `days` |
| `skill_create` | `skills:write` | Create a skill document and queue a collection sync. | `slug`, `title`, `body_md`, `summary`, `family`, `domain` |
| `skill_update` | `skills:write` | Update a skill and queue a re-sync. | `skill_id`, `title`, `summary`, `body_md`, `status`, `enabled` |

## Goals

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `metric_catalog_list` | `metrics:read` | Built-in metric catalog. | `owning_role`, `availability`, `all_versions` |
| `metric_query` | `metrics:read` | Compute one catalog metric. | `key`, `filters`, `period` |
| `charter_list` | `charters:read` | List charters. | `scope`, `status`, `slug` |
| `charter_get` | `charters:read` | One charter with sections and measures. | `charter_id` or `slug`, `version`, `include_metric_values` |
| `charter_propose_version` | `charters:write` | Propose a draft charter. Publishing waits on an approval. | `slug`, `scope`, `title`, `sections`, `measures`, `summary` |

## ICP

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `icp_list` | `icp:read` | List ICP profile versions. | `status`, `slug`, `include_criteria`, `limit` |
| `icp_get` | `icp:read` | One ICP and its version history. | `icp_id`, `version` |
| `icp_propose_version` | `icp:write` | Draft a new ICP version. Activation waits on an approval. | `slug`, `name`, `criteria`, `summary` |
| `account_fit_score` | `icp:write` | Score an account against an ICP and write the fit fields. | `account_id`, `icp_id` |
| `accounts_by_tier` | `icp:read` | Accounts in a fit tier. | `tier`, `icp_id`, `min_score`, `limit` |

## Outcomes and cases

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `outcomes_list` | `engagement_outcomes:read` | List engagement outcomes. | `status`, `confirmed_state`, `deal_id`, `project_id`, `account_id`, `limit` |
| `outcome_create` | `engagement_outcomes:write` | Create an outcome. Cannot set achieved directly. | `title`, `description`, `type`, `source`, `deal_id` or `project_id`, `account_id`, `status` |
| `outcome_update` | `engagement_outcomes:write` | Update outcome fields. Does not confirm or achieve. | `outcome_id` plus the fields to change |
| `outcome_confirm` | `engagement_outcomes:write` | Confirm, reject, or propose achieved. Achieved files a human-only card. | `outcome_id`, `action` (`confirm`, `reject`, `achieve`) |
| `cases_list` | `cases:read` | List support cases. | `status`, `account_id`, `project_id`, `limit` |
| `case_create` | `cases:write` | Open a case on an account. | `title`, `description`, `account_id`, `project_id`, `status` |
| `case_update` | `cases:write` | Update a case and its outcome links. | `case_id`, `link_outcome_id`, `unlink_outcome_id` |

## Agent bus

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `agent_bus_subscribe` | `agent_bus:write` | Subscribe a runtime to the bus. | `agent_id`, `session_key`, `channels` |
| `agent_bus_list_agents` | `agent_bus:read` | List agents and presence. | `only_active`, `only_clocked_in` |
| `agent_bus_broadcast` | `agent_bus:write` | Broadcast a message. | `from_agent_id`, `body`, `kind`, `only_clocked_in` |
| `agent_bus_send` | `agent_bus:write` | Send to specific agents. | `from_agent_id`, `to_agent_ids`, `body`, `thread_id` |
| `agent_bus_inbox` | `agent_bus:read` | Pull an agent's inbox. | `agent_id`, `status`, `limit` |
| `agent_bus_reply` | `agent_bus:write` | Reply in a thread. | `from_agent_id`, `body`, `thread_id`, `in_reply_to` |
| `agent_bus_ack` | `agent_bus:write` | Acknowledge a message. | `agent_id`, `message_id` |

## LLMs

Provider tokens go to Vault and are never returned. `has_vault` is the only secret signal. A blank token on update keeps the stored secret. `model_id` must be a pinned id. The caller must also be a workspace owner or admin.

| Tool | Scope | Purpose | Key parameters |
|---|---|---|---|
| `llm_provider_list` | `decisions:read` | List providers. No Vault id or token. | none |
| `llm_provider_create` | `decisions:write` | Create a provider. Optional token is stored in Vault. `enabled` defaults false. | `provider_key`, `endpoint_url`, `enabled`, `token` |
| `llm_provider_update` | `decisions:write` | Update a provider. Omit a field to leave it. Blank `token` keeps the secret. | `provider_key`, `endpoint_url`, `enabled`, `token` |
| `llm_provider_disable` | `decisions:write` | Kill switch. The Vault secret stays. | `provider_key` |
| `llm_binding_list` | `decisions:read` | List named instances and flow options. | none |
| `llm_binding_create` | `decisions:write` | Create a pinned instance. One row per flow and role. | `instance_name`, `flow_key`, `role`, `provider_key`, `model_id`, `params`, `enabled` |
| `llm_binding_update` | `decisions:write` | Update an instance by id. Omitted fields stay. | `id`, `instance_name`, `flow_key`, `role`, `provider_key`, `model_id`, `params`, `enabled` |
| `llm_binding_disable` | `decisions:write` | Kill switch. The row stays. | `id` |

See [LLMs](/docs/features/llms).
