import { POSTS, fmtDate } from './posts-data';
import { getCustomPosts } from './redis';

export { fmtDate };

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://randywalton.com').replace(/\/$/, '');

export const CATEGORIES = ['Leadership', 'Growth', 'Innovation', 'Change', 'Faith', 'Ministry', 'Oddities'];

const MO = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Curated decks/kickers from the design handoff. Fall back to derived
// values for everything else (including future admin-authored posts).
const CURATED = {
  'the-risk-problem': {
    deck: 'Our curated, risk-less future is no more likely to happen than our big dream. So why not embrace the risk? Share your idea. Create your art. Apply for the job.',
  },
  'the-culture-test': {
    label: 'CULTURE',
    deck: 'No healthy culture can sustain itself under an unhealthy leader — and there lies our greatest opportunity to impact culture.',
  },
  'the-benefits-of-coaching': {
    label: 'COACHING',
    deck: 'The most elite athletes in the world all keep coaches for their entire careers. The key corollary to sustained success is coach-ability.',
  },
  'the-point-of-coaching': {
    label: 'COACHING',
    deck: 'Coaching is about leading others to discovery. The minute it becomes teaching, you steal the most powerful part of what it does.',
  },
};

export function plainText(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerptOf(post, max = 170) {
  if (CURATED[post.slug]?.deck) return CURATED[post.slug].deck;
  if (post.excerpt) return post.excerpt;
  const text = plainText(post.body);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

export function cardKicker(post) {
  const [y, m] = post.date.split('-');
  const label = CURATED[post.slug]?.label || (post.categories[0] || 'Essay').toUpperCase();
  return `${label} · ${MO[+m - 1]} ${y}`;
}

export function shortDate(iso) {
  const [, m, d] = iso.split('-');
  return `${MO[+m - 1]} ${+d}`;
}

export async function getAllPosts() {
  const custom = await getCustomPosts();
  const bySlug = new Map();
  for (const p of POSTS) bySlug.set(p.slug, p);
  for (const p of custom) bySlug.set(p.slug, p);
  return [...bySlug.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getPost(slug) {
  const posts = await getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { post: null, prev: null, next: null };
  return { post: posts[i], prev: posts[i + 1] || null, next: posts[i - 1] || null };
}

export function isStaticSlug(slug) {
  return POSTS.some((p) => p.slug === slug);
}

export function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'essay';
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Plain text -> simple paragraph HTML (blank lines separate paragraphs).
export function textToHtml(text) {
  return String(text)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}
