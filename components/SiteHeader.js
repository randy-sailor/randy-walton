import Link from 'next/link';

export default function SiteHeader({ active }) {
  const cls = (name) => (active === name ? 'active' : undefined);
  return (
    <header className="site-header">
      <div className="site-header-row">
        <Link href="/" className="wordmark">
          Randy Walton<span className="dot">.</span>
        </Link>
        <nav className="site-nav">
          <Link href="/essays" className={cls('essays')}>ESSAYS</Link>
          <Link href="/about" className={cls('about')}>ABOUT</Link>
          <Link href="/contact" className={cls('contact')}>CONTACT</Link>
        </nav>
      </div>
    </header>
  );
}
