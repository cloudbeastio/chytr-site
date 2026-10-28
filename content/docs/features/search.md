---
title: Search
description: Name search in the top bar versus semantic search over indexed text.
keywords: search, global search, rag, hybrid search, chat, entity match
section: features
order: 42
status: published
unlisted: false
---

# Search

## What it does

Search answers two different questions: who has this name, and what did we write about them.

chytr has two searches. They answer different questions.

## Top bar

The shell search calls `GET /cockpit/api/global-search`. After two characters it returns name matches, up to five per group:

- tasks, by title
- accounts, by name
- contacts, by full name
- deals, by name

A short id (`T…` for a task, `W…` for a work item) resolves through `GET /cockpit/api/short-id` when the query matches that pattern. Results open the record. This path is a scoped `ilike` lookup. It does not embed the query and it does not search mail bodies.

`GET /cockpit/api/records/search` and `GET /cockpit/api/accounts/search` are the same style of lookup for pickers inside the app.

## Semantic search

Indexed text (activities and entity notes that passed the quality gate) is embedded with `gte-small` at 384 dimensions and stored in `rag_chunks`. Query time combines keyword search and vector search, then fuses the lists.

You use that index from:

- `/chat`, the knowledge-graph chat
- the approval deck's card chat
- MCP `search`, `rag_search`, and `entity_context_query` (scope `rag:read`)

`search` is the one to call from an agent. It routes the question, then runs the hybrid query. Optional filters are `domain_name`, `deal_name`, and `project_name`. Results are limited to the token's owner and team.

`rag_search` is the lower-level hybrid call: `query`, `match_count`, optional `source_tables`, and a time window. `entity_match_search` resolves a person, company, or campaign name to candidates. It does not merge them. `entity_search_diag` explains a name that did not resolve. `entity_context_query` builds a pack for one entity: the card, scoped chunks, and optional tasks and notes.

Digest and noise activities are not indexed. A record you cannot find in chat may still show up in the top bar if its name matches.

## What search will not do

Name search will not invent a link between a person and an account. Matching a first name is not a merge. Create and merge stay on approval cards. See [Approvals](/docs/features/approvals).

## MCP tools

| Tool | Scope | Role |
|---|---|---|
| `search` | `rag:read` | Scoped hybrid search. This is the one to call |
| `rag_search` | `rag:read` | Lower-level hybrid call |
| `entity_match_search` | `rag:read` | Name to candidates. Does not merge |
| `entity_search_diag` | `rag:read` | Why a name did not resolve |
| `entity_context_query` | `rag:read` | Card, scoped chunks, optional tasks and notes |

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/global-search` | Top-bar name search. Query `q`, after two characters |
| `GET` | `/cockpit/api/short-id` | Resolve a short id when the query matches that pattern |
| `GET` | `/cockpit/api/records/search` | Picker lookup |
| `GET` | `/cockpit/api/accounts/search` | Account picker lookup |

Chat on `/chat` and the deck card chat call the semantic index from the session. They are not a third search engine.

## Permissions

Semantic tools need `rag:read` from one permission-set layer. Results are limited to the token's owner and team. The top bar uses the signed-in session.

Row access is RLS by creator. Admins see all rows. Members see their own. Name search does not bypass that.

## Agent example

Call `search` with the question you would type. Add a dimension filter only when you already know it.

```json
{
  "tool": "search",
  "arguments": {
    "query": "what did we agree about rollout scope",
    "match_count": 5
  }
}
```

Expected result: fused keyword and vector hits from indexed text the token may see. Digest and noise activities are absent. A name that exists only as a CRM row, with no indexed text, can still appear in `GET /cockpit/api/global-search` and be missing here.

```json
{
  "ok": true,
  "matches": [
    {
      "summary": "Scoped the rollout to one region."
    }
  ]
}
```

