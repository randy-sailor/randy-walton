import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { unsubscribeToken } from '@/lib/auth';
import { redisConfigured, removeSubscriber } from '@/lib/redis';

export const metadata = { title: 'Unsubscribe — Randy Walton', robots: { index: false } };

export default async function UnsubscribePage({ searchParams }) {
  const params = await searchParams;
  const email = String(params.e || '');
  const token = String(params.t || '');
  const valid = email && token && token === unsubscribeToken(email);

  let removed = false;
  if (valid && redisConfigured()) {
    try {
      await removeSubscriber(email);
      removed = true;
    } catch {
      removed = false;
    }
  }

  return (
    <div className="page">
      <SiteHeader />
      <main className="simple-main">
        <div className="simple-center">
          <div className="page-kicker">MAILING LIST</div>
          <h1 className="simple-h1">{valid ? 'You are unsubscribed.' : 'Invalid link.'}</h1>
          <p className="simple-p">
            {valid
              ? removed
                ? `${email} has been removed from the list. Sorry to see you go — the essays will always be here if you change your mind.`
                : `We couldn't reach the subscriber list just now, but your link is valid — please try again in a moment.`
              : 'This unsubscribe link is incomplete or has expired. If you keep receiving emails, reply to any of them and I will remove you personally.'}
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
