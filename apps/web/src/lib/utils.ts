import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  
  if (Array.isArray(error)) {
    return error.map(e => e.description || e.message || JSON.stringify(e)).join(', ');
  }
  
  if (error?.description) return error.description;
  if (error?.message) return error.message;
  
  return 'An unexpected error occurred';
}
