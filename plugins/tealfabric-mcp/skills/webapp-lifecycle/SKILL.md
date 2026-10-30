---
name: Tealfabric Webapp Lifecycle
description: Create, version, publish, unpublish, and delete Tealfabric webapps via MCP.
---

# Tealfabric Webapp Lifecycle

1. Confirm a user with role `webapp_user` exists. Never use `tenant_admin` as `webapp_user_id`.
2. `tealfabric_list_webapps` (optional search / pagination) to avoid duplicates.
3. `tealfabric_create_webapp` with required fields only:

```json
{
  "tool": "tealfabric_create_webapp",
  "args": {
    "name": "<name>",
    "type": "webapp",
    "page_content": "<html>...</html>",
    "webapp_user_id": "<webapp-user-id>"
  }
}
```

4. Iterate content with `tealfabric_update_webapp`, or branch with `tealfabric_create_webapp_version`.
5. Go live with `tealfabric_publish_webapp` — **`version` is required**.
6. Take offline with `tealfabric_unpublish_webapp`.
7. Remove with `tealfabric_delete_webapp` only when explicitly requested.

Allowed `type` examples: `webapp`, `webhook`, `websocket`, `callback`, `document-viewer`, `document_viewer`.
