// Static landing page. No auth, no app, no login.
// TODO(copy): all text below is placeholder until Mark supplies final copy.
export default function Home() {
  return (
    <main className="wrap">
      <header className="top">
        <span className="brand">
          chytr<span>.</span>
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">Coming soon</p>
        <h1>Headline copy goes here.</h1>
        <p className="lede">
          Supporting copy goes here. This page is a preview build awaiting final
          copy from Marketing.
        </p>
      </section>

      <section className="grid">
        {["Feature one", "Feature two", "Feature three"].map((t) => (
          <article key={t} className="card">
            <h2>{t}</h2>
            <p>Placeholder description.</p>
          </article>
        ))}
      </section>

      <footer className="foot">© {new Date().getFullYear()} chytr</footer>
    </main>
  );
}
