# Handoff — perfection loop round 2

## Result

All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed. Product repair commit `7c2de871a3cc87b69cba4b5a595d12d9845283d8` is pushed to `origin/main` and deployed at `https://remote-file-handoff-manifest.sociobot.in`.

The mobile demo shows the command and completed missing/changed/extra result inside the first 390 × 844 viewport. Its Project Aurora files use honest Markdown/text extensions. Reset and Start for real remain isolated from normal browser data. Generated HTML uses “signed file list” consistently. Back preserves scroll while focus moves to the h1. Root metadata uses the full product name. Legal copy makes no untestable retention or future-publication promises. Every flagged landing and README phrase is rewritten.

The checksum-relay pixel/demoscene identity, original art, static deployment class, Rust command-line tool, and local-first privacy model remain intact. AI was not added because hashing and signature verification must be deterministic and locally auditable.

## Exact evidence

- Clean clone: `/tmp/rfhm-polish2-clean-y6nK4C/repo` at `7c2de87`.
- All 11 `.factory/claims.json` commands passed separately.
- `npm test` passed 2 Rust unit tests, 4 command-line integration tests, 1 Rust doc test, 9 Vitest tests, 11 claim tests, and 5 production-browser tests.
- `npm run build` produced `dist/site`.
- `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo build --release`, and `cargo package --allow-dirty` passed. Packaging included 13 files (98.4 KiB unpacked; 27.7 KiB compressed). Cargo only reported the upstream `proc-macro-error2` future-incompatibility advisory.
- Browser coverage includes 390 × 844 and desktop first screens, demo entry/reset/isolation, routes, HTTP 404, route focus, Back scroll, 44 px targets, reflow, console errors, links, service-worker control, and offline reload.
- Axe found zero serious/critical issues on `/`, `/demo/`, `/privacy/`, `/terms/`, and the 404.
- `/opt/fleet/lib/verify-url.sh` passed the live title/lang/main/h1/alt/button/console baseline. Evidence: `artifacts/live-polish-2/verify-url/verify.json`.
- The live cold audit passed every route, link, finding check, and offline demo. Evidence: `artifacts/live-polish-2/live-check.json` and its screenshots.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.1 s, TBT 0 ms, CLS 0. Evidence: `artifacts/live-polish-2/lighthouse.json`.
- Production root SHA-256 `a41474c76097d768087fc7a5a2198d4cbfcb8cbdd9171ed421f09ca873de6d17` matches `dist/site/index.html`.
- Production demo SHA-256 `e7bf2501eb0dd7f774a0693cac3025409a69f2a13062c2311c850cb3a4e3222e` matches `dist/site/demo/index.html`.
- Live headers include self-only CSP, HSTS, Referrer-Policy, Permissions-Policy, and `nosniff`.

## Reproduce

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
node scripts/verify-live.mjs https://remote-file-handoff-manifest.sociobot.in artifacts/live-polish-2
```

The factory owns registry credentials; do not publish the crate. `cargo package --allow-dirty` creates the ready-to-publish package.

## Known gaps

None.
