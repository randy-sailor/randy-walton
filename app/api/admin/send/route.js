import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { redisConfigured, getSubscribers, isEmail } from '@/lib/redis';
import {
  resendConfigured,
  fromAddress,
  sendOne,
  sendBatch,
  renderEmail,
  emailParagraphs,
  essayBlock,
  unsubscribeUrl,
  unsubscribeApiUrl,
} from '@/lib/email';
import { getAllPosts, textToHtml } from '@/lib/content';

export const maxDuration = 300;

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (!resendConfigured()) {
    return NextResponse.json(
      { error: 'Email is not configured. Set the RESEND_API_KEY environment variable (see README).' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject || '').trim().slice(0, 300);
  const message = String(body.message || '').trim().slice(0, 50000);
  const essaySlug = String(body.essaySlug || '').trim();
  const mode = body.mode === 'all' ? 'all' : 'test';
  const testEmail = String(body.testEmail || '').trim().toLowerCase();

  if (!subject) return NextResponse.json({ error: 'A subject is required.' }, { status: 400 });
  if (!message && !essaySlug) {
    return NextResponse.json({ error: 'Write a message and/or pick an essay to feature.' }, { status: 400 });
  }

  let essay = null;
  if (essaySlug) {
    const posts = await getAllPosts();
    essay = posts.find((p) => p.slug === essaySlug) || null;
    if (!essay) return NextResponse.json({ error: 'Selected essay was not found.' }, { status: 400 });
  }

  const coreHtml = (message ? emailParagraphs(textToHtml(message)) : '') + (essay ? essayBlock(essay) : '');

  const buildEmail = (to) => ({
    from: fromAddress(),
    to: [to],
    subject,
    html: renderEmail({
      bodyHtml: coreHtml,
      footerHtml: `<br><a href="${unsubscribeUrl(to)}" style="color:#8a8577;">UNSUBSCRIBE</a>`,
    }),
    headers: {
      'List-Unsubscribe': `<${unsubscribeApiUrl(to)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (mode === 'test') {
    if (!isEmail(testEmail)) {
      return NextResponse.json({ error: 'Enter a valid test email address.' }, { status: 400 });
    }
    try {
      await sendOne(buildEmail(testEmail));
      return NextResponse.json({ ok: true, sent: 1, mode: 'test' });
    } catch (err) {
      return NextResponse.json({ error: `Test send failed: ${err.message}` }, { status: 502 });
    }
  }

  if (!redisConfigured()) {
    return NextResponse.json({ error: 'Database not configured — no subscriber list available.' }, { status: 503 });
  }
  const subscribers = await getSubscribers();
  if (!subscribers.length) {
    return NextResponse.json({ error: 'There are no subscribers yet.' }, { status: 400 });
  }

  const messages = subscribers.map((s) => buildEmail(s.email));
  const { sent, errors } = await sendBatch(messages);
  return NextResponse.json({ ok: errors.length === 0, sent, total: subscribers.length, errors, mode: 'all' });
}
