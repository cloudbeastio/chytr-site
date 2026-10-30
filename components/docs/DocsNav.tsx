"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { SidebarNavSection } from "@/lib/docs"

type DocsNavProps = {
  sections: SidebarNavSection[]
}

function isCurrent(pathname: string, href: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/"
  return clean === href
}

function NavLinks({ sections }: DocsNavProps) {
  const pathname = usePathname() ?? ""
  return (
    <nav aria-label="chytr docs" className="space-y-6">
      <Link
        href="/docs"
        aria-current={isCurrent(pathname, "/docs") ? "page" : undefined}
        className={`block text-sm font-semibold ${
          isCurrent(pathname, "/docs")
            ? "text-primary"
            : "text-foreground hover:text-primary"
        }`}
      >
        chytr docs
      </Link>
      {sections.map((section) => (
        <div key={section.id}>
          <p
            className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
              section.comingSoon ? "" : "mb-2"
            }`}
          >
            {section.title}
          </p>
          {section.comingSoon ? (
            <p className="mb-2 mt-1 text-xs text-muted-foreground">Coming soon</p>
          ) : null}
          <ul className="space-y-1">
            {section.pages.map((page) => {
              if (!page.listed) {
                return (
                  <li key={page.slug} className="px-2 py-1.5 text-sm text-muted-foreground">
                    {page.title}
                  </li>
                )
              }
              const current = isCurrent(pathname, page.href)
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={current ? "page" : undefined}
                    className={`block rounded-md px-2 py-1.5 text-sm ${
                      current
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function DocsNav({ sections }: DocsNavProps) {
  return (
    <>
      <details className="mb-8 rounded-lg border border-border bg-muted/40 lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Docs</summary>
        <div className="px-4 pb-4">
          <NavLinks sections={sections} />
        </div>
      </details>
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <NavLinks sections={sections} />
        </div>
      </aside>
    </>
  )
}
