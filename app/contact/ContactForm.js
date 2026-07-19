'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'A speaking request',
    message: '',
    company: '', // honeypot — humans never see or fill this
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit() {
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="form-sent">
        <div className="big">Thank you.</div>
        <p>Your message is on its way — I&rsquo;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <div className="form-stack">
      <div className="form-two-col">
        <label className="field">
          <span className="field-label">NAME</span>
          <input value={form.name} onChange={set('name')} autoComplete="name" />
        </label>
        <label className="field">
          <span className="field-label">EMAIL</span>
          <input value={form.email} onChange={set('email')} type="email" autoComplete="email" />
        </label>
      </div>
      <label className="field">
        <span className="field-label">I&rsquo;M REACHING OUT ABOUT</span>
        <select value={form.topic} onChange={set('topic')}>
          <option>A speaking request</option>
          <option>Consulting</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="field">
        <span className="field-label">MESSAGE</span>
        <textarea value={form.message} onChange={set('message')} rows={6} />
      </label>
      <input
        value={form.company}
        onChange={set('company')}
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, border: 0, padding: 0 }}
      />
      {error && <div className="form-error">{error}</div>}
      <button type="button" className="btn-gold form-submit" onClick={submit} disabled={busy}>
        {busy ? 'SENDING…' : 'SEND MESSAGE'}
      </button>
    </div>
  );
}
