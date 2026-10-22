import Link from 'next/link';
export default function AuthCard({ title, lead, children }: { title: string; lead?: React.ReactNode; children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
    <Link href="/" className="mb-8 text-lg font-black tracking-tight">signal<span className="text-coral">fit</span></Link>
    <section className="card"><h1 className="text-2xl font-bold">{title}</h1>{lead && <p className="mt-2 text-sm text-muted">{lead}</p>}<div className="mt-6">{children}</div></section>
  </main>;
}
