# Visual thesis: the checksum relay

## Direction and rationale

Remote File Handoff Manifest uses a **pixel/demoscene language** inspired by a packet moving between two machines while a checksum scope watches the signal. This is not retro styling for nostalgia: the hard grid, indexed colors, and one-bit edges make an invisible verification process legible. Folder trees appear as data lanes; a lime pulse means a byte-for-byte match; coral is reserved for damage or absence.

The site is explicitly dark-mode. A light treatment would weaken the terminal/tool identity and introduce a second palette without helping this single-purpose technical product. Every surface is painted, including form controls and overscroll regions.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| Void | `#080b12` | page background |
| Rack | `#101724` | elevated surface |
| Grid | `#25324a` | borders and inactive tracks |
| Paper | `#f4f7e8` | primary text |
| Phosphor | `#c8ff3d` | primary action, verified state |
| Cyan | `#5ee7f2` | links, focus, metadata |
| Coral | `#ff6b6b` | altered/missing state |
| Amber | `#ffc857` | warning/expiry state |
| Muted | `#aab4c5` | secondary text |

Body text on Void and Rack exceeds 4.5:1. Accent colors are always paired with an icon or text label; color never carries status alone.

## Type and spacing

- Display: `ui-monospace, "SFMono-Regular", Consolas, monospace` in uppercase with restrained tracking. The monospace voice mirrors manifests and command output.
- Body: `Inter`, `system-ui`, sans-serif. The site uses system fallbacks in v1, so there are no font downloads or third-party requests.
- Scale: 14 / 16 / 20 / 28 / clamp(40–72) px. Body never drops below 16 px.
- Spacing: 4 px base; primary steps are 8, 12, 16, 24, 32, 48, 72 px. Corners are clipped at 0 or 2 px rather than softly rounded.

## Composition and interaction grammar

The page is a two-column relay: promise and install command on one side, a compact pixel illustration of source → manifest → recipient on the other. Section eyebrows are numbered like track positions (`01 / BUILD`, `02 / VERIFY`). Rules, sparse grid lines, tabular numerals, and square status lights create hierarchy without card soup. On phones the relay stacks, nonessential grid decoration disappears, commands remain horizontally scrollable, and actions stay at least 44 px tall.

Buttons depress by 2 px with their hard shadow. Inputs light their outer scanline on focus. Result rows enter from the location of the selected folder; no decorative motion loops.

## Motion policy

Transitions are 160–240 ms and limited to opacity and transform. The verification meter runs once after files are selected. Under `prefers-reduced-motion: reduce`, all transforms and smooth scrolling are disabled and results appear immediately. Nothing flashes or autoplays.

## Original asset plan and provenance

- `site/public/relay-hero.webp`: an original raster illustration generated for this product with the factory image generator, then optimized locally to WebP. Prompt: “Wide pixel-art/demoscene editorial illustration for a privacy-first file manifest CLI: two dark indigo computer terminals on opposite edges, a sealed lime checksum packet crossing a cyan data bridge, tiny folder glyphs and hash blocks, limited palette of near-black, phosphor lime, electric cyan, warm coral, crisp 1-bit dither, no gradients, no readable text, no logos, no watermark, generous dark negative space, 16:9.” Model/provider: factory image-generation deployment (`/opt/fleet/lib/gen-image.sh`). Exact generation metadata is retained in `.factory/relay-hero.prompt.json`. License: project-owned generated asset under the repository MIT license.
- UI glyphs and diagrams are hand-made with CSS/semantic text; no icon package or third-party assets.
- `site/public/social-card.png` is a 1200×630 crop derived locally from the original relay illustration.
- `site/public/favicon.svg` and `apple-touch-icon.png` are hand-made folder-and-checksum marks using the product palette.

## Polish continuity

Round 1 retains the dark pixel/demoscene direction. The persistent demo banner uses a subdued phosphor rack tone, while the recorded CLI and mismatch scope reuse the existing terminal grammar. Mobile navigation keeps Demo and Privacy visible; dense workflow decoration stacks below the first-screen task.
