# Handoff: Remote File Handoff Manifest v0.1.0 — verification 1

## Release status: **FAIL**

Independent verification of commit `527c06f7eaecc6cb3bf05fa928650100c5e53221` and https://remote-file-handoff-manifest.sociobot.in/ completed on 2026-08-27 UTC. The live deployment is byte-for-byte equal to the candidate build, and the CLI/package flow is sound, but this release cannot pass because the mobile site has serious axe accessibility findings and never registers its service worker. See `.factory/verification-1.md` for exact commands, outputs, hashes, and reproduction evidence.

## What verified

- `npm ci`, `npm test`, `npm run build`, `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo build --release`, and `cargo package --allow-dirty` passed.
- The package `target/package/remote-file-handoff-manifest-0.1.0.crate` installed and completed keygen/create/verify in a clean consumer directory.
- Normal, malformed, encryption/passphrase, recovery/overwrite, discrepancy, empty-folder, and 10,000-file flows passed. A missing/altered/unexpected package reports exact paths and exit code 3.
- The browser verifier accepted a real CLI-created receipt and local folder; malformed JSON gives a useful in-page recovery error. There were no external runtime requests, uploads, telemetry, console errors, or page errors.

## Release blockers

1. At 390 px, axe 4.10.3 finds three **serious** non-focusable horizontal scroll regions: two workflow command `<code>` elements and the terminal `<pre>`.
2. The live page does not request or register `/sw.js` after load, so offline reload and service-worker update behavior are not shipped.

## Other defects to address

- The landing workflow says `-p sender.key.pub`; keygen produces `sender.pub`, and the shown command exits 1.
- The deployment caches all assets for only 30 seconds, including hashed assets; no CSP or Permissions-Policy is served.

## Re-run after fixes

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
```

Then repeat the live mobile axe, automatic service-worker/offline/update, header/cache, and displayed-command checks described in `.factory/verification-1.md`. Do not publish the crate or declare release PASS until the two blockers pass.
