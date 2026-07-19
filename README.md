# randywalton.com — "The Night Edition"

Randy Walton's personal essay archive and thought-leadership site, rebuilt from the
Claude Design handoff. Editorial broadsheet aesthetic: dark ink-navy masthead, serif
typography (Newsreader), gold accents, flat print-like calm.

Built with **Next.js (App Router)**. The 46 original essays live in `lib/posts-data.js`
(the canonical `posts.js` from the design handoff, with images re-pointed to `/images/`).
Each essay gets its own page at `/blog/<slug>`, with 301 redirects from the original
Squarespace paths, an RSS feed (`/feed.xml`), and a sitemap.

## Pages

- `/` — homepage (masthead, featured latest essay, archive cards)
- `/essays` — full archive grouped by year, with category filter chips
- `/blog/<slug>` — essay reading page with older/newer navigation
- `/about`, `/contact`, `/terms`
- `/admin` — private admin area (see below)

## Admin area (`/admin`)

Password-protected tools for running the site without touching code:

- **Essays** — write and publish new essays (plain text or HTML). They appear on the
  homepage, archive, feed, and sitemap immediately, at `/blog/<slug>`. Admin-posted
  essays can be edited or deleted; the original 46 are immutable.
- **Subscribers** — add (bulk paste), list, and remove blog subscribers.
- **Send update** — compose a branded email update, optionally featuring an essay with
  a "Read the essay" button; send yourself a test first, then send to every subscriber.
  Every email carries a one-click unsubscribe link.

## Deploying to Vercel

1. Import this repository into Vercel (framework preset: **Next.js** — auto-detected).
2. Add environment variables (Settings → Environment Variables):

   | Variable | Required for | Notes |
   | --- | --- | --- |
   | `ADMIN_PASSWORD` | Admin sign-in | Pick a strong password; it unlocks `/admin`. |
   | `RESEND_API_KEY` | Sending email | Free account at [resend.com](https://resend.com); verify your domain. |
   | `EMAIL_FROM` | Sending email | e.g. `Randy Walton <hello@randywalton.com>` (must be on the verified domain). |
   | `CONTACT_TO_EMAIL` | Contact form | Where inquiries go. Defaults to `randy@waltongroup.net`. |
   | `NEXT_PUBLIC_SITE_URL` | Links in emails/feed | e.g. `https://randywalton.com`. Defaults to that value. |
   | `SESSION_SECRET` | Optional | Random string; falls back to `ADMIN_PASSWORD`. |

3. Add the database (stores subscribers and admin-posted essays):
   **Storage → Create Database → Upstash for Redis** → connect to the project.
   This injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically — no code changes.
4. Deploy. Then visit `/admin`, sign in, and you're in business.

The site degrades gracefully: without the database it simply serves the 46 built-in
essays; without Resend, the admin explains what's missing instead of failing silently.

### Notes

- **Legacy images**: nine essay images originally hosted on Squarespace's CDN are
  downloaded into `public/images/` by `scripts/fetch-images.mjs` before every build
  (`prebuild`). If Squarespace ever removes them, commit the previously fetched files.
- **Portrait**: drop a photo at `public/images/portrait.jpg` to fill the About-page
  portrait slot (380×460 or any similar-ratio image).
- **Old URLs**: `next.config.mjs` generates permanent redirects from each essay's
  original Squarespace path (`sourcePath`) to its new `/blog/<slug>` URL.

## Local development

```bash
npm install
npm run dev
```

Optionally create `.env.local` with the variables above to exercise the admin,
email, and database features locally.
