import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService, type UserResponse } from "@/services/api/auth.service";
import { userService } from "@/services/api/user.service";
import { tokenStorage } from "@/lib/token-storage";

function extractIsAdmin(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Kiểm tra token đã lưu khi khởi động app
  useEffect(() => {
    void (async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          const profile = await userService.getMyProfile();
          setUser(profile);
          setIsAdmin(extractIsAdmin(token));
        }
      } catch {
        await tokenStorage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    await tokenStorage.saveTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    setIsAdmin(extractIsAdmin(res.accessToken));
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await authService.register(email, password, fullName);
    await tokenStorage.saveTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    setIsAdmin(extractIsAdmin(res.accessToken));
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clearTokens();
    setUser(null);
    setIsAdmin(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await userService.getMyProfile();
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
