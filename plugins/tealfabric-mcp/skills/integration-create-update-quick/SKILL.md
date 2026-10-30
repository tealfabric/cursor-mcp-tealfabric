---
name: Integration Create Update Quick
description: Minimal-call pattern for creating and updating a Tealfabric integration.
---

# Integration Create Update Quick

Use this when the task is only integration create/update.

1. Check existing first:

```json
{"tool":"tealfabric_list_integrations","args":{"search":"<name-fragment>"}}
```

2. Create with required fields only (`type` must be a known enum value):

```json
{"tool":"tealfabric_create_integration","args":{"name":"<integration-name>","type":"api"}}
```

3. Update optional metadata / connector config after ID is known:

```json
{"tool":"tealfabric_update_integration","args":{"integration_id":"<id>","description":"<text>","is_active":true,"configuration":{}}}
```

4. Optional execute:

```json
{"tool":"tealfabric_execute_integration","args":{"integration_id":"<id>","async":false}}
```

Rules:
- Allowed `type` values: `api`, `webhook`, `message_queue`, `file_transfer`, `database`, `email`, `sms`, `other`.
- Do not send optional fields during create unless explicitly required.
- If update fails, verify `integration_id` via `tealfabric_list_integrations` with `action:"get"`.
