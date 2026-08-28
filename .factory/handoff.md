# Handoff — adversarial review 2

## Result

The review verdict is **FAIL**. No product code was changed. The complete report is `.factory/review-2.md`.

Two blockers remain:

- The first 390 × 844 screen after entering the demo does not show the running command or mismatch result, and its `.ai`/`.mov` samples are plain-text stubs despite the “realistic files” promise.
- The generated HTML report still calls one artifact a receipt, manifest, inventory, and signed file list, so review-1 finding H4 is only partly fixed.

Nine medium/minor findings cover Back scroll restoration, the abbreviated root title, four plain-language issues, and two unlisted policy claims.

## Verification performed

- Opened the live root cold in fresh 390 × 844 and 1440 × 900 Chromium contexts.
- Exercised demo entry, automatic run, Reset, Start for real, seeded-storage isolation, and same-origin requests.
- Ran `handoff demo` from a temporary directory with a separate temporary root; the working-directory marker was untouched.
- Reopened the live demo offline under service-worker control.
- Verified a real CLI-signed folder on the live site while intercepting requests and inspecting localStorage, IndexedDB, and Cache Storage.
- Crawled live internal and external links and checked all routes, metadata, 404 status/body, focus, targets, reflow, and axe.
- Ran every command in `.factory/claims.json` separately from clean clone `/tmp/rfhm-review2-claims-Pr7hbT/repo` at `7d48dec9487176f56b6d99ee6ad382b9db24f638`; all 11 passed.
- Ran `npm test`, `npm run build`, `cargo fmt --check`, and `cargo clippy --all-targets -- -D warnings`; all passed.
- Ran `/opt/fleet/lib/verify-url.sh` against the live root; it passed.
- Compared the clean build with the deployment; route HTML, JS, CSS, and public assets matched by SHA-256.

## Reproduce

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo run -- demo
```

For the first blocking issue, open the live demo in a fresh 390 × 844 viewport and check whether `#demo-recording` and a mismatch path intersect the initial viewport. For the second, generate a signed file list and inspect `manifest.html` for `RECEIPT`, `manifest`, and `Inventory`.

## Known gaps / next steps

Resolve all findings in `.factory/review-2.md`, then rerun the review from scratch. A passing round requires zero findings and no untested claim.
