"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "./api";
import { useToast } from "./toast";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  createdAt?: string;
  _count?: {
    orders?: number;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  quickLogin: (type: "customer" | "merchant") => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: (mode?: "login" | "register") => void;
  authModalMode: "login" | "register";
  setAuthModalMode: (mode: "login" | "register") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const { toast } = useToast();

  // Load session from localStorage on initial client mount
  useEffect(() => {
    const savedToken = localStorage.getItem("paypilot_auth_token");
    const savedUser = localStorage.getItem("paypilot_user");

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore parsing error
        }
      }

      // Verify and refresh session with server
      fetchApi("/api/auth/me")
        .then((res) => {
          if (res?.success && res.user) {
            setUser(res.user);
            localStorage.setItem("paypilot_user", JSON.stringify(res.user));
          } else {
            // Invalid session
            localStorage.removeItem("paypilot_auth_token");
            localStorage.removeItem("paypilot_user");
            setUser(null);
            setToken(null);
          }
        })
        .catch(() => {
          // Keep offline state if server is momentarily unreachable
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("paypilot_auth_token", newToken);
        localStorage.setItem("paypilot_user", JSON.stringify(newUser));
        toast(`Welcome back, ${newUser.name}!`, "success");
        setIsAuthModalOpen(false);
        return true;
      } else {
        toast(res.message || "Failed to sign in", "error");
        return false;
      }
    } catch (err: any) {
      toast(err.message || "Sign in encountered an error", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string, role = "CUSTOMER"): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetchApi("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.success && res.data) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("paypilot_auth_token", newToken);
        localStorage.setItem("paypilot_user", JSON.stringify(newUser));
        toast(`Account created! Welcome, ${newUser.name}`, "success");
        setIsAuthModalOpen(false);
        return true;
      } else {
        toast(res.message || "Registration failed", "error");
        return false;
      }
    } catch (err: any) {
      toast(err.message || "Registration encountered an error", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetchApi("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("paypilot_auth_token");
      localStorage.removeItem("paypilot_user");
      toast("You have been signed out", "info");
    }
  };

  const quickLogin = async (type: "customer" | "merchant") => {
    if (type === "merchant") {
      await login("merchant@paypilot.io", "demo_hash_admin_123");
    } else {
      await login("buyer@paypilot.io", "demo_hash_buyer_123");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
