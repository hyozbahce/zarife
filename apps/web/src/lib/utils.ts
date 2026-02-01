import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response?.data) {
      return getErrorMessage(response.data);
    }
  }

  if (Array.isArray(error)) {
    return error
      .map((item) => {
        if (item && typeof item === 'object') {
          const record = item as { description?: unknown; message?: unknown };
          if (typeof record.description === 'string') return record.description;
          if (typeof record.message === 'string') return record.message;
        }
        return JSON.stringify(item);
      })
      .join(', ');
  }
  
  if (error && typeof error === 'object') {
    const record = error as { description?: unknown; message?: unknown };
    if (typeof record.description === 'string') return record.description;
    if (typeof record.message === 'string') return record.message;
  }
  
  return 'An unexpected error occurred';
}
