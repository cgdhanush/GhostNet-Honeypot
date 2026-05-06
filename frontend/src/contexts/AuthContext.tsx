import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import apiClient from "../services/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

const AUTH_TOKEN_KEY = "ghostnet_auth_token";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("ghostnet_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });

  useEffect(() => {
    if (token) {
      apiClient.setAuthToken(token);
    } else {
      apiClient.setAuthToken();
    }
  }, [token]);

  const login = async (credentials: LoginPayload) => {
    const response = await apiClient.login(credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    if (response.user) {
      localStorage.setItem("ghostnet_user", JSON.stringify(response.user));
      setUser(response.user);
    }
    setToken(response.access_token);
    return response;
  };

  const register = async (payload: RegisterPayload) => {
    const response = await apiClient.register(payload);
    localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    if (response.user) {
      localStorage.setItem("ghostnet_user", JSON.stringify(response.user));
      setUser(response.user);
    }
    setToken(response.access_token);
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("ghostnet_user");
    apiClient.setAuthToken();
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
