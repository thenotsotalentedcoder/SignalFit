import Link from 'next/link';
export default function NotFound(){return <main className="grid min-h-screen place-items-center p-6 text-center"><div><p className="eyebrow">404</p><h1 className="mt-3 text-4xl font-black">That signal went quiet.</h1><Link className="mt-6 inline-block rounded-full bg-ink px-5 py-3 font-bold text-white" href="/">Return home</Link></div></main>}
