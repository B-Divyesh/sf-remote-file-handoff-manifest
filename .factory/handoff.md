# Handoff — adversarial review 3

## Result

Review-only work completed and committed. No product source was modified.

The product **does not pass** this review. `.factory/review-3.md` records two remaining defects:

1. Reopened `F-2-3` / `F-3-1`: Back loses the workflow scroll position after a real browser click.
2. `F-3-2`: the demo replay button also triggers clipboard-copy handling and ends labelled “Copy install command.”

## Verification performed

- Cold live mobile (390 × 844) and desktop (1440 × 900) first-read checks.
- Live demo entry/reset/exit, real-storage marker isolation, same-origin request observation, live offline reload, and CLI demo from a temporary directory.
- Every one of the 11 `.factory/claims.json` commands, separately, in clean clone `/tmp/rfhm-review3-ZjyuGq/repo`.
- Clean-clone `npm test`, `npm run build`, `cargo fmt --check`, and `cargo clippy --all-targets -- -D warnings`.
- Live metadata/route/404/link crawl and real-click Back/focus check.

## Reproduce

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
```

For the two failures, follow the exact reproductions and test changes in `.factory/review-3.md`.

## Known gaps

The two findings above remain. Do not mark the product accepted until they are repaired and independently retested.
