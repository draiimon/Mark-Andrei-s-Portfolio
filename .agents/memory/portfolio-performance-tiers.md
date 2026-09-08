---
name: Portfolio performance tiers
description: Device-tier rules for keeping the portfolio visually faithful while reducing work on low-end phones.
---

Low-end scheduling optimizations may cover older Android and iPhone hardware, but the portfolio's existing visual-lite CSS must remain scoped to the device class it was designed for. Do not broaden visual overrides that reduce blur, glow, animation, or interaction geometry just because a device is detected as low power.

**Why:** The portfolio's identity depends on the depth and motion of its atmospheric surfaces. Runtime work can be reduced independently through delayed non-critical work, throttled analysis, stable component inputs, and cached media without flattening those surfaces.

**How to apply:** Use shared performance detection for JavaScript scheduling and audio analysis. Keep `data-mobile-lite` visual rules Android-scoped unless the visual treatment is explicitly re-approved at representative phone sizes.