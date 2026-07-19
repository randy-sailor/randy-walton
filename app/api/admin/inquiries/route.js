import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { redisConfigured, getContactMessages } from '@/lib/redis';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (!redisConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured. Add Upstash Redis to the Vercel project (see README).' },
      { status: 503 }
    );
  }
  return NextResponse.json({ messages: await getContactMessages() });
}
