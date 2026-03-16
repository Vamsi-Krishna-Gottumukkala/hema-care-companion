import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "user" | "admin" | null;

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, _password: string): Promise<{ success: boolean; role?: UserRole }> => {
    await new Promise((r) => setTimeout(r, 800));
    if (email === "admin@hemaai.com") {
      const adminUser: AuthUser = { id: "a1", name: "Dr. Michael Chen", email, role: "admin", avatar: "MC" };
      setUser(adminUser);
      return { success: true, role: "admin" };
    } else if (email.includes("@")) {
      const userObj: AuthUser = { id: "u1", name: "Sarah Johnson", email, role: "user", avatar: "SJ" };
      setUser(userObj);
      return { success: true, role: "user" };
    }
    return { success: false };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
