/**
 * Firebase Auth Types
 */

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
  providerId: string;
  createdAt: number;
  lastLoginAt: number | null;
}

export interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthProvider = "email" | "google" | "apple" | "anonymous";

export interface SignInOptions {
  email?: string;
  password?: string;
  provider?: "google" | "apple";
}

export interface AuthError {
  code: string;
  message: string;
}

