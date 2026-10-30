import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "chytr",
  description: "chytr — a public landing page. Copy pending.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
