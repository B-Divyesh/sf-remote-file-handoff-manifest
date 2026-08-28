# Handoff — polish round 3

## Status

The repair is ready for deployment. The final commit, clean-clone evidence, and cold live verification are added here immediately after the deployment check.

## Repair included

- Saves and restores the reader’s exact scroll position for real same-origin navigation, then focuses and announces the destination h1 without moving the viewport.
- Limits clipboard behavior to the install command. The demo replay button now runs only the bundled sample and returns to “Replay sample check.”
- Keeps the full earlier repair set: plain first-screen wording, isolated `?demo=1` / `/demo/` sample path, persistent banner/reset/exit controls, 11 claim tests, legal/404 routes, metadata, accessible mobile layout, local-only verifier, and the checksum-relay visual identity.

## Local verification

The repair source commit `6205b12` passed:

```sh
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --allow-dirty
```

`npm test` includes Rust unit/integration/doctest coverage, TypeScript checks, claim tests, browser route/metadata/mobile/Axe checks, privacy/request checks, service-worker offline checks, and the real-click Back/replay regressions. `cargo package --allow-dirty` creates the ready-to-publish crate; do not publish it from this repository.

## Run and deploy

```sh
npm ci
npm test
npm run build
cargo run -- demo
```

The factory deploys `dist/site`; deployment is triggered by the committed `main` branch work order. The user-facing demo is `https://remote-file-handoff-manifest.sociobot.in/?demo=1`, which redirects to `/demo/`.

## Known gaps

None in the repaired source. Final live deployment evidence is pending the required cold check.
