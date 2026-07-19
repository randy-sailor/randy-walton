'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Leadership', 'Growth', 'Innovation', 'Change', 'Faith', 'Ministry', 'Oddities'];

const EMPTY_ESSAY = {
  title: '',
  slug: '',
  date: '',
  categories: [],
  excerpt: '',
  body: '',
  isHtml: false,
  editing: false,
};

function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function api(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Signed out.');
  }
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export default function Dashboard({ config }) {
  const router = useRouter();
  const [tab, setTab] = useState('essays');

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <>
      {(!config.redis || !config.resend) && (
        <div className="admin-panel">
          <h2>Finish setting up</h2>
          <ul className="setup-list">
            {!config.redis && (
              <li>
                <strong>Database (subscribers &amp; new essays):</strong> in Vercel, open{' '}
                <em>Storage → Create Database → Upstash for Redis</em> and connect it to this
                project. It injects <code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code>{' '}
                automatically.
              </li>
            )}
            {!config.resend && (
              <li>
                <strong>Email (updates &amp; contact form):</strong> create a free{' '}
                <a href="https://resend.com" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Resend
                </a>{' '}
                account, verify your sending domain, then add <code>RESEND_API_KEY</code> and{' '}
                <code>EMAIL_FROM</code> (e.g. <code>Randy Walton &lt;hello@randywalton.com&gt;</code>)
                as environment variables.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="admin-tabs">
        <button type="button" className={`chip${tab === 'essays' ? ' active' : ''}`} onClick={() => setTab('essays')}>
          ESSAYS
        </button>
        <button type="button" className={`chip${tab === 'subscribers' ? ' active' : ''}`} onClick={() => setTab('subscribers')}>
          SUBSCRIBERS
        </button>
        <button type="button" className={`chip${tab === 'send' ? ' active' : ''}`} onClick={() => setTab('send')}>
          SEND UPDATE
        </button>
        <button type="button" className={`chip${tab === 'inquiries' ? ' active' : ''}`} onClick={() => setTab('inquiries')}>
          INQUIRIES
        </button>
        <button type="button" className="chip" style={{ marginLeft: 'auto' }} onClick={logout}>
          SIGN OUT
        </button>
      </div>

      {tab === 'essays' && <EssaysTab />}
      {tab === 'subscribers' && <SubscribersTab />}
      {tab === 'send' && <SendTab />}
      {tab === 'inquiries' && <InquiriesTab />}
    </>
  );
}

/* --- Essays ---------------------------------------------------------------- */

function EssaysTab() {
  const [custom, setCustom] = useState([]);
  const [form, setForm] = useState(EMPTY_ESSAY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/admin/posts')
      .then((d) => setCustom(d.custom))
      .catch((e) => setMsg({ error: e.message }));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function setTitle(e) {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  }

  function toggleCat(cat) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  }

  function editPost(p) {
    setForm({
      title: p.title,
      slug: p.slug,
      date: p.date,
      categories: p.categories || [],
      excerpt: p.excerpt || '',
      body: p.body,
      isHtml: true, // stored bodies are HTML
      editing: true,
    });
    setSlugTouched(true);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function publish() {
    setMsg(null);
    setBusy(true);
    try {
      const payload = { ...form, date: form.date || new Date().toISOString().slice(0, 10) };
      await api('/api/admin/posts', { method: 'POST', body: JSON.stringify(payload) });
      const d = await api('/api/admin/posts');
      setCustom(d.custom);
      setForm(EMPTY_ESSAY);
      setSlugTouched(false);
      setMsg({ ok: form.editing ? 'Essay updated.' : 'Essay published. It is live on the site now.' });
    } catch (e) {
      setMsg({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug) {
    if (!window.confirm(`Delete “${slug}”? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
      setCustom((c) => c.filter((p) => p.slug !== slug));
    } catch (e) {
      setMsg({ error: e.message });
    }
  }

  return (
    <>
      <div className="admin-panel">
        <h2>{form.editing ? `Editing: ${form.title || form.slug}` : 'Post a new essay'}</h2>
        <div className="form-stack">
          <div className="form-two-col">
            <label className="field">
              <span className="field-label">TITLE</span>
              <input value={form.title} onChange={setTitle} />
            </label>
            <label className="field">
              <span className="field-label">DATE</span>
              <input type="date" value={form.date} onChange={set('date')} />
            </label>
          </div>
          <div className="form-two-col">
            <label className="field">
              <span className="field-label">SLUG (URL: /blog/…)</span>
              <input
                value={form.slug}
                disabled={form.editing}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
              />
            </label>
            <div className="field">
              <span className="field-label">CATEGORIES</span>
              <div className="cat-checks">
                {CATEGORIES.map((c) => (
                  <label key={c}>
                    <input
                      type="checkbox"
                      checked={form.categories.includes(c)}
                      onChange={() => toggleCat(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <label className="field">
            <span className="field-label">EXCERPT (OPTIONAL — USED ON THE HOMEPAGE &amp; SEARCH RESULTS)</span>
            <textarea value={form.excerpt} onChange={set('excerpt')} rows={2} />
          </label>
          <label className="field">
            <span className="field-label">
              BODY — {form.isHtml ? 'HTML' : 'PLAIN TEXT (BLANK LINE STARTS A NEW PARAGRAPH)'}
            </span>
            <textarea value={form.body} onChange={set('body')} rows={14} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, font: '400 14px var(--sans)', color: 'var(--secondary)' }}>
            <input
              type="checkbox"
              checked={form.isHtml}
              onChange={(e) => setForm((f) => ({ ...f, isHtml: e.target.checked }))}
            />
            Body is HTML (paste <code>&lt;p&gt;</code> markup directly)
          </label>
          {msg?.error && <div className="admin-msg error">{msg.error}</div>}
          {msg?.ok && <div className="admin-msg ok">{msg.ok}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-gold form-submit" onClick={publish} disabled={busy}>
              {busy ? 'SAVING…' : form.editing ? 'SAVE CHANGES' : 'PUBLISH ESSAY'}
            </button>
            {form.editing && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setForm(EMPTY_ESSAY);
                  setSlugTouched(false);
                  setMsg(null);
                }}
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Essays posted from the admin</h2>
        {custom.length === 0 ? (
          <p className="admin-note">
            Nothing yet. The original 46 archive essays are built into the site and always live;
            essays you publish here appear alongside them instantly.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TITLE</th>
                <th>SLUG</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {custom.map((p) => (
                <tr key={p.slug}>
                  <td>{p.date}</td>
                  <td>{p.title}</td>
                  <td>
                    <a href={`/blog/${p.slug}`} style={{ color: 'var(--gold-light)' }} target="_blank" rel="noreferrer">
                      /blog/{p.slug}
                    </a>
                  </td>
                  <td>
                    <button type="button" className="action" onClick={() => editPost(p)}>
                      EDIT
                    </button>
                  </td>
                  <td>
                    <button type="button" className="action" onClick={() => remove(p.slug)}>
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* --- Subscribers ------------------------------------------------------------ */

function SubscribersTab() {
  const [subs, setSubs] = useState(null);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/admin/subscribers')
      .then((d) => setSubs(d.subscribers))
      .catch((e) => setMsg({ error: e.message }));
  }, []);

  async function add() {
    setMsg(null);
    setBusy(true);
    try {
      const d = await api('/api/admin/subscribers', {
        method: 'POST',
        body: JSON.stringify({ emails: input }),
      });
      setSubs(d.subscribers);
      setInput('');
      const parts = [`Added ${d.added}.`];
      if (d.duplicates) parts.push(`${d.duplicates} already subscribed.`);
      if (d.invalid) parts.push(`${d.invalid} invalid.`);
      setMsg({ ok: parts.join(' ') });
    } catch (e) {
      setMsg({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(email) {
    if (!window.confirm(`Remove ${email} from the list?`)) return;
    try {
      const d = await api(`/api/admin/subscribers?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      setSubs(d.subscribers);
    } catch (e) {
      setMsg({ error: e.message });
    }
  }

  return (
    <>
      <div className="admin-panel">
        <h2>Add subscribers</h2>
        <div className="form-stack">
          <label className="field">
            <span className="field-label">EMAIL ADDRESSES (ONE PER LINE, OR SEPARATED BY COMMAS)</span>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} />
          </label>
          {msg?.error && <div className="admin-msg error">{msg.error}</div>}
          {msg?.ok && <div className="admin-msg ok">{msg.ok}</div>}
          <button type="button" className="btn-gold form-submit" onClick={add} disabled={busy || !input.trim()}>
            {busy ? 'ADDING…' : 'ADD TO LIST'}
          </button>
        </div>
      </div>
      <div className="admin-panel">
        <h2>Subscribers{subs ? ` (${subs.length})` : ''}</h2>
        {!subs ? (
          <p className="admin-note">Loading…</p>
        ) : subs.length === 0 ? (
          <p className="admin-note">No subscribers yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>EMAIL</th>
                <th>ADDED</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.email}>
                  <td>{s.email}</td>
                  <td>{s.addedAt ? new Date(s.addedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button type="button" className="action" onClick={() => remove(s.email)}>
                      REMOVE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* --- Inquiries (contact form submissions) ----------------------------------- */

function InquiriesTab() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/admin/inquiries')
      .then((d) => setMessages(d.messages))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="admin-panel">
      <h2>Contact form inquiries{messages ? ` (${messages.length})` : ''}</h2>
      <p className="admin-note">
        Every submission is stored here, even when email delivery fails — so nothing is ever lost.
        The status column shows whether the email notification reached your inbox, and if not, why.
      </p>
      {error && <div className="admin-msg error">{error}</div>}
      {!messages ? (
        <p className="admin-note">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="admin-note" style={{ marginTop: 16 }}>No inquiries yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>RECEIVED</th>
              <th>FROM</th>
              <th>TOPIC</th>
              <th>MESSAGE</th>
              <th>EMAIL STATUS</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }}>{m.at ? new Date(m.at).toLocaleString() : '—'}</td>
                <td>
                  {m.name}
                  <br />
                  <a href={`mailto:${m.email}`} style={{ color: 'var(--gold-light)' }}>
                    {m.email}
                  </a>
                </td>
                <td>{m.topic}</td>
                <td style={{ whiteSpace: 'pre-wrap', maxWidth: 420 }}>{m.message}</td>
                <td>
                  {m.emailed === true ? (
                    <span style={{ color: '#3d6b35' }}>Delivered ✓</span>
                  ) : m.emailed === false ? (
                    <span style={{ color: '#a4392f' }}>Failed{m.emailError ? ` — ${m.emailError}` : ''}</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* --- Send update ------------------------------------------------------------ */

function SendTab() {
  const [all, setAll] = useState([]);
  const [subCount, setSubCount] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [essaySlug, setEssaySlug] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/admin/posts')
      .then((d) => setAll(d.all))
      .catch(() => {});
    api('/api/admin/subscribers')
      .then((d) => setSubCount(d.subscribers.length))
      .catch(() => {});
  }, []);

  async function send(mode) {
    setMsg(null);
    if (mode === 'all') {
      const n = subCount ?? 'all';
      if (!window.confirm(`Send “${subject}” to ${n} subscribers?`)) return;
    }
    setBusy(true);
    try {
      const d = await api('/api/admin/send', {
        method: 'POST',
        body: JSON.stringify({ subject, message, essaySlug, mode, testEmail }),
      });
      setMsg({
        ok:
          mode === 'test'
            ? `Test sent to ${testEmail}.`
            : `Sent to ${d.sent} of ${d.total} subscribers.${d.errors?.length ? ' Errors: ' + d.errors.join('; ') : ''}`,
      });
    } catch (e) {
      setMsg({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Send an email update{subCount != null ? ` — ${subCount} subscriber${subCount === 1 ? '' : 's'}` : ''}</h2>
      <div className="form-stack">
        <label className="field">
          <span className="field-label">SUBJECT</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">MESSAGE (BLANK LINE STARTS A NEW PARAGRAPH)</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} />
        </label>
        <label className="field">
          <span className="field-label">FEATURE AN ESSAY (OPTIONAL — ADDS A “READ THE ESSAY” BUTTON)</span>
          <select value={essaySlug} onChange={(e) => setEssaySlug(e.target.value)}>
            <option value="">— None —</option>
            {all.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.date} · {p.title}
              </option>
            ))}
          </select>
        </label>
        <div className="form-two-col" style={{ alignItems: 'end' }}>
          <label className="field">
            <span className="field-label">TEST EMAIL ADDRESS</span>
            <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} type="email" />
          </label>
          <div>
            <button
              type="button"
              className="btn-outline"
              onClick={() => send('test')}
              disabled={busy || !subject || !testEmail}
            >
              SEND TEST
            </button>
          </div>
        </div>
        {msg?.error && <div className="admin-msg error">{msg.error}</div>}
        {msg?.ok && <div className="admin-msg ok">{msg.ok}</div>}
        <button
          type="button"
          className="btn-gold form-submit"
          onClick={() => send('all')}
          disabled={busy || !subject || subCount === 0}
        >
          {busy ? 'SENDING…' : 'SEND TO ALL SUBSCRIBERS'}
        </button>
      </div>
    </div>
  );
}
