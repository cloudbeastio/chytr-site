---
title: App and environment
description: Environment variables and the intended chytr app build.
keywords: app, environment, session, next
section: self-host
order: 3
status: published
unlisted: false
---

# App and environment

> **Preview.** Self-hosting chytr is not verified on a clean stack. Migrations still contain a fixed operator user, the Supabase config is pinned to one project, and there is no owner bootstrap. This page describes the intended flow. Do not treat it as a supported install.

The app lives in `apps/cockpit`. It is a Next.js app. The browser talks to `/cockpit/api` on the same host. That API uses the signed-in user's Supabase session.

## Variables

Copy `apps/cockpit/.env.example` to `.env.local` for a local run. On a host, set the same keys in the host's environment. Never commit values.

| Variable | Where it is read | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Yes. Your project URL, `https://<your-project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Yes. The anon or publishable key only |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes for invites, ingest, and other privileged routes. Never expose it to the client bundle |
| `MCP_RESOURCE_URL` | Server | Optional. Defaults to this host's `/api/mcp` |
| `MCP_AUTH_SERVER` | Server | Optional. Defaults to `<SUPABASE_URL>/auth/v1` |
| `ANTHROPIC_API_KEY` | Server | Optional. Deck chat and graph chat |
| `XAI_API_KEY` | Server | Optional. Voice routes |
| `NEXT_PUBLIC_WIKI_GITHUB_BASE` | Client | Optional. Base URL for wiki links. Leave empty if you have no wiki |
| `COCKPIT_HOME` | Server | Optional. Overrides the authenticated redirect from `/` |
| `COCKPIT_APP_URL` | Server | Origin of this app, no path. Invite links redirect to `<origin>/login`. `NEXT_PUBLIC_SITE_URL` and `APP_URL` are accepted aliases. Never set it to the Supabase API host |
| `COCKPIT_ALLOWED_HOSTS` | Server | Optional. Comma-separated hostnames, no scheme. When no app URL variable is set, the invite redirect may use the request's own origin, but only if its host is listed here. Set it to your chytr hostname if you rely on that fallback |
| `NEXT_PUBLIC_SITE_URL`, `APP_URL` | Server | Optional aliases for `COCKPIT_APP_URL`, checked in that order after it |
| `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_BRANCH_URL`, `VERCEL_URL`, `VERCEL_ENV` | Server | Set by Vercel. The invite redirect falls back to them when no app URL variable is set. You do not set them yourself |

`apps/cockpit/.env.example` lists every variable above that you set yourself, with empty values. `MCP_PUBLIC_ORIGIN` is read by the `mcp` Edge Function, not by the app. Set it as a function secret. See [Database and Edge Functions](/docs/self-host/database).

The service-role key bypasses row security. The app uses it only on routes that already checked a workspace owner or admin, plus the ingest route, which accepts only a personal access token holding the `agent_logs:write` scope instead of a user session. Treat the key as production secret material.

## Build

Intended local commands:

```bash
cd apps/cockpit
npm install
npm run build
npm run start
```

On Vercel, set the root directory to `apps/cockpit` and set the variables above in the project environment.

`npm run build` reads `.env.local`, and the client inlines the `NEXT_PUBLIC_*` values at build time, so set them before you build. `npm run start` serves on port 3000.

### Build status of the export

Earlier preview exports failed `npm run build` for two packaging reasons: the docs copy step looked only in `docs/public/cockpit`, and one line of `components/settings/KnowledgeSettings.tsx` was broken by the export scrub. The copy step now also reads `docs/cockpit`, the layout this tree uses (`apps/cockpit/lib/copyCockpitDocs.ts`), and that line now exports as plain text. A full build of a fresh export has not been re-run since those fixes. If the build fails, report it as described in `SECURITY.md` or `CONTRIBUTING.md`.

## Auth URLs

Set `COCKPIT_APP_URL` to the chytr origin, for example `https://chytr.example.com`. Invites redirect to `https://chytr.example.com/login`.

In Supabase Auth, add that `/login` URL to **Redirect URLs**. **Site URL** stays the API host that serves the OAuth consent page. It is not the chytr origin. The invite email href must be `{{ .ConfirmationURL }}`, which carries the allowlisted redirect. Do not use `{{ .SiteURL }}` as the href.

## Sign-in email must carry the code

The login form signs people in with a 6-digit code. Supabase's default **Magic Link** email contains only a link, and that link does not sign anyone in to chytr. Edit the Magic Link email template so it includes the code:

```html
<p>Your chytr sign-in code: {{ .Token }}</p>
```

On a hosted project, edit **Authentication → Emails → Magic Link**. On a local stack, point `config.toml` at a template file and restart with `supabase stop` and `supabase start`:

```toml
[auth.email.template.magic_link]
subject = "Your chytr sign-in code"
content_path = "./supabase/templates/magic_link.html"
```

MCP OAuth consent is a different URL. `supabase/config.toml` points the OAuth server authorization path at the `auth-pages` Edge Function, not at chytr `/login`.

Do not copy `site_url` or the redirect list from the committed `supabase/config.toml`; they describe another deployment. In your project's Auth URL settings, set the Site URL to your app's public origin and add `<your-app-origin>/login` to the redirect allowlist. The exact dashboard click-path has not been rechecked against the current Supabase UI.

## Sign-in form

The login page is email plus a one-time code. The email field starts empty.
