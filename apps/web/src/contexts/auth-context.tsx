/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthState, AuthResponse } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (response: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        return {
          user: JSON.parse(savedUser) as User,
          token: savedToken,
          isAuthenticated: true,
          isLoading: false,
        };
      }
    } catch {
      // Ignore storage errors and fall back to defaults.
    }

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  const login = (response: AuthResponse) => {
    const user: User = {
      email: response.email,
      role: response.role,
      tenantId: response.tenantId,
    };

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));

    setState({
      user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
