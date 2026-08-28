# Handoff — polish round 3

## Result

Accepted. Repair commit `6205b12` and deployed commit `563645f99dff336ce8c3dc65889c95da25def796` are pushed to `main`. The factory static deployment rebuilt `dist/site` and is live at `https://remote-file-handoff-manifest.sociobot.in` with footer build `6205b12-p3`.

## What changed

- Fixed `F-2-3` / `F-3-1`: same-origin navigation saves x/y by history entry. Back/Forward focuses and announces the destination h1 without scrolling it into view, then restores the saved location.
- Fixed `F-3-2`: clipboard handling is exclusively `#copy-install-command`. The demo `#play-demo` control is disabled while it runs and reliably finishes as “Replay sample check.”
- Preserved the earlier complete repairs: plain first screen, `?demo=1` isolation, reset/exit banner, bundled CLI demo, claims registry, legal/404 routes, titles/metadata, keyboard/focus/mobile behavior, local-only verifier, privacy boundary, and checksum-relay identity.
- Updated the catalog sentence to the verb-first “Verify folder handoffs with signed file lists.”

## Exact verification evidence

### Clean clone

In `/tmp/rfhm-polish3-clean-azHvin/repo`, a fresh `--no-local` clone at `563645f`, `npm ci` completed with 0 vulnerabilities. Every `claims.json` command passed separately:

```sh
npm run test:claims -- --testNamePattern '@claim:signed-list-roundtrip'
npm run test:claims -- --testNamePattern '@claim:exact-differences-10000'
npm run test:claims -- --testNamePattern '@claim:browser-local-private'
npm run test:claims -- --testNamePattern '@claim:isolated-demo'
npm run test:claims -- --testNamePattern '@claim:offline-reload'
npm run test:claims -- --testNamePattern '@claim:encrypted-outputs'
npm run test:claims -- --testNamePattern '@claim:json-script-output'
npm run test:claims -- --testNamePattern '@claim:package-copy'
npm run test:claims -- --testNamePattern '@claim:exit-codes'
npm run test:claims -- --testNamePattern '@claim:manifest-format'
npm run test:claims -- --testNamePattern '@claim:free-mit'
```

The same clean clone then passed:

```sh
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
```

This covers Rust unit/integration/doctest, TypeScript, all claim flows, the 10,000-file fixture, production-browser routing/metadata/mobile/Axe/privacy/offline checks, release compilation, and the ready-to-publish `target/package/remote-file-handoff-manifest-0.1.0.crate` (28 KiB). Do not publish the crate from this repository.

### Deployed cold check

- Rebuilt with the work-order command `npm ci && npm run build:site`, then deployed with `/opt/fleet/lib/deploy-static.sh remote-file-handoff-manifest /work/repo/dist/site`.
- `/opt/fleet/lib/verify-url.sh` passed on the live root: 200, title, `lang=en`, one h1, main, no missing image alt, and no console/page errors. Evidence: `/work/.evidence/live-polish-3/verify-url/verify.json` and its desktop/mobile screenshots.
- Live 390 px real-click Back test left `/#how` at y=1232 and restored y=1225 after Privacy → Back, with h1 focus. Live demo replay showed the running state, all three exact paths, and ended only as “Replay sample check.” Evidence and screenshots: `artifacts/live-polish-3/live-check.json`, `home-mobile.png`, `demo-mobile.png`, `not-found-mobile.png`.
- Live `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200. `/missing-polish-3` returned designed 404 with Return home. All five routes had expected metadata and zero serious/critical Axe 4.10.3 violations. The only 404 console message is the expected failed request for that direct 404 response.
- Fresh live demo isolation retained `localStorage['real:marker']`, created no `demo:` storage, made only same-origin requests, and reloaded/completed offline after service-worker control. Evidence: `/work/.evidence/live-polish-3/demo-offline.json`.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.89 s, LCP 1.05 s, TBT 0 ms, CLS 0. Evidence: `artifacts/live-polish-3/lighthouse.json`.
- Current CLI demo ran from a separate temporary invocation directory and reported the three expected paths; it created `/tmp/handoff-demo-23293-0` without reading or changing the invocation directory.

## Run and deploy

```sh
npm ci
npm test
npm run build
cargo run -- demo
```

For deployment, build `dist/site` with `npm ci && npm run build:site` and use the factory static work-order deployment. The public demo is `https://remote-file-handoff-manifest.sociobot.in/?demo=1`, which redirects to `/demo/`.

## Known gaps

None.
