# Adversarial first-read review 1

**Product:** Remote File Handoff Manifest

**Live URL:** https://remote-file-handoff-manifest.sociobot.in

**Reviewed:** 2026-08-28 UTC

**Revision reviewed:** `617355265602c975146387b06165206916218144`

**Verdict:** **FAIL**

The site has a distinct visual identity and the implemented verifier works, but four blocking failures prevent acceptance: the first screen does not name its audience or establish one first action, no compliant demo exists, the claims registry is absent, and unknown routes are served as the homepage with HTTP 200.

## First-screen cold read

Fresh Playwright 1.58.2 contexts were opened at 390 × 844 and 1440 × 900 before scrolling.

| Question | Cold answer | Result |
| --- | --- | --- |
| What does this do? | It creates a signed inventory of a folder so another person can check whether every file arrived unchanged. | Clear on both sizes. |
| For whom? | The screen only says “you” and “your recipient.” It does not identify freelancers, small teams, or the private-folder handoff situation. | **BLOCKING** |
| What should I click first? | “Build a receipt” looks primary, but “Verify a handoff” is adjacent and the visitor's role is not established. “Build a receipt” only scrolls to installation commands; it does not build anything or explain what happens next. | **BLOCKING** |

Exact copy that failed: “Create a signed inventory before you send. Your recipient checks every filename, byte count, and SHA-256 hash after it lands—over any NAS, SFTP, drive, or peer-to-peer link.” This explains mechanics but not the intended user. The actions are “Build a receipt” and “Verify a handoff”; neither is the required sample-data entry.

Concrete replacement:

> **Verify every file in a folder handoff.**
>
> For freelancers and small teams sending private folders, show recipients exactly what is missing or changed.
>
> **Try it with sample data** — opens a failed handoff with realistic files and exact mismatch paths.
>
> Free and open source · Files stay on your device · Works offline after the first visit

The last two facts must only ship after corresponding claim tests are registered.

## Findings, ordered by severity

### B1 — BLOCKING — There is no compliant web or CLI demo

**Quote/evidence:** The first screen offers “Build a receipt” and “Verify a handoff,” not “Try it with sample data.” `/demo` and `/?demo=1` both render the normal homepage. Neither has “Demo — sample data, nothing is saved,” “Reset demo,” or “Start for real.” `handoff demo` exits 2 with `error: unrecognized subcommand 'demo'`. The repository has no `examples/` directory and no `.factory/demo.md`. The landing page has no recording of the real CLI.

“Preview a mismatch” is below the fold. It changes one result panel to two hard-coded paths, but it does not load a usable sample handoff, provide a demo URL, expose reset/start controls, or run the CLI on shipped sample input.

**Why this loses or misleads a visitor:** A phone visitor cannot try the job within one click and cannot verify that the CLI produces the result shown. The static mismatch is labelled as a preview, not an isolated demo.

**Concrete fix:** Add a first-screen “Try it with sample data” link to `/demo`. Make that route show a self-hosted recording of the real binary operating on a shipped, realistic folder. Add `handoff demo`, bundled files under `examples/`, a temporary output directory printed by the command, the persistent demo banner, working reset/start controls, and `.factory/demo.md`. Test that demo runs never read or write normal user storage.

### B2 — BLOCKING — `.factory/claims.json` and claim-tagged tests are absent

**Quote/evidence:** Reading `.factory/claims.json` returns “No such file or directory”; `rg -n '@claim:' .` finds no tagged tests. There were therefore zero listed commands to run from the required registry. The clean-clone `npm test` suite passes, including a 10,000-file regression, but those tests are not connected to public claims by stable claim IDs.

**Why this loses or misleads a visitor:** The page asks visitors to rely on privacy, offline, cryptographic, format, compatibility, and quantitative statements without the required auditable map from each statement to an observable test.

**Concrete fix:** Add `.factory/claims.json`; add exactly one `@claim:<id>` test for each claim below; include every place the claim appears; remove any statement that cannot be tested. Run each listed command from a clean clone.

Each row below is an individual unlisted-claim finding:

| ID | Location and exact claim-like copy | Required registry/test fix |
| --- | --- | --- |
| UC00 | Landing: “Prove the whole folder arrived.” | Register complete, missing, changed, and extra-file cases; keep “arrived” qualified because the tool does not prove transport completion. |
| UC01 | Landing: “Create a signed inventory before you send.” | `signed-inventory-create`: run `handoff create`; inspect signed output. |
| UC02 | Landing: “Your recipient checks every filename, byte count, and SHA-256 hash after it lands—over any NAS, SFTP, drive, or peer-to-peer link.” | Register field coverage and changed/missing-file verification; narrow the transport list to what a fixture can prove. |
| UC03 | Landing: “No account” | `no-account`: complete demo without authentication. |
| UC04 | Landing: “No upload” | `no-upload`: intercept the full browser flow and assert no upload request. |
| UC05 | Landing: “No tracking” | `no-tracking`: assert no analytics or third-party requests. |
| UC06 | Landing: “10,000 files checked” | Register the 10,000-file fixture and assert the count. |
| UC07 | Landing: “1 altered file found” | In that fixture, alter one file and assert its exact path. |
| UC08 | Landing: “0 false reports” | Assert no unchanged path is reported. |
| UC08a | Landing: “This is evidence of contents, not a promise from the transport.” | Register what signature and comparison prove; retain the transport limitation. |
| UC09 | Landing: “The sender hashes every file and signs the ordered list with an Ed25519 identity.” | Register manifest ordering, per-file hash, and signature verification. |
| UC10 | Landing: “Copy the files and receipt through your existing NAS, SFTP client, drive, or private link.” | Replace with “Use your existing transfer tool”; do not imply tested interoperability with named transports. |
| UC11 | Landing: “The recipient sees exact missing, altered, and unexpected paths—without uploading anything.” | Register three discrepancy cases plus network interception. |
| UC12 | Landing: “Rust 1.85+ · MIT licensed · JSON output for scripts · no telemetry” | Split and register version build, license presence, JSON parse, and no-network tests. |
| UC13 | Landing: “SHA-256 per file” | Assert every manifest file entry has the correct SHA-256. |
| UC14 | Landing: “Ed25519 signed” | Assert a valid signature passes and a modified payload fails. |
| UC15 | Landing: “Optional encryption” | Assert encrypted JSON and HTML outputs cannot expose filenames and decrypt correctly. |
| UC16 | Landing: “Scriptable output” | Parse `--json` output and assert its documented schema. |
| UC16a | Landing: “Check a handoff in this browser.” | Complete an actual signed browser verification. |
| UC17 | Landing: “Hashing happens on this device; nothing leaves the tab.” | Intercept all requests while verifying real sample files. |
| UC18 | Landing: “Encrypted receipts require the CLI.” | Assert browser rejection/help and successful CLI verification of the same encrypted receipt. |
| UC19 | Landing: “Empty folders must be checked with the CLI.” | Register an empty-folder CLI fixture. |
| UC20 | Landing: “You’re offline. Verification still works locally.” | Register first-load, offline reload, and real sample verification while offline. |
| UC21 | Landing: “Your exact missing, changed, and extra paths will appear here.” | Assert the three path categories, not only that the panel exists. |
| UC22 | Landing: “Both JSON and HTML receipts are encrypted with the age file format; your files remain where they are.” | Assert both outputs are age-encrypted and source file bytes remain unchanged. |
| UC22a | Landing: “Open source infrastructure for clearer handoffs.” | Point “open source” to the license/source; replace the subjective “clearer” claim. |
| UC23 | README: “`handoff` creates transport-independent evidence for a folder delivery.” | Use the create/package/verify round trip; replace “transport-independent evidence” with a narrower tested phrase. |
| UC24 | README: “It records every relative path, byte size, and SHA-256 hash in a signed manifest, produces a readable HTML receipt, and tells a recipient exactly which files are missing, altered, or unexpected.” | Register manifest fields, HTML receipt, and all discrepancy categories. |
| UC25 | README: “It does not upload files or guarantee delivery.” | Assert no network calls; keep the explicit non-guarantee. |
| UC26 | README: “Build the single binary with Rust 1.85 or newer.” | Build under the minimum supported Rust version. |
| UC26a | README: “Create a signing identity once.” | Run key generation twice only if rotation/reuse semantics are documented; otherwise say “Create a sender key.” |
| UC27 | README: “Build signed JSON and HTML receipts for a folder:” | Assert both outputs exist and signatures verify. |
| UC27a | README: “Copy the files and receipts into a portable package.” | Run `handoff package`; assert files and receipts exist without source mutation. |
| UC27b | README: “At the destination, verify the received `files/` directory:” | Verify the packaged directory in a separate temporary destination. |
| UC28 | README: “The output can be transferred by any ordinary tool:” | Replace “any” with a non-universal statement, or define and test supported transfer behavior. |
| UC29 | README: “A clean verification exits `0`; discrepancies exit `3`; an invalid signature or decryption failure exits `4`; operational errors exit `1`; invalid CLI usage exits `2`.” | Register a case for every exit status. |
| UC30 | README: “Encrypt both receipts with a passphrase supplied through the environment (never a command-line argument):” | Assert both outputs and verify the passphrase is absent from argv. |
| UC30a | README: “Plain manifests reveal filenames.” | Inspect a plain manifest fixture and assert its paths are readable. |
| UC31 | README: “The encrypted HTML file is a privacy-safe cover sheet; use the CLI to decrypt and verify.” | Replace “privacy-safe” with the observable contents, then assert no filenames/content appear. |
| UC32 | README: “Files themselves are not encrypted.” | Assert source and packaged file bytes remain plain and unchanged. |
| UC33 | README manifest-format paragraph: version, compact payload signing, path ordering, `/` separators, fields, and unsafe-path rejection. | Split into claim entries for version/schema, signature bytes, ordering/separators, and traversal rejection. |
| UC34 | README: “The browser verifier hashes selected local files in place; files are never uploaded or stored.” | Intercept requests and inspect localStorage/IndexedDB/cache after a real verification. |
| UC35 | README: “`npm test` also builds the production site and runs Chromium coverage for the 390 px mobile accessibility gate, service-worker registration, offline reload, and deployment response policy.” | Split the sentence and register the observable gates or describe it only as test-suite scope. |
| UC36 | README: “The browser version is pinned in `package.json`.” | Assert the exact Playwright version has no range. |
| UC37 | README: “There is no telemetry, account, hosted storage, runtime CDN, or external request.” | Register authentication absence, storage inspection, and network interception separately. |
| UC38 | README: “Signing proves that the manifest came from the holder of the key and has not changed; it does not prove that a transport completed.” | Register valid/wrong-key and modified-manifest cases; keep the limitation. |
| UC39 | README: “The factory deploys the static output in `dist/site` to `https://remote-file-handoff-manifest.sociobot.in`.” | Compare live asset hashes with a clean production build, or move this operational statement out of product claims. |
| UC40 | README: “`site/public/staticwebapp.config.json` ships with that output and defines the security headers plus immutable caching for hashed assets.” | Assert the built file exists and the live response headers/cache rules match it. |

### B3 — BLOCKING — Unknown and demo routes are soft 404s

**Quote/evidence:** `GET /definitely-missing-review-1` returns HTTP 200 and the homepage headline “Prove the whole folder arrived.” `GET /demo` does the same. There is no designed 404 route.

**Why this loses or misleads a visitor:** A mistyped or shared URL silently becomes the homepage. The address bar says the visitor is on a page that does not exist, while the content says otherwise. Crawlers also receive a false success.

**Concrete fix:** Serve a product-styled not-found page with a real 404 status and a “Return home” action. Reserve `/demo` for the actual demo. Add direct-load tests for `/demo`, `/privacy/`, `/terms/`, and an unknown path.

### B4 — BLOCKING — The first screen omits the audience and a single honest first action

**Quote/evidence:** “Create a signed inventory before you send” addresses an unspecified “you.” “Build a receipt” only scrolls to install commands, while “Verify a handoff” addresses a different role.

**Why this loses or misleads a visitor:** A recipient cannot tell whether to install the CLI or use the browser form; a sender cannot tell that the primary button merely reveals setup commands. This fails the required what/for-whom/first-action test on both viewport sizes.

**Concrete fix:** Use the replacement first-screen copy above. Make the only primary action “Try it with sample data,” describe the next screen beside it, and present sender and recipient paths after the demo.

### H1 — HIGH — Metadata is incomplete on every route

**Quote/evidence:** `/`, `/privacy/`, and `/terms/` have correct titles, descriptions, `lang="en"`, one `<h1>`, and one `<main>`. All three lack canonical, Open Graph, and Twitter metadata. All lack an apple-touch icon. Legal pages have no favicon; the homepage only has a data-URL favicon. No 1200 × 630 social image is present.

**Why this loses or misleads a visitor:** Shared links have no controlled title/image presentation, duplicate route forms lack a canonical identity, and installed mobile bookmarks lack the product icon.

**Concrete fix:** Add per-route canonical URLs, OG/Twitter title and descriptions, a product-art 1200 × 630 image, an SVG favicon, and a 180 px apple-touch icon. Test them on all routes.

### H2 — HIGH — Route focus and mobile touch targets miss the stated accessibility contract

**Quote/evidence:** After opening Privacy and returning with Back, `document.activeElement` is `<body>` on both documents, not the new `<h1>`. At 390 px, the wordmark is 24 px high, “Read the security notes” is 19 px high, and footer links are 22 px high. The same 22 px legal targets appear on Privacy and Terms.

**Why this loses a visitor:** Screen-reader users receive no deliberate route announcement, and several phone targets are about half the required 44 px height.

**Concrete fix:** Focus a `tabindex="-1"` page `<h1>` after navigation and announce it in a polite live region. Give all interactive targets a minimum 44 × 44 px hit area without changing the visual type size. Add browser assertions.

### H3 — HIGH — Header/footer structure changes by route and omits required trust links

**Quote/evidence:** The landing header has “How it works,” “Verify here,” and “Install CLI”; legal headers only have “Return home.” The landing header has no Demo or Privacy link. Footers omit “Built by Param Factory” and a version/build ID; legal footers omit Source. The product one-liner is hidden on phone.

**Why this loses a visitor:** Navigation and provenance move or disappear as the visitor checks legal information, and there is no persistent path to the missing demo.

**Concrete fix:** Use one shared header/footer on every route: wordmark, Demo, product section, Privacy, then the one-line description, Privacy, Terms, “Built by Param Factory,” and build ID. Keep the one-liner visible at 390 px.

### H4 — HIGH — Copy uses three names for the same artifact and several labels require insider knowledge

**Quote/evidence:** The same signed artifact is called “inventory,” “receipt,” and “manifest.” Headings include “TRANSPORT INDEPENDENT,” “01 / THE RELAY,” “A single binary. Open format.,” “03 / RECEIVE,” and “READY // LOCAL MODE.” Capability labels use “SHA,” “SIG,” and “AGE.”

**Why this loses a visitor:** A first-time visitor must infer whether a receipt and manifest differ, what is relayed, and whether “AGE” means expiry or encryption.

**Concrete fix:** Choose one user-facing term, preferably “signed file list,” and define “manifest” once for the file name. Use “How to verify a folder handoff,” “Install the command-line tool,” “Verify the received folder,” “Ready to verify on this device,” “SHA-256 file hashes,” “Ed25519 signature,” and “Encrypt receipt filenames.”

### M1 — MEDIUM — Several actions describe results they do not perform

**Quote/evidence:** “Build a receipt” scrolls to installation instructions; “Install CLI” also only scrolls. No receipt is built and no installation starts.

**Why this misleads a visitor:** The labels promise completed outcomes rather than the next visible step.

**Concrete fix:** Until a demo exists, rename both to “View install steps.” With the demo, use “Try it with sample data” as primary and keep “View install steps” secondary.

### M2 — MEDIUM — A successful one-file verification has a grammar error

**Quote/evidence:** The live verifier rendered “1 files match the signed receipt byte for byte.”

**Why this reduces trust:** The error appears in the exact success state where the product asks the recipient to trust a cryptographic result.

**Concrete fix:** Pluralize the noun: “1 file matches…” and “2 files match…”. Add assertions for zero, one, and multiple files.

### M3 — MEDIUM — The quantitative strip reads like unexplained product telemetry

**Quote/evidence:** “10,000 files checked · 1 altered file found · 0 false reports.”

**Why this can mislead a visitor:** Nothing says this is a controlled fixture. It can be read as live usage or an unsupported performance statistic.

**Concrete fix:** Rewrite as “Test result: in a 10,000-file fixture, changing one file reported only that path.” Link it to the registered claim test.

## Demo and sandbox observations

- There is no demo mode to enter or reset, so namespace isolation cannot pass.
- The closest sample control, “Preview a mismatch,” was exercised. It displayed `exports/final-cut.mov` as missing and `brand/logo-master.ai` as altered.
- A seeded `localStorage` value `real:review-marker=keep-me` remained unchanged after preview and real verification. No IndexedDB database was created. Reload cleared the transient preview panel.
- A real manifest/key/folder generated by the CLI was loaded into the live browser verifier. It returned “Everything arrived intact.” From file selection through completion, Playwright observed zero network requests.
- After one online load and service-worker control, an offline reload returned the homepage and showed the offline notice. This supports the implementation behavior, but the copy remains an unlisted claim.
- The CLI has no demo command; running it in a fresh temporary directory failed before producing output.

## Structure, accessibility, and link checks

| Check | Result |
| --- | --- |
| Title pattern and length | Pass on `/`, `/privacy/`, `/terms/`; lengths 49, 38, 36. |
| `lang`, one `<h1>`, `<main>`, image alt | Pass on the three real routes. |
| Meta description | Present and under 155 characters on the three real routes. |
| Canonical, OG, Twitter, favicon set | Fail; see H1. |
| Designed 404 and correct status | **Blocking fail**; see B3. |
| Deep links and Back | Direct legal links load; Back restores the landing scroll position. Focus remains on `<body>`. |
| Dead-link crawl | All same-page target IDs exist. Privacy, Terms, GitHub source, and security-notes destination returned 200. |
| Header/footer consistency | Fail; see H3. |
| Visual identity | Pass. The dark pixel/demoscene checksum-relay treatment is product-specific and not a generic gradient/card SaaS template. |
| Axe serious/critical | Zero on live `/`, `/privacy/`, and `/terms/` at 390 px. |
| Keyboard focus styling | Visible focus rule exists; command scrollers are focusable. |
| Touch targets | Fail; see H2. |
| Reduced motion | A reduced-motion override is present. |
| Console/page errors | None observed on tested routes. |
| First-load JS | 7.00 kB raw / 3.17 kB gzip in the clean build; passes the budget. |
| Security headers | Live CSP, HSTS, Referrer-Policy, Permissions-Policy, and nosniff headers are present. |

`/opt/fleet/lib/verify-url.sh` passed the homepage baseline: HTTP 200, title, `lang`, one `<h1>`, `<main>`, all image alt attributes, labelled buttons, and no console errors. Playwright axe was used for the required serious/critical check.

## Copy audit

Counts treat a whitespace-delimited token containing a letter or number as one word. Hyphenated terms count as one. Code blocks and shell commands are not sentences, so they are excluded; UI labels and headings are included because the review explicitly checks them. `>22` marks the hard cap. `J` jargon, `T` inconsistent terminology, `H` unclear out-of-context heading, `A` action does not match result, `M` unsupported marketing wording, and `C` unlisted claim.

### Landing page: static copy

| # | Exact copy | Words | Flags / proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | Skip to main content | 4 | — |
| 2 | HANDOFF_ | 1 | Product wordmark; not the page headline. |
| 3 | How it works | 3 | — |
| 4 | Verify here | 2 | — |
| 5 | Install CLI | 2 | A: “View install steps.” |
| 6 | TRANSPORT INDEPENDENT | 2 | J: “Works with any file-transfer method.” |
| 7 | Prove the whole folder arrived. | 5 | C; otherwise plain and job-focused. |
| 8 | Create a signed inventory before you send. | 7 | T/C: “Create a signed file list before you send.” |
| 9 | Your recipient checks every filename, byte count, and SHA-256 hash after it lands—over any NAS, SFTP, drive, or peer-to-peer link. | 20 | J/C and no audience. Use the first-screen replacement above. |
| 10 | Build a receipt | 3 | A/T: “View install steps,” or implement the result. |
| 11 | Verify a handoff | 3 | Result-naming verb; destination is correct. |
| 12 | No account | 2 | C |
| 13 | No upload | 2 | C |
| 14 | No tracking | 2 | C |
| 15 | Pixel-art file packet travelling securely between two computers | 8 | C/M: “Pixel-art diagram of a signed file list moving between two computers.” |
| 15a | VISUAL CHECKSUM / 0001 | 3 | J; decorative art overlay, so hide it from assistive technology or use “File check illustration.” |
| 16 | TX signed manifest RX verified folder | 6 | J/T: “Sender: signed file list · Recipient: verified folder.” |
| 17 | 10,000 files checked | 3 | C; label as a test result. |
| 18 | 1 altered file found | 4 | C; label as a test result. |
| 19 | 0 false reports | 3 | C; label as a test result. |
| 20 | This is evidence of contents, not a promise from the transport. | 11 | J: “This checks file contents. It does not guarantee delivery.” |
| 21 | 01 / THE RELAY | 3 | H/J: “How to verify a folder handoff.” |
| 22 | Three commands. | 2 | — |
| 23 | One unambiguous handoff. | 3 | M: “Create, send, then verify.” |
| 24 | Sign the inventory | 3 | T: “Sign the file list.” |
| 25 | The sender hashes every file and signs the ordered list with an Ed25519 identity. | 14 | J/T/C: “The sender hashes each file and signs the list with their key.” |
| 26 | Move it your way | 4 | H: “Send the folder.” |
| 27 | Copy the files and receipt through your existing NAS, SFTP client, drive, or private link. | 15 | T/C: “Send the folder and signed file list with your usual transfer tool.” |
| 28 | Verify what landed | 3 | — |
| 29 | The recipient sees exact missing, altered, and unexpected paths—without uploading anything. | 11 | T/C: use “missing, changed, and extra” consistently. |
| 30 | 02 / BUILD | 2 | H: “Install the command-line tool.” |
| 31 | A single binary. | 3 | J: “Install one command-line tool.” |
| 32 | Open format. | 2 | J/C: “Read receipts as JSON.” |
| 33 | Rust 1.85+ · MIT licensed · JSON output for scripts · no telemetry | 10 | J/C: split into plain, tested facts. |
| 34 | Copy install command | 3 | Result-naming verb; pass. |
| 35 | SHA SHA-256 per file | 4 | J/C: “SHA-256 hash for each file.” |
| 36 | SIG Ed25519 signed | 3 | J/C: “Signed with Ed25519.” |
| 37 | AGE Optional encryption | 3 | J/C and “AGE” looks like expiry: “Encrypt receipt filenames.” |
| 38 | JSON Scriptable output | 3 | J/C: “JSON output for scripts.” |
| 39 | 03 / RECEIVE | 2 | H: “Verify the received folder.” |
| 40 | Check a handoff in this browser. | 6 | — |
| 41 | Select the plain JSON receipt, the received folder, and the sender public key. | 13 | J/T: define “public key”; choose manifest or receipt. |
| 42 | Hashing happens on this device; nothing leaves the tab. | 9 | J/C: “Your files stay in this browser tab.” |
| 43 | Signed manifest | 2 | T: choose one artifact term. |
| 44 | Choose manifest.json. | 2 | T |
| 45 | Encrypted receipts require the CLI. | 5 | J/T/C: “Use the command-line tool for encrypted file lists.” |
| 46 | Received folder | 2 | — |
| 47 | Choose the package’s files folder. | 5 | T: folder/package/files collide. “Choose the received folder.” |
| 48 | Empty folders must be checked with the CLI. | 8 | J/C: expand CLI once. |
| 49 | Trusted sender key | 3 | J: “Sender’s verified public key.” |
| 50 | Use the .pub file received through a trusted channel. | 9 | J: explain how to verify the channel/key. |
| 51 | Verify selected files | 3 | Result-naming verb; pass. |
| 52 | Preview a mismatch | 3 | Result-naming verb, but not a compliant demo. |
| 53 | You’re offline. | 2 | — |
| 54 | Verification still works locally. | 4 | C |
| 55 | READY // LOCAL MODE | 3 | H/J: “Ready to verify on this device.” |
| 56 | Waiting for a receipt | 4 | T: choose the artifact term. |
| 57 | Your exact missing, changed, and extra paths will appear here. | 10 | C; terminology conflicts with “altered” and “unexpected.” |
| 58 | 04 / PRIVATE MODE | 3 | H/J: “Protect filenames in receipts.” |
| 59 | Filenames can be sensitive too. | 5 | — |
| 60 | Add --encrypt and provide RFHM_PASSPHRASE. | 5 | J: “Add `--encrypt` and set the `RFHM_PASSPHRASE` environment variable.” |
| 61 | Both JSON and HTML receipts are encrypted with the age file format; your files remain where they are. | 18 | J/T/C: define age and use one artifact term. |
| 62 | Read the security notes | 4 | Clear link label. |
| 63 | Remote File Handoff Manifest | 4 | — |
| 64 | Open source infrastructure for clearer handoffs. | 6 | J/M/C: “Free, open-source tool for checking folder handoffs.” |
| 65 | Privacy | 1 | — |
| 66 | Terms | 1 | — |
| 67 | Source | 1 | External destination is not disclosed; “Source on GitHub (external).” |

No static landing sentence exceeds 22 words and no banned plain-words term appears. The jargon, terminology, heading, action, marketing, and claim flags above still require changes.

### Landing page: interactive copy

| Exact copy | Words | Flags / proposed rewrite |
| --- | ---: | --- |
| Copied to clipboard | 3 | — |
| Select the command above to copy | 6 | This is shown after copy failure but does not explain why. “Clipboard access failed. Select and copy the command above.” |
| INPUT NEEDED | 2 | H: “Choose three items to verify.” |
| Choose all three inputs | 4 | “Choose all three items.” |
| Select the JSON manifest, received folder, and trusted sender key before verifying. | 11 | J/T: “Choose the signed file list, received folder, and verified sender key.” |
| HASHING // LOCAL | 2 | J: “Checking files on this device.” |
| Checking every file… | 3 | C |
| Keep this tab open. | 4 | — |
| No file content is being uploaded. | 6 | C |
| VERIFIED // SIGNATURE VALID | 3 | J/C: “Verified · sender signature is valid.” |
| Everything arrived intact | 3 | C |
| `{count} files match the signed receipt byte for byte.` | 9 | C/T; grammar fails at one file. |
| MISMATCH // REVIEW | 2 | J: “Differences found.” |
| Receipt expired or files differ | 6 | T: use the chosen artifact term. |
| `{count} difference(s) found` | 3 | — |
| Review the exact paths below before accepting this handoff. | 9 | — |
| ERROR // STOPPED | 2 | H: “Verification stopped.” |
| Could not verify this handoff | 5 | Error summary; the following exception must always state a user action. |
| An unexpected browser error occurred. | 5 | Incomplete error: add the reason if known. |
| Use the CLI for a detailed check. | 7 | J/A: “Run the command-line verifier for more detail.” |
| MISMATCH // SAMPLE | 2 | J: “Sample differences.” |
| 2 differences found | 3 | — |
| This preview shows how an incomplete delivery is reported. | 9 | — |
| No local files were read. | 5 | C |
| Matched / Missing / Altered / Unexpected / Expired | 5 | T: use “changed” and “extra” everywhere. |
| The manifest is not valid JSON. | 6 | J: “This file is not valid JSON.” |
| Choose the plain manifest.json file. | 5 | T: use the chosen artifact term. |
| This JSON file is not a Remote File Handoff Manifest receipt. | 11 | T: manifest/receipt collision. “This is not a Handoff manifest.” |
| This manifest format or version is not supported by the browser verifier. | 12 | J but specific; add “Use the current CLI to check it.” |
| The manifest inventory is incomplete or malformed. | 7 | J/T and no next step. “This manifest has a missing or invalid file list. Ask the sender to create it again.” |
| The manifest contains an unsafe or invalid relative path. | 9 | J and no next step. Add “Do not use it; ask the sender to create it again.” |
| Manifest paths are not unique and sorted. | 7 | J and no next step. Add the same sender action. |
| The inventory entry for `{path}` is malformed. | 7 | J/T and no next step. Add the same sender action. |
| The manifest byte total is inconsistent. | 6 | J and no next step. Add the same sender action. |
| The sender public key has an invalid header or encoding. | 10 | J and no next step. “Choose the sender’s `.pub` file again.” |
| The manifest signer does not match the trusted sender key. | 10 | J/T. Add “Stop and confirm the key with the sender.” |
| This browser cannot verify Ed25519 signatures. | 6 | J; the following CLI action is useful. |
| Use the handoff CLI instead. | 5 | J/A: “Run the command-line verifier instead.” |
| The manifest signature is invalid. | 5 | J/C |
| Do not trust this receipt. | 5 | T: “Do not accept this handoff.” |
| The manifest contains invalid cryptographic data. | 6 | J and no next step. Add “Ask the sender to create it again.” |

### README: every heading and prose sentence

| # | Exact copy | Words | Flags / proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | Remote File Handoff Manifest | 4 | Product name, but not a job headline. Consider “Verify every file in a folder handoff.” |
| 2 | `handoff` creates transport-independent evidence for a folder delivery. | 8 | J/C: “`handoff` creates a signed file list for any folder transfer.” |
| 3 | It records every relative path, byte size, and SHA-256 hash in a signed manifest, produces a readable HTML receipt, and tells a recipient exactly which files are missing, altered, or unexpected. | 31 | **>22**, J/T/C. Split: “It records each path, size, and SHA-256 hash in a signed file list. It also creates an HTML report. Recipients see missing, changed, and extra files.” |
| 4 | It is for freelancers and small teams handing private folders over NAS mounts, SFTP, removable media, or peer-to-peer links. | 19 | J; audience is clear. |
| 5 | It does not upload files or guarantee delivery. | 8 | C |
| 6 | Install | 1 | Clear heading. |
| 7 | Build the single binary with Rust 1.85 or newer: | 9 | J/C: “Install with Rust 1.85 or newer.” |
| 8 | Usage | 1 | Broad but understandable heading. |
| 9 | Create a signing identity once. | 5 | J: “Create a sender key once.” |
| 10 | Keep `sender.key` private; send `sender.pub` to recipients through a trusted channel. | 11 | J: explain how to check the key. |
| 11 | Build signed JSON and HTML receipts for a folder: | 9 | T/C: choose receipt or manifest consistently. |
| 12 | Copy the files and receipts into a portable package. | 9 | T/C |
| 13 | The output can be transferred by any ordinary tool: | 9 | M/C: “Transfer the output with your usual file-transfer tool.” |
| 14 | At the destination, verify the received `files/` directory: | 8 | J: “On the recipient’s machine, verify the received `files/` folder.” |
| 15 | For scripts, add `--json`. | 4 | C |
| 16 | A clean verification exits `0`; discrepancies exit `3`; an invalid signature or decryption failure exits `4`; operational errors exit `1`; invalid CLI usage exits `2`. | 25 | **>22**, J/C. Split into five short exit-status sentences. |
| 17 | Private manifests | 2 | T: “Encrypt manifest filenames.” |
| 18 | Plain manifests reveal filenames. | 4 | C |
| 19 | Encrypt both receipts with a passphrase supplied through the environment (never a command-line argument): | 14 | J/T/C |
| 20 | The encrypted HTML file is a privacy-safe cover sheet; use the CLI to decrypt and verify. | 16 | M/J/C: “The encrypted HTML file does not display filenames. Use the command-line tool to decrypt and verify it.” |
| 21 | Files themselves are not encrypted. | 5 | C |
| 22 | Manifest format | 2 | Clear technical heading. |
| 23 | Version `1` is UTF-8 JSON. | 5 | J/C |
| 24 | The signature is Ed25519 over the exact compact JSON encoding of the `payload` object. | 14 | J/C; appropriate only in the format reference. |
| 25 | Entries are sorted by relative path and use `/` separators. | 9 | J/C |
| 26 | Each entry has `path`, `size`, and a lowercase SHA-256 `sha256` value. | 11 | J/C |
| 27 | Implementations must reject unsupported versions and unsafe absolute or parent-traversal paths. | 11 | J/C: “Readers must reject unsupported versions, absolute paths, and paths containing `..`.” |
| 28 | Development | 1 | Clear heading. |
| 29 | Run the landing page locally with `npm run dev`. | 9 | — |
| 30 | The browser verifier hashes selected local files in place; files are never uploaded or stored. | 15 | J/C: “The browser reads selected files locally. It does not upload or store them.” |
| 31 | `npm test` also builds the production site and runs Chromium coverage for the 390 px mobile accessibility gate, service-worker registration, offline reload, and deployment response policy. | 26 | **>22**, J/C. Split after “production site,” then list the four checks. |
| 32 | The browser version is pinned in `package.json`. | 7 | J/C |
| 33 | Deploy | 1 | Clear heading. |
| 34 | The factory deploys the static output in `dist/site` to `https://remote-file-handoff-manifest.sociobot.in`. | 10 | J/C |
| 35 | `site/public/staticwebapp.config.json` ships with that output and defines the security headers plus immutable caching for hashed assets. | 16 | J/C: split or leave in maintainer-only deployment docs. |
| 36 | Build it with `npm ci && npm run build:site`; do not publish the crate from this repository. | 16 | J; concrete maintainer instruction. |
| 37 | Privacy and security | 3 | Clear heading. |
| 38 | There is no telemetry, account, hosted storage, runtime CDN, or external request. | 12 | J/C: “The product has no tracking, account, hosted storage, third-party scripts, or runtime network request.” |
| 39 | Signing proves that the manifest came from the holder of the key and has not changed; it does not prove that a transport completed. | 24 | **>22**, J/T/C. Split: “A valid signature proves the key holder signed this manifest. It also proves the manifest is unchanged. It does not prove delivery completed.” |
| 40 | Protect the signing key and share its public half through a trusted channel. | 13 | J: explain how to verify the public key. |
| 41 | License | 1 | Clear heading. |
| 42 | MIT. | 1 | — |
| 43 | See LICENSE. | 2 | — |

The README has four sentences over 22 words: rows 3, 16, 31, and 39. No banned plain-words term appears. The main consistency defect is the rotation among “inventory,” “manifest,” “receipt,” “package,” “folder,” and “files” without defining their relationships.

## Verification record

- Clean clone: `/tmp/tmp.YqTo0Xj9do/repo` from the reviewed revision.
- `npm ci`: pass.
- `npm test`: pass — 2 Rust unit tests, 4 CLI integration tests, 1 Rust doc test, 6 Vitest tests, and 3 browser tests.
- `npm run build`: pass; produced `dist/site`. Home JS is 7.00 kB raw / 3.17 kB gzip.
- Listed claim commands: none could be run because `.factory/claims.json` is missing.
- Live viewport checks: pass for load and console cleanliness at 390 × 844 and 1440 × 900.
- Live real-data browser verification: pass for one signed file; zero requests occurred after inputs were selected.
- Live offline reload: pass after first online visit and service-worker control.
- Live link crawl: no dead link among the links present.

## Decision

**FAIL.** There are four BLOCKING findings and more than three non-blocking findings. Passing implementation tests and strong visual differentiation do not compensate for the missing demo, absent claims contract, ambiguous first action, or soft-404 routing.
