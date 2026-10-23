'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import { api } from '@/lib/client';

export default function SetupTwoFactor() {
  const [qr, setQr] = useState(''); const [code, setCode] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function start() { setBusy(true); setError(''); const r = await api('/api/auth/totp/enroll', 'POST'); if (r.ok) setQr(r.data.qr); else setError(r.data.error); setBusy(false); }
  async function verify(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(''); const r = await api('/api/auth/totp/verify', 'POST', { code }); if (r.ok) router.push(r.data.next); else { setError(r.data.error); setBusy(false); } }
  return <AuthCard title="Add an authenticator" lead="Use any TOTP authenticator app. Your workspace unlocks once a code is verified.">
    {!qr ? <button onClick={start} disabled={busy} className="btn-primary w-full">{busy ? 'Preparing…' : 'Show QR code'}</button> : <form onSubmit={verify} className="space-y-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="QR code for your authenticator app" width={192} height={192} className="mx-auto h-48 w-48" />
      <label className="label">6-digit code<input className="field" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required /></label>
      <button className="btn-primary w-full" disabled={busy || code.length !== 6}>Verify and continue</button>
    </form>}
    {error && <p role="alert" className="alert-error mt-4">{error}</p>}
  </AuthCard>;
}
