import { NextResponse } from 'next/server';
import { checkPassword, sessionToken, adminConfigured, ADMIN_COOKIE } from '@/lib/auth';

export async function POST(request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: 'Admin is not configured. Set the ADMIN_PASSWORD environment variable in Vercel.' },
      { status: 503 }
    );
  }
  const body = await request.json().catch(() => ({}));
  if (!checkPassword(String(body.password || ''))) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
