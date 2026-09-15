/**
 * RevenueCat Configuration
 *
 * Uses react-native-config. Dev builds should load `.env.staging`
 * (see package.json scripts + Android `dev` flavor + iOS scheme).
 */

import Config from "react-native-config";
import { Platform } from "react-native";
import { RevenueCatConfig } from "@hydroly/revenuecat-service";

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const fromConfig = (Config as Record<string, string | undefined>)[key];
    if (fromConfig) return fromConfig;
    const fromProcess = process.env[key];
    if (fromProcess) return fromProcess;
  }
  return "";
}

/**
 * Get RevenueCat configuration from environment variables
 */
export function getRevenueCatConfig(): RevenueCatConfig {
  // Hydroly uses a shared key; also accept Macro Meals-style split keys
  const sharedKey = readEnv("REVENUE_CAT_API_KEY");
  const iosApiKey =
    readEnv("REVENUECAT_IOS_API_KEY") || sharedKey;
  const androidApiKey =
    readEnv("REVENUECAT_ANDROID_API_KEY") || sharedKey;

  const entitlementId = readEnv("REVENUECAT_ENTITLEMENT_ID") || "pro";

  const productIds = {
    monthly: {
      ios: readEnv("IOS_PRODUCT_MONTHLY_ID") || "com.hydroly.app.pro.monthly",
      android:
        readEnv("ANDROID_PRODUCT_MONTHLY_ID") || "com.hydroly.app.pro.monthly",
    },
    yearly: {
      ios: readEnv("IOS_PRODUCT_YEARLY_ID") || "com.hydroly.app.pro.yearly",
      android:
        readEnv("ANDROID_PRODUCT_YEARLY_ID") || "com.hydroly.app.pro.yearly",
    },
  };

  return {
    iosApiKey,
    androidApiKey,
    entitlementId,
    productIds,
  };
}

/**
 * Check if RevenueCat is properly configured
 */
export function isRevenueCatConfigured(): boolean {
  const config = getRevenueCatConfig();
  const platform = Platform.OS as "ios" | "android";
  const apiKey = platform === "ios" ? config.iosApiKey : config.androidApiKey;

  return !!apiKey && apiKey.length > 0;
}
