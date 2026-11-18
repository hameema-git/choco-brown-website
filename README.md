# Choco Brown

A responsive bakery storefront built with React, TypeScript, Vite, Tailwind CSS, and Motion.

## Make It Live

Start with `START-HERE.txt` for the simplest publishing steps. `DEPLOYMENT.md` includes complete Netlify, Vercel, custom-domain, existing-hosting, and update instructions.

The complete project ZIP includes a ready-to-upload `dist/` folder, all source files, images, local fonts and font licenses, tests, and the dependency lockfile. The separate live-site ZIP contains only the production website. You can publish the included `dist` folder with Netlify Drop without installing Node.js or running a build yourself.

## Run

- Use Node.js 22.12 or a newer Node.js 22 release.
- `npm ci`
- `npm run dev`
- `npm run build` for the production site in `dist/`.
- `npx playwright test` for the browser interaction tests. Install Chromium once with `npx playwright install --with-deps chromium`.
- `python3 scripts/package_release.py` after building to create the source and live-site ZIPs in `release/`.

## Storefront

- Filterable, six-item menu with product details.
- Browser-local shopping bag with quantity controls and estimated totals.
- Validated pickup requests prepared for WhatsApp, not a payment or order-confirmation service.
- External Swiggy and Zomato links for delivery.
- Vennala and Eroor directions, phone contact, and party-order inquiries.
- Responsive navigation, keyboard-accessible dialogs, and reduced-motion support.

## Content

The main page is in `src/App.tsx`. Products, indicative prices, and contact links are in `src/data/menu.ts`. Checkout is in `src/components/OrderDrawer.tsx` and styling is in `src/index.css`.

Product images are generated illustrations of the bakery's offerings, not photographs supplied by the business. Prices are representative of the supplied price range and should be verified by the bakery before publishing. Availability, final prices, store choice, and pickup times are confirmed by the bakery on WhatsApp. Hours are not presented as live or verified. Review highlights summarize the provided community feedback rather than inventing attributed customer reviews.

No card details or personal checkout information are stored. Only product IDs and bag quantities are saved in local storage. Name, store preference, and notes are included in the WhatsApp link when the customer requests an order. The customer must send that message themselves.

## Dependency Audit

The production dependency audit is clean at verification. The build-tool dependency tree still reports an upstream `picomatch` ReDoS advisory. These tools are not shipped as browser runtime dependencies. A compatible upstream fix is still needed; no forced, incompatible Vite downgrade was applied.
