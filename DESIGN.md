# Design

## Visual Theme

Light, atmospheric, architectural. A pale ice-tinted canvas with depth built from soft shadow, layered surfaces, and scroll-driven motion. Simplicity in the igloo.inc register: huge quiet type, vast negative space, one committed accent. Playfulness lives in interaction (cursor-aware touches, tactile hovers, scroll reveals), never in decoration.

## Color Palette

Strategy: **Committed**. A cold near-white canvas carries the surface; deep ink for type; one glacial blue accent doing real semantic work (links, interactive states, the "currently in view" markers).

- Canvas: `oklch(97.5% 0.006 230)` (ice white, blue-tinted)
- Canvas deep: `oklch(94% 0.01 230)` (section contrast bands)
- Ink: `oklch(22% 0.015 240)` (primary text, never #000)
- Ink soft: `oklch(45% 0.012 240)` (secondary text)
- Accent: `oklch(55% 0.16 240)` (glacial blue: links, focus, active markers)
- Accent deep: `oklch(35% 0.1 245)` (hover states on accent)
- Hairline: `oklch(88% 0.008 230)` (rules, borders)

## Typography

- One committed family: "Schibsted Grotesk" (Google Fonts, 400-900). Voice comes from extreme weight + scale contrast inside the single family, tight tracking on display sizes. No serif pairing; the cold-precise lane doesn't want one.
- Body 1.6 line height, max 70ch.
- Scale ratio ≥1.33; hero display sizes use `clamp()` up to ~10rem, tracking -0.04em.
- Section numbers (01, 02, 03) set huge and pale as structural landmarks.

## Layout

- Single continuous scroll narrative: hero → positioning statement → three case studies → about/skills woven as prose → contact.
- Asymmetric editorial grid, content offset from center; no uniform card grids.
- Sticky/pinned elements for case-study chapters (number stays while content scrolls).
- Section padding via `--space-section: clamp(6rem, 5rem + 8vw, 14rem)`; rhythm varies deliberately.

## Motion

- IntersectionObserver-driven reveals: translateY + opacity, 600-900ms, ease-out-expo, slight stagger.
- Scroll progress drives the hero (scale/parting of display type) and case-study chapter transitions.
- Hover states: precise micro-translations and underline draws, 150-300ms.
- All motion behind `prefers-reduced-motion` guard; reduced mode shows static layout.
- Compositor-only properties: transform, opacity, clip-path.

## Components

- Nav: minimal fixed wordmark + contact link, hairline border appears on scroll.
- Case study chapter: oversized number, role line ("Built and shipped solo"), problem/decisions/outcome narrative, single key visual, link out.
- Footer/contact: oversized invitation line with email as the primary action; form secondary or removed.
