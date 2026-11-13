import { useQuery } from "@tanstack/react-query";
import { hasAdminPermission, type AdminPermission } from "@shared/adminAccess";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const TOKEN_KEY = "ss_admin_token";
const COOKIE_SESSION_MARKER = "cookie-session";
let sessionAvailable = false;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionAvailable ? COOKIE_SESSION_MARKER : null;
}

export function setToken(_token?: string): void {
  if (typeof window === "undefined") return;
  sessionAvailable = true;
  try {
    // Remove tokens written by older builds. The active session is HttpOnly.
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage may be disabled. Cookie authentication still works.
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  sessionAvailable = false;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage may be disabled. The server logout clears the cookie.
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeaders(): Record<string, string> {
  return {};
}

export async function adminApiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle expired/invalid session - clear token and redirect to login
  if (res.status === 401) {
    clearToken();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/admin/login")
    ) {
      window.location.href = "/admin/login";
    }
  }

  if (res.ok && method !== "GET") {
    window.dispatchEvent(new Event("ss:cms-catalog-saved"));
  }
  return res;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/admin/me", { credentials: "include" })
      .then(async response => {
        if (!active) return;
        if (!response.ok) {
          clearToken();
          setState({ isAuthenticated: false, isLoading: false, token: null });
          return;
        }
        setToken();
        setState({ isAuthenticated: true, isLoading: false, token: COOKIE_SESSION_MARKER });
      })
      .catch(() => {
        if (active) setState({ isAuthenticated: false, isLoading: false, token: null });
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback((_token?: string) => {
    setToken();
    setState({
      isAuthenticated: true,
      isLoading: false,
      token: COOKIE_SESSION_MARKER,
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });
    setLocation("/admin/login");
  }, [setLocation]);

  const requireAuth = useCallback(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      setLocation("/admin/login");
      return false;
    }
    return true;
  }, [state.isLoading, state.isAuthenticated, setLocation]);

  return {
    ...state,
    login,
    logout,
    requireAuth,
  };
}

export async function readAdminJson<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || fallback);
  return body as T;
}
export function useMyPermissions() {
  const { data: user } = useQuery<{ role: string; permissions?: string[] }>({
    queryKey: ["/api/admin/me"],
    queryFn: async () =>
      readAdminJson(
        await adminApiRequest("GET", "/api/admin/me"),
        "No se pudo verificar su acceso.",
      ),
  });
  return {
    has: (p: AdminPermission | "users" | "agent_knowledge_admin") =>
      hasAdminPermission(user, p === "agent_knowledge_admin" ? "agents" : p),
  };
}

export async function loadAdminSession(_refresh = false) {
  return readAdminJson(
    await adminApiRequest("GET", "/api/admin/me"),
    "Su sesión no está disponible.",
  );
}
