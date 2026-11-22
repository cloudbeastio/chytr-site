export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chytr.ai"

// Early-access destination. TODO: wire a real form/list; until NEXT_PUBLIC_WAITLIST_URL is set
// the CTA scrolls to the #early-access section.
export const WAITLIST_URL = process.env.NEXT_PUBLIC_WAITLIST_URL ?? "#early-access"

// Public source repository. It is private until the public release, so this link 404s for
// visitors before then; the landing link ships only after the repo is public.
export const REPO_URL = "https://github.com/cloudbeastio/chytr"
