import type { ReactNode } from "react"
import type { Metadata } from "next"
import { DocsNav } from "@/components/docs/DocsNav"
import { DOCS_INDEX_DESCRIPTION, getSidebarNav } from "@/lib/docs"
import { SiteHeader } from "@/components/SiteHeader"
import "highlight.js/styles/github-dark.css"
import "./docs.css"

export const metadata: Metadata = {
  title: {
    default: "chytr docs",
    template: "%s | chytr docs",
  },
  description: DOCS_INDEX_DESCRIPTION,
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  const sections = getSidebarNav()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
          <DocsNav sections={sections} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
