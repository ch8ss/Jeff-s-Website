# Jeff — wall art & graffiti portfolio

Next.js 16 (App Router, Cache Components) · Tailwind v4 · GSAP + Lenis · Supabase · Vercel.

The site runs **without any setup**: with no Supabase env vars it renders the starter content in `lib/seed.ts`, which uses Jeff's own photos (`public/work/`, listed in `lib/work-manifest.json`) and process clips (`public/video/`). Connect Supabase so Jeff can manage everything himself from `/admin`.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Connect Supabase

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then `0002_clips.sql` (tables, RLS, storage buckets + policies).
3. **Auth → Providers → Email**: keep email enabled. **Auth → Settings**: turn **off** "Allow new users to sign up".
4. **Auth → Users → Add user**: create Jeff's account (email + password).
5. Make that user an admin:
   ```sql
   insert into admins (user_id) select id from auth.users where email = 'jeff@gmail.com';
   ```
6. Copy `.env.example` to `.env.local` and fill in the values (Project settings → API).
7. Load the starter content (Jeff's 40 artworks, 8 clips, hero/portrait images) into Supabase:
   ```bash
   node scripts/import-to-supabase.mjs
   ```
   It's safe to re-run; anything already imported is skipped, and it never overwrites settings Jeff has changed.
8. Sign in at `/admin/login`. Fill in **Settings** (bio, tagline, city, stats, socials), then edit the artworks: real titles, years, cities, descriptions and prices.

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel (frontend + server actions deploy together).
2. Add the env vars from `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to the real domain (it drives canonical URLs, the sitemap and OG tags).
3. Add the custom domain, then enable **Analytics** and **Speed Insights** in the Vercel dashboard (the components are already in `app/layout.tsx`).
4. Submit `https://your-domain/sitemap.xml` in Google Search Console.

## How content updates go live

Every public read in `lib/queries.ts` is cached with `'use cache'` + `cacheTag(...)`, so pages prerender as static HTML. Admin server actions (`app/admin/actions.ts`) call `updateTag(...)` after each save, so the live site updates on the next request. (This is the Cache Components equivalent of the `revalidatePath` calls in the spec.)

## Where things live

| Path | What |
|---|---|
| `app/(site)/` | Public pages: home, `/for-sale`, `/art/[slug]`, `/walls`, `/blog`, `/blog/[slug]` |
| `app/admin/` | Dashboard: artworks, blog, projects, timeline, testimonials, enquiries, settings |
| `components/sections/` | The 7 home sections |
| `components/ui/Motion.tsx` | Lenis + all scroll animation, driven by `data-*` attributes (`data-bg`, `data-reveal`, `data-words`, `data-count`…) |
| `lib/queries.ts` | Cached data access (falls back to `lib/seed.ts`) |
| `lib/seo.ts` | JSON-LD builders (Person, VisualArtwork + Offer, BlogPosting, BreadcrumbList) |
| `proxy.ts` | Refreshes the Supabase session on `/admin/*` and redirects signed-out users (Next 16 renamed middleware to proxy) |
| `supabase/migrations/` | Schema, RLS, storage |

## Notes and small departures from the spec

- **Still placeholder**: the logo (`components/ui/Logo.tsx`, `app/icon.svg`), and the sample copy for the story paragraph, stats, timeline, projects, testimonials and blog posts. Artwork titles are working titles.
- **Process clips** (`clips` table, `/admin/clips`): short videos shown muted and looping in section 06. The "Watch the process" video can be an uploaded file or a YouTube/Instagram link (Settings). Clips start muted because several carry music.
- **Two extra settings columns**: `series_name` (hero "New series ___ — out now") and `process_poster_path` (process video poster).
- **Extra table**: `contact_clicks` logs "Contact artist" clicks; the dashboard shows the most-clicked pieces.
- **Forms** use React 19 `useActionState` + zod on the server instead of `react-hook-form`. The spam guard is a honeypot field plus a per-IP/email rate limit (in-memory, plus a DB check when `SUPABASE_SERVICE_ROLE_KEY` is set).
- **Filtering on `/for-sale`** happens client-side over the server-rendered list, so the page stays fully static and crawlable.
- **Unknown slugs** (`/art/xyz`) render the not-found UI with `noindex`, but with HTTP 200, because the param is resolved inside a streamed Suspense boundary.
- **Admin images for timeline/projects** are uploaded to the `site` bucket; artwork images go to `artworks/{artwork_id}/…webp`, blog covers to `blog/covers/…`.
- Alt text is enforced in three places: the admin UI blocks saving, the server action rejects it, and the DB `check (length(alt) >= 10)`.
