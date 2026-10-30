import { SiteHeader } from "@/components/SiteHeader"
import { WAITLIST_URL } from "@/lib/site"

// DRAFT COPY for Mark and Joe: every string on this page is a working draft, not approved.

const PILLARS = [
  {
    name: "Clarity",
    body: "See what your agents did, for whom, and why. One receipt per action, written in plain language, in one place.",
  },
  {
    name: "Controls",
    body: "Decide what runs on its own and what waits for a human. Approval gates sit where the stakes are, and you set the thresholds.",
  },
  {
    name: "Accountability",
    body: "Every approval and every rejection is on the record. When something goes wrong, you can trace it to the action, the agent and the decision.",
  },
]

const DIAGRAMS = [
  {
    file: "chytr-diagram-A-ring-flywheel-dark.svg",
    title: "One trigger layer, seven business flywheels",
    alt: "Ring diagram: chytr at the centre, connected to marketing, meetings, projects, approvals, outreach, support and success.",
    caption: "chytr sits in the middle as the trigger layer and source of truth. Insights from every flywheel feed marketing.",
  },
  {
    file: "chytr-diagram-B-trigger-layer-dark.svg",
    title: "Bring your own agents",
    alt: "Layer diagram: Claude, Cursor, Codex and Grok runtimes feed the open-source chytr trigger layer, which drives seven business flywheels.",
    caption: "Claude, Cursor, Codex, Grok or your own. Agents are swappable; the record and the gates stay yours.",
  },
  {
    file: "chytr-diagram-C-pipeline-hitl-dark.svg",
    title: "A human gate at every step that matters",
    alt: "Pipeline diagram: campaigns, deals, projects, agent work, support, success and marketing, each with a human review and approve gate.",
    caption: "Agents do the work. Approvals are where a person says yes or no, and that decision becomes part of the receipt.",
  },
]

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
          <p className="mb-5 font-mono text-sm text-muted-foreground">
            <span className="mr-2 inline-block h-2.5 w-2.5 bg-chyt align-baseline" aria-hidden />
            Open-source business OS for AI agents
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Every AI action has a receipt.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            chytr turns what your agents do into a <span className="font-mono text-foreground">chit</span>: a short,
            reviewable record of the action, the reason and the decision. You stay in charge without reading every log.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={WAITLIST_URL}
              className="rounded-md bg-primary px-5 py-3 font-mono text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Get early access
            </a>
            <a href="/docs" className="font-mono text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Read the docs
            </a>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">The chit</h2>
            <div className="mt-6 grid gap-10 lg:grid-cols-2">
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  A chit is the receipt for one agent action. It says what the agent did, what it touched, why it did it,
                  and who approved it.
                </p>
                <p>
                  Agents are fast and they are not always right. Instead of trusting them blindly or watching them
                  constantly, you read the chits that matter and approve the ones that need you.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted p-5 font-mono text-sm" aria-label="Example chit">
                <div className="mb-3 flex items-center justify-between text-muted-foreground">
                  <span>chit · example</span>
                  <span className="text-foreground">
                    <span className="mr-2 inline-block h-2 w-2 bg-chyt" aria-hidden />
                    awaiting approval
                  </span>
                </div>
                <dl className="space-y-2">
                  <div><dt className="inline text-muted-foreground">action: </dt><dd className="inline">draft follow-up email</dd></div>
                  <div><dt className="inline text-muted-foreground">agent: </dt><dd className="inline">outreach-agent</dd></div>
                  <div><dt className="inline text-muted-foreground">why: </dt><dd className="inline">meeting ended with an open pricing question</dd></div>
                  <div><dt className="inline text-muted-foreground">gate: </dt><dd className="inline">human approval before send</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">What you get</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {PILLARS.map((p) => (
                <article key={p.name} className="rounded-lg border border-border p-6">
                  <h3 className="font-mono text-lg font-medium">{p.name}</h3>
                  <p className="mt-3 text-muted-foreground">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">How it fits together</h2>
            {DIAGRAMS.map((d) => (
              <figure key={d.file}>
                <h3 className="mb-4 text-2xl font-semibold tracking-tight">{d.title}</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/diagrams/${d.file}`} alt={d.alt} width={1280} height={720} className="w-full rounded-lg border border-border" />
                <figcaption className="mt-3 text-sm text-muted-foreground">{d.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Open source, self-host</h2>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight">Your data, your server, your rules.</h3>
            </div>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                chytr is open source under a Sustainable Use License. Run it yourself, read the code, and bring the agents
                you already use.
              </p>
              <p>
                Self-hosting is free. There is no platform fee on your existing subscriptions. An optional Stripe module
                is there if you want billing built in.
              </p>
              <p><a href="/docs" className="text-foreground underline underline-offset-4">Self-hosting guide in the docs</a></p>
            </div>
          </div>
        </section>

        <section id="early-access" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Get early access.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              We are letting people in a few at a time. Join the list and we will tell you when it is your turn.
            </p>
            {/* TODO: wire the real waitlist form / destination (NEXT_PUBLIC_WAITLIST_URL). */}
            <p className="mt-6 font-mono text-sm text-muted-foreground">Sign-up form coming soon.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 font-mono text-sm text-muted-foreground sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/chytr-wordmark-light.svg" alt="chytr.ai" className="h-6 w-auto" />
          <span>© {new Date().getFullYear()} chytr</span>
        </div>
      </footer>
    </>
  )
}
