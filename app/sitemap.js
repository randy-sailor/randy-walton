import { getAllPosts, SITE_URL } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const posts = await getAllPosts();
  const staticPages = ['', '/essays', '/about', '/contact', '/terms'].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: 'monthly',
  }));
  const essayPages = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date + 'T12:00:00Z'),
    changeFrequency: 'yearly',
  }));
  return [...staticPages, ...essayPages];
}
