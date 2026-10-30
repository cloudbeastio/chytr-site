---
title: Entity fields
description: Allowed fields and values for approval cards and the main records.
keywords: entity fields, accounts, contacts, deals, campaigns
section: reference
order: 3
status: published
unlisted: false
---

# Entity fields

The database is the source of truth. Approval cards are checked against `approval_entity_shapes`, which you can edit under **Admin → Approval types**. The tables below match that shape plus the check constraints. If a later migration disagrees with this page, the migration wins.

Agents do not insert these tables directly. They submit a card (`graph_entity_create` or `graph_entity_update`) or an `entity_graph_checkin`. A person approves creates. `entity_field_write` is the single-field path for a value that already has a row, with a source of `agent`, `crm`, or `import`. `entity_create` as an MCP tool is deprecated and does not insert.

Never send these keys on a card: `tags`, `domain_wall`, `references`, `slug`, `id`, `owner_user_id`, `contacts.name`.

`owner_user_id` is the "created by" column. `set_owner_user_id()` stamps it on insert from the session user when it is null. A text `created_by` on tasks and briefs is attribution, and it is not the access column. Who can see the row is in [Permissions and API keys](/docs/reference/permissions#row-access).

Foreign keys accept an id or a slug.

## Card fields

### Accounts

Required: `name`.

Allowed: `name`, `summary`, `industry`, `website`, `domain`, `headquarters_city`, `headquarters_country`, `lifecycle_stage`, `employee_count_range`, `annual_revenue_range`, `phone`.

### Contacts

Required: `full_name`, or both `first_name` and `last_name`.

Allowed: `full_name`, `first_name`, `last_name`, `email`, `title`, `location`, `linkedin_url`, `summary`, `lifecycle_stage`, `account_id`, `phone_primary`, `seniority`.

### Deals

Required: `name`.

Allowed: `name`, `stage`, `status`, `value`, `amount_cents`, `close_date`, `account_id`, `campaign_id`, `end_customer_account_id`, `bill_to_account_id`, `referring_partner_account_id`.

### Projects

Required: `name`.

Allowed: `name`, `status`, `classification`, `start_date`, `end_date`, `account_id`, `deal_id`, `campaign_id`, `client_account_id`, `kind`, `domain`.

### Campaigns

Required: `name`, `campaign_type`.

Allowed: `name`, `campaign_type`, `status`, `description`, `goal`, `start_date`, `end_date`, `exclude_deals_from_board`.

### Territories

Required: `name`.

Allowed: `name`, `partner_account_id`, `parent_id`, `status`, `partner_fy`, `dimensions`.

`territories.status` has no check constraint. The convention used in the product is `active` or `inactive`.

## Allowed values

### Lifecycle stage (accounts and contacts)

`subscriber`, `lead`, `mql`, `sql`, `opportunity`, `customer`, `evangelist`, `churned`, `other`, `unqualified`, `active`, `lost`, `cancelled`, `needs-review`.

`prospect` is normalized to `lead` on the way in. `cancelled` is the archive value. Use `needs-review` when the name is a single token and there is no email and no account.

### Account commercial status

`customer_status` (nullable): `prospect`, `opportunity`, `customer`, `former-customer`, `lost`, `unqualified`.

`partner_status` (nullable): `evaluating`, `onboarding`, `active`, `cancelled`, `inactive`.

These two are columns on the account. They are not the lifecycle stage, and they are not both required on a create card.

### Contact kind

`contact_kind`: `person`, `automation`, `shared_inbox`, `unknown`. The database classifies this from the email and name. A user-set kind is locked against that classifier. It is not a create-card field in the shape above.

### Deals

`stage`: `Lead`, `Qualification`, `Discovery`, `Value Proposition`, `Proposal`, `Negotiate`, `Contract`, `Closed Won`, `Closed Lost`.

`status`: `open`, `won`, `lost`, `stalled`.

`forecast_category`: `pipeline`, `best_case`, `most_likely`, `commit`.

### Projects

`status`: `active`, `paused`, `stuck`, `completed`, `cancelled`.

`classification` (nullable): `internal`, `client`, `partner`.

### Campaigns

`campaign_type`: `outbound_marketing`, `internal_initiative`.

`status`: `draft`, `active`, `paused`, `completed`, `archived`.

### Tasks

`status`: `backlog`, `todo`, `doing`, `review`, `stuck`, `done`, `cancelled`.

`human_approval_to_close`: boolean. Default false.

### Approvals

`status`: `pending`, `approved`, `rejected`, `deferred`, `expired`, `delegated`.

### Activity quality

`quality_class`: `substantive`, `transactional`, `notification`, `digest`, `noise`.

## Agent state and notes

`entity_state_get`, `entity_state_set`, and `entity_state_patch` read or write `agent_state` on `contacts`, `accounts`, `deals`, or `projects`. Set replaces the object. Patch shallow-merges. Pass `expected_updated_at` when you need to lose the race instead of clobbering another writer.

`entity_note_add` appends a note. `entity_notes_list` returns the newest notes. Long bodies are truncated in the tool response.
