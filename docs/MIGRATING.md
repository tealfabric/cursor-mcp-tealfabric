# Migrating Tealfabric Cursor MCP

## 0.1.x → 0.2.0

0.2.0 is a **breaking** release. Rebuild the server and update any tool calls that used the old schemas.

### Checklist

1. Rebuild: `npm install && npm run build`
2. Restart Cursor so it reloads the MCP process
3. Update callers / prompts:
   - [ ] `tealfabric_publish_webapp` — add `version`
   - [ ] `tealfabric_create_webapp` — add `type`, `page_content`, `webapp_user_id`
   - [ ] `tealfabric_list_webapps` — replace `limit` with `page` / `items_per_page`
   - [ ] `tealfabric_test_connector` — replace `payload` with `connector_id` (+ optional `configuration`)
   - [ ] `tealfabric_create_process` / `tealfabric_update_process` — stop sending `version`, `tags`, `estimated_duration`, `template_id`
4. Grant API key scopes if write/execute tools return 403
5. Prefer new tools where useful: webapp version/unpublish, integration execute, process retire, document read-text/write-text/tree

Full narrative: [RELEASE_NOTES_0.2.0.md](RELEASE_NOTES_0.2.0.md).
