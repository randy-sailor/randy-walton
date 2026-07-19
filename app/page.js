import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import { getAllPosts, fmtDate, excerptOf, cardKicker } from '@/lib/content';

// Content merges admin-published essays from Redis at request time.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const posts = await getAllPosts();
  const featured = posts[0];
  const cards = posts.slice(1, 4);
  const moreTitles = posts.slice(4, 8);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-topbar">
          <span>EST. 2010 · ATLANTA</span>
          <nav className="site-nav">
            <Link href="/essays">ESSAYS</Link>
            <Link href="/about">ABOUT</Link>
            <Link href="/contact">CONTACT</Link>
          </nav>
        </div>
        <div className="masthead-center">
          <h1 className="masthead-h1">Randy Walton</h1>
          <div className="tagline-row">
            <div className="tagline-rule" />
            <div className="tagline">Thinking without a box</div>
            <div className="tagline-rule" />
          </div>
          {featured && (
            <div className="featured">
              <div className="featured-kicker">LATEST · {fmtDate(featured.date).toUpperCase()}</div>
              <h2 className="featured-title">
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p className="featured-deck">{excerptOf(featured)}</p>
              <Link href={`/blog/${featured.slug}`} className="btn-gold">
                READ THE ESSAY
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="home-main">
        <div className="section-head">
          <div className="section-label">FROM THE ARCHIVE</div>
          <Link href="/essays" className="italic-link">
            All {posts.length} essays →
          </Link>
        </div>
        <div className="card-grid">
          {cards.map((p) => (
            <article className="card" key={p.slug}>
              <div className="card-kicker">{cardKicker(p)}</div>
              <h3 className="card-title">
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </h3>
              <p className="card-excerpt">{excerptOf(p)}</p>
            </article>
          ))}
        </div>
        <div className="more-titles">
          {moreTitles.map((p, i) => (
            <span key={p.slug} style={{ display: 'contents' }}>
              {i > 0 && <span className="sep">·</span>}
              <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            </span>
          ))}
        </div>
        <div className="home-duo">
          <div>
            <div className="duo-label">ABOUT THE AUTHOR</div>
            <p className="duo-text">
              I am a business, ministry, and social entrepreneur. CEO and Managing Partner of The
              Walton Group, partner at ANGL and Remarkable!, and co-author of{' '}
              <em>Roadmap to Remarkable!</em> I work with leaders seeking to grow their influence in
              the marketplace and the world.
            </p>
            <Link href="/about" className="duo-link">
              More about me →
            </Link>
          </div>
          <div>
            <div className="duo-label">SPEAKING &amp; CONSULTING</div>
            <p className="duo-text">
              For speaking requests, consulting, or other inquiries — I&rsquo;d love to hear from
              you.
            </p>
            <Link href="/contact" className="btn-navy">
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
