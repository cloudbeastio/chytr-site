---
title: Requirements
description: What a self-hosted chytr install expects before you create a project.
keywords: self-host, postgres, node, supabase
section: self-host
order: 1
status: published
unlisted: false
---

# Requirements

> **Preview.** Self-hosting chytr is not yet verified on a clean stack. `supabase/config.toml` ships placeholders (`project_id = "your-project-ref"`, a placeholder `site_url`, example redirect URLs) that you replace with your own project's values. The baseline still refers to a fixed placeholder owner id in some functions (see [Database and Edge Functions](/docs/self-host/database)), and `public.bootstrap_owner` claims a fresh install for its first owner. This page describes the intended flow. Do not treat it as a supported install.

You bring the database and the app host. chytr does not ship as a managed service.

The database ships as one migration, `supabase/migrations/00000000000000_baseline.sql`: a schema-only baseline with reference rows and no operator data.

## Runtime

| Piece | Requirement |
|---|---|
| Node.js | 22 or newer, for the repo tooling and for `apps/cockpit` |
| Package manager | npm |
| App host | Any Node 22 host. On Vercel, set the project root to `apps/cockpit` |
| Database | Your own Supabase project, Postgres 17 (`major_version` in `supabase/config.toml`). A local `supabase start` runs 17.12 |
| CLI | Supabase CLI, for `link`, `db push`, and `functions deploy` |
| Local stack | Docker, only if you run `supabase start` on a machine |

Clone this repository to get `apps/cockpit` and `supabase/`. No public clone URL is published with this preview.

## Extensions the migrations enable

These are the extensions migrations actually `CREATE`:

- `pgcrypto`
- `uuid-ossp`
- `vector`
- `pg_trgm`
- `pgmq`
- `pg_net`
- `pg_cron`
- `hstore`

`pgflow` is not a Postgres extension. Migrations create a `pgflow` schema and load SQL into it. Do not look for `CREATE EXTENSION pgflow`.

Not yet verified on a fresh project: that a new hosted Supabase project allows every extension above without a support request. Check that `pgmq`, `pg_cron`, `pg_net`, and `vector` are available on your plan before you run `db push`.

## What you do not get

A self-host starts as your project. You do not receive another operator's accounts, mail, meetings, or approval history. `supabase/seed.sql` is intentionally empty, so a local `supabase start` or `supabase db reset` gives the same empty install as `db push`. Read [Database and Edge Functions](/docs/self-host/database) before you run it.

## Config uses placeholders

`supabase/config.toml` ships with `project_id = "your-project-ref"`, a placeholder `site_url`, and example redirect URLs (`https://chytr.example.com/login`, plus `127.0.0.1:3000` and `localhost:3000` for local runs). Link the CLI at your own ref when you reach the database step, and replace the example origin with yours.

Not yet verified: the minimum Supabase credentials a new operator needs. Expect to need the project's database password for `supabase link` and `db push`, and a Supabase access token for the CLI. Use your own project's values and keep them out of the repo.
