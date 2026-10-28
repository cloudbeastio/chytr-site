---
title: Pull requests
description: Open pull requests next to the tasks they close, and the check-in that links them.
keywords: pull requests, github, merge, check-in, tasks, work items
section: features
order: 19
status: published
unlisted: false
---

# Pull requests

## What it does

Pull requests show which change is still open, so a finished task is not left attached to a branch nobody merged.

Open **PRs** (`/pull-requests`). The board lists pull requests and can check one in against a task. Connecting GitHub is what makes the list real. That connection lives on [Integrations](/docs/features/integrations).

When an agent finishes a task with `task_request_close` and `human_approval_to_close` is false, a linked pull request that is open with green checks can be merged as a merge commit as part of that close. A close-gated task waits for a person, and approving its close card merges the linked pull requests before the task closes. The close rule is on [Tasks](/docs/features/tasks). Merge rules, branches, and labels are on [GitHub](/docs/features/github).

The screen only calls the session API. There is no MCP tool whose name is pull request.

## MCP tools

No pull-request tool is in the MCP catalog. The agent path that touches a linked pull request is `task_request_close` (`tasks:write`). Pass `pr_url` when you want that close to consider the linked request. The tool merges only when the task is not close-gated, the request is open, checks are green, and GitHub is connected. Otherwise it reports why and leaves the request unmerged.

`work_set_session` records the repo and branch on the lease. It does not open a pull request.

## HTTP endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/pull-requests` | List for this screen |
| `POST` | `/cockpit/api/pull-requests` | Record a pull request |
| `POST` | `/cockpit/api/pull-requests/check-in` | Attach the request to the open task it closes |
| `GET` | `/cockpit/api/work-items` | Leases shown next to the requests |

Task merge state is also on `GET` and `POST /cockpit/api/tasks/:id/merge-gate`.

## Permissions

The screen uses the signed-in session. `task_request_close` needs `tasks:write` from one permission-set layer. GitHub access is the workspace integration, not a scope on the token.

Row access is RLS by creator. Admins see all rows. Members see their own. See [What a member can see](/docs/features/users#what-a-member-can-see).

## Agent example

Call `task_request_close` with the task and the pull request URL. Do not call a merge tool. There isn't one.

```json
{
  "tool": "task_request_close",
  "arguments": {
    "task_ids": ["task-1"],
    "pr_url": "https://github.com/example/app/pull/18",
    "note": "Scope doc matches the branch."
  }
}
```

Expected result when the task is not close-gated and the request is open with green checks: `ok` true, the request merged as a merge commit, and the task `done`. When the task is close-gated, the task stays open and a close card is pending. When checks are red, nothing merges and the result says why.

```json
{
  "ok": true,
  "status": "done"
}
```
