import { apiClient } from "./client";
import type { UserResponse } from "./auth.service";

export interface UserUpdateRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  organization?: string;
}

export const userService = {
  async getMyProfile(): Promise<UserResponse> {
    const { data } = await apiClient.get("/users/my-profile");
    return data.data;
  },

  async updateMyProfile(payload: UserUpdateRequest): Promise<UserResponse> {
    const { data } = await apiClient.put("/users/my-profile", payload);
    return data.data;
  },
};
