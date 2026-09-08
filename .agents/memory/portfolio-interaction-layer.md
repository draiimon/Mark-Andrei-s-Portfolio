---
name: Portfolio interaction layer
description: Visual guardrail for the portfolio’s motion-rich scroll, music, and assistant interactions.
---

The portfolio’s scroll reveal, music controller, music-reactive hero, and chatbot aura are intentional parts of its identity. Future visual refinements should preserve their motion, glow, depth, and feedback instead of replacing them with flat opaque or square controls.

**Why:** Flattening these interaction styles made the portfolio feel static and visibly worse even though the underlying components still worked.

**How to apply:** Keep the dark, grid-free surface and transparent header, but treat the interaction layer as expressive UI: restore original animation and depth styles when adding broader surface overrides.