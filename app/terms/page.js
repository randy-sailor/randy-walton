import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Terms — Randy Walton',
  description: 'A note on this site.',
};

export default function TermsPage() {
  return (
    <div className="page">
      <SiteHeader />
      <main className="simple-main">
        <div className="simple-center">
          <div className="page-kicker">TERMS</div>
          <h1 className="simple-h1">A note on this site.</h1>
          <p className="simple-p">
            This is just a place to write and express my own ideas of the world. Any offense is
            unintentional. You may freely link to my content, but may not use it, publish it, or
            share it in any way without express written consent.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
