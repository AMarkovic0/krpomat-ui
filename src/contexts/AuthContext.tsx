import React, { createContext, useContext, useState, useCallback } from "react";
import { login as login_api } from "../api";
import { TOKEN } from '../utils';

type User = {
  id: string;
  email: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const mockUsers = [
  { id: "1", email: "admin@example.com", password: "admin123", role: "admin" as const },
  { id: "2", email: "user@example.com", password: "user123", role: "user" as const },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await login_api(email, password);
      
      if (!data || typeof data === 'undefined') {
        localStorage.setItem("isAuth", "false");
        setUser(null);
        throw new Error("Invalid credentials");
      }

      localStorage.setItem("isAuth", "true");
      localStorage.setItem("username", data.username);
      localStorage.setItem(TOKEN(), data.token);
      
      setUser({
        id: data.id || String(Date.now()), // Generate an ID if none provided
        email: data.username,
        role: data.username === "admin" ? "admin" : "user"
      });
    } catch (error) {
      localStorage.setItem("isAuth", "false");
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.setItem("isAuth", "false");
    localStorage.setItem(TOKEN(), "");
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};