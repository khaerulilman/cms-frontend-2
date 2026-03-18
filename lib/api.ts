// API calls use relative path to go through Next.js proxy (rewrites in next.config.ts)
// This ensures cookies are same-origin and work in all environments
const BASE_URL = "";

// Direct backend URL for full-page redirects (e.g., Google OAuth)
// These bypass the proxy since the browser navigates directly
// trigger commit
export const BACKEND_URL = process.env.NEXT_PUBLIC_MAIN_API;

if (!process.env.NEXT_PUBLIC_MAIN_API) {
  throw new Error(
    "NEXT_PUBLIC_MAIN_API is not defined in environment variables",
  );
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T = any>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", body } = options;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in requests
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "API request failed");
    }

    return data;
  }

  async login(email: string, password: string) {
    const response = await this.request("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });

    // Store user data only (tokens are in HTTP-only cookies)
    if (typeof window !== "undefined" && response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout() {
    const response = await this.request("/api/v1/auth/logout", {
      method: "POST",
    });

    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }

    return response;
  }

  async refreshToken() {
    return this.request("/api/v1/auth/refresh-token", {
      method: "POST",
    });
  }

  async establishSession(setupToken: string) {
    return this.request("/api/v1/auth/establish-session", {
      method: "POST",
      body: { setupToken },
    });
  }

  async getProfile() {
    return this.request("/api/v1/auth/profile");
  }

  getAllUserProjects() {
    return this.request("/api/v1/projects");
  }

  getAllUserTables(projectId?: string) {
    return this.request(`/api/v1/tables/project/${projectId}`);
  }

  getColumnByTableId(tableId?: string) {
    return this.request(`/api/v1/cms-columns/table/${tableId}`);
  }

  getRowByTableId(tableId?: string) {
    return this.request(`/api/v1/cms-rows/table/${tableId}`);
  }

  getCellsByRowId(rowId?: string) {
    return this.request(`/api/v1/cms-cells/row/${rowId}`);
  }

  createColumn(tableId: string, columns: Array<{ name: string }>) {
    return this.request("/api/v1/cms-columns", {
      method: "POST",
      body: { tableId, columns },
    });
  }

  createRow(tableId: string) {
    return this.request("/api/v1/cms-rows", {
      method: "POST",
      body: { tableId },
    });
  }

  createTable(projectId: string, name: string, isSubTable: boolean) {
    return this.request("/api/v1/tables", {
      method: "POST",
      body: { projectId, name, isSubTable },
    });
  }

  duplicateTable(tableId: string, isSubTable?: boolean) {
    return this.request(`/api/v1/tables/${tableId}/duplicate`, {
      method: "POST",
      body: { isSubTable },
    });
  }

  createProject(name: string, description: string) {
    return this.request("/api/v1/projects", {
      method: "POST",
      body: { name, description },
    });
  }

  deleteTable(tableId: string) {
    return this.request(`/api/v1/tables/${tableId}`, {
      method: "DELETE",
    });
  }

  deleteRow(rowId: string) {
    return this.request(`/api/v1/cms-rows/${rowId}`, {
      method: "DELETE",
    });
  }

  bulkDeleteRows(rowIds: string[]) {
    return this.request("/api/v1/cms-rows/bulk", {
      method: "DELETE",
      body: { rowIds },
    });
  }

  deleteColumn(columnId: string) {
    return this.request(`/api/v1/cms-columns/${columnId}`, {
      method: "DELETE",
    });
  }

  deleteProject(projectId: string) {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  updateCell(rowId: string, columnId: string, value: string) {
    return this.request(`/api/v1/cms-cells/row/${rowId}`, {
      method: "POST",
      body: { columnId, value },
    });
  }

  async updateCellWithImage(
    rowId: string,
    columnId: string,
    image: File,
  ): Promise<any> {
    const formData = new FormData();
    formData.append("columnId", columnId);
    formData.append("image", image);

    const res = await fetch(`/api/v1/cms-cells/row/${rowId}`, {
      method: "POST",
      credentials: "include", // Include cookies
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "API request failed");
    }

    return data;
  }

  getApiKeys() {
    return this.request("/api/v1/apikey");
  }

  generateApiKey() {
    return this.request("/api/v1/apikey", {
      method: "POST",
    });
  }

  deleteApiKey(apiId: string) {
    return this.request(`/api/v1/apikey/${apiId}`, {
      method: "DELETE",
    });
  }

  updateProjects(projectId: string, name: string, description?: string) {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: "PUT",
      body: { name, description },
    });
  }

  updateTables(tableId: string, name: string, isSubTable?: boolean) {
    return this.request(`/api/v1/tables/${tableId}`, {
      method: "PUT",
      body: { name, isSubTable },
    });
  }

  updateColumns(columnId: string, name: string) {
    return this.request(`/api/v1/cms-columns/${columnId}`, {
      method: "PUT",
      body: { name },
    });
  }

  updateCellImage(rowId: string, columnId: string, imageUrl: string) {
    return this.request(`/api/v1/cms-cells/row/${rowId}`, {
      method: "POST",
      body: { columnId, imageUrl },
    });
  }
}

export const api = new ApiClient(BASE_URL);
