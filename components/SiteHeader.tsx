import Link from "next/link"
import { WAITLIST_URL } from "@/lib/site"

// Lockup is the outlined brand SVG (README: never set "chytr.ai" in a live font as the logo).
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="chytr.ai home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/chytr-lockup-light.svg" alt="chytr.ai" className="h-9 w-auto" />
        </Link>
        <nav className="flex items-center gap-5 font-mono text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
          <a
            href={WAITLIST_URL}
            className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
          >
            Early access
          </a>
        </nav>
      </div>
    </header>
  )
}
