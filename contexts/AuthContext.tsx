/**
 * Auth Context
 *
 * Provides Firebase authentication state
 * - Optional, value-driven login
 * - Anonymous users by default
 * - Links to RevenueCat on login
 */

import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import {
  initializeAnonymousAuth,
  onAuthStateChanged,
  signInWithEmail,
  signUpWithEmail,
  signOut as firebaseSignOut,
  getCurrentUser,
  getIdToken,
  FirebaseUser,
  AuthError,
} from "@hydroly/firebase-auth";
import { revenueCatService } from "@hydroly/revenuecat-service";

export interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize anonymous auth on mount
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setIsLoading(true);
        // Try to get current user first
        const currentUser = getCurrentUser();
        if (currentUser) {
          if (mounted) {
            setUser(currentUser);
            setIsLoading(false);
          }
        } else {
          // Create anonymous user
          const anonymousUser = await initializeAnonymousAuth();
          if (mounted) {
            setUser(anonymousUser);
            setIsLoading(false);
          }
        }
      } catch (err: any) {
        console.error("[AuthContext] Error initializing auth:", err);
        if (mounted) {
          setError(err.message || "Failed to initialize authentication");
          setIsLoading(false);
        }
      }
    }

    initialize();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged((authUser) => {
      if (mounted) {
        setUser(authUser);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const authUser = await signInWithEmail(email, password);
      setUser(authUser);

      // Link RevenueCat identity
      if (authUser.uid) {
        try {
          await revenueCatService.logIn(authUser.uid);
          console.log("[AuthContext] RevenueCat identity linked");
        } catch (rcError) {
          console.error("[AuthContext] Error linking RevenueCat:", rcError);
          // Don't fail auth if RevenueCat linking fails
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message || "Failed to sign in");
      setIsLoading(false);
      throw err;
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const authUser = await signUpWithEmail(email, password);
      setUser(authUser);

      // Link RevenueCat identity
      if (authUser.uid) {
        try {
          await revenueCatService.logIn(authUser.uid);
          console.log("[AuthContext] RevenueCat identity linked");
        } catch (rcError) {
          console.error("[AuthContext] Error linking RevenueCat:", rcError);
          // Don't fail auth if RevenueCat linking fails
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message || "Failed to sign up");
      setIsLoading(false);
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      await firebaseSignOut();

      // Log out from RevenueCat (but keep subscription)
      try {
        await revenueCatService.logOut();
        console.log("[AuthContext] RevenueCat logged out");
      } catch (rcError) {
        console.error("[AuthContext] Error logging out RevenueCat:", rcError);
      }

      setUser(null);
      setIsLoading(false);
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message || "Failed to sign out");
      setIsLoading(false);
      throw err;
    }
  };

  const getToken = async (): Promise<string | null> => {
    return getIdToken();
  };

  return {
    user,
    isAuthenticated: !!user && !user.isAnonymous,
    isAnonymous: user?.isAnonymous ?? true,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    getToken,
  };
});
