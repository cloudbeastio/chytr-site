---
title: First user
description: How the first owner is supposed to be created, and what is still missing.
keywords: first user, owner, invite, sign in
section: self-host
order: 4
status: published
unlisted: false
---

# First user

> **Preview.** Self-hosting chytr is not yet verified on a clean stack. `supabase/config.toml` ships placeholders (`project_id = "your-project-ref"`, a placeholder `site_url`, example redirect URLs) that you replace with your own project's values. The baseline still refers to a fixed placeholder owner id in some functions (see [Database and Edge Functions](/docs/self-host/database)), and `public.bootstrap_owner` claims a fresh install for its first owner. This page describes the intended flow. Do not treat it as a supported install.

The login form will not create your user. `shouldCreateUser` is false. You create the user first, then sign in with a one-time code.

## Intended steps

1. In the Supabase dashboard, add a user with a confirmed email, or create one with the Auth admin API:

   ```bash
   curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -H 'content-type: application/json' \
     -d '{"email":"<your-email>","email_confirm":true}'
   ```

2. Set the site URL and redirect allowlist to your chytr origin, and add the code to the Magic Link email. See [App and environment](/docs/self-host/app).
3. Make that user the owner by running `select public.bootstrap_owner('<your-email>')` as the service role (see below).
4. Open `/login`, enter the email, enter the 6-digit code from the email, and land on `/tasks`.

The Supabase dashboard click-path for adding a user and for the redirect allowlist has not been rechecked against the current dashboard. Use the Auth admin API call above if the dashboard differs, and look for the redirect URL settings under your project's Auth configuration.

## The owner setting

The baseline ships `public.bootstrap_owner(p_email text)`. It is the one-shot claim of an empty install. Run it once, after you create the auth user, with the service role (the SQL editor in the Supabase dashboard runs as a role that can do this, or connect as `service_role`):

```sql
select public.bootstrap_owner('<your-email>');
```

Or call it over the API with the service-role key:

```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/bootstrap_owner" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H 'content-type: application/json' \
  -d '{"p_email":"<your-email>"}'
```

It returns the owner's `user_id`, `workspace_id`, `workspace_role: owner` and `is_admin: true`. The same call with the anon key fails with `permission denied for function bootstrap_owner`.

It looks up the existing auth user by email and, in one transaction:

1. sets `app_settings.owner_user_id` to that user's id;
2. sets `user_profiles.is_admin = true`;
3. grants the admin permission set;
4. makes the user the `owner` of the install workspace.

A second call, from anyone, raises `owner already set`. `anon`, `authenticated` and `PUBLIC` cannot execute the function; only `service_role` (and the database owner) can, so nobody who can merely sign up can claim the install first. The baseline contains no real user id and no operator rows.

## Admin versus owner

`public.is_admin()` reads `user_profiles.is_admin`. `bootstrap_owner` sets that flag for the first owner. Some writes, including extraction thresholds, call `is_admin()`. Workspace membership roles (`owner`, `admin`, `member`) are a separate table, and the users screen can invite people only after an owner or admin membership already exists.

In the app, the check is workspace membership, not `is_admin`. Every `/settings/*` screen, and the whole Admin navigation group (integrations, API keys, users, permission sets, domains, approval types, health, meeting pipeline, notifications), is open only to a user with an active `owner` or `admin` membership. Anyone else is redirected to `/`. `is_admin()` is checked by the database on specific writes, for example job control and activity edits. `bootstrap_owner` sets both, so the first owner passes both checks. A member who has `is_admin` set but no owner or admin membership would still be turned away from Settings.

## What a finished install should prove

After `bootstrap_owner` has run, the check is:

1. `/login` returns a page.
2. The one-time code signs the new user in.
3. `/tasks` renders a board.
4. Creating a task shows that task on the board, owned by the signed-in user.

A new task needs a project and a domain. A fresh install has neither.

### Known issue: the first task cannot be created

On a local clean-stack rehearsal, steps 1 to 3 pass. Step 4 does not:

- **New project** does not create a project on a fresh install. See the known issue in [Database and Edge Functions](/docs/self-host/database).
- **New task** fails with `task_create: invalid domain: shared`, because the baseline ships `public.domains` empty.

This page stays unpublished until both are fixed in the baseline.

Re-run the four-step check once the baseline ships domains and owner-aware project creation. Until then this known issue stands.
