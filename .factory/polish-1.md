# Polish round 1 — finding closure

Live check: 28 August 2026 at `https://remote-file-handoff-manifest.sociobot.in`. Deployed site hash for `/` matched `dist/site/index.html`: `52d127a80056992a5696af438e00b5779b5ccb795953c6dc1807045b81fd5fa7`.

Evidence keys:

- `B-FIRST`: browser test “first screen names the audience and offers one honest sample action at desktop and mobile”.
- `B-ROUTES`: browser test “all routes have unique metadata, one h1, shared navigation, large targets, and no serious axe issues”.
- `B-NAV`: browser test “demo direct links, reset, navigation focus, back focus, and not-found routing work”.
- `B-OFFLINE`: browser test “production service worker controls home and demo offline”.
- `C:<id>`: the one test tagged `@claim:<id>` in `site/src/claims.test.ts`.
- Screenshots: `artifacts/home-mobile.png`, `artifacts/home-desktop.png`, `artifacts/demo-mobile.png`, `artifacts/not-found-mobile.png`, and `artifacts/live-verify/`.

## Main findings

| Finding | Change made | Evidence and live check |
| --- | --- | --- |
| B1 | Added first-screen `/?demo=1`, real `/demo/`, persistent banner, reset/start actions, automatically run sample recording, bundled Project Aurora files, and `handoff demo` in a new OS temp directory. Added `.factory/demo.md`. | `C:isolated-demo`, `B-NAV`; `artifacts/demo-mobile.png`, `artifacts/live-demo-mobile.png`; live `/?demo=1` reached `/demo/`, kept `real:cold-marker`, reset, and showed three exact paths. |
| B2 | Added `.factory/claims.json` with 11 public claims and exactly one tagged observable test per claim. Removed or narrowed unsupported language. | Every registry command passed from final clean clone `/tmp/rfhm-final-LdULZg/repo`; claim-specific evidence appears below; live copy was cross-checked on all routes. |
| B3 | Added a styled `404.html`, Azure 404 response override, explicit real routes, and direct-load tests. | `B-NAV`; `artifacts/not-found-mobile.png`; live `/definitely-missing-polish-1` returned HTTP 404 with “This handoff path is missing.” |
| B4 | Replaced the first screen with a seven-word job headline, named freelancers and small teams, and made sample data the only primary action with its result explained. | `B-FIRST`; `artifacts/home-mobile.png`, `artifacts/home-desktop.png`; live cold read matched the new copy and one primary action. |
| H1 | Added unique titles/descriptions, canonicals, OG/Twitter metadata, SVG favicon, 180 px touch icon, and original 1200×630 social card on every route. | `B-ROUTES`, `page accessibility shell`; screenshots above; all live page and image URLs returned 200. |
| H2 | Added 44×44 minimum targets, mobile navigation, route-status live region, and `h1` focus after forward/back navigation. | `B-ROUTES`, `B-NAV`; `artifacts/home-mobile.png`; cold live focus/back, axe serious/critical zero, and target-size scan passed. |
| H3 | Unified header/footer content on home, demo, legal, and 404 pages. Demo, Privacy, Terms, source, factory attribution, one-liner, version, and build ID persist. | `B-ROUTES`, live link crawl (13 unique links, all successful); all screenshots. |
| H4 | Standardized user-facing language on “signed file list,” “folder,” and “missing, changed, extra.” Rewrote numbered headings and acronym labels. | `node scripts/copy-audit.mjs`; `artifacts/home-desktop.png`; live landing copy checked cold. |
| M1 | Replaced result-misleading actions with “Try it with sample data,” “View sample result,” and “Copy install command.” | `B-FIRST`, `B-NAV`; `artifacts/home-mobile.png`; live action destinations passed. |
| M2 | Added singular/plural rendering: “1 file matches” versus “N files match.” | `C:browser-local-private`; browser used a real one-file signed list and asserted the exact singular sentence. |
| M3 | Reframed the number strip as a controlled test result and linked it to a registered fixture test. | `C:exact-differences-10000`; `artifacts/home-desktop.png`; live strip reads “TEST // 10,000 FILES.” |

## Unlisted-claim findings

| ID | Change made | Evidence, screenshot, live URL |
| --- | --- | --- |
| UC00 | Removed “prove arrived”; now says checks contents and does not guarantee delivery. | `C:signed-list-roundtrip`; `home-desktop.png`; live `/`. |
| UC01 | Kept signed-list creation as a tested CLI operation. | `C:signed-list-roundtrip`; `home-desktop.png`; live `/#how`. |
| UC02 | Removed named transport compatibility and kept tested path/size/hash comparison. | `C:signed-list-roundtrip`; `home-desktop.png`; live `/#how`. |
| UC03 | Kept “no account” only in the tested privacy statement. | `C:free-mit`, `C:browser-local-private`; `home-mobile.png`; live `/privacy/`. |
| UC04 | Replaced “No upload” shorthand with the scoped selected-file statement. | `C:browser-local-private`; `home-mobile.png`; live `/`. |
| UC05 | Registered no analytics/tracking and checked runtime/source. | `C:browser-local-private`; `live-verify/screenshot-desktop.png`; live `/privacy/`. |
| UC06 | Labels 10,000 as a fixture, not telemetry. | `C:exact-differences-10000`; `home-desktop.png`; live `/`. |
| UC07 | Asserts the sole changed path in that fixture. | `C:exact-differences-10000`; `home-desktop.png`; live `/`. |
| UC08 | Asserts missing and extra arrays remain empty in that fixture. | `C:exact-differences-10000`; `home-desktop.png`; live `/`. |
| UC08a | Reworded limitation to “does not guarantee delivery”; signature/tamper behavior is tested. | `C:signed-list-roundtrip`; `home-desktop.png`; live `/`. |
| UC09 | Kept ordered hashes and Ed25519 signature as observable format facts. | `C:signed-list-roundtrip`, `C:manifest-format`; `home-desktop.png`; live `/#how`. |
| UC10 | Replaced named transports with “your usual transfer tool.” | `C:package-copy`; `home-desktop.png`; live `/#how`. |
| UC11 | Uses missing/changed/extra consistently; browser privacy is separate and tested. | `C:signed-list-roundtrip`, `C:browser-local-private`; `demo-mobile.png`; live `/demo/`. |
| UC12 | Split claims: MIT, JSON, and network/privacy each have a test; removed the unverified minimum-version line. | `C:free-mit`, `C:json-script-output`, `C:browser-local-private`; `home-desktop.png`; live `/#install`. |
| UC13 | Retained SHA-256 per file and verifies the exact digest. | `C:signed-list-roundtrip`; `home-desktop.png`; live `/#install`. |
| UC14 | Valid signature and payload mutation are both exercised. | `C:signed-list-roundtrip`, `C:manifest-format`; `home-desktop.png`; live `/#install`. |
| UC15 | Verifies both encrypted outputs, hidden filename, successful decrypt, and unchanged source. | `C:encrypted-outputs`; `home-desktop.png`; live `/#install`. |
| UC16 | Parses keygen/create JSON and checks documented fields. | `C:json-script-output`; `home-desktop.png`; live `/#install`. |
| UC16a | Browser verifies a real CLI-signed file, not a placeholder. | `C:browser-local-private`; `home-desktop.png`; live `/#verify`. |
| UC17 | Intercepts the complete browser check and inspects localStorage and IndexedDB. | `C:browser-local-private`; `home-desktop.png`; live `/#verify`. |
| UC18 | Browser rejects encrypted age input with recovery text; CLI decrypts the same output. | `C:encrypted-outputs`; `home-desktop.png`; live `/#verify`. |
| UC19 | CLI creates and verifies a zero-file signed list. | `C:signed-list-roundtrip`; `home-desktop.png`; live `/#verify`. |
| UC20 | Service worker reloads `/demo/` and completes the check offline. | `C:offline-reload`, `B-OFFLINE`; `demo-mobile.png`; cold live offline reload passed. |
| UC21 | Demo asserts and displays all three path categories. | `C:isolated-demo`; `live-demo-mobile.png`; live `/demo/`. |
| UC22 | Checks age headers, hidden names, decrypt, and unchanged source bytes. | `C:encrypted-outputs`; `home-desktop.png`; live `/#install`. |
| UC22a | Replaced subjective “clearer” wording with the concrete footer one-liner and source link. | `C:free-mit`; `home-mobile.png`; live footer/source 200. |
| UC23 | Replaced “transport-independent evidence” with a signed-list description. | `C:signed-list-roundtrip`; `home-desktop.png`; live `/`. |
| UC24 | Split the long README sentence; tests fields, HTML, and all difference categories. | `C:signed-list-roundtrip`; `demo-mobile.png`; live `/demo/`. |
| UC25 | Keeps the delivery limitation and tests browser/CLI absence of network code. | `C:browser-local-private`; `live-verify/screenshot-desktop.png`; live `/privacy/`. |
| UC26 | Removed the public minimum-version build claim; Cargo retains machine-readable `rust-version`. | Full `cargo build --release`; `home-desktop.png`; live install section. |
| UC26a | Replaced “identity once” with “Create a sender key.” | `C:signed-list-roundtrip`; `home-desktop.png`; live install section. |
| UC27 | Asserts signed JSON and HTML outputs exist and verify. | `C:signed-list-roundtrip`; `home-desktop.png`; live install section. |
| UC27a | Packages files and signed outputs without source mutation. | `C:package-copy`; `home-desktop.png`; live `/#how`. |
| UC27b | Verifies the package’s received folder separately. | `C:package-copy`; `home-desktop.png`; live `/#how`. |
| UC28 | Replaced universal “any tool” with “your usual transfer tool.” | `C:package-copy`; `home-desktop.png`; live `/#how`. |
| UC29 | Exercises all five documented exit statuses. | `C:exit-codes`; `home-desktop.png`; live install section. |
| UC30 | Passphrase is supplied only through the environment; both age outputs are asserted. | `C:encrypted-outputs`; `home-desktop.png`; live private section. |
| UC30a | Plain-list path visibility is asserted in the signed-list fixture. | `C:signed-list-roundtrip`; `home-desktop.png`; live private section. |
| UC31 | Removed “privacy-safe”; now says encrypted outputs do not display filenames. | `C:encrypted-outputs`; `home-desktop.png`; live private section. |
| UC32 | Compares source and packaged file bytes unchanged and unencrypted. | `C:encrypted-outputs`, `C:package-copy`; `home-desktop.png`; live private section. |
| UC33 | Registered version, schema, ordering, separators, signature mutation, and traversal rejection. | `C:manifest-format`; `home-desktop.png`; live source link 200. |
| UC34 | Real browser verification intercepts requests and inspects storage. | `C:browser-local-private`; `home-desktop.png`; live `/#verify`. |
| UC35 | README now describes suite scope in short sentences; the full suite is executed. | `npm test`; `live-verify/screenshot-desktop.png`; live `/`. |
| UC36 | Removed the visitor-facing pinned-version claim; package lock still pins Playwright 1.58.2. | `npm ci`, `npm test`; `home-desktop.png`; live `/`. |
| UC37 | Split no-account/tracking/storage/runtime statements and tests them. | `C:browser-local-private`, `C:free-mit`; `live-verify/screenshot-mobile.png`; live `/privacy/`. |
| UC38 | Tests correct key/signature and changed payload; retains explicit delivery limit. | `C:signed-list-roundtrip`, `C:manifest-format`; `home-desktop.png`; live `/terms/`. |
| UC39 | Moved deployment evidence to handoff; live/build root hashes match. | SHA-256 above; `live-verify/screenshot-desktop.png`; live `/` 200. |
| UC40 | Moved config details to handoff and tests built policy/security rules. | Browser deployment-configuration test; `live-verify/screenshot-desktop.png`; live security headers checked. |

## Final verification

- Final clean clone: `/tmp/rfhm-final-LdULZg/repo` from pushed commit `e60ab4c`; every `claims.json` command passed.
- Full local: `npm test`, `npm run build`, `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo build --release`, and `cargo package --allow-dirty` passed.
- Lighthouse production build: Performance 100, Accessibility 100, FCP 1.0 s, LCP 1.2 s, TBT 0 ms, CLS 0.
- Live cold check: first screen, demo/isolation/reset, focus/back, 404, axe, console, offline reload, headers, and link crawl passed.
- Known gaps: none.
