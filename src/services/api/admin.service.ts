import { apiClient } from "./client";

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  organization: string | null;
  status: "ACTIVE" | "BANNED";
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  organization?: string;
}

export const adminService = {
  async getUsers(): Promise<AdminUserResponse[]> {
    const { data } = await apiClient.get("/users");
    return data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async updateUserStatus(id: string, status: "ACTIVE" | "BANNED"): Promise<AdminUserResponse> {
    const { data } = await apiClient.patch(`/users/${id}/status`, { status });
    return data.data;
  },

  async createAdmin(payload: CreateAdminRequest): Promise<AdminUserResponse> {
    const { data } = await apiClient.post("/users/create-admin", payload);
    return data.data;
  },
};
