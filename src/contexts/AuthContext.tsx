import React, { createContext, useContext, useState, useCallback } from "react";

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
    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (mockUser) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
    } else {
      throw new Error("Invalid credentials");
    }
  }, []);

  const logout = useCallback(() => {
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