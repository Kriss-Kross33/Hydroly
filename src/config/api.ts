import { API_BASE_URL } from "./environment";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    LOGIN: "/auth/login",
    GOOGLE_AUTH: "/auth/google",
    APPLE_AUTH: "/auth/apple",
    FACEBOOK_AUTH: "/auth/facebook",
    SUGGEST_MEALS: "/suggest-meals",
  },
};
