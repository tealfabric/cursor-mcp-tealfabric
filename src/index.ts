#!/usr/bin/env node
/**
 * Tealfabric MCP Server for Cursor
 *
 * Exposes tools: list webapps, get/update/publish webapp, list processes/steps,
 * get process/step, execute process, list/upload/move/delete documents (package files).
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
  "tealfabric_upload_document",
  {
    description:
      "Upload a file to Tealfabric documents storage. Use to publish built package files for delivery. Overwrites if destination_path exists.",
    inputSchema: z.object({
      destination_path: z
        .string()
        .describe("Server path where the file will be stored (e.g. packages/report-v1.zip)"),
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
