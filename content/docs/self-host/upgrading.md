---
title: Upgrading
description: Intended upgrade order for the database, Edge Functions, and the app.
keywords: upgrading, migrations, release
section: self-host
order: 5
status: published
unlisted: false
---

# Upgrading

> **Preview.** Self-hosting chytr is not yet verified on a clean stack. `supabase/config.toml` ships placeholders (`project_id = "your-project-ref"`, a placeholder `site_url`, example redirect URLs) that you replace with your own project's values. The baseline still refers to a fixed placeholder owner id in some functions (see [Database and Edge Functions](/docs/self-host/database)), and `public.bootstrap_owner` claims a fresh install for its first owner. This page describes the intended flow. Do not treat it as a supported install.

The app and the database version together. Migrate the database before you deploy a newer app. An app build can call RPCs that the previous schema does not have.

## Intended order

1. Read the release notes. Stop if a migration is marked destructive.
2. Take a backup, or a point-in-time snapshot from your host. `supabase db dump` writes the schema only, so dump data and roles too:

   ```bash
   supabase db dump -f schema.sql
   supabase db dump --data-only -f data.sql
   supabase db dump --role-only -f roles.sql
   ```
3. Check out the release you intend to run.
4. `supabase db push`. Only new filenames apply. Order is the filename. The tracker is `supabase_migrations.schema_migrations`.
5. `supabase functions deploy`.
6. Deploy `apps/cockpit`.
7. Sign in and open `/tasks`.

There is no tagged release yet, so there is no version to pin. Until one exists, update to the revision you intend to run and do not assume a tag name. Skipping versions should work because migrations are cumulative and only new filenames apply, but that has not been rehearsed.

## Rules that match the repo

- Migrations are forward-only. There is no down migration. Rolling back means restoring the backup and deploying the previous app build.
- Do not edit a migration that has already been applied.
- If `db push` reports drift between `schema_migrations` and the files on disk, stop. Compare the applied versions to `supabase/migrations` before you repair anything. Do not paper over drift with dashboard DDL.
- Function secrets are not overwritten by deploy. A release that needs a new secret has to say so. This preview does not yet have that release-note channel.
- New personal-access-token scopes are not added to tokens you already issued. Re-issue tokens after an upgrade that adds scopes.

Not yet rehearsed: restoring from a backup and redeploying the previous app build. The three dump commands were run on a local stack. A restore from their output was not.

## What an upgrade does not fix

Upgrading does not remove the fixed operator id inside older migrations. Those files have already run on any database that applied them. A later migration would have to rewrite the rows on purpose. No such migration is documented here because it does not exist.

