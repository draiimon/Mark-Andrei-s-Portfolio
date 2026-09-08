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