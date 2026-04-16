# Tealfabric MCP Plugin

Cursor marketplace plugin for connecting AI workflows to Tealfabric.

## What it provides

- Webapp operations (list/get/create/update/publish)
- Process and process-step operations (list/get/create/update/execute)
- Document operations (list/metadata/download/upload/move/delete)
- Connector operations (list/test/oauth2-required)
- Integration operations (list/create/update)

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

## Quick checks

- Run `npm run build`
- Run `npm run validate:marketplace`
