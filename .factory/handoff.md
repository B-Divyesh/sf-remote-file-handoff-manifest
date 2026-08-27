# Handoff: Remote File Handoff Manifest v0.1.0

## What shipped

- A Rust `handoff` CLI with four commands: `keygen`, `create`, `verify`, and `package`.
- Deterministic relative-path inventories with byte sizes and streaming SHA-256 hashes.
- Ed25519-signed versioned JSON manifests, trusted-key verification, readable standalone HTML receipts, optional contact and RFC 3339 expiry fields, and explicit exit codes/`--json` output.
- Passphrase encryption for both JSON and HTML receipts using the interoperable age format and `RFHM_PASSPHRASE`; no passphrase is accepted on the command line.
- Safe local packaging for NAS/SFTP-mounted destinations. Packaging re-verifies the source before copying and refuses existing or source-nested destinations. The product does not claim that an external transport completed.
- Error handling for unsafe paths, symlinks/special files, invalid signatures, malformed manifests, expiry, missing/altered/unexpected files, empty folders, and overwrite attempts.
- A static Vite landing/docs site with a real browser-side Ed25519 and SHA-256 verifier, responsive 390 px layout, keyboard/focus states, offline shell cache, privacy and terms pages, and no telemetry/CDN/runtime request.
- A product-specific pixel/demoscene system recorded in `.factory/design.md`. The original hero is `site/public/relay-hero.webp` (27 KB); exact factory-generator metadata is in `.factory/relay-hero.prompt.json`.

## Run and verify

Requirements: Rust 1.85+, Node 20+.

```sh
npm ci
npm test
npm run build       # output: dist/site/index.html
cargo build --release
cargo package
```

Ready-to-publish crate: `target/package/remote-file-handoff-manifest-0.1.0.crate` (run `cargo package`; registry publishing is intentionally left to the factory).

Verification completed on 2026-08-27:

- `npm test`: pass — 2 Rust unit tests, 4 CLI integration tests, 1 Rust doctest, 6 site tests.
- 10,000-file acceptance fixture: pass — changing `item-04217.txt` reports that exact path only; missing and unexpected lists remain empty.
- Rust `cargo clippy --all-targets -- -D warnings`: pass.
- `npm run build`: pass; `dist/site/index.html` present.
- Production initial payload: 7.01 KB JS, 11.80 KB CSS, 27 KB hero WebP.
- `/opt/fleet/lib/verify-url.sh`: pass — title, language, one H1, main landmark, image alt text, and zero console/page errors.
- axe-core 4.13 browser audit: 0 violations.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, total blocking time 0 ms.
- Desktop 1366×900 and mobile 390×844 screenshots were visually inspected; no overlap or horizontal clipping was found.

## Known boundaries

- The browser verifier accepts plaintext JSON receipts and folders containing at least one file because browser directory pickers cannot represent an empty directory consistently. The CLI handles encrypted receipts, empty folders, and large-file verification.
- The browser verifier uses Web Crypto’s Ed25519 support; older browsers receive a direct instruction to use the CLI.
- `package` copies to a local directory, including mounted NAS/SFTP filesystems. Network transport, authentication brokering, hosted storage, encryption-key custody, and delivery guarantees remain intentional non-goals.
- Release binaries are not attached here. The factory can build platform artifacts from the reproducible Cargo package.
