---
name: Portfolio interaction layer
description: Visual guardrail for the portfolio’s motion-rich scroll, music, and assistant interactions.
---

The portfolio’s scroll reveal, music controller, music-reactive hero, and chatbot aura are intentional parts of its identity. Future visual refinements should preserve their motion, glow, depth, and feedback instead of replacing them with flat opaque or square controls.

**Why:** Flattening these interaction styles made the portfolio feel static and visibly worse even though the underlying components still worked.

**How to apply:** Keep the dark, grid-free surface and transparent header, but treat the interaction layer as expressive UI: restore original animation and depth styles when adding broader surface overrides.

On mobile, preserve the original interaction geometry: the music control docks as a compact rounded button at bottom-left, the assistant stays at bottom-right, and the intro hides both until entry; desktop keeps the vertical music rail with speaker, play/pause, and volume.

**Why:** The original mobile experience depends on these fixed touch targets and responsive state changes, not just their visual styling.

**How to apply:** Any future mobile CSS pass must keep the bottom docking, hidden mobile speaker/volume controls, and intro visibility state in sync with the original.

The homepage should use the original `site-shell` styling path without the newer `portfolio-refinement` class; that extra layer changes responsive heading sizing and can push the trailing comma onto a new mobile line.

**Why:** The original responsive utility classes already produce the correct mobile title, card, and interaction geometry.

**How to apply:** Do not re-add broad refinement classes to the homepage unless every mobile override is checked against the original source at the same viewport.

The editor background sparkle field should read as persistent air-dragged dust: it stays dormant until the tenth eclipse click, each ten-click batch spreads once into the whole viewport, then settles into bounded wind/Brownian drift and firefly-like shimmer. It must not orbit, use long streak trails, expire, wrap around, or reset.

**Why:** The intended effect needs a deliberate buildup before the star spread, followed by an always-present star-dust atmosphere that gradually gains density; page load and early clicks should remain clean without unbounded particle growth.

**How to apply:** Keep the initial field empty, trigger the first and later batches at ten-click intervals, launch each batch from the eclipse toward random full-viewport settle points, keep particles alive after settling, move them only with small local wind drift, cap the pool by removing only the oldest particles, and clamp edges instead of wrapping.

The authenticated editor should use a quieter companion surface: restrained charcoal glass, warm hairline borders, compact low-emphasis controls, and readable spacing. Keep this treatment scoped to the Control Center so login and homepage atmosphere remain unchanged.

**Why:** The editor needs to feel like the same portfolio without competing with the cinematic public/login presentation.

**How to apply:** Scope editor-only visual overrides to the authenticated shell class; preserve existing form, CRUD, upload, drag-and-drop, and navigation behavior while styling surfaces and controls.