import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clearSession } from "../services/sessionService";
import useStore from "../store/useStore";
// import useStore from '../store/useStore';

import { API_BASE_URL } from "../config/environment";

// Define non-authenticated endpoints
const nonAuthEndpoints = [
  "/auth/login",
  "/extension-officers",
  // "/auth/change-password",
];

console.log(`\n\n\n\n\n\nAPI_BASE_URL: ${API_BASE_URL}\n\n\n\n\n\n`);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem("my_token");

      // Check if this is a FormData request
      const isFormData = config.data instanceof FormData;

      // For FormData requests, remove Content-Type header to let React Native set it with boundary
      if (isFormData) {
        // Remove Content-Type header - React Native will set it automatically with boundary
        if (config.headers) {
          delete config.headers["Content-Type"];
          delete config.headers["content-type"];
        }
      }

      // Only add token if endpoint requires auth and we have a token
      if (
        token &&
        !nonAuthEndpoints.some((endpoint) => config.url?.includes(endpoint))
      ) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Adding auth token to request:", config.url);
      } else if (
        !token &&
        !nonAuthEndpoints.some((endpoint) => config.url?.includes(endpoint))
      ) {
        console.log(
          "No auth token available for protected endpoint:",
          config.url
        );
      }

      // Log request details for debugging
      console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        if (isFormData) {
          console.log("Request body: FormData (multipart/form-data)");
        } else {
          try {
            console.log("Request body:", JSON.stringify(config.data, null, 2));
          } catch {
            console.log("Request body: [Unable to stringify]");
          }
        }
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle network errors (no internet connection)
    if (!error.response) {
      console.debug("Network error:", error || "No internet connection");
      // Create a user-friendly network error
      const networkError = new Error(
        "Please check your internet connection and try again."
      );
      return Promise.reject(networkError);
    }

    // Handle server errors (500, 502, 503, 504 - backend unavailable)
    if (
      error.response?.status === 500 ||
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      error.response?.status === 504
    ) {
      console.error(`${error.response.status} Server error:`, error.message);
      const serverError = new Error(
        "We're currently experiencing technical issues. Please try again later."
      );
      return Promise.reject(serverError);
    }

    // Handle 409 Conflict errors (like duplicate account requests)
    if (error.response?.status === 409) {
      console.error("409 Conflict error:", error.message);
      const conflictError = new Error(
        (error.response?.data as any)?.detail ||
          "A conflict occurred. Please try again."
      );
      return Promise.reject(conflictError);
    }

    // Handle 422 Unprocessable Entity errors (validation errors)
    if (error.response?.status === 422) {
      console.error("422 Validation error:", error.message);
      console.error(
        "Validation error response data:",
        JSON.stringify(error.response?.data, null, 2)
      );

      const responseData = error.response?.data as any;
      let errorMessage = "Validation failed. Please check your input.";
      const validationErrors: any[] = [];

      // Extract validation errors from detail array
      if (responseData?.detail && Array.isArray(responseData.detail)) {
        const errorMessages: string[] = [];

        responseData.detail.forEach((err: any) => {
          if (err.msg) {
            errorMessages.push(err.msg);
            validationErrors.push({
              field: err.loc?.[err.loc.length - 1] || "unknown",
              message: err.msg,
              type: err.type,
              location: err.loc,
            });
          }
        });

        if (errorMessages.length > 0) {
          // If there's only one error, show it directly
          if (errorMessages.length === 1) {
            errorMessage = errorMessages[0];
          } else {
            // If multiple errors, show a summary with the first few
            const firstFew = errorMessages.slice(0, 3).join("; ");
            const remaining = errorMessages.length - 3;
            errorMessage =
              remaining > 0
                ? `${firstFew}${
                    remaining > 0
                      ? ` (and ${remaining} more error${
                          remaining > 1 ? "s" : ""
                        })`
                      : ""
                  }`
                : errorMessages.join("; ");
          }
        }
      } else if (typeof responseData?.detail === "string") {
        errorMessage = responseData.detail;
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      }

      const validationError: any = new Error(errorMessage);
      validationError.response = error.response;
      validationError.status = 422;
      validationError.validationErrors = validationErrors; // Attach structured errors for component access
      validationError.rawDetail = responseData?.detail; // Attach raw detail for advanced handling

      return Promise.reject(validationError);
    }

    // Handle other 4xx client errors
    if (error.response?.status >= 400 && error.response?.status < 500) {
      console.error(`${error.response.status} Client error:`, error.message);
      console.error(
        "Client error response data:",
        JSON.stringify(error.response?.data, null, 2)
      );

      // Extract error message from various possible formats
      let errorMessage = "An error occurred. Please try again.";
      const responseData = error.response?.data as any;

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (responseData) {
        // Try different common error message fields
        errorMessage =
          responseData.detail?.message ||
          (typeof responseData.detail === "string"
            ? responseData.detail
            : null) ||
          responseData.message ||
          responseData.error ||
          JSON.stringify(responseData.detail) ||
          errorMessage;
      }

      const clientError: any = new Error(errorMessage);
      clientError.response = error.response;
      clientError.status = error.response.status;
      return Promise.reject(clientError);
    }

    // Handle other 5xx server errors (if any not covered above)
    if (error.response?.status >= 500 && error.response?.status < 600) {
      console.error(`${error.response.status} Server error:`, error.message);
      const serverError = new Error(
        "We're currently experiencing technical issues. Please try again later."
      );
      return Promise.reject(serverError);
    }

    // Handle 401/403 errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't handle auth errors for login/register endpoints
      if (
        nonAuthEndpoints.some((endpoint) =>
          originalRequest?.url?.includes(endpoint)
        )
      ) {
        return Promise.reject(error);
      }

      // Special handling for email verification required error
      const errorDetail = (error.response?.data as any)?.detail;
      if (
        errorDetail &&
        typeof errorDetail === "string" &&
        errorDetail.toLowerCase().includes("email verification required")
      ) {
        console.log(
          "Email verification required - letting component handle routing"
        );
        return Promise.reject(error);
      }

      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");

        // If we have a refresh token, try to refresh
        if (refreshToken) {
          try {
            console.log(
              "Attempting token refresh with token:",
              refreshToken.substring(0, 10) + "..."
            );
            const response = await axiosInstance.post("/auth/refresh", {
              refresh_token: refreshToken,
            });

            const {
              access_token,
              refresh_token: newRefreshToken,
              user,
            } = response.data;

            console.log("Token refresh successful:", {
              hasAccessToken: !!access_token,
              hasNewRefreshToken: !!newRefreshToken,
              userId: user?.id,
            });

            // Update tokens in storage
            await AsyncStorage.setItem("my_token", access_token);
            if (newRefreshToken) {
              await AsyncStorage.setItem("refresh_token", newRefreshToken);
            }

            // Update store with new authentication state
            const store = useStore.getState();
            store.setAuthenticated(
              true,
              access_token,
              user?.id || store.userId || ""
            );

            // Retry original request
            if (originalRequest) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // Clear tokens and logout
            await handleLogout();
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, logout
          console.log("No refresh token available, logging out");
          try {
            const keys = await AsyncStorage.getAllKeys();
            console.log("Available storage keys:", keys);
          } catch (keysError) {
            console.log("Could not get storage keys:", keysError);
          }
          await handleLogout();
          return Promise.reject(error);
        }
      } catch (storageError) {
        console.error(
          "Error accessing storage during token refresh:",
          storageError
        );
        await handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle logout
const handleLogout = async () => {
  try {
    // Clear session using the session service
    await clearSession();

    // Update store state
    const store = useStore.getState();
    store.logout();

    console.log("User logged out due to token expiration");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// Helper function to set auth tokens
export const setAuthTokens = async (
  accessToken: string,
  refreshToken?: string,
  userId?: string
) => {
  try {
    await AsyncStorage.setItem("my_token", accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem("refresh_token", refreshToken);
    }
    if (userId) {
      await AsyncStorage.setItem("user_id", userId);
    }
  } catch (error) {
    console.error("Error setting auth tokens:", error);
  }
};

// Helper function to clear auth tokens
export const clearAuthTokens = async () => {
  try {
    await clearSession();
  } catch (error) {
    console.error("Error clearing auth tokens:", error);
  }
};

export default axiosInstance;
