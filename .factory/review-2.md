# Adversarial first-read review 2

**Product:** Remote File Handoff Manifest  
**Live URL:** https://remote-file-handoff-manifest.sociobot.in  
**Reviewed:** 2026-08-28 UTC  
**Revision:** `7d48dec9487176f56b6d99ee6ad382b9db24f638`  
**Verdict:** **FAIL**

Two findings are blocking. The demo exists and runs in isolation, but its mobile first screen does not show the product in use. The earlier terminology finding is also only partly fixed: the generated HTML output still calls the same artifact a receipt, manifest, and inventory. Nine additional findings remain.

## Cold first screen

Fresh Chromium 1.58.2 contexts opened the deployed root at 390 × 844 and 1440 × 900 with no prior site state. Nothing was scrolled before this assessment.

| Question | First-read answer | Result |
| --- | --- | --- |
| What does it do? | It makes a signed list for a folder, then identifies missing or changed files for the recipient. | Clear. |
| For whom? | Freelancers and small teams sending private folders. | Clear. |
| What should I click first? | “Try it with sample data.” The adjacent note says it opens a failed handoff and exact mismatch paths. | Clear. |

The exact first-screen copy was “Verify every file in a folder handoff,” “For freelancers and small teams sending private folders, show recipients exactly what is missing or changed,” and “Try it with sample data.” All three answers are available above the fold on both viewports. The three price/privacy/offline facts are visible at 390 px; the third begins within the 900 px desktop viewport.

## Findings

### F-2-1 — BLOCKING — Earlier B1 is only partly fixed: the demo is hidden below the fold and its “realistic files” are text stubs

**Quote/location:** After selecting “Try it with sample data” at 390 × 844, `/demo/` shows the banner, “Find every mismatch in a sample handoff,” and “A real CLI run checks three bundled files. One is missing, one changed, and one extra.” The recorded command starts at y=925 and the mismatch result starts at y=1298, both below the 844 px viewport. The result remains below the fold after the automatic run finishes. The landing promise “realistic files” is also unlisted and contradicted by the fixture: `logo-master.ai` is 58 bytes of plain text and `final-cut.mov` is 62 bytes of plain text, not valid files of those types.

**Why this fails first use:** The first screen after the click is another introduction, not the product being used. A visitor has to scroll before seeing a command or a realistic path, then the supposedly realistic creative files are only labels attached to text. The supplied demo contract explicitly makes a weak sample or first post-click screen blocking. This repeats review-1 finding B1 as a half-fix.

**Concrete fix:** Put the running command and at least the completed missing/changed/extra result in the first 390 × 844 viewport. Reduce or remove the second hero, or place a compact completed result directly under the banner. Replace the fake `.ai` and `.mov` files with small valid sample assets (or use honest text-file extensions), and register/test the “realistic files” claim. Add a browser assertion that `#demo-recording` and a mismatch path intersect the viewport immediately after the one-click entry.

### F-2-2 — BLOCKING — Earlier H4 remains in the generated product output

**Quote/location:** A new `handoff demo` workspace generated `manifest.html` with “SIGNED // RECEIPT,” “File handoff manifest,” “This receipt describes the sender's folder,” “Manifest,” and “Inventory.” The landing page and README call this a “signed file list.” The source is the HTML template in `src/lib.rs`.

**Why this fails first use:** The recipient-facing report still presents four names for one artifact. A recipient cannot confidently tell whether the receipt, manifest, inventory, and signed file list are separate objects. Review 1 required one user-facing term; the implementation only standardized the website copy, so H4 is not fully fixed and is blocking again under the history rule.

**Concrete fix:** Use “signed file list” throughout the generated HTML. Suggested replacements: “SIGNED FILE LIST,” “Folder handoff signed file list,” “This signed file list describes the sender’s folder,” “Signed file list ID,” and “Files.” Keep `manifest.json` only when naming the literal file or technical format. Add a test that rejects the old user-facing terms in generated HTML.

### F-2-3 — MEDIUM — Back navigation loses the visitor’s scroll position

**Quote/location:** On the live mobile page, the review scrolled to `#how` at y=1277, opened Privacy, then used Back. Focus correctly moved to “Verify every file in a folder handoff,” but scroll returned to y=0 instead of y=1277. `site/src/main.ts` calls `heading?.focus()` on `pageshow` without `preventScroll`.

**Why this matters:** A visitor who checks Privacy mid-page loses their place when returning. This misses the site-structure requirement that back/forward restore both scroll and focus.

**Concrete fix:** Preserve the browser’s restored scroll while moving focus, for example with `heading.focus({ preventScroll: true })`. Add a browser test that records a non-zero scroll position before navigation and checks it after Back, as well as checking focus.

### F-2-4 — MEDIUM — The privacy page makes an unlisted, undefined log-retention claim

**Quote/location:** `/privacy/`: “The host may process short-lived request and security logs needed to serve the site.” No `.factory/claims.json` entry covers hosting-log retention.

**Why this can mislead:** “Short-lived” sounds like a privacy assurance but gives no duration or verifiable source. A visitor cannot determine how long identifying request data may remain.

**Concrete fix:** State the actual retention period and link the controlling host policy, then add a claim entry backed by deploy/provider evidence. If the period cannot be verified, remove “short-lived” and say that hosting-provider log retention is outside this product’s control.

### F-2-5 — MINOR — The home title abbreviates the product name

**Quote/location:** Root `<title>` and `og:title`: “Handoff — verify every file in a folder.” The brief and footer name the product “Remote File Handoff Manifest.”

**Why this matters:** The required pattern is “Product name — what it does.” A generic “Handoff” is not the registered product name and is weak in a browser tab or shared result.

**Concrete fix:** Use “Remote File Handoff Manifest — verify every file” (48 characters) for the root title and matching social title.

### F-2-6 — MINOR — Landing copy uses unexplained build jargon

**Quote/location:** Landing install section: “Build one Rust binary.”

**Why this slows a first read:** “Binary” describes an implementation artifact, not the visitor’s result.

**Concrete rewrite:** “Install one command-line tool.”

### F-2-7 — MINOR — README switches from “command-line tool” to “CLI”

**Quote/location:** README: “The CLI demo uses the files in `examples/client-handoff/`.”

**Why this matters:** The declared terminology table chooses “command-line tool,” and a cold reader should not have to map a second abbreviation to it.

**Concrete rewrite:** “The command-line demo uses the files in `examples/client-handoff/`.”

### F-2-8 — MINOR — README describes an implementation artifact instead of the install result

**Quote/location:** README Install: “Build the single command-line binary:”

**Why this slows a first read:** “Binary” is unnecessary jargon, and “build” does not name the user’s outcome.

**Concrete rewrite:** “Install the command-line tool from source:”

### F-2-9 — MINOR — README uses “machine-readable” instead of naming the result

**Quote/location:** README: “Add `--json` before a subcommand for machine-readable output.”

**Why this slows a first read:** “Machine-readable” and “subcommand” require interpretation even though the concrete result is JSON for scripts.

**Concrete rewrite:** “Add `--json` before a command to print JSON for scripts.”

### F-2-10 — MINOR — README leaves exit-code users to interpret “operational”

**Quote/location:** README: “Operational failures exit `1`.”

**Why this matters:** “Operational” does not tell a script author what class of failure occurred.

**Concrete rewrite:** “File and system errors exit `1`.” Verify that this wording matches every error mapped to code 1.

### F-2-11 — MINOR — The terms page contains an unlisted future-process claim

**Quote/location:** `/terms/`: “Material changes appear here with a new effective date.” No claim entry or release check covers this promise.

**Why this can mislead:** It promises future publication behavior that the current sandbox cannot prove.

**Concrete fix:** Remove the sentence, or add a release check that requires the effective date to change whenever the terms content changes.

## Copy audit

Counts treat a hyphenated term as one word. Commands are excluded. Headings, labels, and actions are included because their meaning and result naming are part of this review. Technical names such as SHA-256, Ed25519, JSON, and UTF-8 are retained where they identify an actual format or algorithm. No sentence exceeds 22 words, no banned marketing adjective appears, and the average is below 14 words. The flagged rows map to findings above.

### Landing page: static visible copy

| # | Exact copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Skip to main content | 4 | — |
| 2 | HANDOFF_ | 1 | — |
| 3 | Demo | 1 | — |
| 4 | How it works | 3 | — |
| 5 | Privacy | 1 | — |
| 6 | FOLDER HANDOFF CHECK | 3 | — |
| 7 | Verify every file in a folder handoff. | 7 | — |
| 8 | For freelancers and small teams sending private folders, show recipients exactly what is missing or changed. | 16 | — |
| 9 | Try it with sample data | 5 | — |
| 10 | Opens a failed handoff with realistic files and exact mismatch paths. | 11 | — |
| 11 | Free under the MIT License | 5 | — |
| 12 | Selected files stay in your browser | 6 | — |
| 13 | Reopens offline after the first visit | 6 | — |
| 14 | Pixel-art diagram of a signed file list moving between two computers | 11 | — |
| 15 | Sender: signed file list | 4 | — |
| 16 | Recipient: checked folder | 3 | — |
| 17 | TEST // 10,000 FILES | 3 | — |
| 18 | Changing one file in the fixture reports only that path. | 10 | — |
| 19 | This checks file contents. | 4 | — |
| 20 | It does not guarantee delivery. | 5 | — |
| 21 | 01 / SEND AND CHECK | 4 | — |
| 22 | How to verify a folder handoff | 6 | — |
| 23 | Sign the file list | 4 | — |
| 24 | The sender records each path, size, and SHA-256 hash. | 9 | — |
| 25 | Their Ed25519 key signs the ordered list. | 7 | — |
| 26 | Send the folder | 3 | — |
| 27 | Send the folder and signed file list with your usual transfer tool. | 12 | — |
| 28 | Verify the received folder | 4 | — |
| 29 | The recipient sees the exact missing, changed, and extra paths. | 10 | — |
| 30 | 02 / INSTALL | 2 | — |
| 31 | Install the command-line tool | 4 | — |
| 32 | Build one Rust binary. | 4 | F-2-6: jargon |
| 33 | Use JSON output in scripts. | 5 | — |
| 34 | ~/handoff | 1 | — |
| 35 | Copy install command | 3 | — |
| 36 | SHA-256 hash for each file | 5 | — |
| 37 | Ed25519 signature | 2 | — |
| 38 | Encrypt signed file lists | 4 | — |
| 39 | JSON output for scripts | 4 | — |
| 40 | 03 / CHECK | 2 | — |
| 41 | Verify the received folder | 4 | — |
| 42 | Choose the signed file list, received folder, and sender’s verified public key. | 12 | — |
| 43 | Selected files stay in this tab. | 6 | — |
| 44 | Signed file list | 3 | — |
| 45 | Choose manifest.json. | 3 | — |
| 46 | Use the command-line tool for encrypted lists. | 7 | — |
| 47 | Received folder | 2 | — |
| 48 | Choose the received folder. | 4 | — |
| 49 | Use the command-line tool for an empty folder. | 8 | — |
| 50 | Sender’s verified public key | 4 | — |
| 51 | Choose the sender’s .pub file after confirming its fingerprint. | 9 | — |
| 52 | Verify selected files | 3 | — |
| 53 | View sample result | 3 | — |
| 54 | You are offline. | 3 | — |
| 55 | Local verification remains available. | 4 | — |
| 56 | READY ON THIS DEVICE | 4 | — |
| 57 | Choose three items to verify | 5 | — |
| 58 | Missing, changed, and extra paths will appear here. | 8 | — |
| 59 | 04 / PROTECT NAMES | 3 | — |
| 60 | Protect filenames in signed file lists | 6 | — |
| 61 | Set RFHM_PASSPHRASE and add --encrypt. | 6 | — |
| 62 | The tool encrypts the JSON and HTML outputs; source files do not change. | 13 | — |
| 63 | Read the security notes on GitHub (external) | 7 | — |
| 64 | Remote File Handoff Manifest | 4 | — |
| 65 | Check a received folder against a sender’s signed file list. | 10 | — |
| 66 | Privacy | 1 | — |
| 67 | Terms | 1 | — |
| 68 | Source on GitHub (external) | 4 | — |
| 69 | Built by Param Factory (external) | 5 | — |
| 70 | Version 0.1.0 · build 6173552-p1 | 6 | — |

### Landing page: interactive and error copy

| # | Exact copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Copied to clipboard | 3 | — |
| 2 | Clipboard access failed. | 3 | — |
| 3 | Select the command above. | 4 | — |
| 4 | Choose three items | 3 | — |
| 5 | Choose all three items | 4 | — |
| 6 | Choose the signed file list, received folder, and verified sender key. | 11 | — |
| 7 | Checking on this device | 4 | — |
| 8 | Checking every file… | 3 | — |
| 9 | Keep this tab open while the browser reads your selected files. | 11 | — |
| 10 | Verified — signature valid | 3 | — |
| 11 | Selected files match | 3 | — |
| 12 | 1 file matches the signed file list byte for byte. | 10 | — |
| 13 | N files match the signed file list byte for byte. | 10 | — |
| 14 | Differences found | 2 | — |
| 15 | The signed file list expired or files differ | 8 | — |
| 16 | N differences found | 3 | — |
| 17 | Review the exact paths before accepting this handoff. | 8 | — |
| 18 | Verification stopped | 2 | — |
| 19 | Could not verify this handoff | 5 | — |
| 20 | The browser stopped unexpectedly. | 4 | — |
| 21 | Run the command-line verifier instead. | 5 | — |
| 22 | This file is not valid JSON. | 6 | — |
| 23 | Choose the plain manifest.json file. | 6 | — |
| 24 | This is not a Handoff signed file list. | 8 | — |
| 25 | Ask the sender to create it again. | 7 | — |
| 26 | This signed file list version is not supported. | 8 | — |
| 27 | Use the current command-line tool. | 5 | — |
| 28 | This signed file list is incomplete. | 6 | — |
| 29 | This signed file list contains an unsafe path. | 8 | — |
| 30 | Do not use it; ask the sender to create it again. | 11 | — |
| 31 | The paths are duplicated or unsorted. | 6 | — |
| 32 | Ask the sender to create the signed file list again. | 10 | — |
| 33 | The file entry for PATH is invalid. | 7 | — |
| 34 | The byte total is wrong. | 5 | — |
| 35 | The sender public key is invalid. | 6 | — |
| 36 | Choose the sender’s .pub file again. | 7 | — |
| 37 | The signer does not match this public key. | 8 | — |
| 38 | Stop and confirm the key with the sender. | 8 | — |
| 39 | This browser cannot verify Ed25519 signatures. | 6 | — |
| 40 | The signature is invalid. | 4 | — |
| 41 | Do not accept this handoff. | 5 | — |
| 42 | The signed file list contains invalid cryptographic data. | 8 | — |

### README

| # | Exact copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Verify every file in a folder handoff | 7 | — |
| 2 | `handoff` creates a signed file list for a folder. | 9 | — |
| 3 | It records each relative path, byte size, and SHA-256 hash. | 10 | — |
| 4 | It also creates a readable HTML report. | 7 | — |
| 5 | Recipients see exact missing, changed, and extra paths. | 8 | — |
| 6 | The tool is for freelancers and small teams sending private folders. | 11 | — |
| 7 | It checks contents but does not guarantee delivery. | 8 | — |
| 8 | Try the isolated sample at the web demo, or run: | 10 | — |
| 9 | The CLI demo uses the files in `examples/client-handoff/`. | 9 | F-2-7: inconsistent term |
| 10 | It creates a separate temporary workspace and prints its path. | 10 | — |
| 11 | Install | 1 | — |
| 12 | Build the single command-line binary: | 5 | F-2-8: jargon |
| 13 | Create and verify a signed file list | 7 | — |
| 14 | Create a sender key: | 4 | — |
| 15 | Keep `sender.key` private. | 4 | — |
| 16 | Confirm the displayed public-key fingerprint with the recipient through a separate trusted channel. | 13 | — |
| 17 | Create signed JSON and HTML outputs: | 6 | — |
| 18 | Create a portable directory with the files and signed outputs: | 10 | — |
| 19 | Send that directory with your usual transfer tool. | 8 | — |
| 20 | On the recipient’s machine, check the received `files/` folder: | 10 | — |
| 21 | Add `--json` before a subcommand for machine-readable output. | 8 | F-2-9: jargon |
| 22 | Clean checks exit `0`. | 4 | — |
| 23 | File differences exit `3`. | 4 | — |
| 24 | Signature or decryption failures exit `4`. | 6 | — |
| 25 | Operational failures exit `1`. | 4 | F-2-10: jargon |
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

Landing static average: 5.17 words. Landing interactive/error average: 6.05 words. README average: 7.42 words. Hard-cap and banned-word checks pass.

## Demo and sandbox evidence

| Check | Result | Evidence |
| --- | --- | --- |
| One-click entry | PASS | Root action opened `/?demo=1`, then `/demo/`. |
| Immediate product view | **BLOCKING FAIL** | At 390 × 844, command top y=925 and result top y=1298. See F-2-1. |
| Realistic sample | **BLOCKING FAIL** | The paths are plausible, but the `.ai` and `.mov` files are 58-byte and 62-byte plain-text stubs. See F-2-1. |
| Persistent banner | PASS | “Demo — sample data, nothing is saved,” Reset demo, and Start for real are present; the sticky banner remains visible while scrolling. |
| Reset | PASS | Reset returns the demo to “Checking three sample files…” and completes the same three-path result. |
| Browser isolation | PASS | A seeded `real:review2-marker` survived entry, reset, and exit unchanged; localStorage gained no demo key and IndexedDB remained empty. All requests were same-origin. |
| Leave demo | PASS | Start for real returned to `/`; no demo banner or sample state remained. |
| Offline | PASS | A fresh service-worker-controlled context reloaded `/demo/` offline with HTTP 200 and completed the same result. |
| CLI isolation | PASS | The binary ran from `/tmp/rfhm-cli-review2-znJz8H`, left `real-marker.txt` unchanged, and wrote only under `/tmp/rfhm-cli-tmp-review2-3DUcDb/handoff-demo-3769-0`. It printed that path and all three mismatches. |
| Real browser verification | PASS | The live verifier checked a CLI-signed three-file folder. No request occurred after file selection; localStorage/IndexedDB were unchanged, and Cache Storage contained only public same-origin site assets. |

## Claims audit

The clean clone was `/tmp/rfhm-review2-claims-Pr7hbT/repo` at `7d48dec9487176f56b6d99ee6ad382b9db24f638`. `npm ci` completed with zero audit vulnerabilities. Every command in `.factory/claims.json` was run separately; every tagged test appears exactly once.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `signed-list-roundtrip` | PASS | JSON/HTML created; exact missing, changed, and extra paths; tamper rejection; empty folder. |
| `exact-differences-10000` | PASS | One changed path among 10,000; no missing, extra, or unchanged path reported. |
| `browser-local-private` | PASS | Real signed file verified; zero verification requests; marker retained; IndexedDB empty. |
| `isolated-demo` | PASS | CLI temp workspace and three paths; browser entry/reset; real marker retained. |
| `offline-reload` | PASS | Service-worker-controlled demo reloaded and completed offline. |
| `encrypted-outputs` | PASS | Both age files hid the name, decrypted, and left source bytes unchanged. |
| `json-script-output` | PASS | Key generation and creation emitted parseable documented JSON fields. |
| `package-copy` | PASS | Separate package verified and source bytes remained unchanged. |
| `exit-codes` | PASS | Observable cases returned 0, 1, 2, 3, and 4. |
| `manifest-format` | PASS | Version, fields, ordering, slash paths, signature mutation, and traversal rejection checked. |
| `free-mit` | PASS | MIT text, source link, free fact, and no sign-in gate checked. |

No listed claim test failed. Most landing and README claims map to these entries. The landing claim “realistic files” is unlisted and fails inspection in F-2-1. Two claim-like sentences on other live routes are also unlisted: F-2-4 and F-2-11.

## Earlier-finding verification

Every review-1 finding was checked against the deployed UI and current code. “Resolved” below means the behavior itself was observed or its claim test passed; it does not rely on `.factory/polish-1.md` alone.

| Earlier ID | Status in round 2 | Independent evidence |
| --- | --- | --- |
| B1 | **NOT FULLY RESOLVED — F-2-1** | Entry, banner, Reset, CLI demo, and isolation work; mobile first post-click screen still hides the running product. |
| B2 | Resolved | Registry has 11 unique entries and 11 unique tags; every listed command passed in the clean clone. |
| B3 | Resolved | Unknown live path returned 404 with the designed page; `/demo`, `/privacy`, and `/terms` deep links loaded. |
| B4 | Resolved | Both cold viewports name the job, audience, first action, next result, and three facts. |
| H1 | Resolved | Every route has a unique title, description, canonical, OG/Twitter data, favicon, touch icon, one h1, and one main. |
| H2 | Resolved as originally written | Route h1 focus, live announcement, 44 px targets, and axe checks pass. Back-scroll is a new failure, F-2-3. |
| H3 | Resolved | Shared header/footer links, one-liner, factory attribution, and build ID appear on all five page types. |
| H4 | **NOT FULLY RESOLVED — F-2-2** | Website terminology improved, but the generated HTML still rotates through receipt, manifest, inventory, and signed file list. |
| M1 | Resolved | Actions now name their outcomes: Try, Verify, View, Copy, Reset, Run, and Return. |
| M2 | Resolved | Live real verification rendered “3 files match”; the claim test asserts “1 file matches.” |
| M3 | Resolved | The live strip labels the number as `TEST // 10,000 FILES`; the 10,000-file claim passed. |
| UC00 | Resolved | Arrival proof was removed; content checking and the delivery limitation are explicit. |
| UC01 | Resolved | `signed-list-roundtrip` covers creation. |
| UC02 | Resolved | Path/size/hash coverage is tested; named transport compatibility was removed. |
| UC03 | Resolved | `free-mit` and `browser-local-private` check the absence of an account gate. |
| UC04 | Resolved | `browser-local-private` intercepts verification requests. |
| UC05 | Resolved | Runtime requests stayed same-origin; source/test checks cover tracking. |
| UC06 | Resolved | `exact-differences-10000` asserts 10,000 checked files. |
| UC07 | Resolved | The same test asserts exactly `item-04217.txt` changed. |
| UC08 | Resolved | The same test asserts empty missing and unexpected arrays. |
| UC08a | Resolved | Delivery non-guarantee remains explicit; signing and tamper behavior are tested. |
| UC09 | Resolved | `signed-list-roundtrip` and `manifest-format` cover hashes, order, and signature. |
| UC10 | Resolved | Copy now says “usual transfer tool”; `package-copy` verifies the portable directory. |
| UC11 | Resolved | Exact missing/changed/extra output and browser network isolation are tested. |
| UC12 | Resolved | MIT, JSON output, and privacy are split across registered tests; the version claim was removed. |
| UC13 | Resolved | Exact SHA-256 output is asserted. |
| UC14 | Resolved | Valid signature and modified payload cases are asserted. |
| UC15 | Resolved | Both encrypted outputs, hidden filenames, decrypt, and unchanged source are asserted. |
| UC16 | Resolved | Key and create JSON output is parsed and checked. |
| UC16a | Resolved | A real CLI-signed file was verified in the browser locally and live. |
| UC17 | Resolved | Verification requests and browser storage were inspected locally and live. |
| UC18 | Resolved | Browser rejection and CLI decryption of encrypted output are tested. |
| UC19 | Resolved | Empty-folder creation and verification are tested. |
| UC20 | Resolved | Local and live demo reloads completed offline. |
| UC21 | Resolved | Demo displays and tests all three mismatch categories. |
| UC22 | Resolved | Encryption headers, filename hiding, decrypt, and source bytes are tested. |
| UC22a | Resolved | Subjective “clearer” text was removed; source and license evidence pass. |
| UC23 | Resolved | “Transport-independent evidence” was replaced by the tested signed-list description. |
| UC24 | Resolved | README was split; fields, HTML, and difference categories are tested. |
| UC25 | Resolved | Browser network interception and Rust network-code inspection pass; the delivery limitation remains. |
| UC26 | Resolved | The public minimum-Rust claim was removed. |
| UC26a | Resolved | Copy now says “Create a sender key.” |
| UC27 | Resolved | JSON and HTML creation is asserted. |
| UC27a | Resolved | Package contents and source preservation are asserted. |
| UC27b | Resolved | The copied destination verifies independently. |
| UC28 | Resolved | Universal “any tool” wording was removed. |
| UC29 | Resolved | Every documented exit status is exercised. |
| UC30 | Resolved | Environment passphrase and both encrypted files are exercised. |
| UC30a | Resolved | Plain-list path visibility is exercised. |
| UC31 | Resolved | “Privacy-safe” was removed; hidden filenames are asserted. |
| UC32 | Resolved | Source and packaged file bytes are compared. |
| UC33 | Resolved | Format version/schema/order/signature/path safety are registered and tested. |
| UC34 | Resolved | Real browser verification has request and storage interception. |
| UC35 | Resolved | Full `npm test` passed with all documented test groups. |
| UC36 | Resolved | The visitor-facing version claim is gone; Playwright remains pinned at 1.58.2. |
| UC37 | Resolved | Account/tracking/storage/runtime checks are registered. |
| UC38 | Resolved | Correct key, modified payload, and delivery limitation are covered. |
| UC39 | Resolved | Built and deployed HTML/assets match by SHA-256. |
| UC40 | Resolved | Built policy and live CSP, HSTS, referrer, permissions, nosniff, cache, and 404 behavior were checked. |

## Structure, accessibility, and visual review

| Check | Result |
| --- | --- |
| Route status and deep links | Pass: `/`, `/demo/`, `/privacy/`, `/terms/` return 200; unknown paths return the styled 404 body with status 404. Slashless legal/demo routes also load. |
| Titles | Four route titles are correctly distinct; root fails the full product-name pattern in F-2-5. |
| Metadata/assets | Pass: descriptions under 155 characters, canonical links, OG/Twitter cards, 1200 × 630 social image, SVG favicon, 180 × 180 touch icon, and matching theme color. |
| Semantics | Pass: `lang=en`, one h1, one main, ordered headings, landmarks, alt text, and labelled controls. |
| Header/footer | Pass: consistent wordmark/navigation/footer, Privacy, Terms, source, factory attribution, version, and build ID. |
| Back/focus | Partial: h1 focus and polite announcement pass; scroll restoration fails in F-2-3. |
| Links | Pass: 13 unique live destinations/anchors were crawled; every intended route and external destination returned 200. The deliberately missing route returned 404. |
| Keyboard/touch | Pass: no keyboard trap observed, visible cyan focus treatment, and no visible target below 44 × 44 at 390 px. |
| Axe | Pass: zero WCAG 2 A/AA violations on home, demo, Privacy, Terms, and the 404 at 390 px; no serious/critical findings at desktop. |
| Text resize/reflow | Pass at a 390 px effective width under 200% zoom; no horizontal page overflow. |
| Reduced motion | Pass: the media query removes transitions/animation, and demo results render immediately. |
| Console/load | Pass on real routes; no errors. `/opt/fleet/lib/verify-url.sh` passed the root. |
| First-load budget | Pass: production JS is 9.60 kB raw / 3.84 kB gzip; CSS is 15.11 kB raw / 4.01 kB gzip; hero is 27.4 kB. |
| Security/cache | Pass: self-only CSP, HSTS, referrer and permissions policies, nosniff, immutable hashed assets, and no-store service worker. |
| Visual identity | Pass: the checksum-relay pixel/demoscene palette, grid, hard edges, terminal typography, original art, and styled 404 are product-specific rather than a generic SaaS template. |

The clean production build matches the deployed root, demo, Privacy, Terms, JS, CSS, and public assets byte for byte. The live 404 body also matches `dist/site/404.html`.

## Missed leverage

No missing AI feature is justified. Cryptographic hashing and signature verification must remain deterministic, local, and auditable; model output would not improve the core job. Export is already present as signed JSON and readable HTML, packaging is implemented, and transport/sync is intentionally left to the user’s existing tool. No AI feature, provider key, Azure endpoint, or decorative AI copy is present.

## Verification commands and results

- Every `.factory/claims.json` command: PASS from the clean clone.
- `npm test`: PASS (Rust unit/integration/doc tests, TypeScript tests, 11 claim tests, and 5 browser tests).
- `npm run build`: PASS; `dist/site` produced.
- `cargo fmt --check`: PASS.
- `cargo clippy --all-targets -- -D warnings`: PASS; Cargo emitted only an upstream future-incompatibility advisory.
- `/opt/fleet/lib/verify-url.sh <live-root> <temp-evidence-dir>`: PASS.
- Live Playwright checks: cold mobile/desktop, demo/reset/exit, offline reload, real-file privacy interception, routes, metadata, axe, targets, links, and back/focus behavior completed.

## What would make this perfect

Close all eleven findings. The acceptance-critical work is to expose the sample command/result in the first mobile demo viewport, ship honest sample file types, and standardize the generated HTML on “signed file list.” Then preserve scroll on Back, replace the four flagged jargon/inconsistency phrases, use the full product name in the root title, and remove or make testable the two policy claims. Re-run this entire review from a fresh context and clean clone; PASS requires zero remaining findings.
