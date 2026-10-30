/**
 * Tealfabric API client for MCP server.
 * Uses TEALFABRIC_API_KEY (X-API-Key) and TEALFABRIC_API_URL.
 *
 * Aligned with backend-next REST contracts (webapps, integrations, processflow, documents).
 */

import { readFile } from "fs/promises";
import { basename } from "path";

const getBaseUrl = (): string => {
  const url = process.env.TEALFABRIC_API_URL || "https://tealfabric.io";
  return url.replace(/\/$/, "");
};

const getHeaders = (): Record<string, string> => {
  const key = process.env.TEALFABRIC_API_KEY;
  if (!key) {
    throw new Error("TEALFABRIC_API_KEY is not set");
  }
  return {
    "Content-Type": "application/json",
    "X-API-Key": key,
  };
};

const getApiKeyHeaders = (): Record<string, string> => {
  const key = process.env.TEALFABRIC_API_KEY;
  if (!key) {
    throw new Error("TEALFABRIC_API_KEY is not set");
  }
  return { "X-API-Key": key };
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    method,
    headers: getHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Tealfabric API ${res.status}: ${text || res.statusText}`);
  }
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export type IntegrationType =
  | "api"
  | "webhook"
  | "message_queue"
  | "file_transfer"
  | "database"
  | "email"
  | "sms"
  | "other";

export type IntegrationStatus = "active" | "inactive" | "error" | "testing";

export type WebappType =
  | "webapp"
  | "webhook"
  | "websocket"
  | "callback"
  | "document-viewer"
  | "document_viewer";

export type ProcessStatus = "draft" | "active" | "inactive" | "archived";

export type AuthTransport = "cookie" | "bearer" | "both";

export type StepLanguage = "javascript" | "typescript" | "php";

export const tealfabric = {
  // --- Connectors ---
  async listConnectors(params?: {
    action?: "get" | "parameters";
    connector_id?: string;
  }) {
    const q = new URLSearchParams();
    if (params?.action) q.set("action", params.action);
    if (params?.connector_id) q.set("connector_id", params.connector_id);
    return request<{ success: boolean; data?: unknown; connectors?: unknown[] }>(
      "GET",
      `/api/v1/connectors${q.toString() ? `?${q.toString()}` : ""}`
    );
  },

  async testConnector(params: {
    connector_id: string;
    configuration?: Record<string, unknown>;
  }) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "POST",
      "/api/v1/connectors?action=test",
      {
        connector_id: params.connector_id,
        ...(params.configuration !== undefined
          ? { configuration: params.configuration }
          : {}),
      }
    );
  },

  async getConnectorOAuth2Required(connectorId: string) {
    return request<{
      success: boolean;
      oauth2_required?: boolean;
      authentication_type?: string;
    }>("GET", `/api/v1/connectors/${encodeURIComponent(connectorId)}/oauth2-required`);
  },

  // --- Integrations ---
  async listIntegrations(params?: {
    action?: "get" | "statistics" | "test" | "status" | "execution-history";
    integration_id?: string;
    execution_id?: string;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    is_active?: 0 | 1;
    page?: number;
    items_per_page?: 10 | 25 | 50 | 100;
    sort_by?: "name" | "type" | "status" | "is_active" | "created_at" | "updated_at";
    sort_direction?: "ASC" | "DESC";
  }) {
    const q = new URLSearchParams();
    if (params?.action) q.set("action", params.action);
    if (params?.integration_id) q.set("integration_id", params.integration_id);
    if (params?.execution_id) q.set("execution_id", params.execution_id);
    if (params?.limit != null) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    if (params?.type) q.set("type", params.type);
    if (params?.status) q.set("status", params.status);
    if (params?.is_active != null) q.set("is_active", String(params.is_active));
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.items_per_page != null) q.set("items_per_page", String(params.items_per_page));
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.sort_direction) q.set("sort_direction", params.sort_direction);
    return request<{ success: boolean; data?: unknown; integrations?: unknown[] }>(
      "GET",
      `/api/v1/integrations${q.toString() ? `?${q.toString()}` : ""}`
    );
  },

  async createIntegration(body: {
    name: string;
    type: IntegrationType | string;
    description?: string;
    connector_id?: string;
    status?: IntegrationStatus | string;
    is_active?: boolean;
    configuration?: Record<string, unknown>;
    connector_configuration?: Record<string, unknown>;
    executable_by_ai_agents?: boolean;
  }) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "POST",
      "/api/v1/integrations?action=create",
      body
    );
  },

  async updateIntegration(
    integrationId: string,
    body: {
      name?: string;
      type?: IntegrationType | string;
      description?: string;
      connector_id?: string;
      status?: IntegrationStatus | string;
      is_active?: boolean;
      configuration?: Record<string, unknown>;
      connector_configuration?: Record<string, unknown>;
      executable_by_ai_agents?: boolean;
    }
  ) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "PUT",
      "/api/v1/integrations?action=update",
      { integration_id: integrationId, ...body }
    );
  },

  async executeIntegration(params: {
    integration_id: string;
    data?: Record<string, unknown>;
    async?: boolean;
  }) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "POST",
      "/api/v1/integrations?action=execute",
      {
        integration_id: params.integration_id,
        ...(params.data !== undefined ? { data: params.data } : {}),
        ...(params.async !== undefined ? { async: params.async } : {}),
      }
    );
  },

  async deleteIntegration(integrationId: string) {
    return request<{ success: boolean; message?: string }>(
      "DELETE",
      "/api/v1/integrations?action=delete",
      { integration_id: integrationId }
    );
  },

  // --- Webapps ---
  async listWebapps(params?: {
    search?: string;
    page?: number;
    items_per_page?: 10 | 25 | 50 | 100;
    type?: string;
    published_only?: boolean;
    process_id?: string;
    sort_by?: "name" | "type" | "created_at" | "updated_at" | "version";
    sort_direction?: "ASC" | "DESC";
  }) {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.items_per_page != null) q.set("items_per_page", String(params.items_per_page));
    if (params?.type) q.set("type", params.type);
    if (params?.published_only != null) q.set("published_only", params.published_only ? "1" : "0");
    if (params?.process_id) q.set("process_id", params.process_id);
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.sort_direction) q.set("sort_direction", params.sort_direction);
    const query = q.toString();
    return request<{ success: boolean; webapps?: unknown[]; data?: unknown; count?: number }>(
      "GET",
      `/api/v1/webapps${query ? `?${query}` : ""}`
    );
  },

  async getWebapp(webappId: string, version?: number) {
    const q = version != null ? `?version=${version}` : "";
    return request<{ success: boolean; webapp?: unknown }>(
      "GET",
      `/api/v1/webapps/${encodeURIComponent(webappId)}${q}`
    );
  },

  async createWebapp(body: {
    name: string;
    type: WebappType | string;
    page_content: string;
    webapp_user_id: string;
    description?: string;
    code_snippet?: string;
    page_head?: string;
    page_header?: string;
    page_footer?: string;
    custom_css?: string;
    custom_js?: string;
    process_id?: string;
    version?: number;
    is_published?: boolean;
    http_headers?: unknown;
    custom_security_policy?: string;
    custom_referrer_policy?: string;
    auth_transport?: AuthTransport;
    auth_require?: boolean;
    public_uri_host?: string;
    public_uri_path?: string;
    public_uris?: unknown;
  }) {
    return request<{
      success: boolean;
      webapp_id?: string;
      webapp?: { webapp_id: string };
      error?: string;
      errors?: string[];
    }>("POST", "/api/v1/webapps", body);
  },

  async updateWebapp(
    webappId: string,
    body: {
      name?: string;
      description?: string;
      webapp_user_id?: string;
      process_id?: string | null;
      page_content?: string;
      code_snippet?: string;
      page_head?: string;
      page_header?: string;
      page_footer?: string;
      custom_css?: string;
      custom_js?: string;
      http_headers?: unknown;
      custom_security_policy?: string;
      custom_referrer_policy?: string;
      auth_transport?: AuthTransport;
      auth_require?: boolean;
      public_uri_host?: string;
      public_uri_path?: string;
      public_uris?: unknown;
      version?: number;
      version_id?: string | number;
    }
  ) {
    return request<{ success: boolean; webapp?: unknown; error?: string }>(
      "PUT",
      `/api/v1/webapps/${encodeURIComponent(webappId)}`,
      body
    );
  },

  async publishWebapp(webappId: string, version: number) {
    return request<{ success: boolean; message?: string; error?: string; errors?: string[] }>(
      "POST",
      `/api/v1/webapps/${encodeURIComponent(webappId)}/publish`,
      { version }
    );
  },

  async unpublishWebapp(webappId: string) {
    return request<{ success: boolean; message?: string; error?: string }>(
      "POST",
      `/api/v1/webapps/${encodeURIComponent(webappId)}/unpublish`,
      {}
    );
  },

  async createWebappVersion(webappId: string) {
    return request<{ success: boolean; version?: number; message?: string; error?: string }>(
      "POST",
      `/api/v1/webapps/${encodeURIComponent(webappId)}/version`,
      {}
    );
  },

  async deleteWebapp(webappId: string) {
    return request<{ success: boolean; message?: string; error?: string }>(
      "DELETE",
      `/api/v1/webapps/${encodeURIComponent(webappId)}`
    );
  },

  // --- Processes ---
  async listProcesses() {
    return request<{ success: boolean; processes?: unknown[]; data?: unknown }>(
      "GET",
      "/api/v1/processflow?action=processes"
    );
  },

  async getProcess(processId: string) {
    return request<{ success: boolean; process?: unknown; data?: unknown }>(
      "GET",
      `/api/v1/processflow?action=process&process_id=${encodeURIComponent(processId)}`
    );
  },

  async listProcessSteps(processId: string) {
    return request<{ success: boolean; steps?: unknown[]; data?: unknown }>(
      "GET",
      `/api/v1/processflow?action=steps&process_id=${encodeURIComponent(processId)}`
    );
  },

  async getProcessStep(stepId: string) {
    return request<{ success: boolean; step?: unknown; data?: unknown }>(
      "GET",
      `/api/v1/processflow?action=step&step_id=${encodeURIComponent(stepId)}`
    );
  },

  async executeProcess(processId: string, input?: Record<string, unknown>) {
    return request<{ success: boolean; result?: unknown; error?: string }>(
      "POST",
      "/api/v1/processflow?action=execute-process",
      { process_id: processId, input_data: input ?? {} }
    );
  },

  async createProcess(body: {
    name: string;
    description?: string;
    type?: string;
    status?: ProcessStatus;
    category?: string;
    configuration?: Record<string, unknown>;
    is_template?: boolean;
    priority?: string;
    executable_by_ai_agents?: boolean;
  }) {
    return request<{ success: boolean; data?: { process_id?: string }; error?: string }>(
      "POST",
      "/api/v1/processes?action=create",
      body
    );
  },

  async updateProcess(
    processId: string,
    body: {
      name?: string;
      description?: string;
      type?: string;
      status?: ProcessStatus;
      category?: string;
      configuration?: Record<string, unknown>;
      is_template?: boolean;
      priority?: string;
      executable_by_ai_agents?: boolean;
    }
  ) {
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "PUT",
      "/api/v1/processes?action=update",
      { process_id: processId, ...body }
    );
  },

  async deleteProcess(processId: string) {
    return request<{ success: boolean; data?: unknown; message?: string }>(
      "DELETE",
      "/api/v1/processes?action=delete",
      { process_id: processId }
    );
  },

  /**
   * Soft-retire a process (mirrors ProcessflowService.retireProcess).
   * No tenant REST retire route exists; implemented via get + update.
   */
  async retireProcess(processId: string) {
    const got = await this.getProcess(processId);
    const process =
      (got as { process?: Record<string, unknown>; data?: Record<string, unknown> }).process ??
      (got as { data?: Record<string, unknown> }).data ??
      (got as Record<string, unknown>);
    const currentName = String(
      (process as { name?: unknown })?.name ?? ""
    ).trim();
    if (!currentName && !(got as { success?: boolean }).success) {
      throw new Error(`Tealfabric API: process not found (${processId})`);
    }
    const retiredName = currentName.startsWith("<retired>")
      ? currentName
      : `<retired> ${currentName || processId}`;
    return this.updateProcess(processId, {
      name: retiredName,
      status: "inactive",
    });
  },

  async createProcessStep(body: {
    process_id: string;
    name?: string;
    step_name?: string;
    step_type?: string;
    description?: string;
    code_snippet?: string;
    sequence?: number;
    sequence_order?: number;
    input_schema?: Record<string, unknown>;
    output_schema?: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    language?: StepLanguage | string;
    execution_timeout?: number;
  }) {
    const { name, step_name, ...rest } = body;
    const resolvedName = name ?? step_name;
    return request<{ success: boolean; data?: { step_id?: string }; error?: string }>(
      "POST",
      "/api/v1/processes?action=create-step",
      {
        ...rest,
        ...(resolvedName !== undefined ? { name: resolvedName, step_name: resolvedName } : {}),
      }
    );
  },

  async updateProcessStep(
    stepId: string,
    body: {
      name?: string;
      step_name?: string;
      step_type?: string;
      description?: string;
      code_snippet?: string;
      sequence?: number;
      sequence_order?: number;
      position_x?: number;
      position_y?: number;
      input_schema?: Record<string, unknown>;
      output_schema?: Record<string, unknown>;
      configuration?: Record<string, unknown>;
      language?: StepLanguage | string;
      execution_timeout?: number;
    }
  ) {
    const { name, step_name, ...rest } = body;
    const resolvedName = name ?? step_name;
    return request<{ success: boolean; data?: unknown; error?: string }>(
      "PUT",
      "/api/v1/processes?action=update-step",
      {
        step_id: stepId,
        ...rest,
        ...(resolvedName !== undefined ? { name: resolvedName, step_name: resolvedName } : {}),
      }
    );
  },

  async deleteProcessStep(stepId: string) {
    return request<{ success: boolean; data?: unknown; message?: string }>(
      "DELETE",
      "/api/v1/processes?action=delete-step",
      { step_id: stepId }
    );
  },

  // --- Documents ---
  // Note: tenant_id query params are ignored by the API (auth tenant wins).
  async listDocuments(params?: { path?: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "list" });
    if (params?.path) q.set("path", params.path);
    if (params?.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async listDocumentTree(params?: {
    path?: string;
    max_depth?: number;
    tenant_id?: string;
  }) {
    const q = new URLSearchParams({ action: "tree" });
    if (params?.path) q.set("path", params.path);
    if (params?.max_depth != null) q.set("max_depth", String(params.max_depth));
    if (params?.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async getDocumentMetadata(params: { file_path: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "metadata", file_path: params.file_path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async readDocumentText(params: { file_path: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "read-text", file_path: params.file_path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "GET",
      `/api/v1/documents?${q.toString()}`
    );
  },

  async writeDocumentText(params: {
    file_path: string;
    content: string;
    encoding?: string;
    tenant_id?: string;
  }) {
    const q = new URLSearchParams({ action: "write-text" });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "PUT",
      `/api/v1/documents?${q.toString()}`,
      {
        file_path: params.file_path,
        content: params.content,
        ...(params.encoding !== undefined ? { encoding: params.encoding } : {}),
      }
    );
  },

  async downloadDocument(params: { file_path: string; tenant_id?: string }) {
    const base = getBaseUrl();
    const q = new URLSearchParams({ file_path: params.file_path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    // action=download on /documents is retired; use dedicated download path
    const url = `${base}/api/v1/documents/download?${q.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: getApiKeyHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Tealfabric API ${res.status}: ${text || res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    if (contentType.includes("application/json")) {
      const text = await res.text();
      try {
        return JSON.parse(text) as { success: boolean; data?: unknown };
      } catch {
        return { success: true, data: text };
      }
    }

    const contentDisposition = res.headers.get("content-disposition") || "";
    const filenameMatch =
      /filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i.exec(contentDisposition);
    const filename = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || "");

    const bytes = new Uint8Array(await res.arrayBuffer());
    return {
      success: true,
      data: {
        file_path: params.file_path,
        filename: filename || undefined,
        content_type: contentType,
        content_base64: Buffer.from(bytes).toString("base64"),
      },
    };
  },

  async uploadDocument(params: {
    destination_path: string;
    file_path: string;
    tenant_id?: string;
  }) {
    const base = getBaseUrl();
    const q = new URLSearchParams({ action: "upload" });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    const url = `${base}/api/v1/documents?${q.toString()}`;

    const fileBuffer = await readFile(params.file_path);
    const filename = basename(params.file_path);
    const formData = new FormData();
    formData.append("destination_path", params.destination_path);
    formData.append("file", new Blob([fileBuffer]), filename);

    const res = await fetch(url, {
      method: "POST",
      headers: getApiKeyHeaders(),
      body: formData,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Tealfabric API ${res.status}: ${text || res.statusText}`);
    }
    if (!text) return { success: true };
    try {
      return JSON.parse(text) as { success: boolean; data?: unknown };
    } catch {
      return { success: true, data: text };
    }
  },

  async moveDocument(params: {
    old_path: string;
    new_path: string;
    tenant_id?: string;
  }) {
    const q = new URLSearchParams({ action: "move" });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean; data?: unknown }>(
      "PUT",
      `/api/v1/documents?${q.toString()}`,
      { old_path: params.old_path, new_path: params.new_path }
    );
  },

  async deleteDocument(params: { path: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "delete", path: params.path });
    if (params.tenant_id) q.set("tenant_id", params.tenant_id);
    return request<{ success: boolean }>("DELETE", `/api/v1/documents?${q.toString()}`);
  },
};
