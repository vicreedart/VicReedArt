# Project ownership and delivery rules

- This project and every task in this chat belong to the artist.
- Push only to repositories owned by `vicreedart`. The approved repository is `https://github.com/vicreedart/VicReedArt.git`.
- Deploy only to Victoriareedart@gmail.com's Cloudflare account, ID `96beea4cdf2cb1c69115c88264af1c01`.
- Never push to the developer's personal GitHub repositories or deploy to their personal Cloudflare or Vercel accounts.
- Verify the exact repository and account before every push or deployment. Never override the deployment guard to use another account.
- Use Next.js static export and Cloudflare-native APIs. No Vercel services, deployment config, analytics or image optimization endpoints.
- Sanity and Resend must be owned by the artist. Never commit secrets, inquiry data, private photographs or authentication files.
- The approved Sanity project is `oifmrrva`, dataset `production`, in the artist's `Vic Reed Art` organization. Never seed, read content from, or deploy a Studio for a different project.
- Preview content must be visibly labeled. Production must require approved Sanity content and prohibit demo imagery.
- Run lint, type checking, form tests and a production-format build before delivery. Verify desktop and mobile in a browser.
