'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import { api } from '@/lib/client';

export default function Signup() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const r = await api('/api/auth/signup', 'POST', { email, password });
    if (r.ok) router.push(r.data.next); else { setError(r.data.error); setBusy(false); }
  }
  return <AuthCard title="Create your account" lead={<>Already registered? <Link className="font-semibold text-brand underline" href="/signin">Sign in</Link>. Next you add an authenticator app; the workspace stays locked until you do.</>}>
    <form onSubmit={submit} className="space-y-4">
      <label className="label">Email<input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label className="label">Password<input className="field" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required aria-describedby="pw-hint" /><span id="pw-hint" className="mt-1 block text-xs font-normal text-muted">At least 8 characters. Your email is not verified yet.</span></label>
      {error && <p role="alert" className="alert-error">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
    </form>
  </AuthCard>;
}
