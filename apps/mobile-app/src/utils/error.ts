/**
 * Common utilities for auth error handling
 */

export interface ApiError {
  error?: {
    message: string;
    code?: string;
  };
  message?: string;
  status?: number;
  response?: {
    data: {
      error?: {
        message: string;
      };
      message?: string;
    };
  };
}

export function getErrorMessage(error: any): string {
  // Handle different error formats from backend
  if (error?.error?.message) {
    return error.error.message;
  }

  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  // Handle common error codes
  if (error?.response?.status === 400) {
    return "Invalid request. Please check your input.";
  }

  if (error?.response?.status === 401) {
    return "Invalid credentials. Please try again.";
  }

  if (error?.response?.status === 409) {
    return "Email or username already exists.";
  }

  if (error?.response?.status === 500) {
    return "Server error. Please try again later.";
  }

  return "An error occurred. Please try again.";
}

export function isAuthError(error: any): boolean {
  return error?.response?.status === 401;
}

export function isValidationError(error: any): boolean {
  return error?.response?.status === 400;
}

export function isConflictError(error: any): boolean {
  return error?.response?.status === 409; // Email/Username already exists
}

export function isServerError(error: any): boolean {
  return error?.response?.status === 500;
}
