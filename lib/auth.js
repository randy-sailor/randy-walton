import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'rw_admin';

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function sessionToken() {
  return crypto.createHmac('sha256', secret()).update('rw-admin-session-v1').digest('hex');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(password) {
  if (!adminConfigured()) return false;
  return safeEqual(password, process.env.ADMIN_PASSWORD);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, sessionToken());
}

export function unsubscribeToken(email) {
  return crypto
    .createHmac('sha256', secret())
    .update('unsub:' + String(email).trim().toLowerCase())
    .digest('hex')
    .slice(0, 32);
}
