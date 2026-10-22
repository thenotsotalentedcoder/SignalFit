'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import { api } from '@/lib/client';

export default function Signin() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const r = await api('/api/auth/signin', 'POST', { email, password });
    if (r.ok) router.push(r.data.next); else { setError(r.data.error); setBusy(false); }
  }
  return <AuthCard title="Sign in" lead={<>New here? <Link className="font-semibold text-brand underline" href="/signup">Create an account</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      <label className="label">Email<input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label className="label">Password<input className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p role="alert" className="alert-error">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </AuthCard>;
}
