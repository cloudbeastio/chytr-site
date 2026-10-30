---
title: Classifiers
description: Create and edit classification flows and their pinned question sets, and read usage.
keywords: classifiers, flows, question sets, gates, confidence, choice, score, bool
section: features
order: 28
status: published
unlisted: false
---

# Classifiers

## What it does

Classifiers are named flows with a pinned question set. Each question has a closed answer space: choice, score, or yes/no. A decision returns those typed answers plus a confidence and a gate. It does not parse free text at the act layer.

Open **Classifiers** (`/settings/classifiers`). You can create a flow, edit its description and enabled flag, save a new question-set version, and pin a version. Question sets are content-hashed. Saving an edit writes the next version instead of rewriting the old one. Usage (runs, gate mix, confidence, cost) stays on the same page and does not change a flow.

**Archive a flow.** Each flow has an **Archive** button in its row and in its open drawer. A confirmation names the flow first. Archiving forces the flow disabled, so it stops running, and hides it from the list. Runs, answers, and question-set versions stay. Tick **Show archived** to see archived flows, then **Restore** one. A restored flow comes back disabled; enable it yourself. An archived flow cannot be edited until it is restored. Only the flow's owner or an admin can archive or restore. Anyone else gets a permission error. A flow with no owner (seeded) is admin only.

Thresholds and per-gate actions stay on [Decision flows](/docs/features/decision-flows). The audit of what already ran is [Decisions](/docs/features/decisions).

The screen only calls the classifier routes. Agents use the same RPCs through the tools below.

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `classifier_flows_list` | `classifiers:read` | List flows and question-set versions. `can_edit` is true when the caller may write |
| `classifier_flow_get` | `classifiers:read` | Read one flow by `flow_key` |
| `classifier_flow_create` | `classifiers:write` | Create a flow and its first pinned question set. New flows start disabled |
| `classifier_flow_update` | `classifiers:write` | Edit description, enabled, act policy, or the act allow list. An archived flow returns an error until restored |
| `classifier_flow_archive` | `classifiers:write` | Archive (soft delete) a flow, or restore it with `archived: false`. Owner or admin only |
| `classifier_question_set_create` | `classifiers:write` | Append a version. `pin: true` points the flow at it. The same content returns the existing version |
| `classifier_question_set_pin` | `classifiers:write` | Pin a version that already belongs to the flow |

`bool` in a question is stored as `noul`. `choice` needs 2 to 24 choices. `score` defaults to 0..1.

Agent PATs carry these scopes on the token. A signed-in app session uses the user's permission set instead. An admin set in the app can edit without a separate classifiers scope. That bypass does not apply to a PAT.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/classifiers/stats` | Per-flow usage. Any signed-in session. Does not change a flow |
| `GET`, `POST` | `/cockpit/api/classifiers/flows` | List (`?include_archived=true` adds archived flows), or create `{ flow_key, description, questions }` |
| `GET`, `PATCH` | `/cockpit/api/classifiers/flows/:flowKey` | Read, or edit metadata |
| `POST`, `DELETE` | `/cockpit/api/classifiers/flows/:flowKey/archive` | Archive, or restore. Owner or admin only |
| `POST` | `/cockpit/api/classifiers/flows/:flowKey/question-sets` | Append a version. Body `{ questions, pin? }` |
| `POST` | `/cockpit/api/classifiers/flows/:flowKey/question-sets/:id/pin` | Pin that version |

`POST` create returns 201. A missing permission returns 403. An unknown flow returns 404. A duplicate `flow_key` returns 409. Editing an archived flow returns 409. A question that is not choice, score, or bool returns 400.

The stats response is `{ "ok": true, "flows": [ ... ] }`. Each flow includes gate counts (`auto`, `hold`, `escalate`, `blocked_by_rule`), confidence buckets, and cost or token fields when they were stored. An empty list means no scored runs yet, not a broken page.

## Permissions

List and read need `classifiers:read` (or `classifiers:write`). Create, update, and pin need `classifiers:write`. On a chytr session, an admin permission set in the app may do both. Grant the scopes on a permission set for anyone else. PAT callers need the scope on the token. Usage stats use the signed-in session and do not check these scopes.

Row access for recorded decisions stays RLS by creator. Admins see all rows. Members see their own.

## Agent example

Call `classifier_flow_create` with a closed question set.

```json
{
  "tool": "classifier_flow_create",
  "arguments": {
    "flow_key": "demo.route",
    "description": "Route a note to a desk.",
    "enabled": false,
    "questions": {
      "desk": {
        "type": "choice",
        "choices": ["sales", "delivery"]
      },
      "is_customer": {
        "type": "bool"
      }
    }
  }
}
```

Expected result: a disabled flow, one question-set version, and `is_customer` stored as `noul`. `classifier_question_set_create` with `pin` true adds the next version and points the flow at it. The same questions again do not add a version.

```json
{
  "ok": true,
  "can_edit": true,
  "flow": {
    "flow_key": "demo.route",
    "enabled": false
  }
}
```
