'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import { api } from '@/lib/client';

export default function TwoFactor() {
  const [code, setCode] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const r = await api('/api/auth/totp/verify', 'POST', { code });
    if (r.ok) router.push('/workspace'); else { setError(r.data.error || 'Code rejected. Try again.'); setBusy(false); }
  }
  return <AuthCard title="Verify your authenticator" lead="Enter the current 6-digit code to unlock your workspace.">
    <form onSubmit={submit} className="space-y-4">
      <label className="label">Authenticator code<input className="field text-center text-2xl tracking-[0.35em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required autoFocus /></label>
      {error && <p role="alert" className="alert-error">{error}</p>}
      <button className="btn-primary w-full" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Continue'}</button>
    </form>
  </AuthCard>;
}
