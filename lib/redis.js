// Minimal Upstash Redis REST client (no SDK dependency).
// Works with either Upstash-native env vars or the ones Vercel's
// Upstash Marketplace integration injects (KV_REST_API_*).

const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export function redisConfigured() {
  return Boolean(url() && token());
}

export async function redis(...command) {
  if (!redisConfigured()) throw new Error('Redis is not configured');
  const res = await fetch(url(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || `Redis HTTP ${res.status}`);
  return data.result;
}

function pairsToObject(flat) {
  const out = {};
  for (let i = 0; i < (flat || []).length; i += 2) out[flat[i]] = flat[i + 1];
  return out;
}

// --- Subscribers -----------------------------------------------------------

export async function getSubscribers() {
  const flat = await redis('HGETALL', 'subscribers');
  return Object.values(pairsToObject(flat))
    .map((v) => { try { return JSON.parse(v); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
}

export async function addSubscribers(emails) {
  const valid = [...new Set(emails.map((e) => String(e).trim().toLowerCase()).filter(isEmail))];
  if (!valid.length) return { added: 0, invalid: emails.length };
  const args = [];
  for (const email of valid) args.push(email, JSON.stringify({ email, addedAt: Date.now() }));
  const existing = await redis('HKEYS', 'subscribers');
  const fresh = valid.filter((e) => !existing.includes(e));
  if (fresh.length) {
    const freshArgs = [];
    for (const email of fresh) freshArgs.push(email, JSON.stringify({ email, addedAt: Date.now() }));
    await redis('HSET', 'subscribers', ...freshArgs);
  }
  return { added: fresh.length, duplicates: valid.length - fresh.length, invalid: emails.length - valid.length };
}

export async function removeSubscriber(email) {
  return redis('HDEL', 'subscribers', String(email).trim().toLowerCase());
}

export function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

// --- Admin-authored posts --------------------------------------------------

export async function getCustomPosts() {
  if (!redisConfigured()) return [];
  try {
    const flat = await redis('HGETALL', 'custom_posts');
    return Object.values(pairsToObject(flat))
      .map((v) => { try { return JSON.parse(v); } catch { return null; } })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function saveCustomPost(post) {
  await redis('HSET', 'custom_posts', post.slug, JSON.stringify(post));
}

export async function deleteCustomPost(slug) {
  return redis('HDEL', 'custom_posts', slug);
}

// --- Contact messages (stored as a backup of the email notification) -------

export async function saveContactMessage(msg) {
  if (!redisConfigured()) return;
  try {
    await redis('LPUSH', 'contact_messages', JSON.stringify({ ...msg, at: Date.now() }));
  } catch {
    // best-effort backup only
  }
}

export async function getContactMessages(limit = 200) {
  if (!redisConfigured()) return [];
  try {
    const items = await redis('LRANGE', 'contact_messages', 0, limit - 1);
    return items
      .map((v) => { try { return JSON.parse(v); } catch { return null; } })
      .filter(Boolean);
  } catch {
    return [];
  }
}
