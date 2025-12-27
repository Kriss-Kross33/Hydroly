/**
 * RevenueCat Configuration
 *
 * Configure RevenueCat API keys, product IDs, and entitlement ID
 * Uses react-native-config for environment variables
 */

import Config from "react-native-config";
import { Platform } from "react-native";
import { RevenueCatConfig } from "@hydroly/revenuecat-service";

/**
 * Get RevenueCat configuration from environment variables
 */
export function getRevenueCatConfig(): RevenueCatConfig {
  const iosApiKey =
    Config.REVENUE_CAT_API_KEY || process.env.REVENUE_CAT_API_KEY || "";
  const androidApiKey =
    Config.REVENUE_CAT_API_KEY || process.env.REVENUE_CAT_API_KEY || "";

  const entitlementId =
    Config.REVENUECAT_ENTITLEMENT_ID ||
    process.env.REVENUECAT_ENTITLEMENT_ID ||
    "pro";

  // Product IDs - can be overridden via environment variables
  const productIds = {
    monthly: {
      ios:
        Config.IOS_PRODUCT_MONTHLY_ID ||
        process.env.IOS_PRODUCT_MONTHLY_ID ||
        "com.hydroly.app.pro.monthly",
      android:
        Config.ANDROID_PRODUCT_MONTHLY_ID ||
        process.env.ANDROID_PRODUCT_MONTHLY_ID ||
        "com.hydroly.app.pro.monthly",
    },
    yearly: {
      ios:
        Config.IOS_PRODUCT_YEARLY_ID ||
        process.env.IOS_PRODUCT_YEARLY_ID ||
        "com.hydroly.app.pro.yearly",
      android:
        Config.ANDROID_PRODUCT_YEARLY_ID ||
        process.env.ANDROID_PRODUCT_YEARLY_ID ||
        "com.hydroly.app.pro.yearly",
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
