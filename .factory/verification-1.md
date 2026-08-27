# Independent verification 1 — FAIL

**Work order:** `remote-file-handoff-manifest-verify-1`  
**Candidate:** `527c06f7eaecc6cb3bf05fa928650100c5e53221` (`main`)  
**Live URL:** https://remote-file-handoff-manifest.sociobot.in/  
**Verified:** 2026-08-27 UTC

## Verdict

**FAIL.** The Rust CLI meets the researched job-to-be-done in local and packaged-consumer tests, and the deployment exactly matches the candidate build. The live companion site does not meet required accessibility/PWA quality gates: mobile axe has serious findings, and its service worker is not registered by the page, so offline reload/update functionality is unavailable. The landing page also gives a non-working public-key path.

## Required checks run

| Check | Result | Evidence |
| --- | --- | --- |
| Clean dependency install | PASS | `npm ci`: 56 packages, 0 audit vulnerabilities. |
| Unit, integration, type, and browser-verifier tests | PASS | `npm test`: 2 Rust unit + 4 CLI integration + 1 doctest + 6 Vitest tests. The CLI integration test includes the required 10,000-file fixture and reports only `item-04217.txt` altered. |
| Formatting and lint | PASS | `cargo fmt --check`; `cargo clippy --all-targets -- -D warnings`. Cargo emitted only an upstream future-incompatibility advisory for `proc-macro-error2`, not a project warning. |
| Exact production build | PASS | `npm run build`; `cargo build --release`; `cargo package --allow-dirty`. Vite output: 7.01 KB JS, 11.80 KB CSS, 27.44 KB hero image. Package: `target/package/remote-file-handoff-manifest-0.1.0.crate` (26.3 KB compressed). |
| Clean packaged consumer | PASS | Unpacked the `.crate` in a fresh temp directory, `cargo install --path … --root …`, ran `handoff 0.1.0`, then keygen/create/verify successfully. Existing-key/receipt recovery correctly refused overwrites. |
| CLI normal/boundary/error/recovery flow | PASS | Built a signed two-file package with contact and expiry, verified it cleanly, then changed `nested/render.bin`, removed `brief.txt`, and added `extra.txt`: JSON reported exactly altered/missing/unexpected and exited 3. Invalid JSON exited 4. Too-short passphrase exited 1; wrong encrypted-manifest passphrase exited 4; correct passphrase verified cleanly. Empty encrypted folders and 10,000 files also pass repository integration tests. |
| Browser verifier end to end | PASS | On the live site, selected a CLI-produced manifest, directory, and `.pub` key: result `Everything arrived intact`. Replacing the manifest with malformed JSON displayed `The manifest is not valid JSON. Choose the plain manifest.json file.` with no page/console error. Keyboard Enter on “Preview a mismatch” produced `2 differences found`. |
| Candidate/live match | PASS | SHA-256 matched for `index.html` (`050d…4121`), JS (`5aac…5c88`), CSS (`8853…cca6`), `sw.js` (`146b…9550`), and hero (`5994…280c8`). |
| Desktop/mobile usability | PARTIAL | Playwright at 1366×900 and 390×844 found no horizontal overflow (scroll width equals viewport width); both screenshots were visually inspected. 17 controls were reachable; a focused copy button had `rgb(94, 231, 242) solid 3px` outline with 4 px offset. Mobile accessibility still fails below. |
| Reduced motion | PASS | Site uses the reduced-motion media query; the mobile axe run with reduced motion had no page/console errors. |
| Axe accessibility | **FAIL** | Playwright-injected axe 4.10.3 at 390×844 found one **serious** `scrollable-region-focusable` violation with three targets: `li:nth-child(2) > code`, `li:nth-child(3) > code`, and `pre`. Desktop run was clean. |
| Basic live-page audit | PASS | `/opt/fleet/lib/verify-url.sh` reported HTTP 200, title, `lang=en`, one H1, main landmark, image alt text, and zero console/page errors; load was 1081 ms. |
| Privacy/outbound requests | PASS | Browser request capture saw only `https://remote-file-handoff-manifest.sociobot.in`; source inspection found no analytics, telemetry, CDN, or upload request. The browser verifier operated on local selected files. |
| PWA/offline/update | **FAIL** | After a normal live-page `load` plus 5 seconds, `navigator.serviceWorker.getRegistrations()` returned `[]`, no `/sw.js` request appeared, and there was no controller. `sw.js` exists and a direct manual `navigator.serviceWorker.register('/sw.js')` produced an installing registration, isolating the failure to the shipped page’s registration path/timing. Consequently an automatic offline reload or SW update cannot be verified and the claimed offline shell is not delivered. |
| Security headers/caching | PARTIAL | HTTPS has HSTS, `nosniff`, referrer policy, and DNS-prefetch control. There is no CSP or Permissions-Policy. HTML, hashed JS/CSS, service worker, and hero are all served `cache-control: public, must-revalidate, max-age=30`, rather than immutable long-lived caching for hashed assets. |

## Defects by severity

### High

1. **Mobile keyboard accessibility gate failure.** At 390 px, the workflow command areas and terminal `<pre>` can scroll horizontally but cannot receive keyboard focus. Axe marks all three as serious (`scrollable-region-focusable`). Keyboard-only users cannot access overflowing command text.
2. **PWA/offline claim is non-functional.** The deployed page never registers `/sw.js`; no service-worker registration/controller exists after load. The product therefore cannot provide its documented offline shell or service-worker update behavior.

### Medium

1. **The live workflow publishes the wrong public-key path.** It tells recipients to run `handoff verify manifest.json ./files -p sender.key.pub`; `handoff keygen -o sender.key` actually creates `sender.pub`. The displayed command exits 1 with `No such file or directory`.
2. **Deployment cache policy misses the static/PWA budget.** Even content-hashed JS/CSS and the immutable hero have only a 30-second revalidating cache lifetime, adding avoidable repeat-transfer latency and failing the specified immutable-cache policy.

### Low

1. **Defense-in-depth headers are incomplete.** The live response has no Content-Security-Policy or Permissions-Policy. HSTS is 10,886,400 seconds despite carrying `preload`, below the one-year preload criterion.

## Scope notes

- No product source code was changed.
- The CLI itself is a useful, transport-independent signed-manifest tool: relative paths, sizes, SHA-256 hashes, Ed25519 signatures, expiry/contact metadata, encrypted/opaque receipts, package copying, exact discrepancy output, and explicit exit codes all worked in the exercised flows.
- The service-worker failure prevents a PASS even though the CLI and static build are otherwise sound. Resolve the two High defects, then rerun the live mobile axe and offline/update checks before release.
