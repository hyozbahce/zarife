export interface SchoolResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateSchoolRequest {
  name: string;
  adminEmail: string;
  adminPassword: string;
}

// Dummy export to ensure this is recognized as a module with exports by Vite/ESM
export const MANAGEMENT_TYPES = true;
