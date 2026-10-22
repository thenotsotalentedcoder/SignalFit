'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [{ href: '/workspace', label: 'Profile' }, { href: '/research', label: 'Research' }, { href: '/saved', label: 'Shortlist' }];

export default function AppShell({ children, width = 'max-w-3xl' }: { children: React.ReactNode; width?: string }) {
  const path = usePathname(); const router = useRouter();
  async function signOut() { await fetch('/api/auth/signout', { method: 'POST' }); router.push('/'); }
  return <>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/workspace" className="text-lg font-black tracking-tight">signal<span className="text-coral">fit</span></Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
          {links.map((l) => <Link key={l.href} href={l.href} aria-current={path === l.href || path.startsWith(l.href + '/') ? 'page' : undefined} className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-semibold text-muted hover:bg-canvas aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand">{l.label}</Link>)}
          <button onClick={signOut} className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-semibold text-muted hover:bg-canvas">Sign out</button>
        </nav>
      </div>
    </header>
    <main id="main" className={`mx-auto w-full ${width} px-4 py-6 sm:px-6 sm:py-10`}>{children}</main>
  </>;
}
