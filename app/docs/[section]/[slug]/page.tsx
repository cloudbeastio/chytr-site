import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DocBody } from "@/components/docs/DocBody"
import { allDocParams, getDoc } from "@/lib/docs"
import { SITE_URL } from "@/lib/site"

export const dynamicParams = false

type PageProps = {
  params: Promise<{ section: string; slug: string }>
}

export function generateStaticParams() {
  return allDocParams()
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const doc = getDoc(params.section, params.slug)
  if (!doc?.listed) return { title: "chytr docs" }
  const canonical = `${SITE_URL}${doc.href}`
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical },
    openGraph: {
      title: `${doc.title} | chytr docs`,
      description: doc.description,
      url: canonical,
    },
  }
}

export default async function DocPage(props: PageProps) {
  const params = await props.params
  const doc = getDoc(params.section, params.slug)
  if (!doc?.listed) notFound()
  return (
    <article>
      <DocBody content={doc.content} />
    </article>
  )
}
