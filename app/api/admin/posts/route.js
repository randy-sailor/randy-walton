import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { redisConfigured, getCustomPosts, saveCustomPost, deleteCustomPost } from '@/lib/redis';
import { getAllPosts, isStaticSlug, slugify, textToHtml, plainText } from '@/lib/content';

async function guard() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return null;
}

function refresh() {
  revalidatePath('/', 'layout');
}

export async function GET() {
  const blocked = await guard();
  if (blocked) return blocked;
  const all = await getAllPosts();
  const custom = redisConfigured() ? await getCustomPosts() : [];
  return NextResponse.json({
    custom: custom.sort((a, b) => (a.date < b.date ? 1 : -1)),
    all: all.map((p) => ({ slug: p.slug, title: p.title, date: p.date })),
    redisConfigured: redisConfigured(),
  });
}

export async function POST(request) {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!redisConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured. Add Upstash Redis to the Vercel project (see README).' },
      { status: 503 }
    );
  }
  const body = await request.json().catch(() => ({}));

  const title = String(body.title || '').trim().slice(0, 300);
  if (!title) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });

  const slug = slugify(String(body.slug || '').trim() || title);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(body.date || '')) ? body.date : new Date().toISOString().slice(0, 10);
  const categories = Array.isArray(body.categories) ? body.categories.map(String).slice(0, 8) : [];
  const rawBody = String(body.body || '').trim();
  if (!rawBody) return NextResponse.json({ error: 'The essay body is empty.' }, { status: 400 });
  const html = body.isHtml ? rawBody : textToHtml(rawBody);
  const excerpt = String(body.excerpt || '').trim().slice(0, 500) || undefined;
  const editing = Boolean(body.editing);

  if (isStaticSlug(slug)) {
    return NextResponse.json(
      { error: `The slug “${slug}” belongs to an original archive essay and cannot be overwritten.` },
      { status: 400 }
    );
  }
  if (!editing) {
    const existing = await getCustomPosts();
    if (existing.some((p) => p.slug === slug)) {
      return NextResponse.json(
        { error: `An essay with the slug “${slug}” already exists. Edit it instead, or change the slug.` },
        { status: 400 }
      );
    }
  }

  const post = {
    slug,
    title,
    date,
    categories,
    excerpt,
    body: html,
    custom: true,
    updatedAt: Date.now(),
  };
  // Guard against accidentally-empty content after conversion.
  if (!plainText(post.body)) return NextResponse.json({ error: 'The essay body is empty.' }, { status: 400 });

  await saveCustomPost(post);
  refresh();
  return NextResponse.json({ ok: true, post });
}

export async function DELETE(request) {
  const blocked = await guard();
  if (blocked) return blocked;
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
  if (isStaticSlug(slug)) {
    return NextResponse.json({ error: 'Original archive essays cannot be deleted from the admin.' }, { status: 400 });
  }
  await deleteCustomPost(slug);
  refresh();
  return NextResponse.json({ ok: true });
}
