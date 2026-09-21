# VicReedArt — artist handoff

## What belongs to you

Your source code belongs in **vicreedart/VicReedArt** on GitHub. Your website belongs in **Victoriareedart@gmail.com's Account** on Cloudflare, account ID `96beea4cdf2cb1c69115c88264af1c01`. Your Sanity project, Resend email account and domain should also stay in accounts you control. A future developer should receive an invitation, not your password.

The current website is a design preview. Its illustrations, sample artwork titles and sample availability are labeled. They must be replaced with your own photographs and approved details before public launch. The preview inquiry form never sends messages. Your verified Sanity project is `oifmrrva`, dataset `production`, in your **Vic Reed Art** organization. Four sample artworks have been imported, and the temporary import token has been revoked. Your Resend account needs a verified sending domain and its sending key configured in Cloudflare.

- Website preview: https://vicreedart-preview.victoriareedart.workers.dev
- Your content editor: https://vicreedart.sanity.studio

## Edit the website

Bookmark your content editor above. Sign in with the Google account you used for Sanity. You can also open your project from https://www.sanity.io/manage and follow its Studio link.

The editor has two main sections: **Artwork** and **Website text & settings**. Changes save as drafts while you work. Click **Publish** when a document is ready. After the publish webhook is connected, Cloudflare rebuilds the website; wait for that deployment to finish before expecting to see the change. A build failure preserves the previously deployed website.

### Add artwork

1. Open **Artwork**, then create an artwork.
2. Enter its title and use **Generate** beside Page address. Once published, keep that address unchanged so saved links still work.
3. Upload your photographs. The first image is the gallery cover; drag images to reorder them. Add a short description to each photograph for accessibility. Choose a focal position if a crop needs adjusting.
4. Enter availability, type, description, dimensions and materials. Price and year can be left empty. An empty price stays hidden.
5. Choose a Display order number. Lower numbers appear first; use 10, 20, 30 and so on.
6. Turn on **Feature on homepage** if wanted, then click **Publish**.

The first four featured pieces in display order appear on Home. Keep at least one piece featured. The website supports up to 500 published, unarchived artworks before a developer needs to review its build limits.

### Update or hide artwork

- **Change a price:** open the piece, edit Price and Currency, then Publish.
- **Mark sold:** change Availability to Sold, then Publish. It stays in your portfolio.
- **Reorder the gallery:** edit Display order; lower numbers come first.
- **Change featured pieces:** toggle Feature on homepage and Publish each affected piece.
- **Hide a piece:** enable Hide from website and Publish. Its page disappears on the next build. Keep the document if you might restore it later.
- **Delete permanently:** use Sanity's document menu only if you no longer need the record. Archiving is usually easier to undo. Removing or renaming a published page can break previously shared links.

### Edit your story and contact details

Open **Website text & settings**. Use its tabs to edit Identity, Homepage, Gallery, About, Commissions, and Contact & launch. Each biography item is one paragraph. Upload your own artist photograph and replace the temporary caption. A general town or region is sufficient for your studio location.

In **Commissions**, turn **Accepting commissions** on or off. The closed message appears when switched off. Changing this setting does not create email credentials; a developer must finish email setup before you first open commissions.

In **Contact & launch**, enter the public contact email and complete social links. The public email is separate from the private destination inbox configured in Cloudflare. A developer should update that private destination if you want inquiries delivered elsewhere.

## Where inquiries go

After setup, successful inquiries are emailed through your Resend account to the inbox in Cloudflare's `INQUIRY_TO_EMAIL` setting. Reply to that email normally; Reply-To is the visitor's address. Inspiration images arrive as attachments. There is no additional inquiry database or dashboard to maintain.

Check spam filtering and your inbox regularly. Resend can show whether a message was accepted, delivered or bounced. The website displays success after the provider accepts the email, which is not a guarantee that your mailbox has delivered it. Never ask visitors to upload sensitive documents.

## Before launch

Complete these items with your developer:

1. Open your Studio for Sanity project `oifmrrva`, dataset `production`, and replace every sample image and record.
2. Supply approved biography, original photographs, artwork facts, contact details and social links. Review every page on a phone and computer. Disable Temporary sample artwork for entries only after replacing the samples. Enable Content approved for launch when everything is accurate.
3. Connect your domain in your Cloudflare account. No domain purchase is included in the code. Set the final website address in build settings and `wrangler.jsonc`.
4. Verify a sending domain in your Resend account. Configure its sending-only key, From address and your destination inbox as secrets on the production Cloudflare Worker.
5. Create Cloudflare Turnstile verification for the final hostname. Configure its public key for the build and private key on the Worker. Enable both inquiry flags after these are ready.
6. Deploy using the production command, then send one agreed test inquiry, including an image. Verify the success page, inbox delivery, attachment and Reply-To. Test a validation error as well. This real delivery check cannot be completed with placeholder credentials.
7. Connect GitHub `main` to the production Worker and the Sanity publish webhook to its Cloudflare deploy hook. Publish a small text change and confirm a successful rebuild.

Before these steps are complete, use only the labeled preview. No secrets are needed in chat; enter them directly in the appropriate account settings.

## Deployment and rollback

Cloudflare hosts static pages. A GitHub push to the connected production branch (`main`) or a Sanity publish event starts a new build. The developer's README gives the exact commands and settings. The preview Worker is separate and cannot send email.

If a new deployment is wrong, open **Cloudflare → Workers & Pages → vicreedart → Deployments**, select the last working deployment, and use **Rollback**. Verify Home and an artwork page afterward. Rollback restores a previously uploaded static snapshot and Worker version; it does not undo later edits in Sanity or changes to external email accounts/secrets. Correct the underlying content or code before another build, otherwise it will reintroduce the problem. For a code problem, your developer can revert the relevant GitHub commit and let Cloudflare rebuild.

If spam or delivery trouble starts, have your developer set the production `INQUIRIES_ENABLED` flag to `false` and redeploy, then close commissions in Sanity. The static portfolio remains available.

## Give a future developer access

Invite the developer to this GitHub repository, your Cloudflare account, your Sanity project and—only if needed—your Resend account. Give each service only the role needed for the work. Keep your own owner access and recovery methods. When the engagement ends, remove those invitations and revoke any temporary access tokens.

The README lists every environment variable and where it belongs. `.env.example` and `.dev.vars.example` contain names only. Never send passwords or API keys in GitHub issues, commit messages, browser-visible code or public documents. No personal developer hosting account is required to operate the site.
