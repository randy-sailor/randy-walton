import { NextResponse } from 'next/server';
import { unsubscribeToken } from '@/lib/auth';
import { redisConfigured, removeSubscriber } from '@/lib/redis';

async function handle(request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('e') || '';
  const token = url.searchParams.get('t') || '';
  const valid = email && token && token === unsubscribeToken(email);
  if (valid && redisConfigured()) {
    try {
      await removeSubscriber(email);
    } catch {
      // fall through — confirmation page will still render
    }
  }
  return valid;
}

// RFC 8058 one-click unsubscribe (mail clients POST here).
export async function POST(request) {
  const valid = await handle(request);
  return valid
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'Invalid unsubscribe link.' }, { status: 400 });
}

export async function GET(request) {
  await handle(request);
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/unsubscribe?${url.searchParams}`, url.origin));
}
