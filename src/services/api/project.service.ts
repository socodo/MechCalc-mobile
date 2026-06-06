import { apiClient } from "./client";

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSaveRequest {
  name: string;
  description?: string;
  status?: string;
}

export const projectService = {
  async getProjects(): Promise<ProjectResponse[]> {
    const { data } = await apiClient.get("/projects");
    return data.data;
  },

  async getProject(id: string): Promise<ProjectResponse> {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data.data;
  },

  async createProject(payload: ProjectSaveRequest): Promise<ProjectResponse> {
    const { data } = await apiClient.post("/projects", payload);
    return data.data;
  },

  async updateProject(id: string, payload: ProjectSaveRequest): Promise<ProjectResponse> {
    const { data } = await apiClient.put(`/projects/${id}`, payload);
    return data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
