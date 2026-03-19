/**
 * Tealfabric API client for MCP server.
 * Uses TEALFABRIC_API_KEY (X-API-Key or Authorization: Bearer) and TEALFABRIC_API_URL.
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

export const tealfabric = {
  async listWebapps(params?: { search?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.limit) q.set("limit", String(params.limit));
    const query = q.toString();
    return request<{ success: boolean; webapps?: unknown[]; count?: number }>(
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
    description?: string;
    page_content?: string;
    page_header?: string;
    page_footer?: string;
    custom_css?: string;
    custom_js?: string;
    process_id?: string;
  }) {
    return request<{ success: boolean; webapp?: { webapp_id: string }; error?: string }>(
      "POST",
      "/api/v1/webapps",
      body
    );
  },

  async updateWebapp(
    webappId: string,
    body: {
      name?: string;
      description?: string;
      page_content?: string;
      page_header?: string;
      page_footer?: string;
      custom_css?: string;
      custom_js?: string;
      process_id?: string | null;
    }
  ) {
    return request<{ success: boolean; webapp?: unknown; error?: string }>(
      "PUT",
      `/api/v1/webapps/${encodeURIComponent(webappId)}`,
      body
    );
  },

  async publishWebapp(webappId: string) {
    return request<{ success: boolean; error?: string }>(
      "POST",
      `/api/v1/webapps/${encodeURIComponent(webappId)}/publish`,
      {}
    );
  },

  async listProcesses() {
    return request<{ success: boolean; processes?: unknown[] }>(
      "GET",
      "/api/v1/processflow?action=processes"
    );
  },

  async getProcess(processId: string) {
    return request<{ success: boolean; process?: unknown }>(
      "GET",
      `/api/v1/processflow?action=process&process_id=${encodeURIComponent(processId)}`
    );
  },

  async listProcessSteps(processId: string) {
    return request<{ success: boolean; steps?: unknown[] }>(
      "GET",
      `/api/v1/processflow?action=steps&process_id=${encodeURIComponent(processId)}`
    );
  },

  async getProcessStep(stepId: string) {
    return request<{ success: boolean; step?: unknown }>(
      "GET",
      `/api/v1/processflow?action=step&step_id=${encodeURIComponent(stepId)}`
    );
  },

  async executeProcess(processId: string, input?: Record<string, unknown>) {
    return request<{ success: boolean; result?: unknown; error?: string }>(
      "POST",
      "/api/v1/processflow?action=execute-process",
      { process_id: processId, input: input ?? {} }
    );
  },

  // --- Documents (package files for delivery) ---
  async listDocuments(params?: { path?: string; tenant_id?: string }) {
    const q = new URLSearchParams({ action: "list" });
    if (params?.path) q.set("path", params.path);
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
