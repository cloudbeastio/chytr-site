import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SITE_URL } from "@/lib/site"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", weight: ["400", "500", "800"] })

const DESCRIPTION =
  "chytr is the open-source business OS for AI agents. Every AI action leaves a receipt: a chit you can review, approve and audit."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "chytr.ai: every AI action has a receipt", template: "%s | chytr" },
  description: DESCRIPTION,
  openGraph: { title: "chytr.ai", description: DESCRIPTION, url: SITE_URL },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
