import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { isAdmin, adminConfigured } from '@/lib/auth';
import { redisConfigured } from '@/lib/redis';
import { resendConfigured } from '@/lib/email';
import Dashboard from './Dashboard';

export const metadata = { title: 'Admin — Randy Walton', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="page">
        <SiteHeader />
        <main className="admin-main">
          <div className="admin-shell">
            <h1 className="admin-h1">Admin setup</h1>
            <div className="admin-panel">
              <h2>One step left</h2>
              <p className="admin-note">
                The admin area is locked until a password is configured. In your Vercel project, go
                to <strong>Settings → Environment Variables</strong> and add:
              </p>
              <ul className="setup-list">
                <li>
                  <code>ADMIN_PASSWORD</code> — the password you&rsquo;ll use to sign in here.
                </li>
              </ul>
              <p className="admin-note" style={{ marginTop: 16 }}>
                Then redeploy. The README covers the email and database variables too.
              </p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!(await isAdmin())) redirect('/admin/login');

  return (
    <div className="page">
      <SiteHeader />
      <main className="admin-main">
        <div className="admin-shell">
          <h1 className="admin-h1">Admin</h1>
          <div className="admin-sub">ESSAYS · SUBSCRIBERS · EMAIL UPDATES</div>
          <Dashboard
            config={{ redis: redisConfigured(), resend: resendConfigured() }}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
