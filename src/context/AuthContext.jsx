import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "lepalmier.auth";

const DEMO_USER = {
  id: "U-001",
  name: "Nguyễn Văn A",
  username: "nguyen.a",
  email: "nguyen.a@lepalmier.vn",
  role: "Giám đốc vận hành",
  roleLevel: "Admin",
  avatar: "NV",
  branches: ["BR-SG-001", "BR-DL-002", "BR-PQ-003", "BR-NT-004"],
  plan: "Enterprise · 4 chi nhánh",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const login = (userData = DEMO_USER) => {
    setUser(userData);
    setIsAuthenticated(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const value = { user, isAuthenticated, login, logout, DEMO_USER };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}