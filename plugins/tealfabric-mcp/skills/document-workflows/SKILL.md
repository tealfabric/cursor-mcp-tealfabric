---
name: Tealfabric Document Workflows
description: Browse, read, write, upload, and download Tealfabric documents via MCP.
---

# Tealfabric Document Workflows

1. Browse with `tealfabric_list_documents` or `tealfabric_list_document_tree` (`max_depth` 1–8).
2. Inspect with `tealfabric_get_document_metadata`.
3. For UTF-8 text: `tealfabric_read_document_text` / `tealfabric_write_document_text` (write creates a backup).
4. For binary packages: `tealfabric_download_document` (base64) or `tealfabric_upload_document` (`destination_path` + local `file_path`).
5. Reorganize with `tealfabric_move_document`; remove with `tealfabric_delete_document` only when requested.

Notes:
- Auth tenant scopes all paths; `tenant_id` tool args are ignored by the API.
- Download uses `/api/v1/documents/download` (not retired `?action=download`).
