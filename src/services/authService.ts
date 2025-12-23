import AsyncStorage from "@react-native-async-storage/async-storage";

import useStore from "../store/useStore";
import axiosInstance from "../utils/axios";
import { offlineService } from "./offlineService";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface _SignupResponse {
  message: string;
  user: {
    id?: string;
    email: string;
  };
  session?: {
    access_token?: string;
    refresh_token?: string;
  };
}

interface SignupData {
  firstName: string;
  lastName: string;
  phone_number: string;
  email: string;
}

interface LoginCredentials {
  membership_id?: string;
  email?: string;
  password: string;
  fcm_token?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const isOnline = offlineService.isDeviceOnline();

      // Use stored FCM token from app initialization, or get a new one if needed
      let fcmToken = await AsyncStorage.getItem("fcm_token");
      if (fcmToken) {
        console.log("FCM TOKEN FROM APP INITIALIZATION", fcmToken);
        console.log("Using stored FCM token from app initialization");
      } else {
        console.log("No stored FCM token, attempting to get a new one...");
        try {
          // fcmToken = await pushNotifications.getFCMToken();
          console.log("FCM TOKEN FROM PUSH NOTIFICATIONS", fcmToken);
          // if (fcmToken) {
          //     await AsyncStorage.setItem('fcm_token', fcmToken);
          //     console.log('New FCM token obtained and stored:', fcmToken);
          // } else {
          //     console.log('Failed to get new FCM token, continuing without push notifications');
          // }
        } catch (error) {
          console.log("Error getting FCM token:", error);
        }
      }

      console.log("FCM TOKEN FROM AUTH SERVICE", fcmToken);

      // Prepare login payload - support both email and membership_id
      const loginPayload: any = {
        password: credentials.password,
        ...(credentials.email && { email: credentials.email }),
        ...(credentials.membership_id && {
          membership_id: credentials.membership_id,
        }),
        ...(fcmToken && { fcm_token: fcmToken }),
      };

      console.log("[AuthService] Login payload:", {
        hasEmail: !!loginPayload.email,
        hasMembershipId: !!loginPayload.membership_id,
        hasFcmToken: !!loginPayload.fcm_token,
        isOnline,
      });

      // If offline, queue the request and use cached auth if available
      if (!isOnline) {
        console.log(
          "[AuthService] Device is offline, checking for previous login"
        );

        // Check if user has logged in before
        const hasLoggedInBefore = await AsyncStorage.getItem(
          "has_logged_in_before"
        );

        if (!hasLoggedInBefore) {
          console.log(
            "[AuthService] User has never logged in before, cannot login offline"
          );
          throw new Error("OFFLINE_MODE_NO_PREVIOUS_LOGIN");
        }

        // Queue the request for later sync
        await offlineService.queueRequest({
          method: "POST",
          url: "/auth/login",
          data: JSON.stringify(loginPayload),
        });

        // Check if we have cached authentication tokens
        const cachedToken = await AsyncStorage.getItem("my_token");
        const cachedUserId = await AsyncStorage.getItem("user_id");

        if (cachedToken && cachedUserId) {
          console.log(
            "[AuthService] Using cached authentication for offline login"
          );
          return {
            access_token: cachedToken,
            refresh_token: (await AsyncStorage.getItem("refresh_token")) || "",
            token_type: "bearer",
            role: "extension_officer", // Default role
            status: "offline",
            password_reset_required: false,
          };
        }

        // If no cached auth but user has logged in before, still throw error
        // but with a different message
        throw new Error("OFFLINE_MODE");
      }

      const response = await axiosInstance.post("/auth/login", loginPayload);

      console.log("[AuthService] Login response status:", response.status);
      console.log("[AuthService] Login response data:", response.data);

      // Only store credentials AFTER successful login
      // This ensures offline login only works if user has logged in before
      if (response.data && credentials.email) {
        try {
          await offlineService.storeCredentials(
            credentials.email,
            credentials.password
          );
          // Mark that user has successfully logged in before
          await AsyncStorage.setItem("has_logged_in_before", "true");
          console.log(
            "[AuthService] Credentials stored for future offline login"
          );
        } catch (error) {
          console.warn(
            "[AuthService] Failed to store credentials for offline login:",
            error
          );
          // Don't fail the login if credential storage fails
        }
      }

      return response.data;
    } catch (error: any) {
      console.error("[AuthService] Login error:", error);

      // If it's a network error and we're offline, handle offline mode
      if (!error.response && !offlineService.isDeviceOnline()) {
        // Check if user has logged in before
        const hasLoggedInBefore = await AsyncStorage.getItem(
          "has_logged_in_before"
        );

        if (!hasLoggedInBefore) {
          console.log(
            "[AuthService] Network error and user has never logged in before"
          );
          throw new Error("OFFLINE_MODE_NO_PREVIOUS_LOGIN");
        }

        // Check for cached credentials and tokens
        const cachedToken = await AsyncStorage.getItem("my_token");
        const cachedUserId = await AsyncStorage.getItem("user_id");

        if (cachedToken && cachedUserId) {
          console.log("[AuthService] Network error but using cached auth");
          return {
            access_token: cachedToken,
            refresh_token: (await AsyncStorage.getItem("refresh_token")) || "",
            token_type: "bearer",
            role: "extension_officer",
            status: "offline",
            password_reset_required: false,
          };
        }
      }

      throw error;
    }
  },

  signup: async (data: SignupData) => {
    try {
      const signupPayload: any = {
        email: data.email,
        phone_number: data.phone_number,
        first_name: data.firstName,
        last_name: data.lastName,
      };

      const response = await axiosInstance.post("/auth/signup", signupPayload);

      return response.data;
    } catch (error) {
      console.error("Signup service error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("my_token");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("user_id");
      // Note: We keep "has_logged_in_before" flag so user can still login offline
      // We also keep stored credentials for offline login convenience
      // Only clear credentials if explicitly requested (e.g., account deletion)
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  deleteUser: async () => {
    try {
      const response = await axiosInstance.delete("/user/me");
      return response.data;
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  },

  getFCMToken: async () => {
    try {
      return await AsyncStorage.getItem("fcm_token");
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  },

  forgotPassword: async (email?: string, phone_number?: string) => {
    try {
      if (!email && !phone_number) {
        throw new Error("Either email or phone_number must be provided");
      }
      const payload = email ? { email } : { phone_number };
      const response = await axiosInstance.post(
        "/auth/forgot-password",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  forgotMembershipID: async (email: string, firstName: string) => {
    try {
      const payload = {
        email,
        first_name: firstName,
      };
      console.log("Forgot membership ID payload:", payload);
      const response = await axiosInstance.post(
        "/auth/forgot-membership",
        payload
      );
      console.log("Forgot membership ID response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Forgot membership ID error:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
      throw error;
    }
  },

  verifyCode: async (params: { email: string; otp: string }) => {
    try {
      const response = await axiosInstance.post(
        "/auth/verify-reset-otp",
        params
      );
      console.log("responseData", response.data);
      return response.data;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  },

  verifyEmail: async (params: { email: string; otp: string }) => {
    console.log("AuthService: Verifying email with params:", params);
    try {
      const response = await axiosInstance.post("/auth/verify-email", params);
      console.log("responseData", response.data);
      return response.data;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  },

  resetPassword: async (resetPasswordData: {
    reset_token: string;
    new_password: string;
  }) => {
    try {
      console.log("AuthService: Sending reset password request with data:", {
        reset_token: resetPasswordData.reset_token
          ? `${resetPasswordData.reset_token.substring(0, 10)}...`
          : "undefined",
        new_password: resetPasswordData.new_password
          ? `${resetPasswordData.new_password.substring(0, 3)}...`
          : "undefined",
        password_length: resetPasswordData.new_password?.length,
      });

      const response = await axiosInstance.post(
        "/auth/reset-password",
        resetPasswordData
      );
      console.log("AuthService: Reset password response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  },

  changePassword: async (changePasswordData: {
    membership_id?: string;
    new_password: string;
  }) => {
    try {
      // Build payload - if membership_id is not provided, just send new_password
      const payload = changePasswordData.membership_id
        ? changePasswordData
        : { new_password: changePasswordData.new_password };

      // Verify token is available before making request
      const token = await AsyncStorage.getItem("my_token");
      console.log("[AuthService] Sending change password request with data:", {
        hasMembershipId: !!payload.membership_id,
        new_password: payload.new_password
          ? `${payload.new_password.substring(0, 3)}...`
          : "undefined",
        password_length: payload.new_password?.length,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
      });

      if (!token) {
        console.error(
          "[AuthService] No authentication token available for change password"
        );
        throw new Error(
          "Authentication required. Please log in again and try changing your password."
        );
      }

      const response = await axiosInstance.post(
        "/auth/change-password",
        payload
      );
      console.log("[AuthService] Change password response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AuthService] Change password error:", error);
      throw error;
    }
  },

  getCurrentToken: async () => {
    try {
      return await AsyncStorage.getItem("my_token");
    } catch (error) {
      console.error("Get token error:", error);
      return null;
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  },

  resendVerificationCode: async (params: { email: string }) => {
    try {
      const response = await axiosInstance.post("/auth/resend-otp", params);
      return response.data;
    } catch (error) {
      console.error("Resend verification code error:", error);
      throw error;
    }
  },

  resendEmailVerification: async (params: { email: string }) => {
    try {
      const response = await axiosInstance.post(
        "/auth/resend-verification",
        params
      );
      return response.data;
    } catch (error) {
      console.error("Resend verification code error:", error);
      throw error;
    }
  },

  verifyEmailToken: async (token: string) => {
    try {
      console.log(
        "AuthService: Verifying email with token:",
        token.substring(0, 10) + "..."
      );
      const response = await axiosInstance.post("/auth/verify-email-token", {
        token,
      });
      console.log("Email verification response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      // Clear all authentication data from AsyncStorage
      await AsyncStorage.removeItem("my_token");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("user_id");
      await AsyncStorage.removeItem("fcm_token");
      await AsyncStorage.removeItem("has_logged_in_before");

      // Clear stored credentials for offline login
      await offlineService.clearStoredCredentials();

      // Call the store logout to clear state
      useStore.getState().logout();
    } catch (error) {
      // Even if there's an error, still try to logout
      useStore.getState().logout();
      throw error;
    }
  },
};
