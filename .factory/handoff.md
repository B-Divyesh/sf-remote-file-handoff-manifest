# Handoff — polish round 1

## Result

All findings in `.factory/review-1.md` are resolved. The Rust CLI remains the primary artifact and the static companion site remains in `dist/site`.

The repaired live site is https://remote-file-handoff-manifest.sociobot.in. The final product commit deployed is `9dd72a5`, with Azure routing/offline fixes in `70390f5`, `6927bbc`, and `fcaebbd`.

## What changed

- Rewrote the first screen around the job, audience, and one “Try it with sample data” action.
- Added `/?demo=1` and `/demo/` with a persistent banner, automatic real-command transcript, Reset demo, and Start for real.
- Added `handoff demo`. It uses bundled Project Aurora files and writes only to a new OS temporary directory.
- Added 11 claims to `.factory/claims.json` and one observable tagged test for each claim.
- Added unique route titles, metadata, canonical links, social art, favicons, consistent navigation, legal links, focus restoration, and a designed HTTP 404.
- Fixed one-file grammar, user-facing terminology, mobile layout, 44 px targets, error recovery text, and the controlled-fixture label.
- Added Azure route policy and a service worker that precaches public route URLs, not deployment-blocked physical HTML paths.
- Rewrote README usage and security language; added `.factory/demo.md`, `.factory/copy-audit.md`, and `.factory/polish-1.md`.
- Preserved and documented the checksum-relay pixel/demoscene visual identity.

## Verification evidence

Full local run:

```sh
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
```

Results:

- Rust: 2 unit tests, 4 CLI integration tests, and 1 doctest passed.
- TypeScript/Vitest: 8 unit/static-page tests passed.
- Claims: all 11 tagged tests passed.
- Production browser: all 5 tests passed across desktop/mobile, routing, axe, focus, touch targets, 404, policy, and offline service-worker use.
- Build: `dist/site` produced; initial JS 9.60 kB raw / 3.84 kB gzip; CSS 15.11 kB raw / 4.01 kB gzip.
- Package: `target/package/remote-file-handoff-manifest-0.1.0.crate`, 13 files, 27.6 KiB compressed.
- Lighthouse: Performance 100, Accessibility 100, FCP 1.0 s, LCP 1.2 s, TBT 0 ms, CLS 0.

Clean-clone claim run:

- Final clean clone: `/tmp/rfhm-final-LdULZg/repo` from pushed commit `e60ab4c`.
- Ran every `test` command in `.factory/claims.json`.
- Result: all 11 passed. Every test creates a fresh temp directory or browser context.

Live verification:

- Deployment ID: `5e1d0e12-9b98-4484-8b2f-f26c316f8b58`.
- `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200.
- `/definitely-missing-polish-1` returned 404 and the designed missing-path page.
- `/?demo=1` entered the demo, preserved a seeded real-data marker, showed all three sample paths, reset, and exposed Start for real.
- Cold browser axe scan found zero serious or critical violations.
- Route focus and Back focus moved to the page `h1`.
- The live service worker controlled a reload and reopened `/demo/` offline.
- The live crawl checked 13 unique links; all succeeded.
- `verify-url.sh`: title, `lang`, one `h1`, main, alt text, button labels, and zero console errors passed.
- Live and built root SHA-256 matched: `52d127a80056992a5696af438e00b5779b5ccb795953c6dc1807045b81fd5fa7`.
- Screenshots: `artifacts/live-verify/screenshot-desktop.png`, `artifacts/live-verify/screenshot-mobile.png`, `artifacts/live-demo-mobile.png`, and `artifacts/not-found-mobile.png`.

## Run and package

```sh
npm ci
npm test
npm run build
cargo run -- demo
cargo package
```

Do not publish the crate here; registry credentials belong to the factory.

## Known gaps and next steps

None.
