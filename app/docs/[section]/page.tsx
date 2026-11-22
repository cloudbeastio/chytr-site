import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DocBody } from "@/components/docs/DocBody"
import { getListedSection, listedSectionIds, renderSectionMarkdown } from "@/lib/docs"
import { SITE_URL } from "@/lib/site"

// Section index at /docs/<section> (for example /docs/self-host). Built from _nav.json, so it
// lists exactly the section's published pages and cannot drift from the sidebar.
export const dynamicParams = false

type PageProps = {
  params: Promise<{ section: string }>
}

export function generateStaticParams() {
  return listedSectionIds().map((section) => ({ section }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { section: id } = await props.params
  const section = getListedSection(id)
  if (!section) return { title: "chytr docs" }
  const canonical = `${SITE_URL}/docs/${section.id}`
  const description = `chytr docs: ${section.title}. ${section.pages.map((p) => p.title).join(", ")}.`
  return {
    title: section.title,
    description,
    alternates: { canonical },
    openGraph: { title: `${section.title} | chytr docs`, description, url: canonical },
  }
}

export default async function SectionIndexPage(props: PageProps) {
  const { section: id } = await props.params
  const section = getListedSection(id)
  if (!section) notFound()
  return (
    <article>
      <DocBody content={renderSectionMarkdown(section)} />
    </article>
  )
}
