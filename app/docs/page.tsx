import type { Metadata } from "next"
import Link from "next/link"
import {
  DOCS_INDEX_DESCRIPTION,
  DOCS_LEDE,
  getListedNav,
} from "@/lib/docs"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: "chytr docs" },
  description: DOCS_INDEX_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/docs` },
  openGraph: {
    title: "chytr docs",
    description: DOCS_INDEX_DESCRIPTION,
    url: `${SITE_URL}/docs`,
  },
}

export default function DocsIndexPage() {
  const sections = getListedNav()
  return (
    <article>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        chytr docs
      </h1>
      <div className="mb-10 space-y-4 text-lg text-muted-foreground">
        {DOCS_LEDE.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-3 text-xl font-semibold text-foreground">{section.title}</h2>
            <ul className="space-y-3">
              {section.pages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="font-medium text-primary underline underline-offset-2">
                    {page.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}
