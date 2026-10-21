# ReUI Data Grid "Advanced" blocks page, offline 1:1 replay

A self-contained recreation of [reui.io/blocks/data-grid/advanced](https://reui.io/blocks/data-grid/advanced) as captured logged-out on 2026-10-20. It runs ReUI's own shipped Next.js code for the docs shell **and** each of the 8 block previews, which are separate documents in iframes: Campaign Performance, Store P&L, Campaign Targets, Reliability Index (SLOs), Wholesale Onboarding, Stock Mix, Pro Forma and Service Visits. Sorting, search, filters, tabs, pagination, menus and charts inside the grids work like the live site, with zero network access.

- **Open:** `index.html` (single file, about 17 MB).
- **MagicPath:** https://api.magicpath.ai/v1/merry-tide-3257

## How it works
`source/build.cjs` packs the shell HTML, the 8 preview HTML documents, 100 JS files, CSS (133 fonts, stored once), images, flag icons and 2 API responses into the page. `source/boot.js` serves everything from memory and runs in every document:
- preview iframes are loaded through `srcdoc` (same origin as the shell, so `file://` works) and reuse the shell's decoded data;
- scripts load from blob URLs while reporting their original paths; images, `fetch` and XHR are answered from the recording;
- `URL` resolves against the original reui.io address when the document base is `about:srcdoc`; `postMessage` targets are normalized for opaque origins;
- Next's router is initialized with the original page URL (one patched reference: `location:window.location`), and history updates never change the real address bar.
A Content-Security-Policy blocks all network access. Links, sign-in, Code tabs and purchase flows show a notice.

## Verification
Screenshots at six scroll positions match live (`evidence/live-vs-replay.jpg`). All 8 grids hydrate (0 errors, 0 network requests in headless Chromium). Searching "Ember" in the campaign grid filters to the same 3 rows as live and clearing restores 10.

## Limits
- This page only. Other ReUI pages, the Code tab source (Pro), Customize and sign-in open the real site.
- Data is frozen at capture time.

## Rights
All code, design and content belong to ReUI / Keenthemes. The Advanced blocks are part of ReUI Pro. This is an unaffiliated, non-commercial reference replay of a publicly viewable preview page; no Pro source code from the Code tab is included. Remove on request.
