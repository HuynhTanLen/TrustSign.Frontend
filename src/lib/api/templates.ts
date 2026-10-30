import { apiFetch } from "@/lib/api";
import { USE_MOCK, mockError, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";

export interface TemplateSummary {
  id: string;
  name: string;
  variables: string[];
  authorName: string;
  updatedAt: string;
}

export interface TemplateDetail extends TemplateSummary {
  content: string;
}

export interface SaveTemplateRequest {
  name: string;
  content: string;
}

/** Variables written as {{ten_bien}} in a template's content, in order of first use. */
export function detectVariables(content: string): string[] {
  return Array.from(new Set(Array.from(content.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g), (m) => m[1])));
}

export const templatesApi = {
  list(): Promise<TemplateSummary[]> {
    if (USE_MOCK) return mockResponse(mockDb.templates);
    return apiFetch<TemplateSummary[]>("/api/templates");
  },

  get(id: string): Promise<TemplateDetail> {
    if (USE_MOCK) {
      const found = mockDb.templates.find((t) => t.id === id);
      if (!found) return mockError(404, "Không tìm thấy mẫu hợp đồng.");
      return mockResponse({
        ...found,
        content: found.variables.map((v) => `${v}: {{${v}}}`).join("\n"),
      });
    }
    return apiFetch<TemplateDetail>(`/api/templates/${encodeURIComponent(id)}`);
  },

  create(data: SaveTemplateRequest): Promise<TemplateDetail> {
    if (USE_MOCK) {
      const created: TemplateDetail = {
        id: `tpl-${Date.now()}`,
        name: data.name,
        content: data.content,
        variables: detectVariables(data.content),
        authorName: mockDb.currentUserName,
        updatedAt: new Date().toISOString(),
      };
      mockDb.templates.unshift(created);
      return mockResponse(created);
    }
    return apiFetch<TemplateDetail>("/api/templates", { method: "POST", body: JSON.stringify(data) });
  },

  update(id: string, data: SaveTemplateRequest): Promise<TemplateDetail> {
    if (USE_MOCK) {
      const idx = mockDb.templates.findIndex((t) => t.id === id);
      if (idx === -1) return mockError(404, "Không tìm thấy mẫu hợp đồng.");
      const updated: TemplateDetail = {
        ...mockDb.templates[idx],
        name: data.name,
        content: data.content,
        variables: detectVariables(data.content),
        updatedAt: new Date().toISOString(),
      };
      mockDb.templates[idx] = updated;
      return mockResponse(updated);
    }
    return apiFetch<TemplateDetail>(`/api/templates/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: string): Promise<void> {
    if (USE_MOCK) {
      const idx = mockDb.templates.findIndex((t) => t.id === id);
      if (idx !== -1) mockDb.templates.splice(idx, 1);
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/templates/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
