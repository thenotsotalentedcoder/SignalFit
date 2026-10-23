import Link from 'next/link';
export default function NotFound() {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4"><p className="eyebrow">404</p><h1 className="mt-2 text-2xl font-bold">Page not found</h1><p className="mt-2 text-muted">The page may have moved, or it belongs to another account.</p><Link className="btn-primary mt-6 self-start" href="/">Go to home</Link></main>;
}
