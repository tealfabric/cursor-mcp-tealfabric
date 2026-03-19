/**
 * Tealfabric API client for MCP server.
 * Uses TEALFABRIC_API_KEY (X-API-Key or Authorization: Bearer) and TEALFABRIC_API_URL.
 */
const getBaseUrl = () => {
    const url = process.env.TEALFABRIC_API_URL || "https://dev.tealfabric.io";
    return url.replace(/\/$/, "");
};
const getHeaders = () => {
    const key = process.env.TEALFABRIC_API_KEY;
    if (!key) {
        throw new Error("TEALFABRIC_API_KEY is not set");
    }
    return {
        "Content-Type": "application/json",
        "X-API-Key": key,
    };
};
async function request(method, path, body) {
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
    if (!text)
        return undefined;
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
export const tealfabric = {
    async listWebapps(params) {
        const q = new URLSearchParams();
        if (params?.search)
            q.set("search", params.search);
        if (params?.limit)
            q.set("limit", String(params.limit));
        const query = q.toString();
        return request("GET", `/api/v1/webapps${query ? `?${query}` : ""}`);
    },
    async getWebapp(webappId, version) {
        const q = version != null ? `?version=${version}` : "";
        return request("GET", `/api/v1/webapps/${encodeURIComponent(webappId)}${q}`);
    },
    async createWebapp(body) {
        return request("POST", "/api/v1/webapps", body);
    },
    async updateWebapp(webappId, body) {
        return request("PUT", `/api/v1/webapps/${encodeURIComponent(webappId)}`, body);
    },
    async publishWebapp(webappId) {
        return request("POST", `/api/v1/webapps/${encodeURIComponent(webappId)}/publish`, {});
    },
    async listProcesses() {
        return request("GET", "/api/v1/processflow?action=processes");
    },
    async getProcess(processId) {
        return request("GET", `/api/v1/processflow?action=process&process_id=${encodeURIComponent(processId)}`);
    },
    async listProcessSteps(processId) {
        return request("GET", `/api/v1/processflow?action=steps&process_id=${encodeURIComponent(processId)}`);
    },
    async getProcessStep(stepId) {
        return request("GET", `/api/v1/processflow?action=step&step_id=${encodeURIComponent(stepId)}`);
    },
    async executeProcess(processId, input) {
        return request("POST", "/api/v1/processflow?action=execute-process", { process_id: processId, input: input ?? {} });
    },
};
