export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chytr.ai"

// Early-access destination. TODO: wire a real form/list; until NEXT_PUBLIC_WAITLIST_URL is set
// the CTA scrolls to the #early-access section.
export const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL ?? "#early-access"
