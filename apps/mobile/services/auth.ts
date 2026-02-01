import * as SecureStore from 'expo-secure-store';
import api from './api';

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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/api/account/login', { email, password });
  const data: AuthResponse = res.data;
  await SecureStore.setItemAsync('token', data.token);
  await SecureStore.setItemAsync('user', JSON.stringify({ email: data.email, role: data.role, tenantId: data.tenantId }));
  return data;
}

export async function studentLogin(schoolCode: string, username: string): Promise<AuthResponse> {
  const res = await api.post('/api/students/login', { schoolCode, username });
  const data: AuthResponse = res.data;
  await SecureStore.setItemAsync('token', data.token);
  await SecureStore.setItemAsync('user', JSON.stringify({ email: data.email, role: data.role, tenantId: data.tenantId }));
  return data;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
}

export async function getStoredUser(): Promise<User | null> {
  const userStr = await SecureStore.getItemAsync('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('token');
}
