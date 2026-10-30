# Tealfabric Cursor Connector — Developer Documentation

This document is for developers who want to use, configure, or extend the **Tealfabric MCP Server** (Cursor connector) for the Tealfabric platform.

**Tealfabric platform documentation:** [https://tealfabric.io/docs](https://tealfabric.io/docs) — use this as the reference for WebApps, ProcessFlow, APIs, and platform concepts.

---

## Table of contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation and build](#3-installation-and-build)
4. [Cursor configuration](#4-cursor-configuration)
5. [Tools reference](#5-tools-reference)
6. [Tealfabric API mapping](#6-tealfabric-api-mapping)
7. [Environment variables](#7-environment-variables)
8. [Security and API keys](#8-security-and-api-keys)
9. [Project structure](#9-project-structure)
10. [Extending the server](#10-extending-the-server)
11. [Troubleshooting](#11-troubleshooting)
12. [References](#12-references)
13. [Release notes and migration](#13-release-notes-and-migration)

---

## 1. Overview

The Tealfabric Cursor Connector is an **MCP (Model Context Protocol) server** that runs locally and talks to the Tealfabric REST API. It lets the AI in **Cursor IDE**:

- **List** connectors and check connector OAuth2 requirements; **test** connector configuration
- **List, create, update, execute, and delete** integrations
- **List, create, update, publish, unpublish, version, and delete** webapps
- **List, create, update, execute, retire, and delete** ProcessFlow processes and steps
- **List, tree, read-text, write-text, download, upload, move, delete** documents

The server is **standalone**: it only depends on Node.js, npm packages (`@modelcontextprotocol/sdk`, `zod`), and the Tealfabric API. It does not depend on the Tealfabric codebase.

- **Transport:** stdio (Cursor spawns the process and communicates via stdin/stdout).
- **Authentication:** Tealfabric API key via `TEALFABRIC_API_KEY` (sent as `X-API-Key`).

Tool input contracts are aligned with backend-next platform write-field contracts (required webapp fields, publish `version`, document download path, etc.).

---

## 2. Prerequisites

- **Node.js 18+**
- **Tealfabric account** and an **API key**
  - Create keys in the Tealfabric UI (e.g. User settings → API Keys) or via `POST /api/v1/api-keys` when logged in.
  - Recommended scopes: `connectors.read`, `connectors.write`, `integrations.read`, `integrations.write`, `integrations.execute`, `integrations.delete`, `webapps.read`, `webapps.write`, `processflow.read`, `processflow.write`, `documents.read`, `documents.write` (or equivalent `*.*` / `*` grants).
- **Cursor IDE** (with MCP support; typically Cursor v0.40+)

---

## 3. Installation and build

```bash
cd mcp-server-tealfabric
npm install
npm run build
```

- **Output:** `dist/index.js` (and `dist/client.js`). Cursor runs `node dist/index.js`.
- **Scripts:**
  - `npm run build` — compile TypeScript
  - `npm run start` — run `node dist/index.js` (for manual testing)
  - `npm run dev` — build then run

---

## 4. Cursor configuration

Add the MCP server in Cursor so the AI can call Tealfabric tools.

**Option A — UI:** Cursor Settings → **Tools & MCP** → **Add new MCP server**

**Option B — Config file:** Create or edit `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "tealfabric": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-server-tealfabric/dist/index.js"],
      "env": {
        "TEALFABRIC_API_KEY": "YOUR_API_KEY",
        "TEALFABRIC_API_URL": "https://tealfabric.io"
      }
    }
  }
}
```

- Replace `YOUR_API_KEY` with your Tealfabric API key.
- Replace `/ABSOLUTE/PATH/TO/mcp-server-tealfabric/dist/index.js` with the real path to the built entrypoint.

Then **restart Cursor** so it loads the server.

---

## 5. Tools reference

All tools return JSON (or error text) in MCP content. Parameters are validated with Zod schemas.

| Tool | Description | Parameters |
|------|-------------|------------|
| `tealfabric_list_connectors` | List connectors, get connector details, or get connector parameters | `action` (optional: `get`, `parameters`), `connector_id` (optional) |
| `tealfabric_test_connector` | Test connector configuration | `connector_id`, optional `configuration` |
| `tealfabric_get_connector_oauth2_required` | Check if a connector requires OAuth2 | `connector_id` |
| `tealfabric_list_integrations` | List integrations or query by action/filter | optional: `action`, `integration_id`, `execution_id`, `limit`, `search`, `type`, `status`, `is_active`, `page`, `items_per_page`, `sort_by`, `sort_direction` |
| `tealfabric_create_integration` | Create a new integration | `name`, `type` (`api`\|`webhook`\|…), optional: `description`, `connector_id`, `status`, `is_active`, `configuration`, `connector_configuration`, `executable_by_ai_agents` |
| `tealfabric_update_integration` | Update an existing integration | `integration_id`, optional same fields as create |
| `tealfabric_execute_integration` | Execute an integration | `integration_id`, optional `data`, `async` |
| `tealfabric_delete_integration` | Delete an integration | `integration_id` |
| `tealfabric_list_webapps` | List webapps | optional: `search`, `page`, `items_per_page`, `type`, `published_only`, `process_id`, `sort_by`, `sort_direction` |
| `tealfabric_get_webapp` | Get one webapp by ID | `webapp_id`, `version` (optional) |
| `tealfabric_create_webapp` | Create a new webapp | **required:** `name`, `type`, `page_content`, `webapp_user_id`; optional: description, page_*, css/js, auth/public URI, `process_id`, etc. |
| `tealfabric_update_webapp` | Update an existing webapp | `webapp_id`, optional content/auth/public URI fields, `version` / `version_id` |
| `tealfabric_publish_webapp` | Publish a webapp version | `webapp_id`, **`version` (required)** |
| `tealfabric_unpublish_webapp` | Unpublish a webapp | `webapp_id` |
| `tealfabric_create_webapp_version` | Create new unpublished version | `webapp_id` |
| `tealfabric_delete_webapp` | Delete a webapp | `webapp_id` |
| `tealfabric_list_processes` | List ProcessFlow processes | (none) |
| `tealfabric_get_process` | Get one process by ID | `process_id` |
| `tealfabric_list_process_steps` | List steps of a process | `process_id` |
| `tealfabric_get_process_step` | Get one process step by step_id | `step_id` |
| `tealfabric_execute_process` | Execute a process | `process_id`, `input` (optional object) |
| `tealfabric_create_process` | Create a new process | `name`, optional: `description`, `type`, `status`, `category`, `configuration`, `is_template`, `priority`, `executable_by_ai_agents` |
| `tealfabric_update_process` | Update an existing process | `process_id`, optional same fields as create |
| `tealfabric_delete_process` | Hard-delete a process | `process_id` |
| `tealfabric_retire_process` | Soft-retire (inactive + `<retired>` name) | `process_id` |
| `tealfabric_create_process_step` | Create a new step | `process_id`, `name` or `step_name`, optional: `step_type`, `language`, `execution_timeout`, schemas, etc. |
| `tealfabric_update_process_step` | Update an existing process step | `step_id`, optional step fields including `language`, `execution_timeout`, positions |
| `tealfabric_delete_process_step` | Delete a process step | `step_id` |
| `tealfabric_list_documents` | List documents in a directory | `path` (optional); `tenant_id` ignored |
| `tealfabric_list_document_tree` | List documents as a tree | optional: `path`, `max_depth` |
| `tealfabric_get_document_metadata` | Get file metadata | `file_path` |
| `tealfabric_read_document_text` | Read UTF-8 text | `file_path` |
| `tealfabric_write_document_text` | Write UTF-8 text | `file_path`, `content`, optional `encoding` |
| `tealfabric_download_document` | Download file content (base64) | `file_path` |
| `tealfabric_upload_document` | Upload a file | `destination_path`, `file_path` |
| `tealfabric_move_document` | Move or rename file/directory | `old_path`, `new_path` |
| `tealfabric_delete_document` | Delete file or directory | `path` |

For WebApp and ProcessFlow concepts, see [https://tealfabric.io/docs](https://tealfabric.io/docs).

---

## 6. Tealfabric API mapping

The connector calls the Tealfabric REST API under the hood. All requests use the base URL from `TEALFABRIC_API_URL` and send `X-API-Key: <TEALFABRIC_API_KEY>`.

| Tool | HTTP | Tealfabric endpoint |
|------|------|---------------------|
| `tealfabric_list_connectors` | GET | `/api/v1/connectors` (+ optional `?action=&connector_id=`) |
| `tealfabric_test_connector` | POST | `/api/v1/connectors?action=test` (body: `connector_id`, optional `configuration`) |
| `tealfabric_get_connector_oauth2_required` | GET | `/api/v1/connectors/{connectorId}/oauth2-required` |
| `tealfabric_list_integrations` | GET | `/api/v1/integrations` (+ optional query filters/actions) |
| `tealfabric_create_integration` | POST | `/api/v1/integrations?action=create` |
| `tealfabric_update_integration` | PUT | `/api/v1/integrations?action=update` |
| `tealfabric_execute_integration` | POST | `/api/v1/integrations?action=execute` |
| `tealfabric_delete_integration` | DELETE | `/api/v1/integrations?action=delete` |
| `tealfabric_list_webapps` | GET | `/api/v1/webapps` (`page`, `items_per_page`, filters) |
| `tealfabric_get_webapp` | GET | `/api/v1/webapps/{id}` (+ optional `?version=`) |
| `tealfabric_create_webapp` | POST | `/api/v1/webapps` |
| `tealfabric_update_webapp` | PUT | `/api/v1/webapps/{id}` |
| `tealfabric_publish_webapp` | POST | `/api/v1/webapps/{id}/publish` (body: `{ version }`) |
| `tealfabric_unpublish_webapp` | POST | `/api/v1/webapps/{id}/unpublish` |
| `tealfabric_create_webapp_version` | POST | `/api/v1/webapps/{id}/version` |
| `tealfabric_delete_webapp` | DELETE | `/api/v1/webapps/{id}` |
| `tealfabric_list_processes` | GET | `/api/v1/processflow?action=processes` |
| `tealfabric_get_process` | GET | `/api/v1/processflow?action=process&process_id={id}` |
| `tealfabric_list_process_steps` | GET | `/api/v1/processflow?action=steps&process_id={id}` |
| `tealfabric_get_process_step` | GET | `/api/v1/processflow?action=step&step_id={id}` |
| `tealfabric_execute_process` | POST | `/api/v1/processflow?action=execute-process` (body: `process_id`, `input_data`) |
| `tealfabric_create_process` | POST | `/api/v1/processes?action=create` |
| `tealfabric_update_process` | PUT | `/api/v1/processes?action=update` |
| `tealfabric_delete_process` | DELETE | `/api/v1/processes?action=delete` |
| `tealfabric_retire_process` | GET+PUT | get process then update (`status: inactive`, `<retired>` name prefix) |
| `tealfabric_create_process_step` | POST | `/api/v1/processes?action=create-step` |
| `tealfabric_update_process_step` | PUT | `/api/v1/processes?action=update-step` |
| `tealfabric_delete_process_step` | DELETE | `/api/v1/processes?action=delete-step` |
| `tealfabric_list_documents` | GET | `/api/v1/documents?action=list` |
| `tealfabric_list_document_tree` | GET | `/api/v1/documents?action=tree` |
| `tealfabric_get_document_metadata` | GET | `/api/v1/documents?action=metadata&file_path={path}` |
| `tealfabric_read_document_text` | GET | `/api/v1/documents?action=read-text&file_path={path}` |
| `tealfabric_write_document_text` | PUT | `/api/v1/documents?action=write-text` |
| `tealfabric_download_document` | GET | `/api/v1/documents/download?file_path={path}` |
| `tealfabric_upload_document` | POST | `/api/v1/documents?action=upload` (multipart) |
| `tealfabric_move_document` | PUT | `/api/v1/documents?action=move` |
| `tealfabric_delete_document` | DELETE | `/api/v1/documents?action=delete&path={path}` |

Full API and platform behaviour are documented at [https://tealfabric.io/docs](https://tealfabric.io/docs).

---

## 7. Environment variables

| Variable | Required | Default | Description |
|---------|----------|---------|-------------|
| `TEALFABRIC_API_KEY` | Yes | — | Tealfabric API key. Sent as `X-API-Key`. |
| `TEALFABRIC_API_URL` | No | `https://tealfabric.io` | Base URL of the Tealfabric API (no trailing slash). |

Set these in Cursor’s MCP server config (`env`), or in the shell when running `node dist/index.js` manually.

---

## 8. Security and API keys

- **Do not commit** real API keys. Prefer Cursor’s MCP UI or a local `mcp.json` that is gitignored.
- API keys are **tenant- and user-scoped** in Tealfabric; restrict scopes as the platform supports them.
- The connector only uses **HTTPS** and does not log the key; it sends it only in the `X-API-Key` header to `TEALFABRIC_API_URL`.
- Document `tenant_id` tool parameters are ignored by the API (auth tenant wins).

---

## 9. Project structure

```
mcp-server-tealfabric/
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
├── docs/
│   ├── DEVELOPER.md              # This file
│   ├── MIGRATING.md              # Upgrade checklists
│   └── RELEASE_NOTES_0.2.0.md    # User-facing release notes
├── plugins/tealfabric-mcp/       # Cursor marketplace plugin + skills
├── src/
│   ├── index.ts                  # MCP server: tools + stdio transport
│   └── client.ts                 # Tealfabric API client (fetch + X-API-Key)
└── dist/                         # Built output (after npm run build)
    ├── index.js
    └── client.js
```

- **`src/index.ts`** — Creates the MCP server, registers tools with Zod input schemas, connects `StdioServerTransport`, and forwards tool calls to `client.ts`.
- **`src/client.ts`** — Exports `tealfabric` with methods for each API (webapps, processflow, documents). Uses `TEALFABRIC_API_KEY` and `TEALFABRIC_API_URL`.

---

## 10. Extending the server

To add a new tool:

1. **Add a method** in `src/client.ts` that calls the appropriate Tealfabric endpoint (reuse the existing `request()` pattern and headers).
2. **Register a tool** in `src/index.ts` with `server.registerTool(name, { description, inputSchema }, async (args) => ({ content: resultContent(...) }))`.
3. **Rebuild:** `npm run build`.

Prefer aligning new write fields with platform contracts in `backend-next` (`platform-write-field-contracts.ts`, `platform-action-tools.constants.ts`) when those domains are already exposed here.

For new Tealfabric endpoints or capabilities, use [https://tealfabric.io/docs](https://tealfabric.io/docs) and your environment’s API base (e.g. Swagger at `{TEALFABRIC_API_URL}/api-docs/` if available).

---

## 11. Troubleshooting

| Issue | What to check |
|-------|-------------------------------|
| "TEALFABRIC_API_KEY is not set" | Set `TEALFABRIC_API_KEY` in Cursor’s MCP server `env` (or in the shell). |
| 401 from Tealfabric | Key invalid or revoked. Create a new key in Tealfabric (User → API Keys). |
| 403 Insufficient API key scope | Grant required scopes (e.g. `webapps.write`, `integrations.execute`). |
| Publish fails with "Version number required" | Pass `version` to `tealfabric_publish_webapp`. |
| Create webapp validation errors | Provide `name`, `type`, `page_content`, and `webapp_user_id` (role `webapp_user`). |
| Tools not visible in Cursor | Ensure the MCP server path in `args` points to `dist/index.js` and restart Cursor. |
| "Cannot find module" at runtime | Run `npm run build` and point Cursor to `dist/index.js`, not `src/index.ts`. |
| Wrong tenant or no data | API key is tied to a Tealfabric user/tenant; use a key for the correct account. |

---

## 12. References

- **Tealfabric platform documentation:** [https://tealfabric.io/docs](https://tealfabric.io/docs) — quickstart, ProcessFlow, WebApps, integrations, connectors.
- **MCP (Model Context Protocol):** [https://modelcontextprotocol.io](https://modelcontextprotocol.io) — protocol and concepts.
- **Cursor MCP:** Cursor Settings → Tools & MCP, or [Cursor docs on MCP](https://cursor.com/docs/cookbook/building-mcp-server) for connecting custom servers.

---

## 13. Release notes and migration

- **[RELEASE_NOTES_0.2.0.md](RELEASE_NOTES_0.2.0.md)** — user-facing summary of 0.2.0 (breaking changes, new tools, upgrade steps).
- **[MIGRATING.md](MIGRATING.md)** — checklist for upgrading from 0.1.x.
- **[CHANGELOG.md](../CHANGELOG.md)** — version history.
