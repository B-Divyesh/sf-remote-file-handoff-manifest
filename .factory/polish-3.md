# Polish round 3 — cumulative finding closure

Repair source commit: `6205b12`. Final commit and live evidence are recorded in `.factory/handoff.md` after deployment. Evidence aliases: `B-FIRST` = mobile/desktop cold-first-screen browser test; `B-ROUTES` = route/metadata/targets/Axe browser test; `B-NAV` = demo/reset/real-click Back/focus/404 browser test; `B-OFFLINE` = service-worker/offline browser test; `C:<id>` = the sole registered claim test. Screenshots: `artifacts/home-mobile.png`, `artifacts/home-desktop.png`, `artifacts/demo-mobile.png`, `artifacts/not-found-mobile.png`.

## Current review 3

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-2-3 / F-3-1 | Save scroll coordinates before a same-origin navigation, keyed to a durable history-entry ID. On `pageshow`, focus/announce the h1 without scroll, then restore that entry’s point on the next frames. The regression now uses `locator.click()`. | `B-NAV`; `home-mobile.png`; live `/#how → /privacy/ → Back`. |
| F-3-2 | Scoped clipboard handling to `#copy-install-command`. `#play-demo` disables during its run and ends only as “Replay sample check.” | `B-NAV`, site test “keeps replay and clipboard actions isolated”; `demo-mobile.png`; live `/demo/`. |

## Review 1 and 2 structural findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| B1 / F-2-1 | Retained one-click `?demo=1` → `/demo/`, in-memory samples, persistent banner/reset/exit, immediate recorded command/result, honest text fixtures, and CLI temp workspace. | `C:isolated-demo`, `B-NAV`, `B-OFFLINE`; `demo-mobile.png`; live `/demo/`. |
| B2 | Retained 11 claims with exactly one observable tagged test per public promise. | All `C:*` below; clean-clone claims; live copy audit. |
| B3 | Retained direct demo/legal routes and designed HTTP 404. | `B-ROUTES`, `B-NAV`; `not-found-mobile.png`; live `/missing-polish-3`. |
| B4 | Retained plain task/audience/one sample action/adjacent outcome/three tested facts above the fold. | `B-FIRST`; home screenshots; live `/`. |
| H1 / F-2-5 | Retained unique full-name title, description, canonical, social metadata, favicon, and touch icon per route. | `B-FIRST`, `B-ROUTES`; live all routes. |
| H2 | Retained 44 px targets, visible focus, announcements, and now a real-click Back/Forward scroll restoration. | `B-ROUTES`, `B-NAV`; live Back path. |
| H3 | Retained shared header/footer, legal links, source/factory links, one-liner, version, and updated build id. | `B-ROUTES`; live all routes. |
| H4 / F-2-2 | Retained “signed file list,” “folder,” and “missing, changed, extra” in site, README, and generated HTML. | `C:signed-list-roundtrip`; copy audit; live output. |
| M1 | Retained result-naming actions, including the corrected replay control. | `B-FIRST`, `B-NAV`; live `/`, `/demo/`. |
| M2 | Retained singular/plural matched-file grammar. | `C:browser-local-private`; live `/#verify`. |
| M3 | Retained 10,000-file controlled-fixture framing. | `C:exact-differences-10000`; live `/`. |
| F-2-4 | Retained removal of undefined host-log retention language. | Copy audit; live `/privacy/`. |
| F-2-6 | Retained “Install one command-line tool.” | Copy audit; live `/#install`. |
| F-2-7 | Retained “command-line demo” in README. | Copy audit; README. |
| F-2-8 | Retained “Install the command-line tool from source.” | Copy audit; README. |
| F-2-9 | Retained “JSON for scripts” wording. | `C:json-script-output`; README. |
| F-2-10 | Retained “File and system errors exit 1.” | `C:exit-codes`; README. |
| F-2-11 | Retained removal of the untestable Terms future-process promise. | Copy audit; live `/terms/`. |

## Review 1 public-claim findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| UC00 | Contents-only limit retained; delivery-proof wording removed. | `C:signed-list-roundtrip`; live `/`. |
| UC01 | Observable signed-list creation retained. | `C:signed-list-roundtrip`; live `/#how`. |
| UC02 | Tested path/size/hash scope retained; named-transfer compatibility removed. | `C:signed-list-roundtrip`; live `/#how`. |
| UC03 | Scoped no-account wording retained. | `C:free-mit`, `C:browser-local-private`; live `/privacy/`. |
| UC04 | Selected-file no-upload behavior retained. | `C:browser-local-private`; live `/#verify`. |
| UC05 | No analytics/advertising/tracking claim retained. | `C:browser-local-private`; live `/privacy/`. |
| UC06 | 10,000-file fixture count retained. | `C:exact-differences-10000`; live `/`. |
| UC07 | Sole changed fixture path retained. | `C:exact-differences-10000`; live `/`. |
| UC08 | Zero false missing/extra reports retained. | `C:exact-differences-10000`; live `/`. |
| UC08a | Signature/content scope and delivery limitation retained. | `C:signed-list-roundtrip`; live `/`. |
| UC09 | Ordered SHA-256 and Ed25519 assertions retained. | `C:signed-list-roundtrip`, `C:manifest-format`; live `/#how`. |
| UC10 | “Usual transfer tool” wording retained. | `C:package-copy`; live `/#how`. |
| UC11 | Exact difference terms and local-browser behavior retained. | `C:signed-list-roundtrip`, `C:browser-local-private`; live `/demo/`. |
| UC12 | Separate MIT, JSON, privacy assertions retained; minimum-version promise absent. | `C:free-mit`, `C:json-script-output`, `C:browser-local-private`; live `/#install`. |
| UC13 | Per-file SHA-256 checks retained. | `C:signed-list-roundtrip`; live `/#install`. |
| UC14 | Valid-signature and modified-payload cases retained. | `C:signed-list-roundtrip`, `C:manifest-format`; live `/#install`. |
| UC15 | Encryption/hidden-name/decrypt/source-preservation cases retained. | `C:encrypted-outputs`; live `/#install`. |
| UC16 | Parseable JSON for scripts retained. | `C:json-script-output`; live `/#install`. |
| UC16a | Real command-line-signed browser verification retained. | `C:browser-local-private`; live `/#verify`. |
| UC17 | Full request interception and storage inspection retained. | `C:browser-local-private`; live `/#verify`. |
| UC18 | Encrypted-list recovery in browser/CLI retained. | `C:encrypted-outputs`; live `/#verify`. |
| UC19 | Empty-folder CLI verification retained. | `C:signed-list-roundtrip`; live `/#verify`. |
| UC20 | Offline demo reload/completion retained. | `C:offline-reload`, `B-OFFLINE`; live `/demo/`. |
| UC21 | All three demo difference classes retained. | `C:isolated-demo`; live `/demo/`. |
| UC22 | Encrypted JSON/HTML plus unchanged source retained. | `C:encrypted-outputs`; live `/#install`. |
| UC22a | Concrete free/open-source footer and source link retained. | `C:free-mit`; live footer. |
| UC23 | Narrow signed-file-list README description retained. | `C:signed-list-roundtrip`; README. |
| UC24 | Short README field/HTML/difference statements retained. | `C:signed-list-roundtrip`; README. |
| UC25 | No-network selected-file behavior and delivery limitation retained. | `C:browser-local-private`; live `/privacy/`. |
| UC26 | Unsupported public minimum-Rust promise remains removed. | Copy audit; release build. |
| UC26a | “Create a sender key” retained. | `C:signed-list-roundtrip`; README. |
| UC27 | Signed JSON/HTML creation and verification retained. | `C:signed-list-roundtrip`; README. |
| UC27a | Package creation without source mutation retained. | `C:package-copy`; README. |
| UC27b | Separate packaged-folder verification retained. | `C:package-copy`; README. |
| UC28 | Non-universal transfer wording retained. | `C:package-copy`; README. |
| UC29 | All documented exit-code cases retained. | `C:exit-codes`; README. |
| UC30 | Environment-only passphrase/encrypted-output behavior retained. | `C:encrypted-outputs`; README. |
| UC30a | Plain-list filename visibility retained. | `C:signed-list-roundtrip`; README. |
| UC31 | Observable hidden-filename encryption wording retained. | `C:encrypted-outputs`; README. |
| UC32 | Source/package byte-preservation retained. | `C:encrypted-outputs`, `C:package-copy`; README. |
| UC33 | Format/version/order/separator/signature/path-safety coverage retained. | `C:manifest-format`; README. |
| UC34 | Browser no-upload/no-storage verification retained. | `C:browser-local-private`; live `/#verify`. |
| UC35 | Concrete short test-suite description retained. | `npm test`; README. |
| UC36 | Visitor-facing pinned-version claim remains removed. | Copy audit; `npm ci`. |
| UC37 | Separate account/tracking/storage/runtime statements retained. | `C:browser-local-private`, `C:free-mit`; live `/privacy/`. |
| UC38 | Valid/wrong-key and modified-list limits retained. | `C:signed-list-roundtrip`, `C:manifest-format`; live `/terms/`. |
| UC39 | Deployment details remain handoff evidence, not visitor copy. | Build/live hash check; handoff. |
| UC40 | Built security/cache/404 configuration retained. | `B-ROUTES`, deployment-config test; live headers. |

## Final evidence

- Local: `npm test`, `npm run build`, `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo build --release`, and `cargo package --allow-dirty` pass.
- Final clean-clone claim evidence and post-deployment cold checks, including exact commit and live URLs, are in `.factory/handoff.md`.
- No AI feature was added: local hashing and signature verification have no meaningful AI step, and package/JSON output cover the relevant export workflow.
