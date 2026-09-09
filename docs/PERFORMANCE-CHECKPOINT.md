# Performance optimization checkpoint — 2026-09-09

Paused at the user's request to conserve the remaining allowance. Do not treat
the optimization as complete. No commit or push has been made.

## Running version

http://localhost:3000 serves the last tested production build with the existing
root `.env`. The process was started with `scripts/start-local.mjs`; its PID and
logs are in `.local/portfolio.pid`, `.local/portfolio.stdout.log`, and
`.local/portfolio.stderr.log`. It has NOT been rebuilt with the unfinished
adaptive architecture below. Preserve the `.env` without printing its values.

The preceding completed work restored production backdrop-filter rules,
made the home Enter/Loading intro consistent, preserved the transparent editor
login, and verified desktop/mobile/Android browser behavior and actual editor
login. Dockerfile and Compose were updated for the Vite/Express workspace, but
Docker is not installed, so container execution remains unverified.

## Completed work in the current optimization pass

- Saved production baseline metrics to `.local/baseline.json` using
  `.local/profile-performance.cjs` and temporary Playwright installation
  `.local/browser-check/node_modules/playwright`.
- Added `src/lib/adaptive-performance.ts`: shared lightweight/balanced/full
  capability detection, separate network and reduced-motion signals, bounded
  frame sampling, long-task observation, and downgrade hysteresis. This needs
  runtime validation, including behavior when browser capability APIs are absent.
- Replaced legacy `performance-profile.ts` with a compatibility re-export.
- Added `src/lib/visual-ready.ts`, critical HTML boot UI, and replaced the
  fixed five-second PageLoading delay with font/image/frame readiness.
- Made readiness callbacks stable and added `src/lib/public-data.ts` for
  deduplicated, abortable short-lived public-data requests. Home waits for its
  initial portfolio result or bounded snapshot fallback before readiness.
- AppShell now owns performance observation; music no longer overwrites tier
  attributes. Cursor code is lazy and not imported on touch-only startup.
- SolarAura and editor particles use shared effect budgets. Full-capability
  phones no longer automatically receive the old low-resolution particle budget.
- Started adapting background media to responsive posters and deferred video.
- Latest frontend typecheck passed after these partial changes.

All frontend paths above are relative to `artifacts/mark-andrei-portfolio/`.
These changes are SOURCE ONLY and have not undergone a new production build or
browser regression pass.

## Immediate blocker before any new build

`src/components/AmbientBackgroundVideo.tsx` now references
`public/assets/eclipse-poster-640.webp` and `eclipse-poster-1600.webp`.
Those files DO NOT EXIST YET. The extraction helper `.local/create-posters.cjs`
failed to decode the MP4 in bundled Playwright Chromium. Do not ship broken
image references. Installed Google Chrome and Microsoft Edge were found at:

- `C:/Program Files/Google/Chrome/Application/chrome.exe`
- `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`

Next: use installed Chrome (`channel: "chrome"`) to extract real first-frame
WebP posters, ensure cleanup in `finally`, or restore the original video
component until valid assets can be generated. Verify actual aspect ratio;
the component currently assumes 1600 × 900. Browser background video decoding
was not validated by the previous bundled-Chromium tests.

## Remaining implementation, in priority order

1. Finish media assets and review first-frame readiness, image/font failure
   fallbacks, and boot error handling. Test home/editor direct links. Ensure
   there are no arbitrary minimum loader durations and no permanent loader.
2. Finish versioned/bounded service-worker caching. Existing `public/sw.js` is
   still the old worker: fixed `portfolio-cache-v2`, eagerly precaches video,
   and uses skipWaiting/claim. Plan a build-generated revision and immutable
   asset manifest, bounded safe runtime caching, coherent updates, public-only
   offline fallback, no auth/chat/write caches, and no automatic video download.
   Keep storage failures nonfatal and protect old clients from missing chunks.
3. Defer the heavy chatbot/Markdown module until opening, preserving its launcher
   and current visual design. Bound long chat rendering, pause closed animations,
   and explicitly handle offline submissions. This is NOT implemented yet.
4. Finish scoped adaptive CSS: freeze costly moving blur surfaces for weak
   hardware without deleting the visual effects. Preserve full mobile quality,
   existing layout, and Enter/Loading blur consistency. Old `data-mobile-lite`
   rules remain in global CSS but the new controller no longer sets that flag.
5. Review shared title/typewriter timers, cursor visibility/input changes,
   observer cleanup, route cancellation, and editor request/animation cleanup.
   PageLoading should abort its pending preparation on unmount. Check performance
   monitor scheduling for duplicate samples/timers across hide/show events.
6. Backend: inspect safe compression/static cache headers, connection limits and
   timeouts, startup database failure handling, and repeated editor reads.
   No backend optimization or database schema/index change was made in this pass.
   Do not add indexes speculatively. Supabase and Postgres skills were read.
7. Remove only proven unused code/dependencies; no dependency removal has yet
   been performed. Do not delete unrelated untracked projects or user files.

## Baseline (one lab run per scenario, not field metrics)

Mobile viewport 390 × 844; 150 ms latency; ~1.6 Mbps download. Existing Chromium
was used with 1×, 4×, and 6× CPU throttling. Measurement includes initial entry
and 2.5 seconds after clicking the intro. Exact values and request lists are in
`.local/baseline.json`.

| CPU slowdown | LCP | CLS | Observed blocking time | Requests | Encoded transfer |
| --- | --- | --- | --- | --- | --- |
| 1× | 3964 ms | 0.000038 | 78 ms | 12 | 522172 bytes |
| 4× | 4148 ms | 0.158826 | 872 ms | 12 | 522172 bytes |
| 6× | 4580 ms | 0.158808 | 1257 ms | 12 | 522172 bytes |

All three showed TWO `/api/public/portfolio` requests and TWO
`/api/public/views` requests during startup. Stable readiness callbacks and
request deduplication need to be measured again to confirm the fix. Heap output
was quantized (10000000 bytes), so it is not useful evidence of memory behavior.
These are custom lab metrics, not Lighthouse scores or verified INP.

## Verification and resumption commands

- `pnpm.cmd --filter @workspace/mark-andrei-portfolio run typecheck`
- Production frontend build from workspace root:
  `node --env-file=.env artifacts/mark-andrei-portfolio/node_modules/vite/bin/vite.js build --config artifacts/mark-andrei-portfolio/vite.config.ts`
- Full workspace build requires `PORT=3000` and `BASE_PATH=/` for mockup-sandbox.
- Previous functional smoke test: `node .local/verify-local.cjs`.
  It must be updated for resource-based preparation: it previously checked the
  interim Loading profile state, which may now finish within a frame.
- Matching after measurement: `node .local/profile-performance.cjs after`.
  Keep the same browser/network settings for comparison; also run real Chrome
  separately for media correctness. Run multiple samples if time permits.
- Test repeat visit, offline navigation, worker upgrade with an old tab, storage
  failure, poor network recovery, 4×/6× CPU, editor login and reads, previews,
  chatbot open/close, reduced motion, hidden tabs, and repeated navigation.
  Avoid changing live database content merely to test performance.
- Rebuild/restart backend only if backend source changes. Existing frontend
  static files are served directly, so a successful frontend build updates them.
- Produce a concise final report with actual measurements, files changed,
  remaining limitations (physical devices/Docker/Lighthouse if not exercised),
  and no unsupported performance-score claims.

## Workspace cautions

The working tree already contains intentional uncommitted changes from the
earlier pull/local-run/blur fixes and unrelated untracked local projects. Do not
reset or clean it. `.local/apply-adaptive.cjs` and `.local/effects.cjs` are one-time
mutation helpers and must NOT be rerun blindly. Source changes have already
been applied. The current permission profile is unrestricted with approval
policy `never`; do not supply `sandbox_permissions` in tool calls.
