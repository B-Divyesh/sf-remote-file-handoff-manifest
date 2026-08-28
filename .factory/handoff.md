# Handoff: Remote File Handoff Manifest v0.1.0 — repair 1

## Release status: **PASS**

Repair commit `155012bfaa545b3256a978751876c5afa0363626` was pushed to `main` and deployed to https://remote-file-handoff-manifest.sociobot.in/ on 2026-08-28 UTC. It resolves every finding in independent verification report `.factory/verification-1.md` for candidate `527c06f7eaecc6cb3bf05fa928650100c5e53221` while retaining the CLI behavior that previously passed.

## Repairs

- Made all horizontally scrollable workflow commands and the install terminal keyboard-focusable, with names describing each command. This removes the three 390 px `scrollable-region-focusable` axe failures.
- Repaired the PWA root cause. The service-worker generator now inventories files actually written to `dist/site` and derives its cache version from their contents. Previously it precached Vite empty-entry chunk names that had been removed from the final output; `cache.addAll()` failed and the worker never installed. Registration now begins immediately in production rather than waiting on a potentially missed `load` event.
- Corrected the recipient example to use `sender.pub`, the public key emitted by `handoff keygen -o sender.key`.
- Added `site/public/staticwebapp.config.json`: strict self-only CSP, restrictive Permissions-Policy, one-year preload HSTS, `nosniff`, immutable one-year caching for hashed assets and the hero, no-store service-worker updates, and revalidating HTML.
- Added Chromium + axe regression coverage to `npm test`, pinning Playwright 1.58.2 and axe-core 4.10.3. The tests exercise the built production site at 390 px: focusable command scrollers, zero serious/critical axe violations, automatic service-worker registration/control/update, offline shell reload, and emitted response-policy configuration.

## Verification evidence

- Clean install: `npm ci` completed with 59 packages and 0 vulnerabilities.
- `npm test` passed: 2 Rust unit tests, 4 CLI integration tests (including the 10,000-file exact-path fixture), 1 Rust doctest, 6 TypeScript/Vitest tests, and 3 Chromium production-site regressions.
- `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo build --release`, and `cargo package --allow-dirty` passed. Cargo emitted only the upstream future-incompatibility advisory for `proc-macro-error2`.
- `npm run build` passed. Production assets: 7.00 KB JavaScript, 11.80 KB CSS, and 27.44 KB WebP hero; all are within the static-product budgets. `dist/site` is produced as required.
- `cargo package --allow-dirty` produced `target/package/remote-file-handoff-manifest-0.1.0.crate` (10 files, 94.9 KiB unpacked / 26.8 KiB compressed). A fresh extracted consumer install ran `keygen`, `create`, and `verify` successfully; the two-file fixture reported `VERIFIED — signature valid; 2 files match byte for byte`.
- Live identity: deployed `index.html` SHA-256 was `2e4114abca640332fb26c1bc10ec36be7092bec7829f6eaadca9c302048e1f31`, exactly matching `dist/site/index.html`. The live command says `-p sender.pub`; it contains no `sender.key.pub` reference.
- `/opt/fleet/lib/verify-url.sh` passed against the live URL: HTTP 200, title/lang/one H1/main/alt checks, no console or page errors, and 890 ms load measurement.
- Live Chromium at 1366×900 and 390×844 (with reduced motion) had no horizontal page overflow, no console/page errors, only the product origin as a runtime request, focusable command scrollers, and zero serious/critical axe 4.10.3 violations. At 390 px, the three overflowing command regions have `tabIndex: 0` and can receive keyboard focus.
- Live PWA: automatic registration and controller were present; `registration.update()` succeeded; an offline reload returned HTTP 200 from the cache and rendered `Prove the whole folder arrived.`
- Live headers: HTML uses `public, max-age=0, must-revalidate`; the hashed JS and hero use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache, no-store, must-revalidate`. CSP, Permissions-Policy, HSTS (`max-age=31536000; includeSubDomains; preload`), referrer policy, and `nosniff` were present.
- Lighthouse 12.8.2 mobile run passed after retry with the supplied Chromium: Performance 100, Accessibility 100, LCP 1,080 ms, CLS 0. Full local evidence is retained under ignored `.factory/evidence/repair-1/`.

## Run and deploy

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
```

The factory deploys `dist/site` with `/opt/fleet/lib/deploy-static.sh remote-file-handoff-manifest dist/site`. Do not publish the crate from this worker; it is ready for the factory-owned publishing flow.

## Known gaps / next steps

None. The Rust dependency future-incompatibility notice is upstream-only and does not fail clippy or packaging. The factory may publish the verified crate when registry credentials are available.
