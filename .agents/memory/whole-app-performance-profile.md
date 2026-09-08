---
name: Whole-app performance profile
description: Durable rules for adapting shared portfolio effects and offline behavior to device capability.
---

Use a shared capability profile for the portfolio: coarse pointer, device memory/CPU, reduced motion, Save-Data/effective network type, and document visibility should drive lightweight behavior consistently across Home and Edit.

**Why:** The portfolio’s premium feel depends on motion, glow, audio, and the solar aesthetic, so removing effects globally is the wrong tradeoff. The expensive work must pause or reduce cadence only where the device or page state warrants it.

**How to apply:** Prefer adaptive frame cadence, offscreen/hidden pausing, progressive media loading, and small visual-cost reductions over deleting interaction effects. Keep offline caching limited to the app shell and public portfolio data; admin, chat, view writes, and database-backed operations remain online-only.