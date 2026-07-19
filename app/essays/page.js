import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getAllPosts } from '@/lib/content';
import ArchiveClient from './ArchiveClient';

// Content merges admin-published essays from Redis at request time.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Essays — Randy Walton',
  description: 'The full essay archive — leadership, growth, innovation, change, faith, ministry, and a few oddities.',
};

export default async function EssaysPage() {
  const posts = await getAllPosts();
  const slim = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    categories: p.categories || [],
  }));
  return (
    <div className="page">
      <SiteHeader active="essays" />
      <main className="essays-main">
        <ArchiveClient posts={slim} />
      </main>
      <SiteFooter />
    </div>
  );
}
