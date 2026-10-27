import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  company_name?: string | null;
  avatar_url?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { full_name: string; company_name?: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  updatePassword: (token: string, password: string) => Promise<void>;
  googleEnabled: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/auth/${path}`, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "No fue posible completar la solicitud.");
  return payload as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await api<{ user: AuthUser | null }>("me");
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    void api<{ enabled: boolean }>("google/status")
      .then((result) => setGoogleEnabled(result.enabled))
      .catch(() => setGoogleEnabled(false));
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api<{ user: AuthUser }>("login", { method: "POST", body: JSON.stringify({ email, password }) });
    setUser(result.user);
  }, []);

  const signUp = useCallback(async (data: { full_name: string; company_name?: string; email: string; password: string }) => {
    const result = await api<{ user: AuthUser }>("register", { method: "POST", body: JSON.stringify(data) });
    setUser(result.user);
  }, []);

  const signOut = useCallback(async () => {
    try { await api("logout", { method: "POST", body: "{}" }); } finally { setUser(null); }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const result = await api<{ message: string }>("forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    return result.message;
  }, []);

  const updatePassword = useCallback(async (token: string, password: string) => {
    await api("reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut, requestPasswordReset, updatePassword, googleEnabled }), [user, loading, signIn, signUp, signOut, requestPasswordReset, updatePassword, googleEnabled]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return value;
}
