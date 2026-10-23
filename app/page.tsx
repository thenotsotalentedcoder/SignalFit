import Link from 'next/link';

const steps = [
  ['Tell us what is true', 'A short interview adapts to your answers: capabilities, proof, capacity and exclusions.'],
  ['Review and confirm', 'Edit the draft profile. Your statements stay separate from anything we inspect later.'],
  ['Investigate fit', 'Bounded research reads real pages. Every claim cites stored evidence; nothing is sent to anyone.']
];
export default function Home() {
  return <>
    <header className="border-b border-line bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
      <Link href="/" className="text-lg font-black tracking-tight">signal<span className="text-coral">fit</span></Link>
      <nav aria-label="Account" className="flex items-center gap-2"><Link href="/signin" className="btn-secondary">Sign in</Link><Link href="/signup" className="btn-primary">Create account</Link></nav>
    </div></header>
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <p className="eyebrow">For freelancers and small studios</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Find the work your business is built to win.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">SignalFit learns what you can genuinely deliver, then checks current public demand against it. A job posting is treated as advertised work, never as proof someone will buy.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="btn-brand">Build your profile</Link><a href="#how" className="btn-secondary">How it works</a></div>
        </div>
        <aside aria-label="Example result" className="card">
          <p className="eyebrow">Illustration, not a customer result</p>
          <h2 className="mt-2 text-lg font-bold">Invoice-to-ERP sync for freight forwarders</h2>
          <p className="mt-2 flex flex-wrap gap-2"><span className="badge-warn">Single-company lead</span><span className="badge-neutral">Fit not yet scored</span></p>
          <ul className="mt-4 space-y-2 text-sm"><li><b>Observed:</b> one dated posting asks for API integration work.</li><li><b>Still unknown:</b> budget, urgency, willingness to outsource.</li><li><b>Next step:</b> questions to ask the buyer, not a pitch.</li></ul>
        </aside>
      </section>
      <section id="how" className="mt-14 sm:mt-20"><h2 className="text-xl font-bold">How it works</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">{steps.map(([t, d], i) => <li key={t} className="card"><span className="eyebrow">Step {i + 1}</span><h3 className="mt-2 font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></li>)}</ol>
      </section>
    </main>
  </>;
}
