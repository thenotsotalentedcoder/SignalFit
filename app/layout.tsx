import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'SignalFit — Find the work your business is built to win', description: 'A grounded business interview for better-fit opportunities.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
