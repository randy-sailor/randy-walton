import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getPost, fmtDate, excerptOf } from '@/lib/content';

// Content merges admin-published essays from Redis at request time.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await getPost(slug);
  if (!post) return { title: 'Essay — Randy Walton' };
  return {
    title: `${post.title} — Randy Walton`,
    description: excerptOf(post),
  };
}

export default async function EssayPage({ params }) {
  const { slug } = await params;
  const { post, prev, next } = await getPost(slug);
  if (!post) notFound();

  const kicker =
    fmtDate(post.date).toUpperCase() +
    (post.categories?.length ? ' · ' + post.categories.join(', ').toUpperCase() : '');

  return (
    <div className="page">
      <SiteHeader active="essays" />
      <main className="essay-main">
        <article className="essay-article">
          <div className="essay-kicker">{kicker}</div>
          <h1 className="essay-h1">{post.title}</h1>
          <div className="essay-ornament">
            <div className="rule" />
            <div className="diamond" />
            <div className="rule" />
          </div>
          {post.body ? (
            <div className="essay-body" dangerouslySetInnerHTML={{ __html: post.body }} />
          ) : (
            <div className="essay-missing">
              <div className="big">This essay is still being ported from the original archive.</div>
              <div className="small">Full text arriving shortly.</div>
            </div>
          )}
          <div className="essay-pagination">
            {prev && (
              <Link href={`/blog/${prev.slug}`} className="pag-link">
                <div className="pag-label">← OLDER</div>
                <div className="pag-title">{prev.title}</div>
              </Link>
            )}
            {next && (
              <Link href={`/blog/${next.slug}`} className="pag-link next">
                <div className="pag-label">NEWER →</div>
                <div className="pag-title">{next.title}</div>
              </Link>
            )}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
