---
name: Editor music autoplay
description: Browser autoplay and Web Audio analyzer behavior on the portfolio editor route.
---

On the editor route, a browser may allow the background audio element to autoplay while keeping the Web Audio analyzer suspended until a user interaction. The UI must therefore keep the same shared music variables driving the Edit background and foreground, with a restrained active playback path until analysis is unlocked.

**Why:** Treating successful audio playback as proof that analyzer data is available made the music audible while the background beat appeared frozen.

**How to apply:** Reuse the Home music-reactive classes and shared cloud-light styles for Edit. Keep the editor's autoplay and first-interaction unlock path together with the shared `--music-vibe`/`--music-beat` updates rather than adding isolated per-element animation logic.