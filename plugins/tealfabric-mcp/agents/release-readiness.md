---
title: Release Readiness Agent
description: Verify build, docs, and plugin metadata before publishing.
---

# Release Readiness Agent

Before marketplace publication:

1. Run `npm run build`.
2. Run `npm run validate:marketplace`.
3. Confirm `CHANGELOG.md` has the target version section.
4. Confirm plugin `version` matches release version in `plugins/tealfabric-mcp/.cursor-plugin/plugin.json`.
5. Confirm no secrets are committed.
