# Reviewer handoff: adversarial first-read review 1

## Status

Review completed on 2026-08-28 UTC for revision `617355265602c975146387b06165206916218144` and the live site.

Verdict: **FAIL**. The full evidence and sentence-by-sentence audits are in `.factory/review-1.md`.

## What was done

- Opened the live site cold in fresh 390 × 844 and 1440 × 900 browser contexts.
- Audited every static and interactive landing-page sentence and every README prose sentence.
- Checked `/demo`, `?demo=1`, the closest sample preview, CLI demo behavior, storage isolation, real browser verification, offline reload, network requests, links, metadata, route focus, touch targets, 404 behavior, headers, and visual identity.
- Inspected `.factory/claims.json`; it is missing, so there were no listed claim commands.
- Ran the ordinary project gates from a clean clone.

## Verification

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/verify-url.sh https://remote-file-handoff-manifest.sociobot.in <evidence-dir>
```

All four commands passed when supplied the required evidence directory. The clean suite passed 2 Rust unit tests, 4 CLI integration tests, 1 doc test, 6 Vitest tests, and 3 browser tests. Live Playwright axe checks found no serious or critical issues on Home, Privacy, or Terms. A real signed one-file browser verification completed with no network request, and offline reload worked after the first visit.

## Blocking gaps

1. No one-click sandbox demo, demo route/banner/reset, CLI `demo` command, bundled sample, recording, or `.factory/demo.md`.
2. No `.factory/claims.json` and no `@claim:*` tests despite many public claims.
3. The first screen does not name its audience or establish one honest first action.
4. Unknown routes and `/demo` return the homepage with HTTP 200 instead of a designed route/404.

No product code was modified. Only the requested review and this handoff were changed.
