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

The editor background sparkle field should read as persistent air-dragged dust: each batch spreads once from the eclipse into the whole viewport, then settles into bounded wind/Brownian drift and firefly-like shimmer. It must not orbit, use long streak trails, expire, or reset.

**Why:** The intended effect needs the visual excitement of an initial star spread plus an always-present star-dust atmosphere that gradually gains density with clicks.

**How to apply:** Launch each batch from the eclipse toward random full-viewport settle points, keep every particle alive after settling, move it only with small local wind drift, and append new sparkles without slicing or replacing the existing field.