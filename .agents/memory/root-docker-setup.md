---
name: Root Docker setup
description: The project's root Docker configuration is important and must survive cleanup work.
---

The root Dockerfile and related root-level Docker configuration are considered part of the main project and should be preserved during cleanup or refactoring.

**Why:** The user explicitly identified the main Docker setup as important after it was mistakenly treated as archival material.

**How to apply:** Before deleting or relocating Docker-related files, distinguish the active root setup from legacy copies under migration backups; do not remove or rewrite the root files unless explicitly requested.