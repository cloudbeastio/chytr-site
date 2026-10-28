---
title: Quickstart
description: Sign in, create a task, and open the approval queue.
keywords: sign in, first task, approval queue, session
section: getting-started
order: 3
status: published
unlisted: false
---

# Quickstart

These steps assume chytr is already running and your user can sign in. Standing up a fresh project is a preview install and is not covered here.

Use your own host in place of `https://chytr.example.com`.

## 1. Sign in

Open `https://chytr.example.com/login`.

1. Enter the email of a user that already exists in Supabase Auth.
2. Enter the one-time code from that inbox.

The form calls `signInWithOtp` with `shouldCreateUser: false`. An unknown email does not create an account. There is no password field. After a successful code, you land on `/dash` unless the link you opened set a `next` path.

## 2. Create a task

On **Tasks**:

1. Choose **New task**.
2. Give it a title and a desk (project).
3. Leave **Human approval to close** off if you want the assignee to finish it. Turn it on if a person must accept the close.
4. Save. The card starts in **Backlog**.

Drag it to **Todo** when an agent should pick it up. Nothing is dispatched until it is in `todo` and a runtime is assigned.

## 3. Open the approval queue

Go to **Approvals**. The deck shows one pending card. Approve, reject, or skip. **List** is the same queue with filters and bulk actions. An empty queue links to `/chat`. On Dash, **Approvals by desk** lists the same cards grouped by desk, with inline Approve and Reject.

Approving a create card inserts the record. Rejecting it does not. Approving a task's close card merges its linked pull request, then closes the task. If the pull request is not ready, the card stays pending. See [GitHub](/docs/features/github).

## 4. Issue a token for an agent

Go to **Admin → API Keys**. Create a personal access token for the agent, pick the sets and extra scopes for that token, and copy the `cbpat_…` value. It is shown once. That token is the agent credential. A signed-in user's API token is meant to inherit the user's permission set. That inheritance is planned and off by default. See [Permissions and API keys](/docs/reference/permissions).

Point the agent at `https://chytr.example.com/api/mcp` with `Authorization: Bearer <token>`. The tool list is in [MCP tools](/docs/reference/mcp-tools). Register the agent itself under **Agents** if chytr should wake it. See [Connecting agents](/docs/features/agents).

## 5. Look something up

The top bar search matches tasks, accounts, contacts, and deals by name after two characters. It also resolves short ids. That search is not the semantic index. Use `/chat` when you want a question answered from indexed activity text. See [Search](/docs/features/search).
