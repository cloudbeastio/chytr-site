/**
 * Rename + private-data scrub for the public docs port (T0002962).
 * Source docs are written for "Cockpit" under /docs/cockpit. This site publishes
 * them as "chytr" under /docs. Order matters: URLs first, then the product name.
 */

const RENAMES = [
  // Site paths: /docs/cockpit/x -> /docs/x
  [/\]\(https:\/\/cloudbeast\.io\/docs\/cockpit(?=[/)#])/g, "](https://chytr.ai/docs"],
  [/https:\/\/cloudbeast\.io\/docs\/cockpit/g, "https://chytr.ai/docs"],
  [/\/docs\/cockpit(?=[/)#`\s"']|$)/g, "/docs"],
  // Example hostnames
  [/cockpit\.example\.com/g, "chytr.example.com"],
  // Product name
  [/\bCockpit\b/g, "chytr"],
  [/\bCOCKPIT\b/g, "CHYTR"],
]

/** Anything matching these must never reach the public site. */
export const PRIVATE_PATTERNS = [
  { name: "uuid", re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
  { name: "email", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { name: "supabase-project-ref", re: /\b(?:oxouemuxadqcpkjzfatz|jxavpigmekqcinvabpzq)\b/g },
  { name: "internal-hostname", re: /\b(?:main\.cloudbeast\.io|[a-z0-9-]+\.supabase\.co)\b/gi },
  { name: "private-task-id", re: /\b[TW]\d{7}\b/g },
  { name: "jwt-or-key", re: /\b(?:eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|sb_secret_[A-Za-z0-9_-]+|sk-[A-Za-z0-9]{20,})/g },
  { name: "wiki-repo", re: /\bcb-wiki-2\b/g },
]

export function renameText(text) {
  let out = text
  for (const [re, to] of RENAMES) out = out.replace(re, to)
  return out
}

export function findPrivateData(text) {
  const hits = []
  for (const { name, re } of PRIVATE_PATTERNS) {
    for (const m of text.matchAll(re)) hits.push({ name, match: m[0] })
  }
  return hits
}

/**
 * Sections the source keeps as preview (draft/unlisted) but this site publishes.
 * The self-host install pages ship in the repo export; chytr.ai is where people read them.
 */
export const SITE_PUBLISHED_SECTIONS = new Set(["self-host"])

/** Nav JSON: retarget basePath and publish the site-published sections. */
export function transformNav(raw) {
  const nav = JSON.parse(raw)
  nav.product = "chytr"
  nav.basePath = "/docs"
  for (const section of nav.sections) {
    if (!SITE_PUBLISHED_SECTIONS.has(section.id)) continue
    for (const page of section.pages) {
      page.status = "published"
      page.unlisted = false
    }
  }
  return JSON.stringify(nav, null, 2) + "\n"
}

/** Page frontmatter: publish a page that belongs to a site-published section. */
export function publishFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text)
  if (!m) return text
  const fm = m[1]
    .replace(/^status:.*$/m, "status: published")
    .replace(/^unlisted:.*$/m, "unlisted: false")
  return `---\n${fm}\n---\n` + text.slice(m[0].length)
}
