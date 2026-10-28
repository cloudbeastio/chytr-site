---
title: GitHub
description: How pull requests link to tasks, how a close merges them, and what a failed merge means.
keywords: github, pull requests, merge, merge commit, base branch, routine, merge gate, chytr
section: features
order: 20
status: published
unlisted: false
---

# GitHub

## What it does

chytr keeps each task next to its pull request. A task does not close while its change sits unmerged.

Connect GitHub once on [Integrations](/docs/features/integrations). After that, chytr reads pull requests and their check results, links them to tasks, and can merge them when a task closes. Connecting GitHub does not create users and does not grant MCP scopes.

## How a pull request links to a task

A pull request is linked to a task in any of these ways:

- An agent passes `pr_url` to `task_request_close`. The tool records the link before it looks at the task.
- A person pastes the pull request URL when moving a task to **Review** in the task drawer.
- A work item registers the pull request (`work_register_pr`, or the `prs` list on clock-out). The task picks it up through its work item.

Linking is idempotent. The same pull request on the same task is one link, however many ways it arrived.

## See a task's pull requests and checks

- **Task drawer.** Shows the linked pull request for the task with an **Open PR** link.
- **Pull requests view** (`/pull-requests`). Lists pull requests across the connected repositories. Filter by state (open, ready, merged, closed, all) and repository. The list is a cache that chytr refreshes from GitHub, so it can lag GitHub by a short while. The cache holds no check results, so **ready** here means open and not a draft. It does not mean checks are green.
- **Check status for one task.** Check results are not shown on either screen. `GET /cockpit/api/tasks/:id/merge-gate` re-reads every linked pull request and its checks from GitHub right now and reports, per pull request, whether it is merged, ready, or blocked and why. It never merges anything.

For a merge, a pull request is **ready** only when it is open, not a draft, has no conflicts, and every check on its latest commit is green.

## Closing a task merges its pull requests

Which path runs depends on the task's `human_approval_to_close` flag.

| Task | Who closes | What happens |
|---|---|---|
| Not close-gated | The assignee, with `task_request_close` | If the linked pull request is ready, it is merged and the task goes straight to `done`. No close card is created. If it is not ready, nothing merges, the task stays open, and the result says why. With no pull request, the task closes straight to `done`. |
| Close-gated | A person, on the close card | `task_request_close` moves the task to `review` and opens a close card in [Approvals](/docs/features/approvals). **Approving the card merges the linked pull requests, then closes the task.** Clicking **Close** on the board does the same. |

For a close-gated task, the person's approve or Close click is the authorization. The merge is not skipped and not automatic before that click.

### Merge commit only, all or nothing

- Every merge is a **merge commit**. chytr never squashes, so each change keeps its own history.
- A task with more than one pull request is **all or nothing** at the check stage. chytr re-checks every linked pull request first. If any one is not already merged and not ready, the whole close is refused and nothing is merged.
- Only after every pull request is merged does the task close.

## Base branches and labels

chytr merges into the base branch the pull request targets. It never squashes.

If your team uses labels such as `routine` for auto-merge, apply them only from automated pipelines, never to feature pull requests. A close-gated task asks for human review, so its pull request should not carry an auto-merge label.

## When a merge fails

A refused close returns HTTP **409** with a reason. The task is not closed, and no close card is resolved. The 409's reason is `close_gated`, `prs_not_ready` or `merge_failed`; each blocking PR in `blocking[]` carries one of the reasons below.

| Reason | What to do |
|---|---|
| `draft` | Mark the pull request ready for review. |
| `conflicting` | Resolve the conflict or branch-protection requirement, then retry. This also covers GitHub's `blocked` state, such as a missing required review. |
| `close_flip_failed` | HTTP **500**, not 409: the merge succeeded but the task did not flip to `done`. Retry the close; the merged pull request is seen as merged. |
| `checks_red` | Fix or wait for the failing checks, then retry. |
| `no_checks` | No checks have reported on the head commit. Wait for CI to start, then retry. |
| `pr_fetch_failed_<status>` | chytr could not read the pull request from GitHub; the suffix is the HTTP status. Check access, then retry. |
| `no_head_sha` | GitHub returned no head commit for the pull request. Retry in a moment. |
| `merge_response_not_merged` | GitHub answered the merge call but did not report the pull request as merged. Check it on GitHub, then retry. |
| `close_gated` | The task needs human approval to close. Use the Approvals or Close button. |
| `prs_not_ready` | One or more linked pull requests are not ready. The detail lists each one's reason. |
| `merge_failed` | The merge did not complete. The detail carries the cause. |
| `mergeability_pending` | GitHub is still computing. Retry in a moment. chytr does not raise a callout for this. |
| `not_open` | The pull request was closed without merging. Reopen it or link the right one. |
| `merge_rejected` | GitHub refused the merge. The detail carries GitHub's message. |
| `github_app_unavailable` | GitHub is not connected, or its access failed. Reconnect on Integrations. |

If a merge fails partway through a task with several pull requests, the ones already merged stay merged. A retry sees them as merged and continues.

A close-gated task keeps its close card **pending** after a failure, so the card is the record that someone tried. For a task that is not close-gated, chytr also raises a notification for a non-transient block, at most once every six hours per task.

## MCP tools

No tool is named for GitHub. The tool that reaches a pull request is `task_request_close` (`tasks:write`), described on [Tasks](/docs/features/tasks). Pass `pr_url` to link and merge in the same call.

## HTTP endpoints

All of these use the signed-in session. A personal access token cannot call them.

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/tasks/:id/merge-gate` | Read-only: merge readiness of every linked pull request |
| `POST` | `/cockpit/api/tasks/:id/merge-gate` | Retry the merge and close. Honors the close gate unless `respect_close_gate` is false |
| `POST` | `/cockpit/api/tasks/:id/complete` | Complete a task that is not close-gated, merging ready pull requests first |
| `POST` | `/cockpit/api/tasks/:id/close` | Close-gated close from the board. Merges, then closes |
| `POST` | `/cockpit/api/approvals/:id/close-approve` | Approve a close card. Merges, then closes. Refuses with 409 if any pull request of a task is not ready. All-or-nothing applies per task: a card covering several tasks runs them in sequence, so an earlier task may already be merged and closed when a later one fails |

### The merge-gate endpoint

`GET /cockpit/api/tasks/:id/merge-gate` returns the task's close-gate flag and one entry per pull request.

```json
{
  "ok": true,
  "task": { "status": "doing", "human_approval_to_close": true },
  "prs": [
    {
      "repo": "example/app",
      "number": 18,
      "merged": false,
      "ready": false,
      "reason": "checks_red",
      "checks": [{ "name": "build", "status": "completed", "conclusion": "failure" }]
    }
  ]
}
```

`POST` to the same path runs the merge and close. A close-gated task refuses it with `close_gated` unless the caller passes `respect_close_gate: false`, which the Approvals and Close buttons do because the person's click is the approval.

## Set up, repository, and revoke

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/integrations` | Connection status, without stored secrets |
| `POST` | `/cockpit/api/integrations/connect` | Start the GitHub connect. Body `{ "provider": "github" }`. Returns an `authorize_url` |
| `POST` | `/cockpit/api/integrations/revoke` | Disconnect. Body `{ "connectionId": "..." }`. Merging stops until you reconnect |
| `POST` | `/cockpit/api/pull-requests/check-in` | Queue a task to check in one repository. Body `{ "repo": "owner/name" }`. Repeating it returns the open task instead of making another |
| `GET` | `/cockpit/api/pull-requests` | The pull request and branch list for the Pull requests view |

Revoking stops later reads and merges. Rows already imported, and pull requests already merged, stay.

## Chytr log drain

The log drain forwards agent session logs to an external viewer. It is separate from merging. Setup lives on [Integrations](/docs/features/integrations).

| Method | Path | Role |
|---|---|---|
| `GET` | `/cockpit/api/integrations/chytr` | Drain status, without secrets |
| `POST` | `/cockpit/api/integrations/chytr` | Save the base URL and keys, or turn the drain on or off |
| `POST` | `/cockpit/api/integrations/chytr/test` | Check that the stored key reaches the drain |
| `POST` | `/cockpit/api/integrations/chytr/backfill` | Ask the drain to push a page of history. Optional `batch_size`, `max_batches`, `repo`, `reset` |

## Permissions

Connecting, revoking, and the endpoints above use the signed-in session. Closing through an agent needs `tasks:write`. GitHub access is the workspace connection, not a scope on a token. Row access follows RLS: admins see all rows, members see their own.

## Agent example

Call `task_request_close` with the pull request URL. There is no merge tool.

```json
{
  "tool": "task_request_close",
  "arguments": {
    "task_ids": ["task-1"],
    "pr_url": "https://github.com/example/app/pull/18",
    "note": "Docs match the branch."
  }
}
```

Expected result, task not close-gated and the pull request ready: the pull request merges as a merge commit and the task is `done`. If the task is close-gated, the task moves to `review` and a close card waits for a person. If checks are red, nothing merges and the result gives the reason.

```json
{
  "ok": true,
  "status": "done"
}
```
