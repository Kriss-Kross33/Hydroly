// store/useStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "../services/authService";
import { authTokenService } from "../services/authTokenService";

// Add Profile interface
export interface Profile {
  id?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
}

/**
 * Interface for the application state store.
 */
interface AppState {
  // Authentication state
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;

  // Authentication methods
  setAuthenticated: (
    authenticated: boolean,
    token: string,
    userId: string
  ) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;

  // Profile state
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearProfile: () => void;

  // Vessels state
}

/**
 * Convert API LoggedMeal format to app Meal format with null checking
 */

/**
 * Zustand store hook for global application state.
 */
const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Authentication state
      isAuthenticated: false,
      token: null,
      userId: null,

      setAuthenticated: async (authenticated, token, userId) => {
        console.log("Setting authenticated:", {
          authenticated,
          userId,
        });
        await authTokenService.setToken(token);
        // Also store userId separately for PaywallScreen and other screens that check AsyncStorage directly
        if (userId) {
          await AsyncStorage.setItem("user_id", userId);
        }
        set({
          isAuthenticated: authenticated,
          token,
          userId,
        });
      },

      checkAuth: async () => {
        try {
          const token = await authTokenService.initialize();
          const userId = await AsyncStorage.getItem("userId");

          if (token && userId) {
            set({
              isAuthenticated: true,
              token,
              userId,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error checking auth:", error);
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Error during logout:", error);
        } finally {
          set({
            isAuthenticated: false,
            token: null,
            userId: null,
            profile: null,
          });

          // Clear stored authentication data
          await AsyncStorage.removeItem("my_token");
          await AsyncStorage.removeItem("refresh_token");
          await AsyncStorage.removeItem("user_id");
        }
      },

      // Meal suggestions
      suggestedMeals: [],
      isLoadingSuggestions: false,
      suggestionsError: null,

      // Profile state
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      clearProfile: () => set({ profile: null }),

      // Vessels state
      vessels: [],
    }),
    {
      name: "macromate-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userId: state.userId,
        profile: state.profile,
      }),
    }
  )
);

export default useStore;
