---
title: LLMs
description: Named model instances and provider credentials. chytr edits the registry. Edge workers call the provider.
keywords: llms, providers, model bindings, vault, pinned model, kill switch
section: features
order: 27
status: published
unlisted: false
---

# LLMs

## What it does

LLMs is the registry of named model instances and the providers they call. Each instance pins a model id on a provider for one flow and one role (`primary`, `shadow`, or `escalation`). A swap is an edit of that row. You do not deploy code to change the model.

Open **LLMs** (`/settings/llms`). The screen has two parts:

- **Providers** — a key, an `https` endpoint, an enabled flag, and an optional API token. The token is written to Vault. The screen never shows it again. `has_vault` is true when a token is stored.
- **Named instances** — instance name, flow, role, provider, pinned model id, a JSON params object, and an enabled flag.

This app does not call the provider. Edge workers resolve the instance and pull the key. Uncheck **Enabled**, or use Disable, to stop that path. The stored token stays.

A blank token on edit keeps the stored secret. A new provider can be saved with no token; edge hops then have no key until you paste one.

One instance per flow and role. To point the same flow at a different pinned model, edit the existing row. Floating aliases such as `latest` are rejected.

Provider API tokens are not agent personal access tokens. Issue agent tokens under **API Keys**. Register webhook runtimes under **Agents**.

## MCP tools

List tools need `decisions:read`. Create, update, and disable need `decisions:write`. The database still requires the token's user to be a workspace owner or admin, so the scope alone cannot rotate a key.

| Tool | Scope | Role |
|---|---|---|
| `llm_provider_list` | `decisions:read` | Providers. `has_vault` only |
| `llm_provider_create` | `decisions:write` | Create. Optional token goes to Vault |
| `llm_provider_update` | `decisions:write` | Update. Blank token keeps the secret |
| `llm_provider_disable` | `decisions:write` | Kill switch. Secret stays |
| `llm_binding_list` | `decisions:read` | Instances plus flow options |
| `llm_binding_create` | `decisions:write` | Create a pinned instance |
| `llm_binding_update` | `decisions:write` | Update by id. Omitted fields stay |
| `llm_binding_disable` | `decisions:write` | Kill switch. Row stays |

Re-enable with `llm_provider_update` or `llm_binding_update` and `enabled: true`.

## HTTP endpoints

Session routes. Same rules as the screen: no Vault id, no raw token, in the response.

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/llms/providers` | List providers |
| `POST` | `/cockpit/api/llms/providers` | Create. Optional `token` |
| `PATCH` | `/cockpit/api/llms/providers/:providerKey` | Update. Blank `token` keeps the secret |
| `POST` | `/cockpit/api/llms/providers/:providerKey/disable` | Disable |
| `GET` | `/cockpit/api/llms/bindings` | Instances and flows |
| `POST` | `/cockpit/api/llms/bindings` | Create. `modelId` must be pinned |
| `PATCH` | `/cockpit/api/llms/bindings/:id` | Update |
| `POST` | `/cockpit/api/llms/bindings/:id/disable` | Disable |

A provider response looks like `{ "ok": true, "provider": { "provider_key": "example-provider", "endpoint_url": "https://api.example.com/v1", "enabled": false, "has_vault": true } }`.

## Permissions

The signed-in user must be a workspace owner or admin. Members get a refusal from the registry calls.

MCP uses the existing decision scopes, not a separate key system:

- `decisions:read` — list providers and instances
- `decisions:write` — create, update, disable

The token user must also be an owner or admin. An agent personal access token is not a provider API token. Do not paste an agent token into the provider token field.

There is no route that returns the stored provider secret to the browser or to MCP.

## Agent example

Create a provider with a placeholder token, then a pinned instance. `enabled` stays false until you mean to use it.

```json
{
  "name": "llm_provider_create",
  "arguments": {
    "provider_key": "example-provider",
    "endpoint_url": "https://api.example.com/v1",
    "enabled": false,
    "token": "paste-provider-token"
  }
}
```

Expected result: the provider row, `has_vault` true, and no token field.

```json
{
  "ok": true,
  "provider": {
    "provider_key": "example-provider",
    "endpoint_url": "https://api.example.com/v1",
    "enabled": false,
    "has_vault": true
  }
}
```

```json
{
  "name": "llm_binding_create",
  "arguments": {
    "instance_name": "example-classify",
    "flow_key": "activity.quality",
    "role": "primary",
    "provider_key": "example-provider",
    "model_id": "claude-sonnet-5",
    "params": {},
    "enabled": false
  }
}
```

Expected result: one binding. A second `primary` on the same flow is refused. Edit the first row to change the pinned model id. `llm_binding_disable` with `{ "id": "binding-id" }` turns that row off and leaves it in the list.
