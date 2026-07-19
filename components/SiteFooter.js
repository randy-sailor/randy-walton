import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-wordmark">
        Randy Walton<span className="dot">.</span>
      </div>
      <div className="footer-links">
        <a href="https://www.linkedin.com/in/randywalton">LINKEDIN</a>
        <a href="http://instagram.com/randywalton">INSTAGRAM</a>
        <Link href="/terms">TERMS</Link>
      </div>
    </footer>
  );
}
