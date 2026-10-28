#!/usr/bin/env node
/**
 * Sync public docs from a cb-wiki-2 checkout into this site.
 *
 *   node scripts/sync-docs-from-wiki.mjs [/path/to/cb-wiki-2]
 *
 * Source: <wiki>/docs/public/cockpit/
 * Writes ONLY content/docs/** and public/docs/llms*.txt.
 * Applies the rename (Cockpit -> chytr, /docs/cockpit -> /docs), skips the
 * self-host section (preview-only, not published yet), and fails the sync if
 * any private data survives the transform. Never writes landing-page files.
 */
import { cp, mkdir, readFile, readdir, rm, stat, writeFile, access } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { findPrivateData, renameText, transformNav } from "./lib/docs-transform.mjs"

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DEST = path.join(SITE_ROOT, "content", "docs")
const DEST_PUBLIC = path.join(SITE_ROOT, "public", "docs")
const WIKI_ROOT =
  process.argv[2] || process.env.CB_WIKI_REPO_PATH || path.resolve(SITE_ROOT, "..", "cb-wiki-2")
const SRC = path.join(WIKI_ROOT, "docs", "public", "cockpit")
const SKIP_SECTIONS = new Set(["self-host"])
const SKIP_FILES = new Set(["README.md", "llms.txt", "llms-full.txt"])

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

async function main() {
  await access(path.join(SRC, "_nav.json")).catch(() => {
    throw new Error(`missing source: ${SRC}/_nav.json`)
  })

  await rm(DEST, { recursive: true, force: true })
  await mkdir(DEST, { recursive: true })

  const problems = []
  const written = []
  for (const file of await walk(SRC)) {
    const rel = path.relative(SRC, file)
    const [top] = rel.split(path.sep)
    if (SKIP_SECTIONS.has(top) || SKIP_FILES.has(path.basename(rel))) continue
    let text = await readFile(file, "utf8")
    text = path.basename(rel) === "_nav.json" ? transformNav(text) : renameText(text)
    for (const hit of findPrivateData(text)) problems.push(`${rel}: ${hit.name} "${hit.match}"`)
    const dest = path.join(DEST, rel)
    await mkdir(path.dirname(dest), { recursive: true })
    await writeFile(dest, text, "utf8")
    written.push(rel)
  }

  // Agent indexes: regenerate from the published pages rather than copy the wiki's
  // (those list self-host-adjacent and cloudbeast.io URLs).
  await mkdir(DEST_PUBLIC, { recursive: true })
  const nav = JSON.parse(await readFile(path.join(DEST, "_nav.json"), "utf8"))
  const index = ["# chytr docs", ""]
  const full = []
  for (const section of [...nav.sections].sort((a, b) => a.order - b.order)) {
    index.push(`## ${section.title}`, "")
    for (const page of [...section.pages].sort((a, b) => a.order - b.order)) {
      if (page.status !== "published" || page.unlisted) continue
      const body = await readFile(path.join(DEST, section.id, `${page.slug}.md`), "utf8")
      const url = `https://chytr.ai/docs/${section.id}/${page.slug}`
      index.push(`- [${page.title}](${url})`)
      full.push(`# source: ${url}\n\n${body.replace(/^---[\s\S]*?---\n/, "").trim()}\n`)
    }
    index.push("")
  }
  await writeFile(path.join(DEST_PUBLIC, "llms.txt"), index.join("\n"), "utf8")
  await writeFile(path.join(DEST_PUBLIC, "llms-full.txt"), full.join("\n"), "utf8")
  for (const f of ["llms.txt", "llms-full.txt"]) {
    for (const hit of findPrivateData(await readFile(path.join(DEST_PUBLIC, f), "utf8"))) {
      problems.push(`public/docs/${f}: ${hit.name} "${hit.match}"`)
    }
  }

  if (problems.length) {
    console.error("private data survived the scrub:\n" + problems.join("\n"))
    process.exit(1)
  }
  console.log(`synced ${written.length} files → content/docs, public/docs/llms*.txt (self-host skipped)`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
