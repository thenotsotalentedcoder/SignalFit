import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = { title: 'SignalFit — find the work your business is built to win', description: 'Match your real capabilities to current, source-backed client demand.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
