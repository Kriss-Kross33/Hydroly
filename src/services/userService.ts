import { API_CONFIG } from "../config/api";
import axiosInstance from "../utils/axios";

export const userService = {
  /**
   * Fetches user profile information
   * @returns User profile data
   * @throws Error if the request fails
   */
  getProfile: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get("/user/me");
      console.log(
        `\n\n\n\n🔍 USER SERVICE - Profile: ${JSON.stringify(
          response.data
        )}\n\n\n\n`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  /**
   * Updates user preferences
   * @param prefs - The preferences to update
   * @returns Updated user data
   * @throws Error if the request fails
   */
  updatePreferences: async (prefs: Record<string, any>): Promise<any> => {
    try {
      const response = await axiosInstance.patch("/user/preferences", prefs);
      return response.data;
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  },

  updateProfile: async (fields: Record<string, any>): Promise<any> => {
    console.log("updateProfile called with fields:", fields);

    // Always use FormData to match Postman behavior
    console.log("Using FormData (matching Postman)");
    const formData = new FormData();

    // Map frontend field names to backend field names
    const fieldMappings: Record<string, string> = {
      gender: "sex",
      birthday: "dob",
    };

    Object.keys(fields).forEach((key) => {
      const value = fields[key];
      // Use mapped field name if it exists, otherwise use original key
      const backendFieldName = fieldMappings[key] || key;

      console.log(`Processing field ${key} -> ${backendFieldName}:`, value);

      if (value !== null && value !== undefined) {
        if (typeof value === "object" && value.uri) {
          // File object
          console.log(`Appending file for ${backendFieldName}:`, {
            uri: value.uri,
            type: value.type,
            name: value.name,
          });
          formData.append(backendFieldName, {
            uri: value.uri,
            type: value.type || "image/jpeg",
            name: value.name || "file",
          } as any);
        } else {
          // Regular field - convert to string for FormData
          let fieldValue = String(value);

          // Ensure gender values are lowercase
          if (key === "gender" && typeof value === "string") {
            fieldValue = value.toLowerCase();
            console.log(
              `Converting gender to lowercase: ${value} -> ${fieldValue}`
            );
          }

          console.log(
            `Appending regular field ${backendFieldName}:`,
            fieldValue
          );
          formData.append(backendFieldName, fieldValue);
        }
      }
    });

    console.log("=== FULL REQUEST DEBUG ===");
    console.log("Method: PATCH");
    console.log("Using FormData body (multipart/form-data)");
    console.log("FormData fields being sent:", Object.keys(fields));
    console.log("Original field values:", fields);
    console.log("=== SENDING REQUEST ===");

    try {
      const response = await axiosInstance.patch("/user/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      console.log("=== RESPONSE RECEIVED ===");
      console.log("- Parsed Response last_name:", response.data.last_name);
      console.log("- Response updated_at:", response.data.updated_at);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (data: any): Promise<any> => {
    try {
      const response = await axiosInstance.patch("/user/me", data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  /**
   * Fetches user data with detailed profile information
   * @returns User data with profile information
   * @throws Error if the request fails
   */
  fetchUserData: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get("/user/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching user data new:", error);
      throw error;
    }
  },

  /**
   * Updates the FCM token on the backend
   * @param fcmToken - The FCM token to update
   * @returns Response from the backend
   * @throws Error if the request fails
   */
  updateFCMToken: async (fcmToken: string): Promise<any> => {
    console.log("Sending FCM token to backend:", fcmToken);
    try {
      const response = await axiosInstance.patch("/user/me", {
        fcm_token: fcmToken,
      });
      console.log("FCM token updated on backend successfully");
      return response.data;
    } catch (error) {
      console.error("Error updating FCM token on backend:", error);
      throw error;
    }
  },
  uploadProfileImage: async (imageUri: string, authToken: string) => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append("avatar", {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await fetch(`${API_CONFIG.BASE_URL}/user/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });
    console.log("Status:", response.status);

    const responseText = await response.text();
    if (!response.ok) {
      console.error("Upload failed:", response.status, responseText);
      throw new Error(responseText || "Upload failed");
    }
    const responseData = JSON.parse(responseText);
    console.log("Parsed JSON response:", responseData);
    return responseData;
  },
};
