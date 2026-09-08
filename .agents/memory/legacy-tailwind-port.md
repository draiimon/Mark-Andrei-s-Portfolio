---
name: Legacy Tailwind migration
description: Compatibility note for moving Tailwind v3 CSS into the workspace Tailwind v4 Vite scaffold.
---

When a ported app keeps a large Tailwind v3 stylesheet with `@apply`, reference the artifact’s v4 theme stylesheet from the legacy file and declare any custom utility names in the v4 `@theme` block.

**Why:** The v4 Vite plugin processes imported stylesheets independently and otherwise reports standard or app-specific utilities as unknown.

**How to apply:** Add a relative `@reference` before legacy `@tailwind`/`@apply` rules, then define custom colors or utilities (such as `awsOrange`) in the artifact theme.