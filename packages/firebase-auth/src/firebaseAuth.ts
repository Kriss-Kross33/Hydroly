/**
 * Firebase Authentication Service
 *
 * Handles optional, value-driven authentication
 * - Creates anonymous users on first launch
 * - Supports email, Google, Apple sign-in
 * - Links anonymous accounts to authenticated accounts
 * - Never forces login
 */

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseUser, AuthError } from "./types";

const ANONYMOUS_UID_KEY = "@hydroly_anonymous_uid";
const AUTH_STATE_KEY = "@hydroly_auth_state";

/**
 * Convert Firebase user to our FirebaseUser type
 */
function convertFirebaseUser(
  firebaseUser: FirebaseAuthTypes.User | null
): FirebaseUser | null {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isAnonymous: firebaseUser.isAnonymous,
    emailVerified: firebaseUser.emailVerified,
    providerId: firebaseUser.providerData[0]?.providerId || "anonymous",
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime).getTime()
      : Date.now(),
    lastLoginAt: firebaseUser.metadata.lastSignInTime
      ? new Date(firebaseUser.metadata.lastSignInTime).getTime()
      : null,
  };
}

/**
 * Initialize anonymous authentication
 * Called on first app launch
 */
export async function initializeAnonymousAuth(): Promise<FirebaseUser> {
  try {
    // Check if we already have an anonymous user
    const currentUser = auth().currentUser;
    if (currentUser && currentUser.isAnonymous) {
      const user = convertFirebaseUser(currentUser);
      if (user) {
        await AsyncStorage.setItem(ANONYMOUS_UID_KEY, user.uid);
        return user;
      }
    }

    // Check if we stored an anonymous UID before
    const storedUid = await AsyncStorage.getItem(ANONYMOUS_UID_KEY);
    if (storedUid) {
      // Try to get the user (they might have signed in since)
      const user = auth().currentUser;
      if (user && user.uid === storedUid) {
        return convertFirebaseUser(user)!;
      }
    }

    // Create new anonymous user
    const credential = await auth().signInAnonymously();
    const user = convertFirebaseUser(credential.user);

    if (!user) {
      throw new Error("Failed to create anonymous user");
    }

    await AsyncStorage.setItem(ANONYMOUS_UID_KEY, user.uid);
    return user;
  } catch (error: any) {
    console.error("[FirebaseAuth] Error initializing anonymous auth:", error);
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Failed to initialize anonymous authentication",
    } as AuthError;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const currentUser = auth().currentUser;
    const isAnonymous = currentUser?.isAnonymous ?? false;

    if (isAnonymous) {
      // Link anonymous account to email account
      const credential = auth.EmailAuthProvider.credential(email, password);
      const userCredential =
        await auth().currentUser?.linkWithCredential(credential);

      if (!userCredential?.user) {
        throw new Error("Failed to link anonymous account");
      }

      // Clear anonymous UID
      await AsyncStorage.removeItem(ANONYMOUS_UID_KEY);
      return convertFirebaseUser(userCredential.user)!;
    } else {
      // Regular sign in
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      return convertFirebaseUser(userCredential.user)!;
    }
  } catch (error: any) {
    console.error("[FirebaseAuth] Error signing in with email:", error);
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Failed to sign in with email",
    } as AuthError;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const currentUser = auth().currentUser;
    const isAnonymous = currentUser?.isAnonymous ?? false;

    if (isAnonymous) {
      // Link anonymous account to new email account
      const credential = auth.EmailAuthProvider.credential(email, password);
      const userCredential =
        await auth().currentUser?.linkWithCredential(credential);

      if (!userCredential?.user) {
        throw new Error("Failed to link anonymous account");
      }

      // Clear anonymous UID
      await AsyncStorage.removeItem(ANONYMOUS_UID_KEY);
      return convertFirebaseUser(userCredential.user)!;
    } else {
      // Regular sign up
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      return convertFirebaseUser(userCredential.user)!;
    }
  } catch (error: any) {
    console.error("[FirebaseAuth] Error signing up with email:", error);
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Failed to sign up with email",
    } as AuthError;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    // Note: Google Sign-In requires additional setup
    // This is a placeholder - implement with @react-native-google-signin/google-signin
    throw new Error("Google Sign-In not yet implemented");
  } catch (error: any) {
    console.error("[FirebaseAuth] Error signing in with Google:", error);
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Failed to sign in with Google",
    } as AuthError;
  }
}

/**
 * Sign in with Apple
 */
export async function signInWithApple(): Promise<FirebaseUser> {
  try {
    // Note: Apple Sign-In requires additional setup
    // This is a placeholder - implement with @invertase/react-native-apple-authentication
    throw new Error("Apple Sign-In not yet implemented");
  } catch (error: any) {
    console.error("[FirebaseAuth] Error signing in with Apple:", error);
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Failed to sign in with Apple",
    } as AuthError;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return convertFirebaseUser(auth().currentUser);
}

/**
 * Get Firebase ID token
 * Used for FastAPI authentication
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  try {
    const user = auth().currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error("[FirebaseAuth] Error getting ID token:", error);
    return null;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await auth().signOut();
    await AsyncStorage.removeItem(ANONYMOUS_UID_KEY);
    await AsyncStorage.removeItem(AUTH_STATE_KEY);
  } catch (error) {
    console.error("[FirebaseAuth] Error signing out:", error);
    throw error;
  }
}

/**
 * Delete account
 */
export async function deleteAccount(): Promise<void> {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user to delete");

    await user.delete();
    await AsyncStorage.removeItem(ANONYMOUS_UID_KEY);
    await AsyncStorage.removeItem(AUTH_STATE_KEY);
  } catch (error) {
    console.error("[FirebaseAuth] Error deleting account:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error: any) {
    console.error("[FirebaseAuth] Error sending password reset:", error);
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Failed to send password reset email",
    } as AuthError;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return auth().onAuthStateChanged((firebaseUser) => {
    callback(convertFirebaseUser(firebaseUser));
  });
}
