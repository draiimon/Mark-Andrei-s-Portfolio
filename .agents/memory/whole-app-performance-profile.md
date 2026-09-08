---
name: Whole-app performance profile
description: Durable rules for adapting shared portfolio effects and offline behavior to device capability.
---

Use a shared capability profile for the portfolio: coarse pointer, device memory/CPU, reduced motion, Save-Data/effective network type, and document visibility should drive lightweight behavior consistently across Home and Edit.

**Why:** The portfolio’s premium feel depends on motion, glow, audio, and the solar aesthetic, so removing effects globally is the wrong tradeoff. The expensive work must pause or reduce cadence only where the device or page state warrants it.

**How to apply:** Prefer adaptive frame cadence, offscreen/hidden pausing, progressive media loading, and small visual-cost reductions over deleting interaction effects. Keep offline caching limited to the app shell and public portfolio data; admin, chat, view writes, and database-backed operations remain online-only.

For Android Chromium, critical video readiness must not block or hide the route. Use one stable branded loader; low-end Android may use the glass blur during the active intro, but the blur must be scoped to that overlay and removed when it is dismissed.

**Why:** Real Android compositing can retain a backdrop-filter surface while the video underneath changes, making a finished page look permanently blurred or stuck.

**How to apply:** Let the bundled route paint immediately, keep media warm-up advisory, and reserve the minimum loader duration for the branded overlay rather than waiting on video or API readiness. Use the low-power device tier to opt into the Android glass treatment without applying it to the settled page.

The public home route intentionally keeps its “To the clouds.” enter-profile intro; the MARK ANDREI / EDIT loader is reserved for editor routes.

**Why:** The home intro is part of the portfolio identity and is not interchangeable with the editor control-center transition.

**How to apply:** Preserve the home intro when changing global loading behavior, and keep its Android glass treatment tied to the active intro state so it cannot survive into the page content.

Capability-tier attributes that affect loading visuals must be set before the React root renders, not only in a post-mount effect.

**Why:** Android can paint the intro once before the device tier is detected, creating a visible unblurred-to-blurred flash.

**How to apply:** Seed the initial tier synchronously during app bootstrap, then let the mounted shell continue updating it for resize or route changes.