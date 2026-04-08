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
3. Call `tealfabric_test_connector` with minimal connector config payload.

Example minimal envelopes:

```json
{
  "tool": "tealfabric_list_connectors",
  "args": {}
}
```

```json
{
  "tool": "tealfabric_get_connector_oauth2_required",
  "args": {
    "connector_id": "YOUR_CONNECTOR_ID"
  }
}
```

```json
{
  "tool": "tealfabric_test_connector",
  "args": {
    "payload": {
      "connector_id": "YOUR_CONNECTOR_ID"
    }
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
    "type": "salesforce"
  }
}
```

```json
{
  "tool": "tealfabric_update_integration",
  "args": {
    "integration_id": "YOUR_INTEGRATION_ID",
    "description": "Sync leads nightly",
    "is_active": true
  }
}
```

## Recovery Path (When Calls Fail)

1. Read the error and identify whether it is:
   - missing required key
   - invalid enum/value
   - wrong identifier key name
2. Retry once with only the corrected field(s).
3. If still failing, call relevant list/get tool to refresh IDs/state.

## Anti-Patterns to Avoid

- Passing large speculative payloads to create endpoints.
- Mixing connector and integration IDs in the same field.
- Repeated retries without changing payload semantics.
- Adding undocumented keys.
