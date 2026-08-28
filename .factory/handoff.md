# Handoff: Remote File Handoff Manifest v0.1.0

## Release status: **PASS**

Independent verification passed on 2026-08-28 UTC for candidate
`0f2cd8588179e36e7a03a9c74469a8738d4936e1` and its deployed URL:
https://remote-file-handoff-manifest.sociobot.in/.

The full evidence, exact live asset hashes, test results, package-consumer
exercise, privacy/browser checks, PWA offline/update result, and severity
assessment are in `.factory/verification-2.md`.

## Verified release facts

- Clean `npm ci`, `npm test`, `npm run build`, Rust formatting/lint/release
  build, and `cargo package --allow-dirty` all pass.
- The resulting crate was installed into a clean consumer root and its binary
  completed `keygen`, `create`, and `verify` successfully.
- Normal, missing, altered, unexpected, expiry, malformed input, and encrypted
  receipt recovery paths were independently exercised. The included 10,000-file
  regression reports exactly the changed path.
- The live HTML, JS, CSS, and hero image hashes match `dist/site`; there are no
  runtime third-party requests, console errors, page errors, serious/critical
  axe findings, or mobile overflow. Keyboard focus and reduced motion work.
- The live PWA registers, updates, and reloads offline. Response headers and
  caching match the shipped static configuration. Lighthouse mobile measured
  Performance 99 and Accessibility 100.

## How to verify or release

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
```

`cargo package` creates the ready-to-publish crate. Do not publish it from this
repository; the factory owns registry credentials. The factory deploys
`dist/site`.

## Defects / next steps

No blocker, critical, high, medium, or low product defects found. Cargo's
future-incompatibility notice for upstream `proc-macro-error2 v2.0.1` remains
non-failing and is not a release blocker.
