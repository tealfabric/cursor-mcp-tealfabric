#!/usr/bin/env node
/**
 * Tealfabric MCP Server for Cursor
 *
 * Exposes tools: list webapps, get/update/publish webapp, list processes/steps,
 * get process/step, create/update process, create/update process step, execute process,
 * list/upload/move/delete documents (package files).
 *
 * Env: TEALFABRIC_API_KEY (required), TEALFABRIC_API_URL (optional, default https://tealfabric.io)
 *
 * Cursor config (.cursor/mcp.json):
 *   "tealfabric": {
 *     "command": "node",
 *     "args": ["/absolute/path/to/mcp-server-tealfabric/dist/index.js"],
 *     "env": { "TEALFABRIC_API_KEY": "tf_live_...", "TEALFABRIC_API_URL": "https://tealfabric.io" }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { tealfabric } from "./client.js";

function jsonContent(text: string) {
  return [{ type: "text" as const, text }];
}

function resultContent(data: unknown) {
  return jsonContent(typeof data === "string" ? data : JSON.stringify(data, null, 2));
}

const server = new McpServer(
  { name: "tealfabric", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// --- Connectors ---
server.registerTool(
  "tealfabric_list_connectors",
  {
    description: "List Tealfabric connectors, get a specific connector, or fetch connector parameters.",
    inputSchema: z.object({
      action: z.enum(["get", "parameters"]).optional().describe("Optional action; omit to list all"),
      connector_id: z.string().optional().describe("Connector ID (for action=get when supported)"),
    }),
  },
  async ({ action, connector_id }) => {
    try {
      const out = await tealfabric.listConnectors({ action, connector_id });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_test_connector",
  {
    description: "Test a connector configuration payload against the Tealfabric connectors test endpoint.",
    inputSchema: z.object({
      payload: z
        .record(z.unknown())
        .describe("Connector configuration payload expected by the selected connector"),
    }),
  },
  async ({ payload }) => {
    try {
      const out = await tealfabric.testConnector(payload);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_get_connector_oauth2_required",
  {
    description: "Check whether a connector requires OAuth2 authentication.",
    inputSchema: z.object({
      connector_id: z.string().describe("Connector ID"),
    }),
  },
  async ({ connector_id }) => {
    try {
      const out = await tealfabric.getConnectorOAuth2Required(connector_id);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

// --- Integrations ---
server.registerTool(
  "tealfabric_list_integrations",
  {
    description:
      "List integrations or query integration details/status/statistics/execution history via action filters.",
    inputSchema: z.object({
      action: z
        .enum(["get", "statistics", "test", "status", "execution-history"])
        .optional()
        .describe("Optional action; omit to list all integrations"),
      integration_id: z.string().optional().describe("Integration ID (for get/test/execution-history)"),
      execution_id: z.string().optional().describe("Execution ID (for status action)"),
      limit: z.number().int().optional().describe("Limit for execution-history action"),
      search: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      is_active: z.union([z.literal(0), z.literal(1)]).optional().describe("1=enabled, 0=disabled"),
      page: z.number().int().min(1).optional(),
      items_per_page: z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]).optional(),
      sort_by: z.enum(["name", "type", "status", "is_active", "created_at", "updated_at"]).optional(),
      sort_direction: z.enum(["ASC", "DESC"]).optional(),
    }),
  },
  async (args) => {
    try {
      const out = await tealfabric.listIntegrations(args);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_create_integration",
  {
    description: "Create a new integration.",
    inputSchema: z.object({
      name: z.string().describe("Integration name"),
      type: z.string().describe("Integration type"),
      description: z.string().optional(),
      connector_id: z.string().optional(),
      status: z.string().optional(),
      is_active: z.boolean().optional().describe("Whether integration is enabled"),
    }),
  },
  async (args) => {
    try {
      const out = await tealfabric.createIntegration(args);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_update_integration",
  {
    description: "Update an existing integration.",
    inputSchema: z.object({
      integration_id: z.string().describe("Integration ID"),
      name: z.string().optional(),
      type: z.string().optional(),
      description: z.string().optional(),
      connector_id: z.string().optional(),
      status: z.string().optional(),
      is_active: z.boolean().optional(),
    }),
  },
  async ({ integration_id, ...body }) => {
    try {
      const out = await tealfabric.updateIntegration(integration_id, body);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

// --- Webapps ---
server.registerTool(
  "tealfabric_list_webapps",
  {
    description: "List Tealfabric webapps for the authenticated tenant. Optionally filter by search or limit.",
    inputSchema: z.object({
      search: z.string().optional().describe("Search by name or description"),
      limit: z.number().optional().describe("Max results (default 50)"),
    }),
  },
  async ({ search, limit }) => {
    try {
      const out = await tealfabric.listWebapps({ search, limit });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_get_webapp",
  {
    description: "Get a single Tealfabric webapp by ID. Optionally request a specific version.",
    inputSchema: z.object({
      webapp_id: z.string().describe("Webapp UUID"),
      version: z.number().optional().describe("Version number (optional)"),
    }),
  },
  async ({ webapp_id, version }) => {
    try {
      const out = await tealfabric.getWebapp(webapp_id, version);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_create_webapp",
  {
    description: "Create a new Tealfabric webapp. Returns the new webapp_id.",
    inputSchema: z.object({
      name: z.string().describe("Webapp name"),
      description: z.string().optional(),
      page_content: z.string().optional(),
      page_header: z.string().optional(),
      page_footer: z.string().optional(),
      custom_css: z.string().optional(),
      custom_js: z.string().optional(),
      process_id: z.string().optional().describe("Link to a process ID"),
    }),
  },
  async (args) => {
    try {
      const out = await tealfabric.createWebapp(args);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_update_webapp",
  {
    description: "Update an existing Tealfabric webapp (e.g. page_content, name).",
    inputSchema: z.object({
      webapp_id: z.string().describe("Webapp UUID"),
      name: z.string().optional(),
      description: z.string().optional(),
      page_content: z.string().optional(),
      page_header: z.string().optional(),
      page_footer: z.string().optional(),
      custom_css: z.string().optional(),
      custom_js: z.string().optional(),
      process_id: z.string().nullable().optional(),
    }),
  },
  async ({ webapp_id, ...body }) => {
    try {
      const out = await tealfabric.updateWebapp(webapp_id, body);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_publish_webapp",
  {
    description: "Publish a Tealfabric webapp (make the current version live).",
    inputSchema: z.object({ webapp_id: z.string().describe("Webapp UUID") }),
  },
  async ({ webapp_id }) => {
    try {
      const out = await tealfabric.publishWebapp(webapp_id);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

// --- Processes ---
server.registerTool(
  "tealfabric_list_processes",
  {
    description: "List Tealfabric ProcessFlow processes for the authenticated tenant.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const out = await tealfabric.listProcesses();
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_get_process",
  {
    description: "Get a single Tealfabric process by ID.",
    inputSchema: z.object({ process_id: z.string().describe("Process ID") }),
  },
  async ({ process_id }) => {
    try {
      const out = await tealfabric.getProcess(process_id);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_list_process_steps",
  {
    description: "List process steps for a given process.",
    inputSchema: z.object({ process_id: z.string().describe("Process ID") }),
  },
  async ({ process_id }) => {
    try {
      const out = await tealfabric.listProcessSteps(process_id);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_get_process_step",
  {
    description: "Get a single process step by step_id.",
    inputSchema: z.object({ step_id: z.string().describe("Step ID") }),
  },
  async ({ step_id }) => {
    try {
      const out = await tealfabric.getProcessStep(step_id);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_execute_process",
  {
    description: "Execute a Tealfabric process with optional input.",
    inputSchema: z.object({
      process_id: z.string().describe("Process ID"),
      input: z.record(z.unknown()).optional().describe("Process input payload"),
    }),
  },
  async ({ process_id, input }) => {
    try {
      const out = await tealfabric.executeProcess(process_id, input);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_create_process",
  {
    description: "Create a new Tealfabric process (process flow). Returns the new process_id.",
    inputSchema: z.object({
      name: z.string().describe("Process name"),
      description: z.string().optional(),
      type: z.string().optional(),
      status: z.enum(["draft", "active", "inactive", "archived"]).optional().default("draft"),
      version: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      configuration: z.record(z.unknown()).optional(),
      is_template: z.boolean().optional(),
      template_id: z.string().optional(),
      estimated_duration: z.number().optional(),
      priority: z.string().optional(),
    }),
  },
  async (args) => {
    try {
      const out = await tealfabric.createProcess(args);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_update_process",
  {
    description: "Update an existing Tealfabric process (process flow).",
    inputSchema: z.object({
      process_id: z.string().describe("Process ID"),
      name: z.string().optional(),
      description: z.string().optional(),
      type: z.string().optional(),
      status: z.enum(["draft", "active", "inactive", "archived"]).optional(),
      version: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      configuration: z.record(z.unknown()).optional(),
      is_template: z.boolean().optional(),
      template_id: z.string().optional(),
      estimated_duration: z.number().optional(),
      priority: z.string().optional(),
    }),
  },
  async ({ process_id, ...body }) => {
    try {
      const out = await tealfabric.updateProcess(process_id, body);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_create_process_step",
  {
    description: "Create a new process step in a process flow. Returns the new step_id.",
    inputSchema: z.object({
      process_id: z.string().describe("Process ID to add the step to"),
      step_name: z.string().describe("Step name"),
      name: z.string().optional().describe("Alias for step_name"),
      step_type: z.string().optional().default("action"),
      description: z.string().optional(),
      code_snippet: z.string().optional(),
      sequence: z.number().optional(),
      position_x: z.number().optional(),
      position_y: z.number().optional(),
      estimated_duration: z.number().optional(),
      assigned_user_id: z.string().optional(),
      step_status: z.string().optional(),
      input_schema: z.record(z.unknown()).optional(),
      output_schema: z.record(z.unknown()).optional(),
      configuration: z.record(z.unknown()).optional(),
    }),
  },
  async (args) => {
    try {
      const out = await tealfabric.createProcessStep(args);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_update_process_step",
  {
    description: "Update an existing process step in a process flow.",
    inputSchema: z.object({
      step_id: z.string().describe("Step ID"),
      step_name: z.string().optional(),
      name: z.string().optional().describe("Alias for step_name"),
      step_type: z.string().optional(),
      description: z.string().optional(),
      code_snippet: z.string().optional(),
      sequence: z.number().optional(),
      position_x: z.number().optional(),
      position_y: z.number().optional(),
      estimated_duration: z.number().optional(),
      assigned_user_id: z.string().optional(),
      step_status: z.string().optional(),
      input_schema: z.record(z.unknown()).optional(),
      output_schema: z.record(z.unknown()).optional(),
      configuration: z.record(z.unknown()).optional(),
    }),
  },
  async ({ step_id, ...body }) => {
    try {
      const out = await tealfabric.updateProcessStep(step_id, body);
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

// --- Documents (package files for delivery) ---
server.registerTool(
  "tealfabric_list_documents",
  {
    description:
      "List documents/files in a Tealfabric documents directory. Use for browsing package files.",
    inputSchema: z.object({
      path: z.string().optional().describe("Directory path (e.g. packages/, or root if omitted)"),
      tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
    }),
  },
  async ({ path, tenant_id }) => {
    try {
      const out = await tealfabric.listDocuments({ path, tenant_id });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_get_document_metadata",
  {
    description: "Get metadata for a document/file in Tealfabric documents storage.",
    inputSchema: z.object({
      file_path: z.string().describe("Full path to the file (e.g. packages/report-v1.zip)"),
      tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
    }),
  },
  async ({ file_path, tenant_id }) => {
    try {
      const out = await tealfabric.getDocumentMetadata({ file_path, tenant_id });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_download_document",
  {
    description:
      "Download a document/file from Tealfabric documents storage. Returns file content as base64 for binary-safe transfer.",
    inputSchema: z.object({
      file_path: z.string().describe("Full path to the file (e.g. packages/report-v1.zip)"),
      tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
    }),
  },
  async ({ file_path, tenant_id }) => {
    try {
      const out = await tealfabric.downloadDocument({ file_path, tenant_id });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_upload_document",
  {
    description:
      "Upload a file to Tealfabric documents storage. Use to publish built package files for delivery. The file is stored in destination_path using the uploaded file's name.",
    inputSchema: z.object({
      destination_path: z
        .string()
        .describe("Directory path on the server (without filename). File keeps its original name (e.g. packages/ or packages/reports/)"),
      file_path: z
        .string()
        .describe("Local filesystem path to the file to upload (e.g. ./dist/package.zip)"),
      tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
    }),
  },
  async ({ destination_path, file_path, tenant_id }) => {
    try {
      const out = await tealfabric.uploadDocument({ destination_path, file_path, tenant_id });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_move_document",
  {
    description:
      "Move or rename a file/directory in Tealfabric documents storage. Use to update package paths or reorganize.",
    inputSchema: z.object({
      old_path: z.string().describe("Current path of the file or directory"),
      new_path: z.string().describe("Destination path"),
      tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
    }),
  },
  async ({ old_path, new_path, tenant_id }) => {
    try {
      const out = await tealfabric.moveDocument({ old_path, new_path, tenant_id });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

server.registerTool(
  "tealfabric_delete_document",
  {
    description: "Delete a file or directory from Tealfabric documents storage.",
    inputSchema: z.object({
      path: z.string().describe("Path to the file or directory to delete"),
      tenant_id: z.string().optional().describe("Tenant ID (defaults to authenticated tenant)"),
    }),
  },
  async ({ path, tenant_id }) => {
    try {
      const out = await tealfabric.deleteDocument({ path, tenant_id });
      return { content: resultContent(out) };
    } catch (e) {
      return { content: jsonContent(`Error: ${e instanceof Error ? e.message : String(e)}`) };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
