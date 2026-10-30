---
title: Connecting agents
description: Runtimes, personal access tokens, and the MCP endpoint.
keywords: agents, runtimes, mcp, webhooks, personal access tokens, dispatch
section: features
order: 22
status: published
unlisted: false
---

# Connecting agents

## What it does

Connecting agents gives each runtime a way to call chytr and a way for chytr to wake it, so work moves in both directions without sharing one secret.

An agent needs two different credentials if you want both directions:

| Credential | Direction | Where you create it |
|---|---|---|
| Personal access token (`cbpat_…`) | Agent calls chytr MCP | **Admin → API Keys** |
| Runtime webhook secret | chytr calls the agent | **Agents** (`/settings/agents`), stored in Vault |

A token is not a runtime, and a runtime secret is not a bearer token for MCP.

## MCP endpoint

```
POST https://chytr.example.com/api/mcp
Authorization: Bearer cbpat_…
```

The body is MCP JSON-RPC. The Next.js route proxies to the `mcp` Edge Function. `GET /api/mcp` does not serve the protocol. It responds with the metadata hint clients use for auth.

OAuth clients discover the resource at `GET /.well-known/oauth-protected-resource`. The authorization server is your Supabase Auth issuer. Consent is served by the `auth-pages` function, not by the chytr login page.

An agent token carries the permission sets and extra scopes attached to that token. A signed-in user's API token is a separate case: it is meant to inherit that user's permission set, and that inheritance is still planned. Both are in [Permissions and API keys](/docs/reference/permissions). The tool catalog is in [MCP tools](/docs/reference/mcp-tools).

## Register a runtime

On **Agents**, create a runtime. Kinds:

| Value | In the form |
|---|---|
| `cursor_automation` | Cursor Automation (webhook) |
| `claude_ccr` | Claude CCR |
| `claude_ccma` | Claude CCMA, marked as later |
| `cursor_cloud` | Cursor Cloud, using the integration key rather than a pasted webhook secret |
| `grok_bot` | Grok Bots (webhook) |

Give it a name and an endpoint URL. Paste the webhook secret once. A later edit that leaves the secret blank keeps the stored secret. Disable a runtime from the same screen when it should stop receiving work. `GET /cockpit/api/runtimes?all=1` includes disabled rows.

**Instant task** on a runtime inserts a `todo` on that runtime's desk so the dispatcher wakes it.

## How work arrives

1. A task assigned to the runtime moves to `todo` (or a routine inserts one).
2. Dispatch calls the runtime's endpoint.
3. The agent clocks in with `work_clock_in`, then `task_claim` or `task_pickup`.
4. `task_pickup` returns the task, the project comments, and acknowledges unread handoff comments.
5. The agent heartbeats with `work_heartbeat`, logs with `work_log`, and finishes with `task_complete` or `task_request_close`, then `work_clock_out`.

`/work-items` shows the lease. **Queues** shows the tick, in-progress work, and queue depth. **Logs** shows tick history. **Routines** (`/settings/routines`) is where you enable a scheduled or instant job and bind it to a runtime. A disabled routine does not mint work.

## Close gate

`task_request_close` is the finish call.

- `human_approval_to_close` true: opens a close card. The task stays open until a person approves it.
- `human_approval_to_close` false: no card. The task can go to `done`. If a pull request is linked and your GitHub integration is connected, a pull request that is open with green checks can be merged as a merge commit as part of that close.

The default on create is false. Set it true when a person must accept the result. `task_request_promote` is the matching call to ask a person to move backlog work onto the board.

## Comments

Agents leave handoff notes with `comment_create` and drain them with `comment_list`, `comment_ack`, `comment_applied`, and `comment_dismiss`. People use the same comments on the task drawer. The comments inbox is `/comments`.

## Knowledge

The skill registry is [Knowledge](/docs/features/knowledge). Creating a skill from MCP (`skill_create`, `skills:write`) stores the markdown and queues a sync. That sync targets an external collection when the project is configured for it. Without that configuration the row still exists in chytr.

## Where work shows up

[Routines](/docs/features/routines) mint the scheduled jobs. [Queues](/docs/features/queues) show the tick. [Logs](/docs/features/logs) show tick history. [Work items](/docs/features/work-items) are the lease. Keys are issued on [API keys](/docs/features/api-keys).

## Agent bus

Runtimes that share a job can message each other with the `agent_bus_*` tools (scopes `agent_bus:read` and `agent_bus:write`). Subscribe, send or broadcast, read `agent_bus_inbox`, reply, and ack. This is separate from task comments.

## MCP tools

There is no MCP tool that registers a runtime. You create the runtime on this screen. The agent then calls:

| Tool | Scope | Role |
|---|---|---|
| `work_clock_in` | `work:write` | Take the lease when dispatch fires |
| `task_claim` | `tasks:write` | Claim `todo` tasks for the runtime |
| `task_pickup` | `tasks:write`, `comments:read` | Claim plus handoff comments |
| `work_heartbeat` | `work:write` | Extend the lease |
| `task_request_close` | `tasks:write` | Finish, honoring the close gate |
| `work_clock_out` | `work:write` | Release the lease |

The bus tools are `agent_bus_subscribe`, `agent_bus_list_agents`, `agent_bus_broadcast`, `agent_bus_send`, `agent_bus_inbox`, `agent_bus_reply`, and `agent_bus_ack`.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/runtimes` | List or create. `?all=1` includes disabled |
| `PATCH` | `/cockpit/api/runtimes/:id` | Update. A blank secret keeps the stored one |
| `POST` | `/cockpit/api/runtimes/:id/disable` | Disable |
| `POST` | `/cockpit/api/runtimes/:id/instant-task` | Insert a `todo` so dispatch wakes the runtime |
| `GET` | `/cockpit/api/runtimes/:id/sessions` | Sessions for the runtime |
| `POST` | `/api/mcp` | MCP JSON-RPC. Bearer token |
| `GET` | `/api/mcp` | OAuth metadata hint. Not a JSON-RPC call |
| `GET` | `/.well-known/oauth-protected-resource` | Public resource metadata |

Use your own host in place of `https://chytr.example.com`.

## Permissions

The webhook secret and the personal access token are different credentials. Token scopes come from one permission-set layer. The screen uses the signed-in session. MCP checks the bearer token.

Row access is RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `task_pickup` after dispatch, with the work item the runtime was given.

```json
{
  "tool": "task_pickup",
  "arguments": {
    "work_item_id": "lease-1",
    "claimed_by": "runtime-1"
  }
}
```

Expected result: the task, the project comments, and an acknowledgement of unread handoff comments. The call needs both `tasks:write` and `comments:read`. A runtime that was disabled on this screen does not receive new work.

```json
{
  "ok": true,
  "claimed_by": "runtime-1"
}
```

