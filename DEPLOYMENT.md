# Choco Brown Deployment

The complete ZIP includes the editable project and an already-built website. You do not need to install Node.js or use a terminal to publish the included build using Netlify Drop.

## Package Contents

| Location | What it contains |
| --- | --- |
| `dist/` | The ready-to-publish production website. |
| `src/` | Editable React and TypeScript source code. |
| `public/images/` | All eight bakery images. |
| `public/fonts/` | Open-source font licences. The fonts (DM Sans, Fraunces) load from Google Fonts via `index.html`. |
| `package.json` and `package-lock.json` | Dependencies, commands, and the exact dependency lockfile. |
| `netlify.toml` | Netlify build and publish settings. |
| `vercel.json` | Vercel framework, install, build, and output settings. |
| `.nvmrc` | Recommended Node.js major version: 22. |
| `tests/` and `playwright.config.ts` | Browser interaction and accessibility checks. |
| `scripts/package_release.py` | Optional tool to recreate the ZIP packages after rebuilding. |

The complete archive has a top-level `choco-brown` folder. The smaller `choco-brown-live.zip` has the contents of `dist/` directly at its root. Dependencies in `node_modules`, screenshots, local caches, and credentials are deliberately excluded. Install dependencies with `npm ci` if you want to edit or rebuild the source.

## Quick Publish

Use this method if you just want the website online. A desktop or laptop is easiest.

1. Extract `choco-brown-complete.zip` on your computer.
2. Open the extracted `choco-brown` folder and locate `dist`. Check that `dist/index.html`, `dist/images/`, and `dist/fonts/` exist.
3. Create or sign in to your own Netlify account at <https://app.netlify.com/login>. Sign in first so the project belongs to your account.
4. Open <https://app.netlify.com/drop>.
5. Drag the entire `dist` folder into the drop area. Do not upload only `index.html`, the `src` folder, or the unextracted ZIP.
6. Wait for deployment to finish. Open the `netlify.app` address Netlify supplies. That is your public website address.
7. Test the page on your phone and computer, including menu filtering, adding to the bag, the prepared WhatsApp message, and the store links.
8. If desired, customize the project name in Netlify. The name must be available; a particular `netlify.app` name is not guaranteed.

Alternatively, extract `choco-brown-live.zip` into an empty folder. Upload that extracted folder, ensuring `index.html` is directly inside it. This is the same production build without the editable source.

No API keys, environment variables, database, or backend server are required for the included features. Review the host's current pricing and usage limits. A custom domain is normally purchased separately.

## Custom Domain

1. Purchase a domain from a registrar, or use a domain you already control.
2. In your Netlify project, open **Domain management** and add your domain using the option for a domain you already own.
3. Open the DNS settings at your domain registrar or DNS provider.
4. Add the exact website DNS records Netlify shows for your project. Use the dashboard values rather than an IP address copied from an old tutorial. Configure both the root domain and `www` if you want both to work.
5. Preserve existing email-related MX and TXT records. If changing nameservers, first copy any existing email and verification records to the new DNS provider.
6. Wait for DNS verification and certificate provisioning. This can take time; Netlify's dashboard shows the current status.
7. Set your preferred primary domain and confirm the site opens over `https://` before sharing it publicly.

You need access to the domain's DNS settings. Creating these project files does not register a domain or change any DNS records for you.

## Local Editing

1. Install the latest Node.js 22 release from <https://nodejs.org/>. Use version 22.12 or later within Node.js 22.
2. Extract the complete project ZIP and open a terminal in the `choco-brown` folder, the folder containing `package.json`.
3. Run `npm ci` to install the locked dependencies. An internet connection is needed for this step.
4. Run `npm run dev` and open the local URL printed in the terminal.
5. Edit the source files. The local preview updates as you save.
6. Run `npm run build` when your edits are ready. This replaces `dist/` with a fresh production build.
7. Optionally run `npm run preview` and open the URL printed in the terminal to check that build. This command is for local checking, not a public hosting service.

Do not double-click the source `index.html` to run the application. Use the development server, the preview server, or a static web host. The assets use root-relative URLs, so the deployment is designed for a domain root such as `https://your-domain.example/`, not a repository subfolder such as `/choco-brown/`.

## Content Changes

| Change | File |
| --- | --- |
| Product names, descriptions, categories, and prices | `src/data/menu.ts` |
| Phone, WhatsApp, Swiggy, Zomato, and main Maps link | `src/data/menu.ts` |
| Branch addresses, coordinates, map links, story, review highlights, and Instagram link | `src/App.tsx` and `src/data/stores.ts` |
| Page title and search description | `index.html` |
| Colors, fonts, spacing, and responsive design | `src/index.css` |
| Product and bakery imagery | `public/images/` |
| Pickup request form and WhatsApp message format | `src/components/OrderDrawer.tsx` |
| Browser icon | `public/favicon.svg` |

Changing files inside `src/` or `public/` does not update the prebuilt `dist/` automatically. Rebuild and redeploy after every change. If you change an image filename, also update its reference in the source. Public phone numbers and business links are intentionally visible in the client code; do not put passwords or API secrets there.

## Publish Updates

1. Make your changes in the editable source project.
2. Run `npm run build` and check the result locally with `npm run preview`.
3. Open the **same existing Netlify project**, then its **Deploys** page.
4. Upload the newly built `dist` folder to that project's manual deploy area.
5. Verify the updated site at your existing website address. Updating the same project keeps the existing project URL and connected domain.

Keep a backup of the source project. A manually uploaded build cannot be edited through this website's own interface; there is no admin dashboard.

## Git Deployments

Use Git-based publishing if you will update the site regularly.

1. Create a GitHub repository and upload or push the **contents** of the `choco-brown` source folder, preserving its directory structure. A private repository is fine.
2. Make sure `package.json`, `package-lock.json`, `src/`, `public/`, and the configuration files are present. Upload actual source files, not only the ZIP file. Include the hidden `.nvmrc` and `.gitignore` files when using an upload workflow.
3. Do not commit `node_modules`, `dist`, `release`, local `.env` files, test results, or screenshots. The included `.gitignore` excludes them.
4. In Netlify, select **Add new project**, then **Import an existing project**, and connect the repository.
5. Set the root/base directory to the folder containing `package.json`. If you uploaded the entire wrapper folder, select `choco-brown` as the base directory instead of leaving the repository root selected.
6. Use build command `npm run build`, publish directory `dist`, and Node.js `22`. The included `netlify.toml` sets these build values.
7. Deploy. After connecting Git, pushing updates to your configured production branch triggers new deployments automatically.

The host must install development dependencies during the build, because Vite, TypeScript, and Tailwind are build tools. Do not configure the install step as `npm ci --omit=dev`.

## Vercel Alternative

1. Put the editable source into a GitHub repository as described above.
2. Sign in to <https://vercel.com/> and import the repository as a new project.
3. Select the folder containing `package.json` as the root directory.
4. Choose **Vite** as the framework preset, **Node.js 22.x**, install command `npm ci`, build command `npm run build`, and output directory `dist`. The included `vercel.json` supplies the framework and commands.
5. Deploy and open the address Vercel supplies. Future pushes to the production branch trigger updates.
6. To add your own domain, use the project's domain settings and apply the exact DNS records shown there.

This is a business website. Choose a Vercel plan that permits commercial use; Vercel's Hobby plan is for personal, non-commercial use. Check the current plan terms before publishing. This site uses in-page hash links, so no additional client-side route rewrites are needed for its current navigation.

## Existing Hosting

The site can also run on static hosting or a standard web host with a domain document root, such as cPanel hosting. It does not require a Node.js process in production.

1. Back up any existing website before replacing files.
2. Open your hosting file manager or connect using SFTP.
3. Upload the **contents of `dist`**, not its parent folder, to the document root for the target domain. This is often `public_html`, but use the directory configured for your domain.
4. Make sure the document root directly contains `index.html`, `images/`, `fonts/`, and `favicon.svg`. Do not upload the editable source or complete source ZIP into the public web directory.
5. Enable HTTPS through the host and test the site at the domain root.

If your host supports extracting ZIP files, upload `choco-brown-live.zip` to the correct empty document root, extract it there, and remove the uploaded ZIP afterward. Avoid overwriting an existing site without a backup.

## Launch Checklist

- Confirm authorization to use the bakery's name, branding, and published business information.
- Confirm the phone and WhatsApp number, branch details, Instagram profile, and delivery platform links.
- Confirm actual products and current prices. The supplied prices are indicative, not a verified current menu.
- Review the generated, illustrative product imagery; replace it with approved bakery photos if desired.
- Verify current ratings and review counts, or remove them if they can no longer be supported.
- Check the hero, product images, and typography on desktop and mobile.
- Add a product, change its quantity, reload the page, and confirm the bag persists.
- Check the prefilled WhatsApp request and recipient. The customer must send the message; the bakery must confirm availability, price, store, and pickup time.
- Test the call, directions, Instagram, Swiggy, and Zomato links on actual devices.
- Verify your custom domain, primary domain redirect, and HTTPS.
- Keep the original source ZIP and a backup of the current working source.
- Review the build-tool advisory documented in `README.md` before enabling automated builds.

## Project Limits

This is the complete implemented storefront, not a full restaurant management platform. It has no server database, administrator login, automatic order notifications, online payment processing, inventory synchronization, or guaranteed live delivery availability. The browser stores only bag product IDs and quantities. Checkout details are placed in a WhatsApp link when the customer requests an order. Hosting accounts, external delivery accounts, domains, and WhatsApp service availability are managed separately.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Blank page or raw source after upload | Publish `dist`, not `src`, `public`, or the unbuilt source root. |
| Missing images or wrong fonts | Upload all contents of `dist`, including `images` and `fonts`. Host at the domain root. |
| Homepage shows 404 | The selected publish folder must directly contain `index.html`. Remove accidental extra directory nesting. |
| Build rejects Node.js | Select a current Node.js 22 release, at least 22.12. |
| `npm ci` fails | Use the included matching `package.json` and `package-lock.json`; verify your internet connection and npm registry access. Do not remove the lockfile just to bypass an error. |
| Website changes do not appear | Rebuild, upload to the same existing project, verify the latest production deployment, then hard-refresh or use a private browser window. |
| WhatsApp does not open | Allow the user-initiated new window or use the fallback WhatsApp link on the request screen. Verify the recipient number and the device's WhatsApp setup. |
| Bag is empty on a different device | Bag storage is local to each browser and domain, not a server account. |
| Domain or HTTPS is not ready | Check the host's domain verification panel and the exact DNS records at your DNS provider. |
| Google Maps shows “blocked” or “refused to connect” | This is Google blocking the link inside an embedded preview or restricted network, not a problem with this website. The page now includes an on-page OpenStreetMap, an OpenStreetMap directions link, a Google search link, and a copy-address button. Open the Google link in a new browser tab, or use OpenStreetMap / copy the address into any maps app. |

## Developer Checks

- Type check: `npx tsc --noEmit`.
- Build: `npm run build`.
- Install browser test dependencies: `npx playwright install --with-deps chromium`.
- Run browser and accessibility tests: `npx playwright test`.
- Check runtime dependencies: `npm audit --omit=dev`.
- Recreate the archives after building: `python3 scripts/package_release.py`. On Windows, use `py scripts/package_release.py` if that is your Python command. Archives are written to `release/`.

The archive creation and local build can be verified without a hosting account. Actual publishing, domain verification, billing, and external order receipt require your own accounts and are not performed by creating the ZIP.

## Official References

- Netlify publishing: <https://docs.netlify.com/manage/projects/add-new-project/>
- Netlify Drop: <https://app.netlify.com/drop>
- Netlify domains: <https://docs.netlify.com/manage/domains/get-started-with-domains/>
- Vite on Vercel: <https://vercel.com/docs/frameworks/frontend/vite>
- Vercel plans: <https://vercel.com/docs/plans>