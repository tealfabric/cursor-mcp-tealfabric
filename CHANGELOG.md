# Changelog

All notable changes to the Tealfabric MCP Server are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - Released

Full narrative: [docs/RELEASE_NOTES_0.2.0.md](docs/RELEASE_NOTES_0.2.0.md). Migration checklist: [docs/MIGRATING.md](docs/MIGRATING.md).

### Breaking

- **Publish webapp** — `tealfabric_publish_webapp` now requires `version`.
- **Create webapp** — `tealfabric_create_webapp` requires `type`, `page_content`, and `webapp_user_id` (in addition to `name`).
- **List webapps** — replaced ignored `limit` with `page` / `items_per_page`.
- **Test connector** — replaced opaque `payload` with `connector_id` + optional `configuration`.
- **Process create/update** — removed non-persisted fields (`version`, `tags`, `estimated_duration`, `template_id`).
- **Document download** — uses `GET /api/v1/documents/download` (retired `?action=download`).

### Added

- Webapp companions: `tealfabric_unpublish_webapp`, `tealfabric_create_webapp_version`, `tealfabric_delete_webapp`.
- Integration companions: `tealfabric_execute_integration`, `tealfabric_delete_integration`.
- Process companions: `tealfabric_delete_process`, `tealfabric_retire_process`, `tealfabric_delete_process_step`.
- Document companions: `tealfabric_list_document_tree`, `tealfabric_read_document_text`, `tealfabric_write_document_text`.
- Integration/process write fields: `configuration` / `connector_configuration`, `executable_by_ai_agents`, step `language` / `execution_timeout`.
- Webapp create/update fields aligned with platform contracts (auth, public URI, `code_snippet`, `page_head`, etc.).
- Docs: release notes, migration guide, webapp/process/document plugin skills.

### Fixed

- Client paths and schemas aligned with current backend-next REST controllers.

## [0.1.4] - Released

### Fixed

- **Process execute input forwarding** — Fixed `tealfabric_execute_process` payload mapping to send `input_data` (instead of `input`) to `/api/v1/processflow?action=execute-process`, so process input from Cursor is correctly delivered to the ProcessFlow executor.

## [0.1.3] - Released

### Fixed

- **API endpoint prefixing** — Updated connector and integration API calls to use `/api/v1/...` routes to avoid frontend-auth redirects and ensure MCP calls hit API endpoints.

## [0.1.2] - Released

### Added

- **Marketplace packaging** — Added Cursor marketplace manifests, plugin scaffolding, and plugin-level MCP config
- **Skills** — Added low-token MCP usage skills for efficient integration create/update and schema-safe tool calling
- **Validation and CI** — Added marketplace validation script and GitHub Actions workflow for build/validation checks
- **Plugin docs** — Added plugin README with setup and quick verification steps

## [0.1.1] - Released

### Added

- **Connectors** — Added MCP tools to list connectors, test connector configuration, and check OAuth2 requirements
- **Integrations** — Added MCP tools to list integrations with filters/actions and to create/update integrations
- **API coverage** — Extended client and MCP tool registration to support Tealfabric `/connectors` and `/integrations` endpoints
- **Documentation** — Updated `README.md` and developer docs with new connectors/integrations tools and API mapping

## [0.1.0] - Released

### Added

- Initial MCP server for Cursor: webapps, ProcessFlow processes/steps, documents
