# VicReedArt

A coastal mosaic artist portfolio: Next.js and TypeScript export static HTML, Cloudflare Workers Static Assets hosts the pages, Sanity provides published content at build time, and one small Cloudflare Worker sends commission inquiries through Resend.

**Current content is a labeled design preview.** The included artwork imagery is generated illustration, not the artist's original work. No prices or final biography are invented. Preview forms do not send email. A production build refuses demo content, unapproved CMS settings, or incomplete public form configuration.

- Preview: https://vicreedart-preview.victoriareedart.workers.dev
- Content editor: https://vicreedart.sanity.studio
- Review: https://github.com/vicreedart/VicReedArt/pull/1

The preview reads the artist's Sanity dataset during builds. Four labeled sample artworks and six sample images have been imported; the temporary import credential has been revoked. The preview Worker is connected to the `codex/artist-portfolio` branch. The Sanity webhook **Cloudflare artist preview** rebuilds that preview after published artwork or website settings change; it excludes drafts and releases. Production remains gated until approved content, domain and inquiry configuration are ready.

## Ownership

- Source: https://github.com/vicreedart/VicReedArt
- Cloudflare: `Victoriareedart@gmail.com's Account`, ID `96beea4cdf2cb1c69115c88264af1c01`.
- Production Worker: `vicreedart`; separate preview Worker: `vicreedart-preview`.
- Sanity: project `oifmrrva`, dataset `production`, in the artist's **Vic Reed Art** organization. Content import, fetching and Studio configuration reject other destinations.
- Resend and the domain must also belong to the artist.
- Never push to the developer's repositories or deploy to their personal Cloudflare or Vercel accounts. The deployment scripts check the Git remote and exact Cloudflare account before running Wrangler.

## Local setup

Use Node.js 24 LTS and npm. From the repository root:

```sh
npm ci
npm run check
npm run preview
```

Open http://127.0.0.1:8787. This serves the actual static export through Cloudflare's local runtime. For rapid UI editing, `npm run dev` starts Next.js at http://127.0.0.1:3000. The inquiry API exists only in the Cloudflare runtime.

Copy `.env.example` to `.env.local` for local build and Studio settings. Copy `.dev.vars.example` to `.dev.vars` only when testing the Worker locally. These files are ignored. Never put tokens in a `NEXT_PUBLIC_` variable. Public preview mode needs neither file.

## Project layout

```text
src/app/              Home, work, artwork details, about, commissions, privacy, SEO
src/components/       Shared layout, image, gallery and inquiry components
src/content/          Typed content contract and explicitly temporary demo content
src/lib/inquiry.ts    Shared inquiry validation and upload limits
worker/              Cloudflare-only inquiry endpoint
studio/              Sanity schema, editing structure and CLI configuration
scripts/             Content fetch, static headers, target checks and deployment
tests/               Inquiry behavior and ownership safeguards
public/images/demo/  Optimized, labeled preview illustrations
.github/workflows/   Source checks, without deployment credentials
```

## Content and Studio

The artist's verified Sanity project is `oifmrrva`, with dataset `production`. These public identifiers are included in `.env.example`. Set `SANITY_PROJECT_ID` / `SANITY_DATASET` for the build and the matching `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` for the editor. Tokens remain private.

```sh
npm run studio:dev
npm run studio:build
npm run studio:deploy
```

The Studio command uses the configuration in `studio/` and the dependencies installed at the repository root. Login to Sanity with an account authorized for the artist's project before deployment. The chosen `SANITY_STUDIO_HOSTNAME` must be artist-owned. Studio hosting is separate from the public portfolio.

Optional, one-time preview seed:

```sh
npm run studio:seed -- --project=oifmrrva
```

This requires a temporary `SANITY_WRITE_TOKEN`, uploads the six sample illustrations, and creates labeled sample documents. It refuses a project that already contains artwork or website settings. Revoke the temporary token afterward. Never use the seed as final content. Seeded commissions and production approval are disabled.

Set `CONTENT_MODE=sanity` to fetch published CMS documents. There is one bounded query per build (maximum 500 artworks), no polling, no browser CMS token, and no CMS requests on portfolio page visits. Failed or incomplete content stops the build rather than silently substituting samples. Sanity documents support ordering, featured work, archive, availability, multiple images and editable page text.

## Cloudflare deployment

This uses Workers Static Assets rather than a Next.js server adapter. Next.js exports `out/`; assets are served before the Worker. Only `/api/*` runs the Worker first. There are no Next.js server actions, dynamic image endpoints, ISR, databases, queues, cron jobs or persistent servers. Ordinary links navigate static pages without speculative React Server Component prefetch requests.

Use Cloudflare **Workers & Pages → Create application → Continue with GitHub** within the artist's account. Select only `vicreedart/VicReedArt`. Connect a separate preview Worker first:

| Setting        | Preview                         | Production after launch preparation |
| -------------- | ------------------------------- | ----------------------------------- |
| Worker name    | `vicreedart-preview`            | `vicreedart`                        |
| Git branch     | `codex/artist-portfolio`        | `main`                              |
| Root directory | repository root                 | repository root                     |
| Build command  | `npm run build`                 | `npm run build:production`          |
| Deploy command | `npm run deploy:preview`        | `npm run deploy:production`         |
| Content        | `CONTENT_MODE=demo` or `sanity` | approved `CONTENT_MODE=sanity`      |
| Node           | `NODE_VERSION=24`               | `NODE_VERSION=24`                   |

Use the same preview deploy command for any non-production branch command, or leave branch builds disabled. Do not let an unreviewed branch deploy the production Worker. These commands deploy the built files and the required Worker together. Cloudflare installs packages from `package-lock.json` before the build. Wrangler's account ID is fixed in `wrangler.jsonc`; keep it unchanged.

After the production Worker is connected to `main`, pushes to that branch trigger builds and deployments. Configure a **Cloudflare deploy hook** for the production branch and add its URL as a POST webhook in the artist's Sanity project. Enable create/update/delete, exclude drafts and versions, and filter to `artwork` and `siteSettings`. Publishing then rebuilds the static site. Treat the hook URL as a secret; do not put it in Git. Do not add recursive callbacks or periodic rebuilds. See [Cloudflare deploy hooks](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/).

For a manual deploy after building, authenticate Wrangler to the artist's account and run `npm run deploy:preview` or `npm run deploy:production`. A scoped account token can be supplied as `CLOUDFLARE_API_TOKEN`; do not commit it. Build output carries a content digest, so changed content requires a new successful build.

## Environment variables

| Variable                                            | Location and purpose                                                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CONTENT_MODE`                                      | Build: `demo` for preview or `sanity` for CMS content.                                                                                                 |
| `DEPLOYMENT_ENV`                                    | Build: `production` only for final publication. Set automatically by `build:production`; leave unset for preview.                                      |
| `NEXT_PUBLIC_SITE_URL`                              | Build: exact site origin used for canonical URLs and metadata. Use the final HTTPS origin for production.                                              |
| `SANITY_PROJECT_ID`, `SANITY_DATASET`               | Build: artist's project and published dataset.                                                                                                         |
| `SANITY_READ_TOKEN`                                 | Build secret, only needed for a private dataset; read-only. Never shipped to visitors.                                                                 |
| `SANITY_WRITE_TOKEN`                                | Local, temporary secret used only for the optional seed.                                                                                               |
| `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` | Public editor configuration matching the artist's project.                                                                                             |
| `SANITY_STUDIO_HOSTNAME`                            | Artist's chosen hosted Studio subdomain.                                                                                                               |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                    | Build: public Cloudflare Turnstile site key for the final hostname.                                                                                    |
| `NEXT_PUBLIC_INQUIRIES_ENABLED`                     | Build: `true` only when real form delivery is configured. Preview always disables sending.                                                             |
| `CLOUDFLARE_API_TOKEN`                              | Local deploy secret if token authentication is used; never a browser value.                                                                            |
| `SITE_URL`                                          | Worker: exact production origin. Set the production `vars` value in `wrangler.jsonc` to match `NEXT_PUBLIC_SITE_URL`.                                  |
| `INQUIRIES_ENABLED`                                 | Worker: production `vars` flag in `wrangler.jsonc`. Defaults to `false`. Set to `true` after secrets and delivery verification. Preview stays `false`. |
| `TURNSTILE_SECRET_KEY`                              | Worker secret: verification key from the artist's Cloudflare account.                                                                                  |
| `RESEND_API_KEY`                                    | Worker secret: sending-only key from the artist's Resend account.                                                                                      |
| `INQUIRY_TO_EMAIL`                                  | Worker secret/config: artist's destination inbox. Confirm with the artist.                                                                             |
| `INQUIRY_FROM_EMAIL`                                | Worker secret/config: sender on a domain verified in her Resend account.                                                                               |

Add Worker secrets in Cloudflare **Worker → Settings → Variables and Secrets** (production Worker only) or with `npx wrangler secret put NAME`. Build variables belong to **Settings → Build → Variables and secrets**, not the runtime secrets panel. A verified sender domain is required for general public email delivery. An account sharing the same Gmail login does not automatically connect any service.

## Inquiry behavior and usage controls

The form posts to `/api/commissions`. The Worker checks origin/host, method, a honeypot, form age, field lengths, file signatures, Turnstile hostname/action and native rate limit bindings. Limits are 3 requests per IP/minute and 2 valid submissions per email/minute; Cloudflare's limiter is permissive and location-local, not a hard global spending cap. See [rate limiting bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

Allow up to 3 JPEG, PNG or WebP images, 2 MB each and 5 MB combined; the entire streaming request is capped at 6 MB. Images are attached to one plain-text email and not written to a separate database or object store. Request bodies are held transiently in Worker memory. Inbox and email-provider retention remain under the artist's accounts.

Buttons lock during sending. Stable Resend idempotency keys protect explicit retries of identical requests. External calls have bounded timeouts and no automatic retries. No visitor confirmation email is sent. The artist's fixed destination prevents use as an open relay. A success screen appears only after Resend returns an accepted message ID; inbox delivery must still be tested before launch.

Static pages use responsive WebP assets or a fixed set of Sanity CDN image widths, lazy images below the fold, self-hosted fonts, immutable hashed assets, CSP script hashes, and no analytics. Preview has a visible banner, `noindex` headers/metadata, and a disallowing robots file. This discourages indexing; it is not access control.

No paid plan is activated by this repository. The current Cloudflare account uses the Free plan, which supplies its own CPU limit and rejects an explicit `limits.cpu_ms` setting; that setting is intentionally omitted. Provider allowances still apply, and request rate limits do not guarantee a hard account-wide cost cap. Keep spending notifications configured in the artist's provider accounts. Verify large attachments against the selected Cloudflare plan before opening the live form; investigate resource-limit failures before changing plans.

## Validation

`npm run check` runs content validation, ESLint, strict TypeScript for the site/Worker/Studio, automated inquiry/ownership tests, and the optimized static export. `npm run studio:build` separately checks the editor bundle. `npx wrangler deploy --env preview --dry-run` bundles the Cloudflare entry point without publishing. Browser verification should use `npm run preview`, including keyboard/mobile navigation, artwork links, form errors and disabled preview submission.

Tests mock Turnstile and Resend; they do not send real emails. A final real-domain verification and an artist-approved test inquiry are required after credentials are connected. See [HANDOFF.md](HANDOFF.md) for daily editing, launch and rollback, and [ASSETS.md](ASSETS.md) for temporary imagery provenance.
