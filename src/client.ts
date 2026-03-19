/**
 * Tealfabric API client for MCP server.
 * Uses TEALFABRIC_API_KEY (X-API-Key or Authorization: Bearer) and TEALFABRIC_API_URL.
 */

const getBaseUrl = (): string => {
  const url = process.env.TEALFABRIC_API_URL || "https://dev.tealfabric.io";
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
};
