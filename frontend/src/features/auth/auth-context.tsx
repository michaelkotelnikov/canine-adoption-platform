"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createBrowserApiClient } from "@/lib/api/client";
import { isStandaloneFrontend } from "@/lib/standalone";

const TOKEN_KEY = "canine_access_token";

export type AuthUser = {
  id: string;
  email: string;
  is_superuser: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = useCallback(async () => {
    const t = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      setToken(null);
      setUser(null);
      return;
    }
    setToken(t);
    const client = createBrowserApiClient();
    const { data, response } = await client.GET("/users/me");
    if (!response.ok || !data) {
      window.localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      return;
    }
    setUser({
      id: data.id,
      email: data.email,
      is_superuser: data.is_superuser ?? false,
    });
  }, []);

  useEffect(() => {
    if (isStandaloneFrontend()) {
      setLoading(false);
      return;
    }
    void (async () => {
      await loadUserFromStorage();
      setLoading(false);
    })();
  }, [loadUserFromStorage]);

  const setSession = useCallback(
    async (newToken: string) => {
      window.localStorage.setItem(TOKEN_KEY, newToken);
      await loadUserFromStorage();
    },
    [loadUserFromStorage],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, setSession, logout }),
    [user, token, loading, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
