import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, setToken, getToken, clearToken, type UserData } from "@/services/api";

export type UserRole = "user" | "admin" | null;

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; role?: UserRole }>;
  register: (name: string, email: string, password: string, phone?: string, age?: number) => Promise<{ success: boolean; role?: UserRole }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if there's a stored token and load user
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: UserRole }> => {
    try {
      const response = await authApi.login(email, password);
      setToken(response.access_token);
      setUser(response.user);
      return { success: true, role: response.user.role as UserRole };
    } catch (error) {
      return { success: false };
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<{ success: boolean; role?: UserRole }> => {
    try {
      const response = await authApi.loginGoogle(idToken);
      setToken(response.access_token);
      setUser(response.user);
      return { success: true, role: response.user.role as UserRole };
    } catch (error) {
      return { success: false };
    }
  };

  const register = async (
    name: string, email: string, password: string,
    phone?: string, age?: number
  ): Promise<{ success: boolean; role?: UserRole }> => {
    try {
      const response = await authApi.register(name, email, password, phone, age);
      setToken(response.access_token);
      setUser(response.user);
      return { success: true, role: response.user.role as UserRole };
    } catch (error) {
      return { success: false };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
