---
title: HTTP API
description: Session routes under /cockpit/api, plus the MCP and ingest endpoints.
keywords: http api, session routes, cockpit api, mcp endpoint
section: reference
order: 4
status: published
unlisted: false
---

# HTTP API

The browser calls chytr on the same host. It does not call PostgREST from the client. Handlers live under `apps/cockpit/app`.

## Auth

`/cockpit/api/*` uses the Supabase session cookie. `requireUser()` rejects a missing session. The middleware returns JSON `401` for these routes instead of redirecting to HTML. Responses are `{ "ok": true, ... }` or `{ "ok": false, "error": "..." }`.

Three routes sit outside that prefix:

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/mcp` | `Authorization: Bearer` with a `cbpat_…` token or a user JWT. Proxies to the MCP Edge Function |
| `GET` | `/api/mcp` | Unauthenticated hint for OAuth metadata. Not a JSON-RPC call |
| `GET` | `/.well-known/oauth-protected-resource` | Public resource metadata |
| `POST` | `/api/v1/ingest` | `Authorization: Bearer` with `COCKPIT_INGEST_API_KEY`. Agent-hook log ingest. Unexpected failures still return HTTP 200 with `ok: false` |
| `POST` | `/api/gap-action` | Session. Files a pending approval for a calendar gap (`log-call`, `generate-brief`, `not-held`, `exclude`). Does not apply the action |

## Shell

| Methods | Path | Purpose |
|---|---|---|
| `GET` | `/cockpit/api/cockpit` | Home aggregate |
| `GET` | `/cockpit/api/dash` | Dash tiles |
| `GET` | `/cockpit/api/global-search` | Name search. Query `q` |
| `GET` | `/cockpit/api/short-id` | Resolve a short id |
| `GET` | `/cockpit/api/notifications` | Inbox |
| `PATCH` | `/cockpit/api/notifications/:id` | Mark read or dismissed |

## Approvals

Extraction review uses these routes. There is no `/extraction` resource. Filter `item_type` starting with `extraction.` on the list. `PATCH` body is `{ "status": "approved" | "rejected", "note": "..." }`. Bulk body is `{ "ids": ["..."], "status": "approved" | "rejected", "note": "..." }` with 1 to 200 ids. The contract, including what approve applies, is in [Meetings and extraction](/docs/features/meetings).

| Methods | Path | Purpose |
|---|---|---|
| `GET` | `/cockpit/api/approvals` | Pending queue, every type, up to 500 |
| `GET`, `PATCH` | `/cockpit/api/approvals/:id` | Read any status, or set `approved` / `rejected` |
| `POST` | `/cockpit/api/approvals/bulk` | Bulk resolve. Returns `{ ok, updated, status }` |
| `POST` | `/cockpit/api/approvals/:id/merge-approve` | Approve a merge card |
| `GET` | `/cockpit/api/approvals/:id/merge-context` | Merge context for the card |
| `POST` | `/cockpit/api/approvals/:id/close-approve` | Approve a close card |
| `POST` | `/cockpit/api/approvals/:id/reject-cancel` | Reject and cancel the linked work |
| `POST` | `/cockpit/api/approvals/:id/backlog` | Send linked work back to backlog |
| `GET` | `/cockpit/api/approvals/:id/task-context` | Tasks attached to the card |
| `GET`, `PATCH` | `/cockpit/api/approval-shapes` | Read or edit entity shapes and type contracts |

Deck helpers, also session-authenticated: `POST /cockpit/api/deck/chat`, `POST /cockpit/api/deck/graph-chat`, `GET /cockpit/api/deck/context`, `GET /cockpit/api/deck/ground`, `POST /cockpit/api/deck/events`.

## Tasks

| Methods | Path | Purpose |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/tasks` | List or create |
| `GET`, `PATCH` | `/cockpit/api/tasks/:id` | Read or update |
| `POST` | `/cockpit/api/tasks/:id/promote` | Ask to move a backlog task up |
| `POST` | `/cockpit/api/tasks/:id/start` | `todo` to `doing` |
| `POST` | `/cockpit/api/tasks/:id/complete` | Complete a task that is not close-gated |
| `POST` | `/cockpit/api/tasks/:id/close` | Close-gated acknowledgement |
| `POST` | `/cockpit/api/tasks/:id/request-close` | Open the close path |
| `POST` | `/cockpit/api/tasks/:id/stuck` | Mark stuck |
| `POST` | `/cockpit/api/tasks/:id/resume` | `stuck` to `todo` |
| `POST` | `/cockpit/api/tasks/:id/demote` | `todo` to `backlog` |
| `POST` | `/cockpit/api/tasks/:id/reopen` | Reopen from `done` |
| `POST` | `/cockpit/api/tasks/:id/cancel` | Cancel |
| `POST` | `/cockpit/api/tasks/:id/approve-review` | Accept a task that is in `review` |
| `POST` | `/cockpit/api/tasks/:id/archive` | Archive |
| `GET`, `POST` | `/cockpit/api/tasks/:id/merge-gate` | Read or act on the linked pull-request gate |
| `GET` | `/cockpit/api/tasks/:id/activities` | Activity linked to the task |
| `POST` | `/cockpit/api/tasks/scheduled` | Create a scheduled task |
| `POST` | `/cockpit/api/tasks/:id/schedule-enable` | Enable that schedule |
| `GET` | `/cockpit/api/task-tags` | Tag catalog |

## Records

`GET` list routes: `/accounts`, `/contacts`, `/sales` (deals), `/projects`, `/campaigns`, `/territories`, `/pipeline`, `/activities`, `/marketing-content`.

Search helpers: `GET /accounts/search`, `GET /records/search`.

Generic entity drawer:

| Methods | Path | Purpose |
|---|---|---|
| `POST` | `/cockpit/api/entities/:table` | Create through the app's entity path |
| `GET`, `PATCH`, `DELETE` | `/cockpit/api/entities/:table/:id` | Read, update, delete |
| `POST` | `/cockpit/api/entities/:table/:id/merge` | Merge |

`POST`, `PATCH`, and `DELETE` allow `accounts`, `contacts`, `deals`, `projects`, `campaigns`, and `territories`. `GET` also opens the drawer for campaign members, prospects, marketing content, and ICP profiles.

Deal line items: `GET` and `POST /cockpit/api/deals/:id/line-items`, `PATCH` and `DELETE /cockpit/api/deals/:id/line-items/:itemId`.

Products: `GET` and `POST /products`, `GET` and `PATCH /products/:id`.

Campaign products: `GET` and `POST /campaigns/:id/products`, `DELETE /campaigns/:id/products/:productId`.

Project actions under `/projects/:id`: `GET` and `PATCH` the row, `GET …/child-counts`, and `POST` `convert`, `delete`, `merge`, `owner`, and `undo-delete`.

Cases: `GET` and `POST /cases`, `GET` and `PATCH /cases/:id`, outcomes on `/cases/:id/outcomes`.

## Workflows, agents, tokens

| Methods | Path | Purpose |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/workflows` | List or create templates |
| `GET`, `PATCH` | `/cockpit/api/workflows/:id` | Read or edit |
| `POST` | `/cockpit/api/workflows/:id/trigger` | Enqueue a trigger |
| `POST` | `/cockpit/api/workflows/:id/trigger/dry-run` | Validate without starting |
| `GET` | `/cockpit/api/workflows/:id/trigger/events` | Trigger event log |
| `GET`, `POST` | `/cockpit/api/runtimes` | List or upsert a runtime. `?all=1` includes disabled |
| `PATCH` | `/cockpit/api/runtimes/:id` | Update. Blank secret keeps the stored one |
| `POST` | `/cockpit/api/runtimes/:id/disable` | Disable |
| `POST` | `/cockpit/api/runtimes/:id/instant-task` | Insert a todo for that runtime |
| `GET` | `/cockpit/api/runtimes/:id/sessions` | Sessions for the runtime |
| `GET` | `/cockpit/api/runtimes/binding-options` | Runtimes you can bind a job to |
| `GET`, `POST` | `/cockpit/api/ops/jobs` | Routines. `/cockpit/api/ops/routines` is the same handlers |
| `GET` | `/cockpit/api/queue` | Queue and tick snapshot |
| `POST` | `/cockpit/api/queue/bind` | Set or clear a job's primary runtime |
| `POST` | `/cockpit/api/queue/heartbeat` | `bootstrap` or `run_now` |
| `GET`, `POST` | `/cockpit/api/tokens` | List tokens, or issue one. Plaintext is in the create response only |
| `POST` | `/cockpit/api/tokens/:id/revoke` | Revoke |
| `POST` | `/cockpit/api/tokens/:id/scopes` | Replace extra scopes |
| `POST` | `/cockpit/api/tokens/:id/sets` | Replace permission-set membership |
| `GET`, `POST`, `PATCH` | `/cockpit/api/permission-sets` | List, create, archive |
| `GET`, `POST` | `/cockpit/api/permission-sets/admin` | Admin operations on sets |
| `GET`, `POST` | `/cockpit/api/users` | List members, or invite / change role / deactivate |

## Calendar, comments, files

| Methods | Path | Purpose |
|---|---|---|
| `GET` | `/cockpit/api/calendar/grid` | Calendar grid |
| `GET` | `/cockpit/api/timeline` | Legacy timeline payload |
| `POST` | `/cockpit/api/timeline/link` | Attach a note to an event |
| `GET`, `POST` | `/cockpit/api/comments` | List or create |
| `GET`, `PATCH` | `/cockpit/api/comments/:id` | Read, or ack / applied / dismiss |
| `GET`, `POST` | `/cockpit/api/files` | File metadata |
| `GET` | `/cockpit/api/files/:id/url` | Short-lived download URL |
| `GET`, `POST` | `/cockpit/api/assets` | Marketing asset registry |
| `GET`, `PATCH` | `/cockpit/api/assets/:id` | One asset |
| `POST` | `/cockpit/api/assets/:id/versions` | Add a version |
| `POST` | `/cockpit/api/assets/:id/current` | Set the current version |

## Goals, ICP, health

| Methods | Path | Purpose |
|---|---|---|
| `GET`, `POST` | `/cockpit/api/goals/charters` | Charters |
| `GET` | `/cockpit/api/goals/charters/:id` | One charter |
| `GET` | `/cockpit/api/goals/metrics` | Metric catalog |
| `GET` | `/cockpit/api/goals/metrics/query` | Compute one metric |
| `GET`, `POST` | `/cockpit/api/icp-profiles` | ICP profiles |
| `GET` | `/cockpit/api/icp-fit-intent` | Fit and intent grid |
| `GET` | `/cockpit/api/icp-win-rate` | Win-rate summary |
| `GET` | `/cockpit/api/health` | Graph hygiene |
| `GET` | `/cockpit/api/pipeline-health` | Meeting-pipeline health fields |
| `GET` | `/cockpit/api/decisions/rank1` | Quality-classification audit |
| `GET`, `POST` | `/cockpit/api/decisions/graph` | List flows, or create one. Create lands disabled with an empty act allowlist |
| `GET`, `PATCH` | `/cockpit/api/decisions/graph/:flowKey` | Load or save one flow. Includes `can_edit` |
| `POST` | `/cockpit/api/decisions/graph/:flowKey/test` | Dry-run fixture answers. Writes nothing and calls no provider |
| `GET`, `POST` | `/cockpit/api/llms/providers` | List providers, or create one. Optional `token` is write-only |
| `PATCH` | `/cockpit/api/llms/providers/:providerKey` | Update. A blank token keeps the stored secret |
| `POST` | `/cockpit/api/llms/providers/:providerKey/disable` | Disable the provider. The stored token stays |
| `GET`, `POST` | `/cockpit/api/llms/bindings` | List instances and flows, or create a pinned instance |
| `PATCH` | `/cockpit/api/llms/bindings/:id` | Update an instance. Omitted fields stay |
| `POST` | `/cockpit/api/llms/bindings/:id/disable` | Disable the instance. The row stays |
| `POST` | `/cockpit/api/flows/:slug/start` | Start a registered flow |

## Also routed

These exist and use the same session auth. They are operational screens more than a stable integration surface: work items, pull requests, logs, runtime heatmap, agent hook stats, job liveness, deliverables health, permission health, classifiers stats, domains, brands, skill families, skills dispatch, org structure, related work, campaign members, Cursor Cloud session proxy, voice session, and c-suite tallies.

Integrations under `/cockpit/api/integrations` connect or revoke a provider and store optional Cursor and log-drain settings. Treat provider secrets as server-side only.

Voice routes (`/cockpit/api/voice/session`, `transcribe`, `tts`) need `XAI_API_KEY` on the server. They no-op in practice when the key is absent.

<!-- The route list was taken from the route modules' exported methods. Request bodies are not fully specified here. -->
