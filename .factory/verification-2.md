# Independent verification 2 — Remote File Handoff Manifest

## Result: **PASS**

Verified on 2026-08-28 UTC from a clean checkout of candidate
`0f2cd8588179e36e7a03a9c74469a8738d4936e1` at
`https://remote-file-handoff-manifest.sociobot.in/`.

The live deployment is the candidate's static product build. SHA-256 matched
for the root HTML and every first-load asset checked:

| File | SHA-256 | Bytes |
| --- | --- | ---: |
| `index.html` | `2e4114abca640332fb26c1bc10ec36be7092bec7829f6eaadca9c302048e1f31` | 9,422 |
| `assets/home-Bx6WKJ74.js` | `e5dc4ec4486bf734e2b794fe5440cdffeb53d1a440826e80bf22db9ad49a2807` | 6,997 |
| `assets/styles-C_CB7CW2.css` | `885367fbd9db2cfcf32fba7eb22a91dfbde1b7937abec5ceddec2d672a7ecca6` | 11,795 |
| `relay-hero.webp` | `59949614af85e81a2624160de52448e56b76cca221aa448786656951667280c8` | 27,436 |

The candidate changes only prior verification/handoff coverage relative to the
repair commit; the deployed executable/site code and emitted artifacts were
independently rebuilt and tested here.

## Local reproducibility and package quality

- Clean `npm ci` installed 58 packages and reported 0 vulnerabilities.
- `npm test` passed: 2 Rust unit tests, 4 Rust CLI integration tests (including
  the 10,000-file changed-path fixture), 1 Rust doctest, 6 TypeScript/Vitest
  tests, and 3 Chromium production-site tests.
- `npm run build` passed and emitted `dist/site`.
- `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`,
  `cargo build --release`, and `cargo package --allow-dirty` passed. Cargo
  reports only its upstream future-incompatibility advisory for
  `proc-macro-error2 v2.0.1`.
- Packaging produced
  `target/package/remote-file-handoff-manifest-0.1.0.crate`: 10 included
  source/docs/license/test files, 94.9 KiB unpacked and 26.8 KiB compressed.
- A fresh extraction was installed with `cargo install --path ... --root ...`.
  Its `handoff 0.1.0` binary generated a key, created a manifest, and verified
  a consumer-owned fixture successfully.

## CLI end-to-end and recovery evidence

Using the built binary with a two-file nested fixture:

- `keygen`, `create`, `package`, and `verify` all returned structured JSON and
  succeeded. The generated secret key was mode `0600`.
- A clean recipient verification reported exactly two checked files,
  `signature_valid: true`, and `status: "verified"`.
- After changing `nested/render.txt`, removing `brief.txt`, and adding
  `extra.txt`, `verify --json` exited `3` and reported only those exact paths
  in `altered`, `missing`, and `unexpected` respectively.
- The repository test independently exercises the specified 10,000-file
  fixture and verifies that changing `item-04217.txt` reports exactly that
  path, with no false positives.
- Encrypted receipts succeeded with a valid passphrase. Missing and incorrect
  passphrases exited `4` with useful JSON errors and no manifest disclosure.
- Invalid expiry input exited `1`; an expired signed receipt exited `3`, and
  `--ignore-expiry` recovered to a clean `0` result.
- A receipt destination inside its source directory was refused (exit `1`),
  so a manifest cannot accidentally inventory its own output.

## Live web/PWA, accessibility, privacy, and performance

- Chromium smoke tests at 1366x900 and 390x844 found no console errors or
  page errors, no horizontal page overflow, one `h1`, `main`, and `lang=en`.
  Visual review confirmed the declared checksum-relay visual system at both
  sizes.
- Keyboard-only testing reached the visible 3 px cyan skip-link focus ring;
  all four horizontally scrollable command areas are focusable (`tabindex=0`).
  Enter activates the mismatch preview. Submitting an empty form moves focus
  to `manifest-file` and announces clear recovery text. This remained true
  with `prefers-reduced-motion: reduce`.
- Axe Core 4.10.3 on the live desktop and 390 px mobile views found zero
  serious or critical WCAG 2 A/AA violations.
- The live browser verifier successfully checked a real CLI-created nested
  fixture locally (`Everything arrived intact`; 2 files). A malformed JSON
  replacement recovered with `ERROR // STOPPED`, `aria-busy=false`, and
  `The manifest is not valid JSON. Choose the plain manifest.json file.`
- Runtime requests were solely to `remote-file-handoff-manifest.sociobot.in`;
  static source audit found no telemetry, analytics, upload, or network API.
  The CLI code has no network client dependency. Privacy and terms pages are
  present.
- Service worker was automatically registered and controlling the live page;
  `registration.update()` completed and an offline reload returned HTTP 200
  with the expected heading.
- Live headers include a self-only CSP, HSTS preload, `nosniff`, referrer and
  Permissions Policies. HTML is revalidating; hashed JS/CSS and hero use
  `public, max-age=31536000, immutable`; `sw.js` is
  `no-cache, no-store, must-revalidate`.
- First-load assets total 46,228 bytes before transfer compression: 6,997 B JS,
  11,795 B CSS, and 27,436 B hero. These are within the 200 KB JS, 50 KB CSS,
  and 300 KB image budgets; no web fonts are loaded.
- Lighthouse 13.4.1 mobile JSON report: Performance 99, Accessibility 100,
  FCP 1.8 s, LCP 1.8 s, TBT 20 ms, CLS 0, interactive 1.9 s. Chromium emitted
  a non-product `TARGET_CRASHED` warning while capturing the optional final
  full-page screenshot after audits; the report had no run warnings and the
  scores/metrics were written successfully. The independent Playwright runs
  above had no crash or page error.

## Defects

No blocker, critical, high, medium, or low product defects found.

## Commands retained for reproduction

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
```

Do not publish the crate from this repository; the factory owns registry
credentials. The ready-to-publish crate is produced by `cargo package`.
