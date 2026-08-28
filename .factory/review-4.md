# Adversarial first-read review 4

**Product:** Remote File Handoff Manifest  
**Live URL:** https://remote-file-handoff-manifest.sociobot.in  
**Reviewed:** 2026-08-28 UTC  
**Repository revision:** `607af928c8fa651efab3621874501bc60ca86c73`  
**Live footer build:** `6205b12-p3`  
**Verdict:** **PASS**

This round found no blocking, minor, or untested item. The result is based on a new live first-read check, a clean-clone run of every registered claim command, direct demo/privacy/offline/CLI checks, and a route/accessibility/link sweep. No product code was changed.

## Cold first screen

Fresh Chromium 1.58.2 contexts opened the live root at 390 × 844 and 1440 × 900. No scrolling occurred before answering.

| Question | First-read answer | Result |
| --- | --- | --- |
| What does this do? | It verifies a folder handoff and identifies files that are missing or changed. | Clear |
| For whom? | Freelancers and small teams sending private folders. | Clear |
| What should I click first? | “Try it with sample data.” | Clear |

The exact copy available before scrolling was: “Verify every file in a folder handoff.” “For freelancers and small teams sending private folders, show recipients exactly what is missing or changed.” “Try it with sample data.” The adjacent outcome, “Opens a failed handoff with exact missing, changed, and extra paths,” removes ambiguity about the next screen. The price, browser-local, and offline facts were also visible at 390 px. No cold-read finding.

## Findings

None. No `F-4-*` item was raised.

## Copy audit

Counts treat a hyphenated term as one word. Commands and code-only fragments are excluded; headings, labels, buttons, facts, and prose are included. No item exceeds 22 words. No banned marketing adjective, inconsistent user-facing artifact term, context-free heading, or non-result-naming button was found. Technical names such as SHA-256 and Ed25519 appear only in the detailed workflow and format reference, where the tool’s technical audience needs them; they are not required to understand the first action.

### Landing page

| # | Visible copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Skip to main content | 4 | — |
| 2 | ▣ HANDOFF_ | 1 | — |
| 3 | Demo | 1 | — |
| 4 | How it works | 3 | — |
| 5 | Privacy | 1 | — |
| 6 | ◆ FOLDER HANDOFF CHECK | 3 | — |
| 7 | Verify every file in a folder handoff. | 7 | — |
| 8 | For freelancers and small teams sending private folders, show recipients exactly what is missing or changed. | 16 | — |
| 9 | Try it with sample data | 5 | — |
| 10 | Opens a failed handoff with exact missing, changed, and extra paths. | 11 | — |
| 11 | Free under the MIT License | 5 | — |
| 12 | Selected files stay in your browser | 6 | — |
| 13 | Reopens offline after the first visit | 6 | — |
| 14 | Sender: signed file list Recipient: checked folder | 7 | — |
| 15 | TEST // 10,000 FILES Changing one file in the fixture reports only that path. | 14 | — |
| 16 | This checks file contents. | 4 | — |
| 17 | It does not guarantee delivery. | 5 | — |
| 18 | 01 / SEND AND CHECK | 4 | — |
| 19 | How to verify a folder handoff | 6 | — |
| 20 | 01 Sign the file list | 5 | — |
| 21 | The sender records each path, size, and SHA-256 hash. | 9 | — |
| 22 | Their Ed25519 key signs the ordered list. | 7 | — |
| 23 | 02 Send the folder | 4 | — |
| 24 | Send the folder and signed file list with your usual transfer tool. | 12 | — |
| 25 | 03 Verify the received folder | 5 | — |
| 26 | The recipient sees the exact missing, changed, and extra paths. | 10 | — |
| 27 | 02 / INSTALL | 2 | — |
| 28 | Install the command-line tool | 4 | — |
| 29 | Install one command-line tool. | 4 | — |
| 30 | Use JSON output in scripts. | 5 | — |
| 31 | ~/handoff Copy install command | 4 | — |
| 32 | HASH SHA-256 hash for each file | 6 | — |
| 33 | SIGN Ed25519 signature | 3 | — |
| 34 | LOCK Encrypt signed file lists | 5 | — |
| 35 | JSON JSON output for scripts | 5 | — |
| 36 | 03 / CHECK | 2 | — |
| 37 | Verify the received folder | 4 | — |
| 38 | Choose the signed file list, received folder, and sender’s verified public key. | 12 | — |
| 39 | Selected files stay in this tab. | 6 | — |
| 40 | 1. | 1 | — |
| 41 | Signed file list Choose . | 4 | — |
| 42 | Use the command-line tool for encrypted lists. | 7 | — |
| 43 | 2. | 1 | — |
| 44 | Received folder Choose the received folder. | 6 | — |
| 45 | Use the command-line tool for an empty folder. | 8 | — |
| 46 | 3. | 1 | — |
| 47 | Sender’s verified public key Choose the sender’s file after confirming its fingerprint. | 12 | — |
| 48 | Verify selected files | 3 | — |
| 49 | View sample result | 3 | — |
| 50 | ◫ You are offline. | 3 | — |
| 51 | Local verification remains available. | 4 | — |
| 52 | READY ON THIS DEVICE | 4 | — |
| 53 | Choose three items to verify | 5 | — |
| 54 | Missing, changed, and extra paths will appear here. | 8 | — |
| 55 | 04 / PROTECT NAMES | 3 | — |
| 56 | Protect filenames in signed file lists | 6 | — |
| 57 | Set and add . | 3 | — |
| 58 | The tool encrypts the JSON and HTML outputs; source files do not change. | 13 | — |
| 59 | Read the security notes on GitHub (external) → | 7 | — |
| 60 | ▣ Remote File Handoff Manifest | 4 | — |
| 61 | Check a received folder against a sender’s signed file list. | 10 | — |
| 62 | Privacy | 1 | — |
| 63 | Terms | 1 | — |
| 64 | Source on GitHub (external) | 4 | — |
| 65 | Built by Param Factory (external) | 5 | — |
| 66 | Version 0.1.0 · build 6205b12-p3 | 6 | — |

### README

| # | Sentence or heading | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Verify every file in a folder handoff | 7 | — |
| 2 | `handoff` creates a signed file list for a folder. | 9 | — |
| 3 | It records each relative path, byte size, and SHA-256 hash. | 10 | — |
| 4 | It also creates a readable HTML report. | 7 | — |
| 5 | Recipients see exact missing, changed, and extra paths. | 8 | — |
| 6 | The tool is for freelancers and small teams sending private folders. | 11 | — |
| 7 | It checks contents but does not guarantee delivery. | 8 | — |
| 8 | Try the isolated sample at the web demo, or run: | 10 | — |
| 9 | The command-line demo uses the files in `examples/client-handoff/`. | 9 | — |
| 10 | It creates a separate temporary workspace and prints its path. | 10 | — |
| 11 | Install | 1 | — |
| 12 | Install the command-line tool from source: | 6 | — |
| 13 | Create and verify a signed file list | 7 | — |
| 14 | Create a sender key: | 4 | — |
| 15 | Keep `sender.key` private. | 4 | — |
| 16 | Confirm the displayed public-key fingerprint with the recipient through a separate trusted channel. | 13 | — |
| 17 | Create signed JSON and HTML outputs: | 6 | — |
| 18 | Create a portable directory with the files and signed outputs: | 10 | — |
| 19 | Send that directory with your usual transfer tool. | 8 | — |
| 20 | On the recipient’s machine, check the received `files/` folder: | 10 | — |
| 21 | Add `--json` before a command to print JSON for scripts. | 10 | — |
| 22 | Clean checks exit `0`. | 4 | — |
| 23 | File differences exit `3`. | 4 | — |
| 24 | Signature or decryption failures exit `4`. | 6 | — |
| 25 | File and system errors exit `1`. | 6 | — |
| 26 | Invalid command usage exits `2`. | 5 | — |
| 27 | Encrypt file names | 3 | — |
| 28 | Plain signed file lists show filenames. | 6 | — |
| 29 | Set a passphrase in the environment to encrypt both output files: | 11 | — |
| 30 | The encrypted JSON and HTML outputs do not display filenames. | 10 | — |
| 31 | Use the command-line tool to decrypt and verify them. | 9 | — |
| 32 | Source files and packaged files remain unencrypted and unchanged. | 9 | — |
| 33 | Format reference | 2 | — |
| 34 | Format version `1` is UTF-8 JSON. | 6 | — |
| 35 | Ed25519 signs the exact compact JSON encoding of `payload`. | 9 | — |
| 36 | Entries are ordered by relative path and use `/` separators. | 9 | — |
| 37 | Each entry contains `path`, `size`, and lowercase SHA-256 `sha256`. | 9 | — |
| 38 | Readers reject unsupported versions, absolute paths, and paths containing `..`. | 9 | — |
| 39 | Develop and test | 3 | — |
| 40 | `npm test` runs Rust tests, type checks, site tests, claim tests, and browser checks. | 14 | — |
| 41 | The build output is `dist/site`. | 6 | — |
| 42 | The site has no account, analytics, advertising, or third-party runtime code. | 11 | — |
| 43 | Browser checks do not upload or store selected files. | 9 | — |
| 44 | The service worker caches only public site assets for offline use. | 11 | — |
| 45 | See `.factory/claims.json` for each public promise and its verification command. | 12 | — |
| 46 | See `.factory/demo.md` for demo isolation details. | 8 | — |
| 47 | Deploy | 1 | — |
| 48 | The factory deploys `dist/site`. | 5 | — |
| 49 | Maintainers can build it with `npm ci && npm run build:site`. | 11 | — |
| 50 | Registry credentials are factory-owned, so do not publish the crate from this repository. | 13 | — |
| 51 | License | 1 | — |
| 52 | MIT. | 1 | — |

## Demo and sandbox checks

- One live click on “Try it with sample data” followed `/?demo=1` to `/demo/`. The first screen already contained the Project Aurora terminal, a three-file signed list, the running sample check, and the realistic missing, changed, and extra sample paths.
- The persistent banner said “Demo — sample data, nothing is saved” and exposed working “Reset demo” and “Start for real” controls.
- A fresh browser context pre-seeded with `localStorage['real:review4-marker']='keep'` retained that value through demo entry, Reset, and Start for real. Demo mode added no localStorage key; its documented in-memory sample is therefore isolated from real storage.
- Network interception observed only same-origin document, CSS, JavaScript, and image requests. No third-party or upload request occurred.
- In a separate fresh context, the service worker controlled `/demo/`; after `context.setOffline(true)`, reload returned 200 and the sample check completed with all three expected paths.
- From a fresh temporary invocation directory, `target/debug/handoff demo` created `/tmp/handoff-demo-7497-0`, reported the expected three paths, and left the invocation directory empty.

## Claims

`.factory/claims.json` contains 11 entries, each with one matching `@claim:` test. In clean clone `/tmp/rfhm-review4-clean-MkMx8A/repo`, after `npm ci`, every exact registered command passed:

| Claim | Result |
| --- | --- |
| `signed-list-roundtrip` | PASS |
| `exact-differences-10000` | PASS |
| `browser-local-private` | PASS |
| `isolated-demo` | PASS |
| `offline-reload` | PASS |
| `encrypted-outputs` | PASS |
| `json-script-output` | PASS |
| `package-copy` | PASS |
| `exit-codes` | PASS |
| `manifest-format` | PASS |
| `free-mit` | PASS |

The same clean clone passed `npm test`, `npm run build`, `cargo fmt --check`, and `cargo clippy --all-targets -- -D warnings`. The only diagnostic was Cargo’s upstream future-incompatibility warning for `proc-macro-error2`; it did not fail a command or affect the product result.

The landing, README, Privacy, and Terms wording was cross-checked against the registry. Each visitor-relevant statement maps to the appropriate signed-list, exact-differences, browser privacy, isolation, offline, encrypted-output, JSON, package, exit-code, format, or MIT/no-account claim. No unlisted claim was found.

## Earlier-finding confirmation

Every earlier review and polish document was read. The following re-check confirms the prior fixes in live behavior and current code, rather than relying on their previous status labels.

| Earlier finding(s) | Current confirmation |
| --- | --- |
| `B1`, `F-2-1` | Direct demo entry, banner, reset/exit, first-screen populated sample, bundled text fixtures, and separate CLI workspace were exercised. |
| `B2` | The 11-entry registry and all 11 exact tagged claim commands passed from the clean clone. |
| `B3` | `/demo/`, `/privacy/`, and `/terms/` deep links returned 200; `/missing-review-4` returned a designed 404 with Return home. |
| `B4` | Both cold viewports supplied job, audience, sample action, adjacent outcome, and three plain facts before scrolling. |
| `H1`, `F-2-5` | Each checked route has its own title, description, canonical, Open Graph/Twitter image, favicon, apple-touch icon, one h1, and main. |
| `H2` | Axe found no WCAG 2 A/AA issue; focus moves to the h1 with a live announcement. A normal mobile click from y=1232 to Privacy and Back restored y=1232. |
| `H3` | Home, demo, legal, and 404 routes shared the wordmark/header and the footer one-liner, Privacy, Terms, source, Param Factory attribution, and build ID. |
| `H4`, `F-2-2` | Current live and generated wording consistently uses “signed file list” for the artifact; the older receipt/inventory labels do not recur. |
| `M1` | Actions state their result: Try, Verify, View, Copy, Reset, Run/Replay, and Return. |
| `M2` | Current code has the one-file form “1 file matches the signed file list byte for byte.” |
| `M3` | The 10,000-file statement explicitly says it is a test fixture and its quantitative claim passed. |
| `F-2-3`, `F-3-1` | The route handler persists the history-entry scroll point and restores it after h1 focus; the real-click mobile check above confirmed it. |
| `F-3-2` | Clipboard handling is scoped to `#copy-install-command`; the demo replay ended as “Replay sample check,” not an install/clipboard message. |
| `F-2-4` | Privacy avoids the former undefined log-retention promise and states the host-log boundary. |
| `F-2-6` | The landing says “Install one command-line tool,” not unexplained build jargon. |
| `F-2-7` | README consistently says “command-line tool” and “command-line demo.” |
| `F-2-8` | README says “Install the command-line tool from source.” |
| `F-2-9` | README states “JSON output in scripts,” naming the concrete result. |
| `F-2-10` | README states “File and system errors exit 1.” |
| `F-2-11` | Terms contains no untested future-process promise. |
| `UC00` | The unprovable arrival guarantee remains absent; the delivery limitation is explicit. |
| `UC01` | `signed-list-roundtrip` verifies signed-list creation. |
| `UC02` | Path, size, and hash coverage is tested; named-transport compatibility is not claimed. |
| `UC03` | `free-mit` and `browser-local-private` cover the no-account state. |
| `UC04` | `browser-local-private` and live interception cover no selected-file upload. |
| `UC05` | The same privacy claim and live request capture cover no analytics, advertising, or tracking. |
| `UC06` | `exact-differences-10000` asserts 10,000 checked files. |
| `UC07` | The same test asserts the sole changed fixture path. |
| `UC08` | The same test asserts no unchanged path is reported. |
| `UC08a` | The content-check and no-delivery-guarantee wording remains explicit. |
| `UC09` | Ordered SHA-256 fields and signature behavior are covered by `signed-list-roundtrip` and `manifest-format`. |
| `UC10` | The copy says “usual transfer tool”; `package-copy` verifies the separately checkable package. |
| `UC11` | Exact missing, changed, and extra results plus browser locality are exercised. |
| `UC12` | MIT, JSON, and privacy facts have corresponding registered tests; no unsupported minimum-version claim remains. |
| `UC13` | Per-file SHA-256 values are exercised by `signed-list-roundtrip`. |
| `UC14` | Valid and modified signature cases are covered. |
| `UC15` | Both encrypted outputs, hidden filenames, decryption, and unchanged source are covered. |
| `UC16` | Parseable keygen/create JSON is covered by `json-script-output`. |
| `UC16a` | Browser verification uses a real CLI-signed file in `browser-local-private`. |
| `UC17` | Full-flow interception and storage inspection are in `browser-local-private`. |
| `UC18` | Encrypted input recovery is covered by the encryption claim test. |
| `UC19` | Empty-folder CLI verification is covered by `signed-list-roundtrip`. |
| `UC20` | Offline demo reload and completion were exercised live and by `offline-reload`. |
| `UC21` | The demo and `isolated-demo` show all three difference classes. |
| `UC22` | Encryption test covers JSON/HTML encryption and unchanged source bytes. |
| `UC22a` | Subjective “clearer” wording remains absent; the source and MIT evidence are linked. |
| `UC23` | README uses the tested signed-file-list description. |
| `UC24` | README’s fields, HTML output, and difference result statements map to `signed-list-roundtrip`. |
| `UC25` | No upload plus the delivery limitation are covered by the privacy test and copy. |
| `UC26` | The unsupported minimum-Rust version promise remains absent. |
| `UC26a` | The documented action is “Create a sender key.” |
| `UC27` | JSON and HTML output creation is covered by `signed-list-roundtrip`. |
| `UC27a` | `package-copy` checks package contents and source preservation. |
| `UC27b` | The copied destination verifies separately in `package-copy`. |
| `UC28` | Universal transfer-tool wording remains absent. |
| `UC29` | `exit-codes` covers every documented status. |
| `UC30` | Environment passphrase and both encrypted outputs are exercised. |
| `UC30a` | Plain filename visibility is exercised by the signed-list roundtrip. |
| `UC31` | The non-observable “privacy-safe” wording remains absent; hidden filenames are tested. |
| `UC32` | Source and packaged bytes are compared by encryption/package tests. |
| `UC33` | Format version, schema, ordering, signature encoding, and unsafe-path rejection are tested. |
| `UC34` | Browser local-only behavior is tested and live-intercepted. |
| `UC35` | The current README describes the suite concretely; `npm test` passed. |
| `UC36` | No visitor-facing pinned-version claim remains; package pins Playwright 1.58.2. |
| `UC37` | Account/tracking/storage/runtime boundaries are explicitly tested and stated. |
| `UC38` | Signature scope and delivery limit are covered by signed-list/format tests and Terms. |
| `UC39` | Deployment details remain operational documentation, not a visitor promise. |
| `UC40` | Current deep links, headers, and designed 404 passed in the live route sweep. |

## Structure, accessibility, and visual checks

- `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200; unknown route `/missing-review-4` returned 404. All internal destination links returned 200, except the 404 page’s same-document skip anchor, which correctly retains the page’s 404 response.
- Per-route metadata follows the required pattern: `Remote File Handoff Manifest — verify every file`, `Demo — Remote File Handoff Manifest`, `Privacy — Remote File Handoff Manifest`, `Terms — Remote File Handoff Manifest`, and a designed not-found title. Descriptions, canonical links, OG/Twitter cards, favicon, and 180 px touch icon were present.
- The header/footer were consistent across all routes. A real-click route transition focused the new h1 and updated the polite live region. Browser Back preserved the workflow location.
- `verify-url.sh` passed against the live root: HTTP 200, title, `lang=en`, one h1, main landmark, no missing image alt, no unlabeled button, and no console/page error.
- Axe Core 4.10.3 found zero WCAG 2 A/AA violations on root, demo, Privacy, Terms, and 404 at 390 px. The only 404 console line was the browser’s expected failed-request notification for its 404 document.
- The checksum-relay pixel/demoscene surface matches `.factory/design.md`: dark grid, phosphor/cyan/coral state language, hard terminal forms, original relay art, and a styled 404. It is not a generic SaaS template.
- No AI feature is present or needed. The brief calls for deterministic hashing/signing; the tool already supplies the implied package/export workflow and JSON output. An AI step would not improve this job and would weaken the local-first privacy boundary.

## What would make this perfect

No additional feature or repair is indicated by this review. Preserve the tested local-only boundary, one-click sample path, and claim-to-test registry as future changes are made.
