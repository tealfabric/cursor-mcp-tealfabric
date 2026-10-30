# Tealfabric MCP Server for Cursor

MCP (Model Context Protocol) server that connects **Cursor IDE** to the **Tealfabric** platform. The model in Cursor can manage connectors, integrations, webapps, ProcessFlow processes/steps, and documents (including text read/write and package delivery).

## Prerequisites

- **Node.js 18+**
- A **Tealfabric API key** (create one in Tealfabric: User settings → API Keys, or `POST /api/v1/api-keys` when logged in)
- Key scopes as needed: `connectors.read|write`, `integrations.read|write|execute|delete`, `webapps.read|write`, `processflow.read|write`, `documents.read|write`

## Install

```bash
cd cursor-mcp-tealfabric
npm install
npm run build
```

Upgrading from **0.1.x**? Read [docs/RELEASE_NOTES_0.2.0.md](docs/RELEASE_NOTES_0.2.0.md) and [docs/MIGRATING.md](docs/MIGRATING.md) — publish, create-webapp, list-webapps, and test-connector inputs changed.

## Cursor setup

1. **Create an API key** in Tealfabric (if you don’t have one).
2. **Add the MCP server** in Cursor:
   - **Cursor Settings** (Cmd+, / Ctrl+,) → **Tools & MCP** → **Add new MCP server**
   - Or create/edit **`.cursor/mcp.json`** in your project (or `~/.cursor/mcp.json` for global):

```json
{
  "mcpServers": {
    "tealfabric": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/cursor-mcp-tealfabric/dist/index.js"],
      "env": {
        "TEALFABRIC_API_KEY": "YOUR_API_KEY_HERE",
        "TEALFABRIC_API_URL": "https://tealfabric.io"
      }
    }
  }
}
```

Replace:

- `YOUR_API_KEY_HERE` with your Tealfabric API key (e.g. `tf_live_...`).
- `/ABSOLUTE/PATH/TO/cursor-mcp-tealfabric/...` with the real path to this repo (e.g. `/Users/username/src/cursor-mcp-tealfabric/dist/index.js`).

3. **Restart Cursor** so it picks up the new server.

## Tools exposed to Cursor

| Tool | Description |
|------|-------------|
| `tealfabric_list_connectors` | List connectors (optional action: get, parameters) |
| `tealfabric_test_connector` | Test connector (`connector_id` + optional `configuration`) |
| `tealfabric_get_connector_oauth2_required` | Check whether connector requires OAuth2 |
| `tealfabric_list_integrations` | List integrations or query by action/filter |
| `tealfabric_create_integration` | Create a new integration |
| `tealfabric_update_integration` | Update an existing integration |
| `tealfabric_execute_integration` | Execute an integration (optional async/data) |
| `tealfabric_delete_integration` | Delete an integration |
| `tealfabric_list_webapps` | List webapps (`page` / `items_per_page`, filters) |
| `tealfabric_get_webapp` | Get one webapp by ID (optional version) |
| `tealfabric_create_webapp` | Create webapp (`name`, `type`, `page_content`, `webapp_user_id`) |
| `tealfabric_update_webapp` | Update webapp (content, auth, public URI, etc.) |
| `tealfabric_publish_webapp` | Publish a webapp **version** (requires `version`) |
| `tealfabric_unpublish_webapp` | Unpublish a webapp |
| `tealfabric_create_webapp_version` | Create a new unpublished webapp version |
| `tealfabric_delete_webapp` | Delete a webapp |
| `tealfabric_list_processes` | List ProcessFlow processes |
| `tealfabric_get_process` | Get one process by ID |
| `tealfabric_list_process_steps` | List steps of a process |
| `tealfabric_get_process_step` | Get one process step by step_id |
| `tealfabric_execute_process` | Execute a process (optional input) |
| `tealfabric_create_process` | Create a new process |
| `tealfabric_update_process` | Update an existing process |
| `tealfabric_delete_process` | Hard-delete a process |
| `tealfabric_retire_process` | Soft-retire a process (`<retired>` + inactive) |
| `tealfabric_create_process_step` | Create a new step (`name`/`step_name`, optional `language`) |
| `tealfabric_update_process_step` | Update an existing process step |
| `tealfabric_delete_process_step` | Delete a process step |
| `tealfabric_list_documents` | List documents in a directory |
| `tealfabric_list_document_tree` | List documents as a tree |
| `tealfabric_get_document_metadata` | Get file metadata |
| `tealfabric_read_document_text` | Read UTF-8 text document |
| `tealfabric_write_document_text` | Write UTF-8 text document |
| `tealfabric_download_document` | Download a file (returns base64 payload) |
| `tealfabric_upload_document` | Upload a file (e.g. built package) |
| `tealfabric_move_document` | Move or rename file/directory |
| `tealfabric_delete_document` | Delete file or directory |

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TEALFABRIC_API_KEY` | Yes | — | Tealfabric API key (X-API-Key / Bearer) |
| `TEALFABRIC_API_URL` | No | `https://tealfabric.io` | Tealfabric base URL |

## Security

- Do **not** commit `.cursor/mcp.json` if it contains your real API key. Use `.cursor/mcp.json.example` (without the key) and add `mcp.json` to `.gitignore`, or use Cursor’s UI so the key stays local.
- API keys are scoped to your user/tenant in Tealfabric; create keys with minimal required scopes if your platform supports it.

## Documentation

- **Release notes (0.2.0):** [docs/RELEASE_NOTES_0.2.0.md](docs/RELEASE_NOTES_0.2.0.md)
- **Migrating from 0.1.x:** [docs/MIGRATING.md](docs/MIGRATING.md)
- **Developer guide (setup, tools, API mapping, extending):** [docs/DEVELOPER.md](docs/DEVELOPER.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Tealfabric platform docs (WebApps, ProcessFlow, APIs):** [https://tealfabric.io/docs](https://tealfabric.io/docs)

## Related projects

Tealfabric exposes the same MCP capabilities across different host environments. Each repo ships the appropriate packaging and setup for its platform:

| Host | Repository |
|------|------------|
| **Cursor** (this repository) | [tealfabric/cursor-mcp-tealfabric](https://github.com/tealfabric/cursor-mcp-tealfabric) |
| **Claude** (Claude Code and compatible MCP clients) | [tealfabric/claude-mcp-tealfabric](https://github.com/tealfabric/claude-mcp-tealfabric) |
| **Lovable** | [tealfabric/lovable-mcp-tealfabric](https://github.com/tealfabric/lovable-mcp-tealfabric) |
