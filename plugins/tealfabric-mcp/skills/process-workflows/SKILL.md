---
name: Tealfabric Process Workflows
description: Create and manage ProcessFlow processes and steps via MCP.
---

# Tealfabric Process Workflows

1. `tealfabric_list_processes` / `tealfabric_get_process` before mutating.
2. `tealfabric_create_process` with `name` (optional `status`, `category`, `configuration`, `executable_by_ai_agents`).
3. Add steps with `tealfabric_create_process_step` using `name` (or `step_name`), optional `language` (`javascript`|`typescript`|`php`) and `execution_timeout`.
4. Run with `tealfabric_execute_process` (`process_id`, optional `input` → sent as `input_data`).
5. Prefer `tealfabric_retire_process` over hard delete when keeping history.
6. Use `tealfabric_delete_process` / `tealfabric_delete_process_step` only when explicitly required.

Do not send process fields that the API ignores: `version`, `tags`, `estimated_duration`, `template_id`.
