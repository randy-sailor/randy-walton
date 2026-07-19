import { NextResponse } from 'next/server';
import { resendConfigured, sendOne, fromAddress, contactRecipient, renderEmail, emailParagraphs } from '@/lib/email';
import { redisConfigured, saveContactMessage, isEmail } from '@/lib/redis';
import { escapeHtml, textToHtml } from '@/lib/content';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body.name || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const topic = String(body.topic || 'Something else').trim().slice(0, 100);
  const message = String(body.message || '').trim().slice(0, 10000);

  // Honeypot: bots fill every field; pretend success and drop it.
  if (String(body.company || '').trim()) return NextResponse.json({ ok: true });

  if (!name || !message || !isEmail(email)) {
    return NextResponse.json({ error: 'Please fill in your name, a valid email, and a message.' }, { status: 400 });
  }

  await saveContactMessage({ name, email, topic, message });

  if (resendConfigured()) {
    try {
      await sendOne({
        from: fromAddress(),
        to: [contactRecipient()],
        reply_to: [email],
        subject: `[randywalton.com] ${topic} — ${name}`,
        html: renderEmail({
          bodyHtml:
            `<p style="margin:0 0 1em;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;color:#8a8577;">NEW INQUIRY · ${escapeHtml(topic).toUpperCase()}</p>` +
            emailParagraphs(textToHtml(message)) +
            `<p style="margin:1.6em 0 0;font-family:Georgia,serif;font-size:15px;color:#5b6270;">— ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
        }),
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (redisConfigured()) return NextResponse.json({ ok: true }); // stored above
      return NextResponse.json({ error: 'Could not send your message right now. Please try again later.' }, { status: 502 });
    }
  }

  if (redisConfigured()) return NextResponse.json({ ok: true });
  return NextResponse.json(
    { error: 'The contact form is not configured yet. Please email me directly.' },
    { status: 503 }
  );
}
