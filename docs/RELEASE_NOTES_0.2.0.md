# Release notes — Tealfabric Cursor MCP 0.2.0

**Date:** 2026-10-29  
**Package:** `mcp-server-tealfabric` / plugin `tealfabric-mcp`  
**Compatibility:** Node.js 18+, Tealfabric backend-next REST APIs

This release aligns the Cursor MCP server with current Tealfabric platform APIs. Several tool inputs are **breaking** relative to 0.1.x. Upgrade Cursor MCP config after rebuilding (`npm run build`), then restart Cursor.

---

## Highlights

- Tool schemas and HTTP paths match backend-next (webapps, integrations, ProcessFlow, documents).
- Full webapp lifecycle: create → version → publish/unpublish → delete.
- Integration execute/delete and process retire/delete/delete-step.
- Document tree browse plus UTF-8 read/write without full binary download.
- Documented API key scopes for each domain.

---

## Breaking changes (migrate from 0.1.x)

| Area | Before (0.1.x) | After (0.2.0) |
|------|----------------|---------------|
| Publish webapp | `webapp_id` only | `webapp_id` **and** `version` (positive integer) |
| Create webapp | `name` (+ optional page fields) | Required: `name`, `type`, `page_content`, `webapp_user_id` |
| List webapps | `limit` (ignored by API) | `page` + `items_per_page` (`10`\|`25`\|`50`\|`100`) |
| Test connector | opaque `payload` object | `connector_id` + optional `configuration` |
| Create/update process | advertised `version`, `tags`, `estimated_duration`, `template_id` | Those fields removed (not persisted by API) |
| Download document | `GET /api/v1/documents?action=download` | `GET /api/v1/documents/download?file_path=...` (client updated; no tool arg change) |

### Example: publish

```json
{
  "tool": "tealfabric_publish_webapp",
  "args": {
    "webapp_id": "YOUR_WEBAPP_ID",
    "version": 1
  }
}
```

### Example: create webapp

```json
{
  "tool": "tealfabric_create_webapp",
  "args": {
    "name": "Support Assistant",
    "type": "webapp",
    "page_content": "<h1>Hello</h1>",
    "webapp_user_id": "USER_ID_WITH_ROLE_WEBAPP_USER"
  }
}
```

Use a user with role **webapp_user**. Do not pass `tenant_admin` as `webapp_user_id`.

### Example: test connector

```json
{
  "tool": "tealfabric_test_connector",
  "args": {
    "connector_id": "YOUR_CONNECTOR_ID",
    "configuration": {}
  }
}
```

---

## New tools

### Webapps

- `tealfabric_unpublish_webapp` — take a webapp offline
- `tealfabric_create_webapp_version` — copy latest version to a new unpublished version
- `tealfabric_delete_webapp` — delete a webapp

### Integrations

- `tealfabric_execute_integration` — run an integration (`data`, `async` optional)
- `tealfabric_delete_integration` — hard-delete an integration

### Processes

- `tealfabric_delete_process` — hard-delete a process
- `tealfabric_retire_process` — soft-retire (`status: inactive`, name prefixed with `<retired>`)
- `tealfabric_delete_process_step` — delete a step

### Documents

- `tealfabric_list_document_tree` — nested directory tree (`max_depth` 1–8)
- `tealfabric_read_document_text` — read UTF-8 text
- `tealfabric_write_document_text` — write UTF-8 text (server creates a backup)

---

## Schema / field improvements

- Integrations: `configuration` / `connector_configuration`, `executable_by_ai_agents`; tighter `type` and `status` enums.
- Processes: `executable_by_ai_agents` on create/update.
- Process steps: `language` (`javascript`\|`typescript`\|`php`), `execution_timeout`; prefer `name` (keep `step_name` alias).
- Webapps: auth (`auth_transport`, `auth_require`), public URI fields, `code_snippet`, `page_head`, and related platform fields on create/update.
- Documents: `tenant_id` tool params are ignored (auth tenant wins); documented as such.

---

## Upgrade steps

1. Pull or install this release.
2. `npm install && npm run build`
3. Point Cursor MCP `args` at `dist/index.js` (unchanged path pattern).
4. Confirm the API key has scopes for the tools you use (`webapps.*`, `integrations.*`, `processflow.*`, `documents.*`, `connectors.read|write`).
5. Restart Cursor.
6. Update any prompts/automations that called the old publish/create/list/test shapes.

---

## Docs

- [Developer guide](DEVELOPER.md) — tools, API mapping, troubleshooting
- [Migration notes](MIGRATING.md) — 0.1.x → 0.2.0 checklist
- [Changelog](../CHANGELOG.md)

---

## Out of scope in 0.2.0

Not exposed in this Cursor MCP package (platform-native MCP may still offer them): datapool/entities/products/users admin tools, process-trigger CRUD, document reviews.
