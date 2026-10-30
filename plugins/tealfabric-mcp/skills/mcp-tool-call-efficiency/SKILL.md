---
name: Tealfabric MCP Tool Call Efficiency
description: Reduce iterations and token use by following strict, known-good tool call patterns.
---

# Tealfabric MCP Tool Call Efficiency

Use this skill when you need reliable MCP calls with minimal retries.

## Objective

- Minimize trial-and-error with tool schemas.
- Use short call sequences that return actionable data quickly.
- Prefer deterministic payloads and avoid over-supplying fields.

## Core Rules

1. Start with a list tool before create/update unless the user already gave exact IDs.
2. Send only required fields first; add optional fields in follow-up updates.
3. Keep payload keys exactly aligned to tool schema names.
4. For enum-like fields, reuse known values from docs/examples.
5. If a call fails, fix one parameter at a time (do not rewrite whole payload blindly).

## Fast Paths

### Connectors: find and validate

1. `tealfabric_list_connectors` with empty input.
2. If connector identified, call `tealfabric_get_connector_oauth2_required`.
3. Call `tealfabric_test_connector` with `connector_id` and optional `configuration`.

```json
{
  "tool": "tealfabric_test_connector",
  "args": {
    "connector_id": "YOUR_CONNECTOR_ID",
    "configuration": {}
  }
}
```

### Integrations: create with minimum risk

1. `tealfabric_list_integrations` to avoid duplicates.
2. `tealfabric_create_integration` with required fields only (`name`, `type`).
3. `tealfabric_update_integration` for optional metadata once ID is confirmed.

```json
{
  "tool": "tealfabric_create_integration",
  "args": {
    "name": "Salesforce Sync",
    "type": "api"
  }
}
```

### Webapps: create then publish

1. Ensure a `webapp_user` exists; never use `tenant_admin` as `webapp_user_id`.
2. `tealfabric_create_webapp` with required `name`, `type`, `page_content`, `webapp_user_id`.
3. Edit with `tealfabric_update_webapp` or `tealfabric_create_webapp_version` as needed.
4. `tealfabric_publish_webapp` with **both** `webapp_id` and `version`.

```json
{
  "tool": "tealfabric_publish_webapp",
  "args": {
    "webapp_id": "YOUR_WEBAPP_ID",
    "version": 1
  }
}
```

### Documents: text vs binary

- Prefer `tealfabric_read_document_text` / `tealfabric_write_document_text` for UTF-8 files.
- Use `tealfabric_download_document` for binary packages (base64).
- Use `tealfabric_list_document_tree` when browsing nested paths.

## Recovery Path (When Calls Fail)

1. Read the error and identify whether it is:
   - missing required key
   - invalid enum/value
   - wrong identifier key name
   - insufficient API key scope
2. Retry once with only the corrected field(s).
3. If still failing, call relevant list/get tool to refresh IDs/state.

## Anti-Patterns to Avoid

- Passing large speculative payloads to create endpoints.
- Mixing connector and integration IDs in the same field.
- Publishing a webapp without `version`.
- Creating a webapp without `type`, `page_content`, or `webapp_user_id`.
- Using retired document download `?action=download` (server uses `/documents/download`).
- Repeated retries without changing payload semantics.
- Adding undocumented keys.
