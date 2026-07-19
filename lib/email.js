import { SITE_URL, escapeHtml } from './content';
import { unsubscribeToken } from './auth';

export function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function fromAddress() {
  return process.env.EMAIL_FROM || 'Randy Walton <onboarding@resend.dev>';
}

export function contactRecipient() {
  return process.env.CONTACT_TO_EMAIL || 'randy@waltongroup.net';
}

async function resend(path, payload) {
  const res = await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Resend HTTP ${res.status}`);
  return data;
}

export async function sendOne(message) {
  return resend('/emails', message);
}

// Resend batch endpoint accepts up to 100 messages per call.
export async function sendBatch(messages) {
  let sent = 0;
  const errors = [];
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      await resend('/emails/batch', chunk);
      sent += chunk.length;
    } catch (err) {
      errors.push(err.message);
    }
    if (i + 100 < messages.length) await new Promise((r) => setTimeout(r, 600));
  }
  return { sent, errors };
}

export function unsubscribeUrl(email) {
  return `${SITE_URL}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

// POST-capable endpoint for RFC 8058 one-click unsubscribe headers.
export function unsubscribeApiUrl(email) {
  return `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

// Branded email shell matching the site: ink-navy masthead, paper body,
// serif copy, gold accents. Email-safe fonts (Georgia stands in for Newsreader).
export function renderEmail({ bodyHtml, footerHtml = '' }) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f2ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ea;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#141926;padding:28px 36px;text-align:center;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#f5f2ea;">Randy Walton<span style="color:#c9a24b;">.</span></span><br>
          <span style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#c9a24b;">Thinking without a box</span>
        </td></tr>
        <tr><td style="background:#fbf9f3;border:1px solid #d9d4c6;border-top:none;padding:36px 40px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 8px;text-align:center;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.08em;color:#8a8577;">
          RANDY WALTON · <a href="${SITE_URL}" style="color:#8a8577;">${SITE_URL.replace(/^https?:\/\//, '').toUpperCase()}</a>
          ${footerHtml}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function emailParagraphs(html) {
  return String(html).replace(
    /<p>/g,
    '<p style="margin:0 0 1.3em;font-family:Georgia,serif;font-size:17px;line-height:1.7;color:#2b3140;">'
  );
}

export function essayBlock(post) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #d9d4c6;">
    <tr><td style="padding-top:26px;">
      <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;color:#8a8577;">NEW ESSAY</span><br>
      <a href="${SITE_URL}/blog/${post.slug}" style="font-family:Georgia,serif;font-size:24px;color:#171c26;text-decoration:none;line-height:1.3;">${escapeHtml(post.title)}</a>
      <div style="margin-top:16px;">
        <a href="${SITE_URL}/blog/${post.slug}" style="display:inline-block;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.2em;font-weight:bold;color:#141926;background:#d3ab53;padding:13px 24px;text-decoration:none;">READ THE ESSAY</a>
      </div>
    </td></tr>
  </table>`;
}
