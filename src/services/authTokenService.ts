import AsyncStorage from "@react-native-async-storage/async-storage";

export const authTokenService = {
  getToken: async () => {
    try {
      return await AsyncStorage.getItem("my_token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem("refresh_token");
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  setToken: async (token: string | null) => {
    if (token) {
      await AsyncStorage.setItem("my_token", token);
    } else {
      await AsyncStorage.removeItem("my_token");
    }
  },

  setRefreshToken: async (refreshToken: string | null) => {
    if (refreshToken) {
      await AsyncStorage.setItem("refresh_token", refreshToken);
    } else {
      await AsyncStorage.removeItem("refresh_token");
    }
  },

  setTokens: async (
    accessToken: string | null,
    refreshToken: string | null
  ) => {
    await authTokenService.setToken(accessToken);
    await authTokenService.setRefreshToken(refreshToken);
  },

  clearToken: async () => {
    await AsyncStorage.removeItem("my_token");
  },

  clearRefreshToken: async () => {
    await AsyncStorage.removeItem("refresh_token");
  },

  clearTokens: async () => {
    await Promise.all([
      authTokenService.clearToken(),
      authTokenService.clearRefreshToken(),
    ]);
  },

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem("my_token");
      return token;
    } catch (error) {
      console.error("Error initializing auth tokens:", error);
      return null;
    }
  },
};
