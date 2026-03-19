# Tealfabric MCP Server for Cursor

MCP (Model Context Protocol) server that connects **Cursor IDE** to the **Tealfabric** platform. The model in Cursor can list webapps and processes, publish webapps, get/update process steps, execute processes, and upload/manage documents (package files for delivery).

## Prerequisites

- **Node.js 18+**
- A **Tealfabric API key** (create one in Tealfabric: User settings → API Keys, or `POST /api/v1/api-keys` when logged in)

## Install

```bash
cd cursor-mcp-tealfabric
npm install
npm run build
```

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
| `tealfabric_list_webapps` | List webapps (optional: search, limit) |
| `tealfabric_get_webapp` | Get one webapp by ID (optional version) |
| `tealfabric_create_webapp` | Create a new webapp |
| `tealfabric_update_webapp` | Update webapp (e.g. page_content, name) |
| `tealfabric_publish_webapp` | Publish a webapp |
| `tealfabric_list_processes` | List ProcessFlow processes |
| `tealfabric_get_process` | Get one process by ID |
| `tealfabric_list_process_steps` | List steps of a process |
| `tealfabric_get_process_step` | Get one process step by step_id |
| `tealfabric_execute_process` | Execute a process (optional input) |
| `tealfabric_list_documents` | List documents in a directory |
| `tealfabric_get_document_metadata` | Get file metadata |
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

- **Developer guide (setup, tools, API mapping, extending):** [docs/DEVELOPER.md](docs/DEVELOPER.md)
- **Tealfabric platform docs (WebApps, ProcessFlow, APIs):** [https://tealfabric.io/docs](https://tealfabric.io/docs)
