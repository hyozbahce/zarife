export interface User {
  email: string;
  role: string;
  tenantId?: string;
}

export interface AuthResponse {
  email: string;
  token: string;
  role: string;
  tenantId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
