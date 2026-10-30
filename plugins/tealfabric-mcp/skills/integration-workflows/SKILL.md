---
name: Tealfabric Integration Workflows
description: Use MCP tools to list, create, update, execute, and delete Tealfabric integrations and connectors.
---

# Tealfabric Integration Workflows

Use these MCP tools in order:

1. `tealfabric_list_connectors` to discover connectors.
2. `tealfabric_get_connector_oauth2_required` to verify auth expectations.
3. `tealfabric_test_connector` with `connector_id` and optional `configuration`.
4. `tealfabric_create_integration` with required `name` + `type` (`api`|`webhook`|`message_queue`|`file_transfer`|`database`|`email`|`sms`|`other`); include `configuration` / `connector_configuration` when needed.
5. `tealfabric_update_integration` to patch metadata, status, or config.
6. `tealfabric_execute_integration` to run the integration (`integration_id`, optional `data` / `async`).
7. `tealfabric_list_integrations` for operational checks and filtering.
8. `tealfabric_delete_integration` only when hard-delete is explicitly required.
