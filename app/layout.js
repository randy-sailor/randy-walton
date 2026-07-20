import { Newsreader, Archivo } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/content';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Randy Walton — Thinking without a box',
  description:
    "Randy Walton's essay archive — thoughts on leadership, growth, innovation, change, and faith. Thinking without a box.",
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${archivo.variable}`}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
