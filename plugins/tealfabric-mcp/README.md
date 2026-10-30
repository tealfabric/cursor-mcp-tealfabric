# Tealfabric MCP Plugin

Cursor marketplace plugin for connecting AI workflows to Tealfabric.

## What it provides

- Webapp operations (list/get/create/update/publish/unpublish/version/delete)
- Process and process-step operations (list/get/create/update/execute/retire/delete)
- Document operations (list/tree/metadata/read-text/write-text/download/upload/move/delete)
- Connector operations (list/test/oauth2-required)
- Integration operations (list/create/update/execute/delete)
- Skills for efficient tool calling (integrations, webapps, processes, documents)

## Setup

1. Build the server:

```bash
npm install
npm run build
```

2. Configure plugin MCP with your Tealfabric API key when prompted.

## Required environment

- `TEALFABRIC_API_KEY`
- `TEALFABRIC_API_URL` (defaults to `https://tealfabric.io`)

API key scopes as needed: `connectors.*`, `integrations.*`, `webapps.*`, `processflow.*`, `documents.*`.

## Docs

- Package README: [../../README.md](../../README.md)
- Release notes 0.2.0: [../../docs/RELEASE_NOTES_0.2.0.md](../../docs/RELEASE_NOTES_0.2.0.md)
- Migrating: [../../docs/MIGRATING.md](../../docs/MIGRATING.md)
- Developer guide: [../../docs/DEVELOPER.md](../../docs/DEVELOPER.md)

## Quick checks

- Run `npm run build`
- Run `npm run validate:marketplace`
