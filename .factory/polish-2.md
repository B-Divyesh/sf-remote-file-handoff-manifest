# Polish round 2 — cumulative finding closure

Product repair commit: `7c2de871a3cc87b69cba4b5a595d12d9845283d8` (pushed and deployed 28 August 2026).

Evidence: `B-FIRST` = browser first-screen test; `B-ROUTES` = route/metadata/targets/Axe test; `B-NAV` = demo/reset/focus/Back-scroll/404 test; `B-OFFLINE` = service-worker test; `S-COPY` = round-two static copy test; `C:<id>` = matching claim test. Live evidence: `L-HOME` = `artifacts/live-polish-2/home-mobile.png`; `L-DEMO` = `artifacts/live-polish-2/demo-mobile.png`; `L-404` = `artifacts/live-polish-2/not-found-mobile.png`; `L-AUDIT` = `artifacts/live-polish-2/live-check.json`; `L-BASELINE` = `artifacts/live-polish-2/verify-url/verify.json`. All live checks target `https://remote-file-handoff-manifest.sociobot.in`.

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Put the recorded command and completed three-path result in the initial 390 × 844 demo viewport. Replaced fake `.ai`/`.mov` text stubs with honest Markdown/text files and removed subjective “realistic” copy. | `B-NAV`, `C:isolated-demo`, `L-DEMO`; live `/?demo=1`. |
| F-2-2 | Generated HTML now uses “signed file list” for every user-facing artifact label; only literal `manifest.json` remains. Added a regression rejecting the old labels. | `C:signed-list-roundtrip`; live copy in `L-HOME`. |
| F-2-3 | Route focus uses `focus({ preventScroll: true })`; the browser test records and requires the prior scroll after Back. | `B-NAV`, `L-AUDIT`; live `/#how → /privacy/ → Back`. |
| F-2-4 | Removed undefined “short-lived” retention language and state that host-log control sits outside this product. | `S-COPY`, `L-AUDIT`; live `/privacy/`. |
| F-2-5 | Root title and social titles use “Remote File Handoff Manifest — verify every file”. | `B-FIRST`, `S-COPY`, `L-HOME`; live `/`. |
| F-2-6 | Replaced “Build one Rust binary” with “Install one command-line tool.” | `S-COPY`, `.factory/copy-audit.md`, `L-HOME`; live `/#install`. |
| F-2-7 | README now says “The command-line demo”. | `S-COPY`; pushed README. |
| F-2-8 | README now says “Install the command-line tool from source”. | `S-COPY`; pushed README. |
| F-2-9 | README now says “Add `--json` before a command to print JSON for scripts.” | `S-COPY`, `C:json-script-output`; pushed README. |
| F-2-10 | README names “File and system errors” for exit 1; the test invokes a missing file and asserts exit 1. | `S-COPY`, `C:exit-codes`; pushed README. |
| F-2-11 | Removed the untestable future-publication sentence and empty Changes section. | `S-COPY`, `L-AUDIT`; live `/terms/`. |

## Review 1 main findings

| Finding | Change retained or completed | Evidence |
| --- | --- | --- |
| B1 | One-click isolated web/command-line demos, banner, Reset, Start for real, temporary workspace, honest bundled files, and immediate mobile result. | `C:isolated-demo`, `B-NAV`, `B-OFFLINE`, `L-DEMO`; live `/?demo=1`. |
| B2 | Eleven claims have exactly one tagged observable test; every registry command passed separately from the clean clone. | All `C:*`; `/tmp/rfhm-polish2-clean-y6nK4C/repo`. |
| B3 | Demo/legal routes load directly; unknown routes retain the design and HTTP 404. | `B-ROUTES`, `B-NAV`, `L-404`; live `/missing-polish-2`. |
| B4 | First screen names the audience/job and has one honest primary sample action with its outcome. | `B-FIRST`, `L-HOME`; live `/`. |
| H1 | Unique route titles/descriptions/canonicals/social metadata/icons remain; root now uses the full name. | `B-ROUTES`, `B-FIRST`, `L-AUDIT`; live all routes. |
| H2 | 44 px targets, h1 focus/announcement, and preserved Back scroll are verified. | `B-ROUTES`, `B-NAV`, `L-AUDIT`; live `/`. |
| H3 | Shared header/footer retain legal/source/factory links, one-liner, version, and build. | `B-ROUTES`, `L-AUDIT`; live all routes. |
| H4 | Site, README, command-line messages, and generated HTML use “signed file list”; format identifiers stay technical. | `C:signed-list-roundtrip`, `S-COPY`, `L-HOME`; live `/`. |
| M1 | Honest result actions remain “Try it with sample data”, “View sample result”, and “Copy install command”. | `B-FIRST`, `B-NAV`, `L-HOME`. |
| M2 | One-file and plural summaries remain grammatical. | `C:browser-local-private`; live `/#verify`. |
| M3 | The 10,000-file strip remains labelled as a controlled fixture. | `C:exact-differences-10000`, `L-HOME`; live `/`. |

## Review 1 unlisted claims

| Finding | Closure | Evidence |
| --- | --- | --- |
| UC00 | Removed delivery proof; retained the content-check limitation. | `C:signed-list-roundtrip`, `L-HOME`. |
| UC01 | Signed-list creation is observable. | `C:signed-list-roundtrip`; live `/#how`. |
| UC02 | Scope is path/size/hash; named transport compatibility remains removed. | `C:signed-list-roundtrip`; live `/#how`. |
| UC03 | No-account wording is scoped and tested. | `C:free-mit`, `C:browser-local-private`; live `/privacy/`. |
| UC04 | Selected-file upload absence is scoped and intercepted. | `C:browser-local-private`; live `/`. |
| UC05 | No analytics/advertising/tracking is registered and runtime-checked. | `C:browser-local-private`, `L-AUDIT`; live `/privacy/`. |
| UC06 | 10,000 is labelled and asserted as a fixture count. | `C:exact-differences-10000`, `L-HOME`. |
| UC07 | The sole changed fixture path is asserted. | `C:exact-differences-10000`, `L-HOME`. |
| UC08 | Missing and extra remain empty in that fixture. | `C:exact-differences-10000`, `L-HOME`. |
| UC08a | Signature/content scope and delivery limitation remain explicit. | `C:signed-list-roundtrip`, `L-HOME`. |
| UC09 | Ordered hashes and Ed25519 signature remain tested format facts. | `C:signed-list-roundtrip`, `C:manifest-format`; live `/#how`. |
| UC10 | Copy says “your usual transfer tool”, without universal transport claims. | `C:package-copy`; live `/#how`. |
| UC11 | Missing/changed/extra terminology and local browser operation stay consistent. | `C:signed-list-roundtrip`, `C:browser-local-private`, `L-DEMO`. |
| UC12 | MIT, JSON, and privacy facts are split/tested; no public minimum-version claim. | `C:free-mit`, `C:json-script-output`, `C:browser-local-private`; live `/#install`. |
| UC13 | Per-file SHA-256 values are asserted. | `C:signed-list-roundtrip`; live `/#install`. |
| UC14 | Valid and modified signature cases are exercised. | `C:signed-list-roundtrip`, `C:manifest-format`; live `/#install`. |
| UC15 | Encrypted outputs, hidden filenames, decrypt, and unchanged source are asserted. | `C:encrypted-outputs`; live `/#install`. |
| UC16 | Key generation and create JSON fields are parsed. | `C:json-script-output`; live `/#install`. |
| UC16a | Browser verification uses a real command-line-signed file. | `C:browser-local-private`; live `/#verify`. |
| UC17 | The browser check intercepts requests and inspects storage. | `C:browser-local-private`, `L-AUDIT`; live `/#verify`. |
| UC18 | Browser recovery for encrypted input and command-line decrypt are exercised. | `C:encrypted-outputs`; live `/#verify`. |
| UC19 | A zero-file signed list is created and verified. | `C:signed-list-roundtrip`; live `/#verify`. |
| UC20 | Demo reload and completed check work offline. | `C:offline-reload`, `B-OFFLINE`, `L-AUDIT`; live `/demo/`. |
| UC21 | Demo displays and asserts all three difference classes. | `C:isolated-demo`, `L-DEMO`; live `/demo/`. |
| UC22 | Age headers, hidden names, decrypt, and unchanged source bytes are checked. | `C:encrypted-outputs`; live `/#install`. |
| UC22a | Subjective copy stays removed; source/license links succeed. | `C:free-mit`, `L-AUDIT`; live footer. |
| UC23 | README uses the tested signed-file-list description. | `C:signed-list-roundtrip`; pushed README. |
| UC24 | README is split into short sentences; fields, HTML, and differences are tested. | `C:signed-list-roundtrip`, `.factory/copy-audit.md`; `L-DEMO`. |
| UC25 | No network/upload behavior is intercepted; the delivery limit remains. | `C:browser-local-private`; live `/privacy/`. |
| UC26 | The unverified minimum-Rust claim remains removed. | Clean `cargo build --release`; pushed README. |
| UC26a | Copy remains “Create a sender key.” | `C:signed-list-roundtrip`; pushed README. |
| UC27 | Signed JSON and HTML outputs exist and verify. | `C:signed-list-roundtrip`; live `/#install`. |
| UC27a | Packaging preserves source files and copies signed outputs. | `C:package-copy`; pushed README. |
| UC27b | The packaged folder verifies separately. | `C:package-copy`; pushed README. |
| UC28 | Universal “any tool” wording remains removed. | `C:package-copy`; live `/#how`. |
| UC29 | All five exit statuses are exercised; exit-1 copy is concrete. | `C:exit-codes`, `S-COPY`; pushed README. |
| UC30 | Passphrase is environment-only; both encrypted outputs are exercised. | `C:encrypted-outputs`; pushed README. |
| UC30a | Plain-list filename visibility is asserted. | `C:signed-list-roundtrip`; pushed README. |
| UC31 | “Privacy-safe” stays removed; encrypted outputs hide names. | `C:encrypted-outputs`; pushed README. |
| UC32 | Source and packaged bytes remain unchanged. | `C:encrypted-outputs`, `C:package-copy`; pushed README. |
| UC33 | Version/schema/order/separators/signature/path safety are tested. | `C:manifest-format`; pushed README. |
| UC34 | Real browser verification intercepts requests and checks storage. | `C:browser-local-private`; live `/#verify`. |
| UC35 | README describes suite scope briefly; the clean-clone suite passed. | `npm test`; pushed README. |
| UC36 | Public pinned-version copy stays removed; Playwright is exactly 1.58.2. | Clean `npm ci`, `npm test`. |
| UC37 | Account/tracking/storage/runtime statements are split and tested. | `C:browser-local-private`, `C:free-mit`; live `/privacy/`. |
| UC38 | Correct key, modified payload, and delivery limitation are covered. | `C:signed-list-roundtrip`, `C:manifest-format`; live `/terms/`. |
| UC39 | Deployment evidence stays in handoff; live/build root and demo hashes match. | `.factory/handoff.md`, `L-HOME`; live `/`. |
| UC40 | Built response policy and live headers/404 are checked. | Deployment-configuration test, `L-404`; live `/missing-polish-2`. |

## Final verification

- All 11 claim commands passed separately from clean clone `/tmp/rfhm-polish2-clean-y6nK4C/repo` at `7c2de87`.
- That clone passed `npm test`, `npm run build`, `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo build --release`, and `cargo package --allow-dirty`.
- Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.1 s, TBT 0 ms, CLS 0 (`artifacts/live-polish-2/lighthouse.json`).
- Live/build hashes match: root `a41474c76097d768087fc7a5a2198d4cbfcb8cbdd9171ed421f09ca873de6d17`; demo `e7bf2501eb0dd7f774a0693cac3025409a69f2a13062c2311c850cb3a4e3222e`.
- Known gaps: none.
