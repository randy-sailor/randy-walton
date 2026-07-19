import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { redisConfigured, getSubscribers, addSubscribers, removeSubscriber } from '@/lib/redis';

async function guard() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (!redisConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured. Add Upstash Redis to the Vercel project (see README).' },
      { status: 503 }
    );
  }
  return null;
}

export async function GET() {
  const blocked = await guard();
  if (blocked) return blocked;
  return NextResponse.json({ subscribers: await getSubscribers() });
}

export async function POST(request) {
  const blocked = await guard();
  if (blocked) return blocked;
  const body = await request.json().catch(() => ({}));
  const raw = String(body.emails || '');
  const emails = raw.split(/[\s,;]+/).filter(Boolean);
  if (!emails.length) return NextResponse.json({ error: 'No email addresses provided.' }, { status: 400 });
  const result = await addSubscribers(emails);
  return NextResponse.json({ ...result, subscribers: await getSubscribers() });
}

export async function DELETE(request) {
  const blocked = await guard();
  if (blocked) return blocked;
  const email = new URL(request.url).searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 });
  await removeSubscriber(email);
  return NextResponse.json({ ok: true, subscribers: await getSubscribers() });
}
