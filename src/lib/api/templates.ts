import { apiFetch } from "@/lib/api";
import { USE_MOCK, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";

// Planned endpoints (FE-04): GET/POST /api/templates, GET/PUT/DELETE /api/templates/{id}.

export interface TemplateSummary {
  id: string;
  name: string;
  variables: string[];
  authorName: string;
  updatedAt: string;
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

  create(data: SaveTemplateRequest): Promise<TemplateSummary> {
    if (USE_MOCK) {
      const created: TemplateSummary = {
        id: `tpl-${Date.now()}`,
        name: data.name,
        variables: detectVariables(data.content),
        authorName: mockDb.currentUserName,
        updatedAt: new Date().toISOString(),
      };
      mockDb.templates.unshift(created);
      return mockResponse(created);
    }
    return apiFetch<TemplateSummary>("/api/templates", { method: "POST", body: JSON.stringify(data) });
  },
};
