import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { SITE_URL } from "@/lib/site"

const DOCS_ROOT = path.join(process.cwd(), "content", "docs")
const BASE_PATH = "/docs"
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Verbatim from content/docs/getting-started/overview.md. */
export const DOCS_LEDE = [
  "chytr is the control plane for a workspace where agents do the work and people decide. Agents propose records, drafts, and task changes. A person approves or rejects those proposals. The database keeps the decision.",
  "Cloudbeast.io LLC publishes chytr for technical operators and builders. There is no managed service in this version. You run it yourself: a Next.js app on top of your own Supabase project (Postgres, Auth, and Edge Functions). Feature behavior is the same on every install. There are no edition splits.",
] as const

export const DOCS_INDEX_DESCRIPTION =
  "chytr docs. There is no managed service in this version. You run it yourself: a Next.js app on top of your own Supabase project (Postgres, Auth, and Edge Functions)."

type DocStatus = "draft" | "published"

type NavPage = {
  slug: string
  title: string
  order: number
  status: DocStatus
  unlisted: boolean
}

type NavSection = {
  id: string
  title: string
  order: number
  pages: NavPage[]
}

type NavFile = {
  product: string
  basePath: string
  sections: NavSection[]
}

export type ListedNavPage = {
  slug: string
  title: string
  href: string
  description: string
}

export type ListedNavSection = {
  id: string
  title: string
  pages: ListedNavPage[]
}

export type SidebarNavPage = {
  slug: string
  title: string
  href: string
  listed: boolean
}

export type SidebarNavSection = {
  id: string
  title: string
  /** Every page in the section is draft or unlisted. Names stay visible, with no links. */
  comingSoon: boolean
  pages: SidebarNavPage[]
}

export type Doc = {
  section: string
  slug: string
  title: string
  description: string
  status: DocStatus
  unlisted: boolean
  listed: boolean
  href: string
  content: string
}

function isSlug(value: string): boolean {
  return SLUG_RE.test(value)
}

/** HTML comments are builder notes. They are not page copy. */
function stripHtmlComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

function asStatus(value: unknown): DocStatus {
  return value === "published" ? "published" : "draft"
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function readNav(): NavFile {
  const raw = fs.readFileSync(path.join(DOCS_ROOT, "_nav.json"), "utf8")
  const parsed = JSON.parse(raw) as NavFile
  if (!parsed || !Array.isArray(parsed.sections)) {
    throw new Error("docs _nav.json has no sections")
  }
  return parsed
}

function findNavPage(section: string, slug: string): NavPage | null {
  const nav = readNav()
  const sectionEntry = nav.sections.find((item) => item.id === section)
  if (!sectionEntry) return null
  return sectionEntry.pages.find((page) => page.slug === slug) ?? null
}

function docFilePath(section: string, slug: string): string | null {
  if (!isSlug(section) || !isSlug(slug)) return null
  const root = path.resolve(DOCS_ROOT)
  const file = path.resolve(root, section, `${slug}.md`)
  if (file !== path.join(root, section, `${slug}.md`)) return null
  if (!file.startsWith(root + path.sep)) return null
  return file
}

export function getDoc(section: string, slug: string): Doc | null {
  const file = docFilePath(section, slug)
  if (!file) return null
  let raw: string
  try {
    raw = fs.readFileSync(file, "utf8")
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === "ENOENT") return null
    console.error("[docs] read failed", section, slug, err)
    return null
  }

  let parsed: matter.GrayMatterFile<string>
  try {
    parsed = matter(raw)
  } catch (err) {
    console.error("[docs] frontmatter failed", section, slug, err)
    return null
  }

  const data = parsed.data ?? {}
  const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : slug
  const description =
    typeof data.description === "string" && data.description.trim()
      ? data.description.trim()
      : title
  const status = asStatus(data.status)
  const unlisted = asBool(data.unlisted, true)
  const navPage = findNavPage(section, slug)
  const navListed = Boolean(navPage && navPage.status === "published" && navPage.unlisted === false)
  const fileListed = status === "published" && unlisted === false
  if (
    navPage &&
    (navPage.status !== status || navPage.unlisted !== unlisted || navPage.title !== title)
  ) {
    console.warn("[docs] nav/frontmatter mismatch", section, slug)
  }

  return {
    section,
    slug,
    title,
    description,
    status,
    unlisted,
    listed: navListed && fileListed,
    href: `${BASE_PATH}/${section}/${slug}`,
    content: stripHtmlComments(parsed.content),
  }
}

function listDocFiles(): { section: string; slug: string }[] {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(DOCS_ROOT, { withFileTypes: true })
  } catch (err) {
    console.error("[docs] list failed", err)
    return []
  }
  const out: { section: string; slug: string }[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || !isSlug(entry.name)) continue
    let files: string[]
    try {
      files = fs.readdirSync(path.join(DOCS_ROOT, entry.name))
    } catch (err) {
      console.error("[docs] section list failed", entry.name, err)
      continue
    }
    for (const file of files) {
      if (!file.endsWith(".md")) continue
      const slug = file.slice(0, -3)
      if (!isSlug(slug)) continue
      out.push({ section: entry.name, slug })
    }
  }
  return out
}

export function allDocParams(): { section: string; slug: string }[] {
  return listDocFiles().filter((item) => getDoc(item.section, item.slug)?.listed)
}

function navSectionsInOrder(): NavSection[] {
  return [...readNav().sections].sort((a, b) => a.order - b.order)
}

/** Sidebar source. Every _nav.json section and page, sorted by `order`. */
export function getSidebarNav(): SidebarNavSection[] {
  const out: SidebarNavSection[] = []
  for (const section of navSectionsInOrder()) {
    const pages = [...section.pages].sort((a, b) => a.order - b.order)
    const items: SidebarNavPage[] = pages.map((page) => {
      const doc = getDoc(section.id, page.slug)
      return {
        slug: page.slug,
        title: page.title,
        href: `${BASE_PATH}/${section.id}/${page.slug}`,
        listed: Boolean(doc?.listed),
      }
    })
    if (items.length === 0) continue
    out.push({
      id: section.id,
      title: section.title,
      comingSoon: items.every((page) => !page.listed),
      pages: items,
    })
  }
  return out
}

export function getListedNav(): ListedNavSection[] {
  const out: ListedNavSection[] = []
  for (const section of navSectionsInOrder()) {
    const pages = [...section.pages].sort((a, b) => a.order - b.order)
    const listed: ListedNavPage[] = []
    for (const page of pages) {
      const doc = getDoc(section.id, page.slug)
      if (!doc?.listed) continue
      listed.push({
        slug: page.slug,
        title: page.title,
        href: doc.href,
        description: doc.description,
      })
    }
    if (listed.length > 0) {
      out.push({ id: section.id, title: section.title, pages: listed })
    }
  }
  return out
}

export function listedDocPaths(): string[] {
  try {
    const pages = getListedNav().flatMap((section) => section.pages.map((page) => page.href))
    return [BASE_PATH, ...pages]
  } catch (err) {
    console.error("[docs] listed paths failed", err)
    return []
  }
}

export function renderIndexMarkdown(): string {
  const lines: string[] = ["# chytr docs", ""]
  for (const paragraph of DOCS_LEDE) {
    lines.push(paragraph, "")
  }
  for (const section of getListedNav()) {
    lines.push(`## ${section.title}`, "")
    for (const page of section.pages) {
      lines.push(`- [${page.title}](${SITE_URL}${page.href}) — ${page.description}`)
    }
    lines.push("")
  }
  return lines.join("\n")
}

/** Markdown body for /docs routes. Null lets the site 404 handler run. */
export function docsMarkdownResponse(
  pathname: string
): { body: string; status: number } | null {
  const clean = pathname.replace(/\/+$/, "") || "/"
  if (clean !== BASE_PATH && !clean.startsWith(`${BASE_PATH}/`)) return null
  try {
    if (clean === BASE_PATH) {
      return { body: renderIndexMarkdown(), status: 200 }
    }
    const rest = clean.slice(BASE_PATH.length + 1)
    const parts = rest.split("/")
    if (parts.length !== 2) return null
    const doc = getDoc(parts[0], parts[1])
    if (!doc?.listed) return null
    return { body: doc.content, status: 200 }
  } catch (err) {
    console.error("[docs] markdown failed", pathname, err)
    return null
  }
}
