# chytr-site

Public site for chytr (chytr.ai). Next.js, static.

- `/` is the landing page.
- `/docs` is the product and self-host documentation, rendered from `content/docs/` (markdown plus `_nav.json`).

## Docs sync

Docs are authored in the private source repo under `docs/public/cockpit/`, the same tree the
chytr export ships as `docs/cockpit/`. Port them with:

```bash
npm run sync:docs -- /path/to/source-repo
npm run check:docs
```

The sync:

- renames Cockpit to chytr and `/docs/cockpit` to `/docs`;
- publishes the `self-host` install section, which the source keeps as draft (this site is where
  people read it);
- regenerates `public/docs/llms*.txt`;
- fails if any private data (UUID, email, internal hostname, project ref, task id, key) survives.

Lowercase `cockpit` inside API paths (`/cockpit/api/...`), MCP tool names, and scopes is the real
wire format and is intentionally left as-is.

No login. Do not edit `content/docs/` by hand; fix the source and re-sync.

## License wording

chytr is source-available under the Functional Source License (FSL-1.1-ALv2); each release becomes
Apache 2.0 after two years. Use that exact sentence wherever the site describes the license, and no
other licensing label.
