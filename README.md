# chytr-site

Public site for chytr (chytr.ai). Next.js 14, static.

- `/docs` — product docs, rendered from `content/docs/` (markdown + `_nav.json`).
- `/` — placeholder that redirects to `/docs` until the landing page ships.

## Docs sync

Docs are authored in the private wiki repo (`docs/public/cockpit/`). Port them with:

```bash
npm run sync:docs -- /path/to/cb-wiki-2
npm run check:docs
```

The sync renames Cockpit → chytr and `/docs/cockpit` → `/docs`, skips the `self-host`
section (preview-only), regenerates `public/docs/llms*.txt`, and **fails if any private data
(UUID, email, internal hostname, project ref, task id, key) survives**. Lowercase `cockpit`
inside API paths (`/cockpit/api/...`), MCP tool names, and scopes is the real wire format and
is intentionally left as-is.

No login. Do not edit `content/docs/` by hand; fix the source and re-sync.
