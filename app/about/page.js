import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Portrait from '@/components/Portrait';

export const metadata = {
  title: 'About — Randy Walton',
  description: 'A business, ministry, and social entrepreneur. CEO and Managing Partner of The Walton Group.',
};

export default function AboutPage() {
  return (
    <div className="page">
      <SiteHeader active="about" />
      <main className="about-main">
        <div className="about-grid">
          <aside>
            <Portrait />
            <div className="currently">
              <div className="currently-label">CURRENTLY</div>
              <div className="currently-list">
                <div>
                  CEO &amp; Managing Partner, <strong>The Walton Group</strong>
                </div>
                <div>
                  Partner, <strong>ANGL</strong>
                </div>
                <div>
                  Partner, <strong>Remarkable!</strong>
                </div>
                <div>
                  Co-author, <em>Roadmap to Remarkable!</em>
                </div>
              </div>
            </div>
          </aside>
          <article className="about-article">
            <div className="page-kicker">ABOUT ME</div>
            <h1 className="about-h1">A business, ministry, and social entrepreneur.</h1>
            <p className="about-p first">
              I currently serve as the CEO and Managing Partner for The Walton Group, Inc., Partner
              at ANGL, and Partner at Remarkable! I am also the co-author of{' '}
              <em>Roadmap to Remarkable!</em>
            </p>
            <p className="about-p">
              I am an author, speaker, consultant, adventure racer, global missions advocate,
              private pilot, ministry leader, father of three daughters, and husband to one wife.
            </p>
            <p className="about-p">
              I work with leaders and entrepreneurs seeking to grow their influence in the
              marketplace and the world. I also help companies identify ways to radically grow their
              competitive advantage in the marketplace to accelerate top-line revenue growth. I am
              blessed to be able to spend my days with incredibly smart people as they seek to find
              ways to connect the calling and gifting that God has given them with their marketplace
              efforts.
            </p>
            <p className="about-p">
              As well as partnering with leaders to grow companies, I have been incredibly fortunate
              to travel the world helping business leaders internationally who are seeking to
              leverage their business platforms as tools to share their faith.
            </p>
            <p className="about-p aside">
              When I am not working, reading, meeting with ministry leaders, planning events,
              writing, traveling, mountain biking, dating my wife, hanging with my kids, or flying —
              that means I am probably asleep.
            </p>
            <div className="about-ctas">
              <Link href="/contact" className="btn-navy">
                GET IN TOUCH
              </Link>
              <Link href="/essays" className="btn-outline">
                READ THE ESSAYS
              </Link>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
