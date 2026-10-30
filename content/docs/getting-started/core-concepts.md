---
title: Core concepts
description: Agents propose, humans approve, and the objects chytr keeps in between.
keywords: approvals, tasks, desks, entities, runtimes, members
section: getting-started
order: 2
status: published
unlisted: false
---

# Core concepts

## Agents propose, humans approve

An agent does not insert an account, contact, deal, project, campaign, or territory by itself. It submits an **approval card**. You approve the card in chytr, and the database applies the change. You reject it, and the change does not apply.

Some cards are human-only. Agents can file a create, merge, rename, or alias. A person approves those. Field updates and many task moves can be resolved by an agent whose token has `approvals:write`, through `approval_resolve`. Extraction types are in that agent-resolvable set. The extraction review tools, and what an approve applies, are in [Meetings and extraction](/docs/features/meetings).

A decided card is terminal. Approving or rejecting it does not reopen the same row.

## Approvals

An approval is one pending decision. It has a status (`pending`, `approved`, `rejected`, `deferred`, `expired`, `delegated`), a type, a title, and an `on_approve` payload that says what to do if you accept it. The Approvals screen is both a swipe deck and a list of the same queue. See [Approvals](/docs/features/approvals).

## Tasks

A task is a unit of work on a board: `backlog`, `todo`, `doing`, `review`, `stuck`, `done`, `cancelled`. Tasks belong to a project (a desk) and can be assigned to a person or an agent runtime. Moving a task to `todo` is what wakes a runtime.

`human_approval_to_close` is the close gate. On means a person must accept a close card. Off, the default, means the assignee can close the task. Set the flag when you create the task. Wording in the description does not change the gate.

## Desks

A desk is the project a task hangs on. `/desks` shows the same projects as an org-style team view or a list. Routines and workflow templates bind to a desk so scheduled work has a home.

## Work items

A work item is the lease an agent takes while it runs a task or a job. The agent clocks in, heartbeats, logs, and clocks out. `/work-items` is the ledger. People read it. Agents write it through MCP.

## Entities

Entities are the CRM records: accounts, contacts, deals, projects, campaigns, and territories. Each has allowed fields and allowed values. Agents send those fields on a card. Illegal keys are stripped. See [Entity fields](/docs/reference/entity-fields).

Activities are the timeline behind those records: mail, calendar events, and meeting notes. Extraction is headless. A proposal is an approval of type `extraction.<action>`, reviewed with the extraction tools or the approvals API. There is no extraction screen. See [Meetings and extraction](/docs/features/meetings).

## Agent runtimes

A runtime is a registered agent endpoint: a Cursor automation, a Claude runtime, Cursor Cloud, or a Grok bot. chytr stores the webhook secret in Vault. A personal access token is a different credential. The token is how that agent calls MCP. The webhook secret is how chytr calls the agent. See [Connecting agents](/docs/features/agents).

## Domains

Domains are labels you define under Admin. Tasks, projects, and comments can be filtered by domain. They are a workspace catalog, not a second product.

## Access

One permission layer, built on permission sets, covers the app and a signed-in user's API token. Agent MCP tokens are separate: they carry the sets and extra scopes attached to that token, because the caller may be an agent.

A row belongs to the person who created it. Members see their own rows. Admins and owners see every row. The column is `owner_user_id`.

**Status.** User-set inheritance is off by default (`feature.permission_sets_users`). Creator-scoped row access is the model and is not yet the policy on every table. See [Permissions and API keys](/docs/reference/permissions).

## Workspace members

People who can sign in are workspace members with the role `owner`, `admin`, or `member`. Sign-in is an email one-time code for a user that already exists. The app does not create a user from the login form. See [Users and members](/docs/features/users).
