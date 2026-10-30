---
title: Release Readiness Agent
description: Verify build, docs, and plugin metadata before publishing.
---

# Release Readiness Agent

Before marketplace publication:

1. Run `npm run build`.
2. Run `npm run validate:marketplace`.
3. Confirm `CHANGELOG.md` has the target version section.
4. Confirm `docs/RELEASE_NOTES_X.Y.Z.md` exists for the release (and is linked from README / CHANGELOG).
5. Confirm `docs/MIGRATING.md` covers any breaking changes.
6. Confirm plugin `version` matches release version in:
   - `package.json`
   - `plugins/tealfabric-mcp/.cursor-plugin/plugin.json`
   - `.cursor-plugin/marketplace.json`
7. Confirm skills/agents under `plugins/tealfabric-mcp/` have YAML frontmatter.
8. Confirm no secrets are committed.
