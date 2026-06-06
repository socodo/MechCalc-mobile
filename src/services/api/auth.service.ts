import { apiClient } from "./client";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponse {
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

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data.data;
  },

  async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const { data } = await apiClient.post("/auth/register", { email, password, fullName });
    return data.data;
  },

  async refreshToken(token: string): Promise<AuthResponse> {
    const { data } = await apiClient.post("/auth/refresh", { token });
    return data.data;
  },
};
