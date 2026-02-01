import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, type AuthResponse, getStoredUser, logout as doLogout, login as doLogin, studentLogin as doStudentLogin } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  studentLogin: (schoolCode: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await getStoredUser();
      setUser(storedUser);
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await doLogin(email, password);
    setUser({ email: response.email, role: response.role, tenantId: response.tenantId });
  };

  const studentLogin = async (schoolCode: string, username: string) => {
    const response = await doStudentLogin(schoolCode, username);
    setUser({ email: response.email, role: response.role, tenantId: response.tenantId });
  };

  const logout = async () => {
    await doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, studentLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
