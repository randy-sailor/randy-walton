'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <SiteHeader />
      <main className="simple-main">
        <div className="login-panel">
          <div className="page-kicker">ADMIN</div>
          <h1 className="simple-h1" style={{ fontSize: 40 }}>
            Sign in.
          </h1>
          <form onSubmit={submit} className="form-stack" style={{ marginTop: 28 }}>
            <label className="field">
              <span className="field-label">PASSWORD</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-gold form-submit" disabled={busy}>
              {busy ? 'SIGNING IN…' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
