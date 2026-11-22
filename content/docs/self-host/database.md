---
title: Database and Edge Functions
description: Intended commands to apply migrations and deploy Edge Functions on your project.
keywords: database, migrations, edge functions, postgres
section: self-host
order: 2
status: published
unlisted: false
---

# Database and Edge Functions

> **Preview.** Self-hosting chytr is not yet verified on a clean stack. `supabase/config.toml` ships placeholders (`project_id = "your-project-ref"`, a placeholder `site_url`, example redirect URLs) that you replace with your own project's values. The baseline still refers to a fixed placeholder owner id in some functions (see [Database and Edge Functions](/docs/self-host/database)), and `public.bootstrap_owner` claims a fresh install for its first owner. This page describes the intended flow. Do not treat it as a supported install.

Apply the database before you deploy the app. The app calls RPCs that the migrations define.

## Link your project

From the repo root, point the CLI at the project you created. `supabase/config.toml` ships the placeholder `project_id = "your-project-ref"`; replace it with your project ref, or leave it and link explicitly:

```bash
supabase link --project-ref <your-project-ref>
```

Always pass `--project-ref` with your own ref. Before you push anything, check which project the CLI is linked to (`supabase projects list` marks the linked one). Linking on a fresh project has not yet been rehearsed end to end.

## Apply migrations

```bash
supabase db push
```

The CLI applies `supabase/migrations` in filename order and records them in `supabase_migrations.schema_migrations`. Today that is one file, `00000000000000_baseline.sql`. A second `db push` reports `Local database is up to date` (or the remote equivalent). Do not edit a migration after it has been applied. Do not run dashboard DDL as a substitute.

The baseline needs the extensions listed in [Requirements](/docs/self-host/requirements). A local `supabase start` provides all of them.

### Known issue: placeholder owner id

The baseline contains no real user id, but about 40 functions and 12 column defaults still refer to a fixed placeholder owner id instead of `app_settings.owner_user_id`. On a fresh install this shows up as:

- **New project** in chytr does not create the project. It creates a pending `project_create` approval, and approving it creates another pending approval instead of the project. The project gate exempts only the placeholder id, not your owner.
- Creating a project fails outright until the `projects_creation_gate` actor exists in `ops.agent_actors`. The baseline ships that table empty.

Until these are fixed in the baseline, a fresh install cannot create its first project from the UI. There is no supported workaround in this preview.

This section will be removed when a release fixes the baseline.

`db push` does not run `supabase/seed.sql`. `supabase db reset` does, but the shipped seed is empty, so either path gives an empty install. Neither path creates a user. See [First user](/docs/self-host/first-user).

## Edge Functions

Sign-in and the task board use Supabase Auth and PostgREST RPCs. They do not require an Edge Function. You deploy functions when you turn on the features that call them. 29 functions ship in this export.

> The agent heartbeat and dispatch functions (`ops-heartbeat`, `ops-dispatch`), the X, Instagram, and TikTok publishers and their MCP servers, the Notion marketing bridge, the analytics drain, and the chytr log ingest do not ship. Do not expect them to exist on your project.

### Authentication

Every function runs with `verify_jwt = false` in `supabase/config.toml`, so the Supabase gateway does not check a JWT. Each function authenticates its own callers. Deploy with `--no-verify-jwt` as well, so the setting holds even if a config block is missing:

```bash
supabase functions deploy <name> --no-verify-jwt
```

`functions deploy` needs a linked project. Without `supabase link` it stops with `Cannot find project ref. Have you run supabase link?`.

The auth modes in the table below are:

- **Service key.** `Authorization: Bearer <service key>`, compared in constant time against `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY` on projects that use the new key format). Only a bearer equal to that key is accepted. A hand-written token with a `service_role` claim is not.
- **Cron secret.** An `x-cron-secret` header, checked by calling the service-role-only RPC `edge_cron_secret_verify` against a value stored in Vault. Pg_cron and trigger calls send it. Functions that accept it also accept the service key.
- **Admin user.** A signed-in user JWT whose `user_profiles.is_admin` is true. Only some functions accept it, in addition to the machine modes.
- **User JWT.** A signed-in user, validated with `auth.getUser`.
- **PAT or OAuth.** A personal access token or an OAuth token for an MCP client.
- **HMAC.** A GitHub webhook signature.

A call that fails every mode gets a 401.

### Function reference

| Function | What it does | Kind | Auth | Secrets and config it reads |
|---|---|---|---|---|
| `mcp` | The MCP server: tools for tasks, approvals, entities, search, files, and more | User-facing | PAT or OAuth | `MCP_RESOURCE_URL`, `MCP_PUBLIC_ORIGIN`, `MCP_AUTH_SERVER`, `COCKPIT_APP_URL`, `CHYTR_URL`, `CHYTR_API_KEY` (optional, best-effort) |
| `auth-pages` | Serves the sign-in, token, account, integrations, and MCP consent pages | User-facing | Public HTML; the pages call Supabase Auth | `AUTH_PAGES_HTML`, `PUBLIC_BASE_URL`, `SUPPORT_EMAIL` |
| `auth-token` | Password and email-code sign-in for the auth pages | User-facing | Public endpoint, validates credentials | none beyond platform keys |
| `auth-pat` | Creates and manages personal access tokens | User-facing | User JWT | `AUTH_ALLOWED_ORIGINS` |
| `oauth-integrations` | Provider connect for Google, GitHub, and X: start, callback, complete, disconnect | User-facing | User JWT; the provider callback is a bounce only | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `X_OAUTH_CLIENT_ID`, `X_OAUTH_CLIENT_SECRET`, `INTEGRATIONS_OAUTH_STATE_SECRET`, `OAUTH_INTEGRATIONS_REDIRECT_URI`, `OAUTH_UI_RETURN_ORIGINS`, `COCKPIT_ORIGIN`, `GOOGLE_OAUTH_SCOPES`, `X_OAUTH_SCOPES`, `GITHUB_OAUTH_SCOPES` |
| `cockpit-api` | chytr reads, notification resolve, and redirect info | User-facing | User JWT (OAuth client tokens are rejected) | platform keys |
| `search` | Semantic search over the RAG index | User-facing | User JWT (OAuth client tokens are rejected) | platform keys |
| `task-close-gate` | Checks linked pull requests, merges them, and closes a task | User-facing | User JWT | GitHub App values below |
| `github-repo-status` | Refreshes the cached repo, pull request, and branch state; archive action | User-facing and worker | User JWT, or cron secret or service key for reconcile. Archive needs a user JWT | `GITHUB_ORG`, GitHub App values below |
| `github-webhook` | Receives GitHub App webhooks to keep the pull request cache current | Webhook | HMAC (`X-Hub-Signature-256`) | `GITHUB_WEBHOOK_SECRET` |
| `voice-pages` | Serves the voice agent page | User-facing | Public HTML | `AUTH_PAGES_HTML` |
| `voice-token` | Mints a short-lived PAT and an xAI client secret for the voice page | User-facing | User JWT | `XAI_API_KEY`, `XAI_SKILL_COLLECTION_ID` |
| `record-update` | chytr entity edits that write to a GitHub wiki repository and mirror to Postgres | User-facing | User JWT | GitHub OAuth values, `GITHUB_ORG` |
| `agent-bus` | HTTP facade for the agent message bus | Worker or client | Cron secret or service key. Reads and ack also accept an admin user | platform keys |
| `cb-activity-classifier` | Labels activities with a quality class and work type | Worker | Cron secret or service key | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `CB_ROUTINES_REPO`, `CB_ROUTINES_REF`, `CB_ROUTINES_SKILL_BASE_URL` |
| `cb-activity-process` | Per-activity processing: links, merge proposals, signals | Worker | Cron secret or service key | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `CB_ROUTINES_REPO`, `CB_ROUTINES_REF`, `CB_ROUTINES_SKILL_BASE_URL` |
| `decision-worker` | Drains the decision job queue | Worker | Cron secret or service key | `ANTHROPIC_API_KEY` |
| `enrichment-worker` | Drains the enrichment queue: link, enrich, web enrich, sentiment, scorecard | Worker | Cron secret or service key | `EXA_API_KEY`, `ENRICHMENT_WORKER_BATCH`, `CB_SCORECARD_ENABLED` |
| `extraction-route` | Runs extraction for one activity, called by a database trigger | Worker | Cron secret or service key | platform keys |
| `icp-scoring-worker` | Re-scores accounts against the active ICP version | Worker | Cron secret or service key | `XAI_API_KEY` |
| `ingestion-worker` | Drains the Gmail and Calendar ingestion queue | Worker | Cron secret or service key | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `INGESTION_WORKER_BATCH` |
| `google-sync` | Hourly poll that enqueues Gmail and Calendar ingestion per connection | Worker | Cron secret or service key | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` |
| `notion-sync` | Readiness-gated poll of a Notion meeting-notes database | Worker | Cron secret, service key, or admin user | `NOTION_INTEGRATION_TOKEN`, `NOTION_MEETING_NOTES_DB_ID`, `MEETING_POLL_DRY_RUN`, `MEETING_POLL_DISPATCH`, `MEETING_POLL_SETTLE_MINUTES`, `MEETING_POLL_MAX_DISPATCH` |
| `rag-worker` | Chunks and embeds content into the RAG index | Worker | Cron secret or service key | `RAG_WORKER_BATCH` |
| `skill-sync` | Uploads skill markdown to an xAI collection | Worker | Cron secret or service key | `XAI_API_KEY`, `XAI_MANAGEMENT_API_KEY`, `XAI_SKILL_COLLECTION_ID`, `SKILL_SYNC_BATCH` |
| `pgflow-step-worker` | Executes workflow step tasks | Worker | Cron secret or service key | platform keys |
| `backfill-orchestrator` | Manual backfill of ingestion processing and embeddings | Operator | Service key | platform keys |
| `search-maintenance` | Daily, weekly, and monthly search index maintenance | Worker | Service key only | platform keys |
| `entity-extractor` | Retired. A no-op stub that returns `{"ok":true,"retired":true}` | None | Service key | none |

Platform keys are `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_SECRET_KEY`. Supabase injects them into every function. You do not set them.

Notes on specific functions:

- **`record-update`** reads a wiki entity file from a GitHub repository with the signed-in user's GitHub OAuth token, patches it, commits it, and mirrors the change into Postgres. The repository name is fixed in code and the owner comes from `GITHUB_ORG`. A standalone install has no such repository, so do not deploy this function unless you maintain a repository with that layout. chytr does not need it to load.
- **`cb-activity-classifier` and `cb-activity-process`** fetch their prompt text as markdown from a GitHub repository at run time. A 404 or a network failure falls back to a bundled copy for known prompts. Set `CB_ROUTINES_SKILL_BASE_URL` to host the files yourself. Check this behavior on your project before trusting it.
- **`notion-sync`** defaults to a dry run that writes nothing, and it never dispatches work unless you ask. See Notion below.
- **`entity-extractor`** does nothing. Deploying it is harmless and unnecessary.

### What to deploy

A working install with sign-in, the task board, and agents over MCP needs these:

```bash
supabase functions deploy mcp auth-pages auth-token auth-pat cockpit-api --no-verify-jwt
```

Add the group for each feature you turn on:

| Feature | Functions |
|---|---|
| Search embeddings | `rag-worker`, `search` |
| Mail and calendar | `oauth-integrations`, `google-sync`, `ingestion-worker`, `cb-activity-classifier`, `cb-activity-process`, `decision-worker`, `enrichment-worker`, `extraction-route` |
| Provider connect in Settings | `oauth-integrations` |
| GitHub pull request tracking and task close | `github-webhook`, `github-repo-status`, `task-close-gate` |
| Notion meeting notes | `notion-sync` |
| Voice | `voice-pages`, `voice-token`, `skill-sync` |
| Workflows | `pgflow-step-worker` |
| ICP scoring | `icp-scoring-worker` |
| Agent message bus | `agent-bus` |
| Operator tools | `backfill-orchestrator`, `search-maintenance` |

Deploy functions by name rather than all at once. `supabase/config.toml` still contains blocks for functions that do not ship, and a full `supabase functions deploy` has not been run against a clean project.

### How workers are scheduled

The export ships no scheduled jobs. The baseline installs the queues, the worker-side database functions, and the helper `util.invoke_edge_function`, but it neutralizes every `cron.schedule` call. Until you schedule them, the worker functions only run when you call them.

Two mechanisms drive the workers:

- **Queue drains.** Database functions such as `util.process_rag_jobs`, `util.process_ingestion_jobs`, and `util.process_enrichment_jobs` read a pgmq queue and call the matching Edge Function through `util.invoke_edge_function`. In the original deployment they ran every 10 to 15 seconds under pg_cron.
- **Direct ticks.** pg_cron calls `util.invoke_edge_function('<name>', '<json body>'::jsonb)` on a cadence. For example, `google-sync` ran hourly.

`util.invoke_edge_function` posts to `<project url>/functions/v1/<name>` with `net.http_post`. It builds the URL from a Vault secret named `project_url`, and it sends the cron secret in `x-cron-secret`. Both values live in Vault:

| Vault secret name | Purpose |
|---|---|
| `project_url` | Base URL of your project, `https://<your-project-ref>.supabase.co`, no trailing slash |
| `edge_cron_secret` | Random value of at least 32 characters. `util.invoke_edge_function` sends it, and `edge_cron_secret_verify` compares it |

The migrations that created `edge_cron_secret` mint a random value if none exists. Whether the shipped baseline creates either secret is not verified, so check `select name from vault.secrets` after `db push`. To create a missing one, use the Vault function the migrations use:

```sql
select vault.create_secret('<random value, 32+ characters>', 'edge_cron_secret', 'x-cron-secret for Edge Functions');
select vault.create_secret('https://<your-project-ref>.supabase.co', 'project_url');
```

You never set the cron secret as an Edge Function secret. It is a database-side value. Each function asks the database whether the header matches, and keeps a positive answer in memory for five minutes. If the database is unreachable or the secret is missing, the function returns 401. A rotated value takes effect after the cache expires.

To schedule a worker, call `cron.schedule` yourself. For example, an hourly Google poll:

```sql
select cron.schedule(
  'google-sync-poll',
  '0 * * * *',
  $$select util.invoke_edge_function('google-sync', '[]'::jsonb, 180000);$$
);
```

There is no supported schedule list yet for the activity classifier, activity processor, decision worker, ICP scoring worker, or pgflow step worker. This release ships no cron jobs for them. Until a schedule is published, run them on demand or pick your own cadence and watch the Queues and Logs screens.

Some of these workers also read a `routine_config` row by name and skip with `reason: disabled` if it is missing or disabled. Check that the rows you need exist before you schedule a routine worker.

### Secrets

Set function secrets with `supabase secrets set NAME=<value>`. Never commit a value.

Most provider secrets can also be stored in the app. The LLMs and Integrations screens write them for a user or for the workspace, and Vault holds the stored value. A function resolves a secret in this order: the signed-in user's value, the workspace value, the legacy Vault store, then the environment variable named below. An error in that lookup falls back to the environment. The Supabase platform keys are never resolved this way. They stay in the environment.

| Name | Used by | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | `cb-activity-classifier`, `cb-activity-process`, `decision-worker` | Required for the activity pipeline |
| `ANTHROPIC_MODEL` | `cb-activity-classifier`, `cb-activity-process` | Optional. Overrides the model |
| `XAI_API_KEY` | `voice-token`, `skill-sync`, `icp-scoring-worker` | Optional. Voice, skill sync, ICP scoring |
| `XAI_MANAGEMENT_API_KEY` | `skill-sync` | Optional |
| `XAI_SKILL_COLLECTION_ID` | `voice-token`, `skill-sync` | Optional. Plain env var only |
| `EXA_API_KEY` | `enrichment-worker` | Optional. Web enrichment |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | `oauth-integrations`, `google-sync`, `ingestion-worker` | Required for Google |
| `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET` | `oauth-integrations`, `record-update` | Optional. Per-user GitHub connect |
| `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY` | `github-repo-status`, `task-close-gate` | Optional. GitHub App |
| `GITHUB_WEBHOOK_SECRET` | `github-webhook` | Required if you deploy the webhook |
| `GITHUB_ORG` | GitHub functions | Optional config. Owner for repository lookups |
| `X_OAUTH_CLIENT_ID`, `X_OAUTH_CLIENT_SECRET` | `oauth-integrations` | Optional. See the X note below |
| `INTEGRATIONS_OAUTH_STATE_SECRET` | `oauth-integrations` | Required for any provider connect. Signs the OAuth state |
| `NOTION_INTEGRATION_TOKEN` (alias `NOTION_INTERNAL_TOKEN`) | `notion-sync` | Required for Notion |
| `NOTION_MEETING_NOTES_DB_ID` | `notion-sync` | Optional. Overrides the database id |
| `OAUTH_INTEGRATIONS_REDIRECT_URI` | `oauth-integrations` | Optional. Overrides the callback URL |
| `OAUTH_UI_RETURN_ORIGINS` | `oauth-integrations` | Optional. Extra allowed chytr origins, comma separated |
| `COCKPIT_ORIGIN` | `oauth-integrations` | Set this to your chytr origin. The default points at the original deployment |
| `COCKPIT_APP_URL` | `mcp` and shared links | Optional. Origin for chytr deep links. Falls back to `MCP_PUBLIC_ORIGIN` |
| `MCP_RESOURCE_URL`, `MCP_PUBLIC_ORIGIN`, `MCP_AUTH_SERVER` | `mcp` | Optional. Public URLs advertised to MCP clients |
| `AUTH_ALLOWED_ORIGINS` | `auth-pat`, `auth-token`, `voice-token` | Optional. CORS origins, comma separated |
| `AUTH_PAGES_HTML` | `auth-pages`, `voice-pages` | Optional. Set `true` with a custom domain to serve `text/html` |
| `PUBLIC_BASE_URL`, `SUPPORT_EMAIL` | `auth-pages` | Optional. Shown on the pages |
| `CB_ROUTINES_REPO`, `CB_ROUTINES_REF`, `CB_ROUTINES_SKILL_BASE_URL` | `cb-activity-classifier`, `cb-activity-process` | Optional. Where prompt markdown is fetched from |
| `CB_SCORECARD_ENABLED` | `enrichment-worker` | Optional. `true` turns on scorecard jobs |
| `RAG_WORKER_BATCH`, `INGESTION_WORKER_BATCH`, `ENRICHMENT_WORKER_BATCH`, `SKILL_SYNC_BATCH` | the matching worker | Optional. Batch sizes, capped at 50 |
| `MEETING_POLL_DRY_RUN`, `MEETING_POLL_DISPATCH`, `MEETING_POLL_SETTLE_MINUTES`, `MEETING_POLL_MAX_DISPATCH` | `notion-sync` | Optional. Poll behavior |
| `GOOGLE_OAUTH_SCOPES`, `X_OAUTH_SCOPES`, `GITHUB_OAUTH_SCOPES` | `oauth-integrations` | Optional. Override the default scopes |

chytr loads without any of the optional ones. The related screens stay idle.

## Integrations (optional)

Each integration is off until you configure it. Set a value either as a function secret or on the Integrations screen.

### Google (Gmail and Calendar)

1. In Google Cloud, create an OAuth client of type Web application. Enable the Gmail API, the Google Calendar API, and the Drive API.
2. Add the redirect URI. It is the `oauth-integrations` function URL, `https://<your-project-ref>.supabase.co/functions/v1/oauth-integrations`, unless you set `OAUTH_INTEGRATIONS_REDIRECT_URI`, in which case use that value exactly.
3. Set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`, plus `INTEGRATIONS_OAUTH_STATE_SECRET` (any long random string).
4. Set `COCKPIT_ORIGIN` to your chytr origin, or add it to `OAUTH_UI_RETURN_ORIGINS`. The connect flow only returns to an allowed origin.
5. Deploy `oauth-integrations`, then `google-sync`, `ingestion-worker`, and the processing workers. Schedule them as described above.
6. Connect from Settings. The default scopes are `openid`, `email`, `profile`, and read-only access to Gmail, Calendar, and Drive. Set `GOOGLE_OAUTH_SCOPES` to narrow them.

### GitHub App and webhook

The GitHub App keeps the pull request cache current and powers task close.

1. Create a GitHub App and install it on the organization or account that owns your repositories.
2. Set `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, and `GITHUB_APP_PRIVATE_KEY`. Set `GITHUB_ORG` to the owner name.
3. Set the app's webhook URL to `https://<your-project-ref>.supabase.co/functions/v1/github-webhook` and choose a webhook secret. Set the same value as `GITHUB_WEBHOOK_SECRET`. The function verifies the `X-Hub-Signature-256` HMAC and rejects a call without it.
4. Deploy `github-webhook`, `github-repo-status`, and `task-close-gate`.

### GitHub OAuth (per-user connect)

Create a GitHub OAuth App. Set its callback URL to the same `oauth-integrations` URL as for Google. Set `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET`. The default scopes are `repo` and `read:user`. Set `GITHUB_OAUTH_SCOPES` to change them.

### Notion

1. Create an internal integration in Notion and copy its token into `NOTION_INTEGRATION_TOKEN`.
2. Share your meeting-notes database with the integration.
3. Set `NOTION_MEETING_NOTES_DB_ID` to that database's id. Without it the function uses a default id from the original deployment.
4. Deploy `notion-sync`.

The poll defaults to a dry run that writes nothing and dispatches nothing. A request body of `{"dry_run": false}` or the `MEETING_POLL_DRY_RUN=false` variable turns writes on. Dispatching a note to an agent is a separate switch, `dispatch` or `MEETING_POLL_DISPATCH`. The agent dispatch functions do not ship, so leave dispatch off.

### xAI voice

Deploy `voice-pages` and `voice-token`. Set `XAI_API_KEY`. Set `XAI_SKILL_COLLECTION_ID` if you use an xAI skill collection. `skill-sync` also needs `XAI_MANAGEMENT_API_KEY`. `voice-token` mints a short-lived token with read-mostly scopes for the voice page.

### LLM providers

Set `ANTHROPIC_API_KEY` for the activity pipeline, or enter the key on the LLMs screen. Set `XAI_API_KEY` if you use xAI routes. `EXA_API_KEY` enables web enrichment.

### X

The X connect flow in `oauth-integrations` exists and needs `X_OAUTH_CLIENT_ID` and `X_OAUTH_CLIENT_SECRET`. No X publisher ships in this release, so connecting an account does not post anything.

### chytr log drain

The chytr log drain is not included. Its ingest function does not ship.
