/**
 * RevenueCat Service
 *
 * Handles subscription management, purchases, and entitlements
 * - Integrates with Firebase Auth for identity linking
 * - Supports Pro and Pro Plus tiers
 * - Handles subscription restoration
 * - Manages customer attributes
 *
 * NOTE: Test Store Error (Android)
 * When using test store API keys on Android, you may see this error in logs:
 * "Error deserializing subscription information... test_store"
 * This is a known RevenueCat Android SDK issue and is harmless in development.
 * It does not affect functionality - subscriptions still work correctly.
 * This error will NOT appear in production with real store API keys.
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";
import {
  SubscriptionStatus,
  RevenueCatConfig,
  ExistingSubscriptionCheck,
  LinkSubscriptionResult,
} from "./types";

// Default configuration - should be overridden via initialize()
const DEFAULT_CONFIG: RevenueCatConfig = {
  iosApiKey: "",
  androidApiKey: "",
  entitlementId: "pro", // Default entitlement ID for Hydroly
  productIds: {
    monthly: {
      ios: "com.hydroly.app.pro.monthly",
      android: "com.hydroly.app.pro.monthly",
    },
    yearly: {
      ios: "com.hydroly.app.pro.yearly",
      android: "com.hydroly.app.pro.yearly",
    },
  },
};

class RevenueCatService {
  private isInitialized = false;
  private config: RevenueCatConfig = DEFAULT_CONFIG;
  private debugMode = false;

  /**
   * Initialize RevenueCat with configuration
   */
  async initialize(
    config: Partial<RevenueCatConfig>,
    userId?: string,
    debug = false
  ): Promise<void> {
    if (this.isInitialized) {
      if (this.debugMode) {
        console.log("[RevenueCat] Already initialized");
      }
      return;
    }

    try {
      this.debugMode = debug;
      this.config = { ...DEFAULT_CONFIG, ...config };

      const platform = Platform.OS as "ios" | "android";
      const apiKey =
        platform === "ios" ? this.config.iosApiKey : this.config.androidApiKey;

      if (!apiKey) {
        throw new Error(
          `No RevenueCat API key found for ${platform}. Please provide ${platform}ApiKey in config.`
        );
      }

      if (this.debugMode) {
        console.log("[RevenueCat] Initializing with config:", {
          platform,
          apiKey: `${apiKey.substring(0, 10)}...`,
          entitlementId: this.config.entitlementId,
          userId: userId || "anonymous",
        });
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      this.isInitialized = true;

      if (this.debugMode) {
        console.log("[RevenueCat] ✅ Initialized successfully");
      }
    } catch (error) {
      console.error("[RevenueCat] ❌ Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Get current offerings (subscription packages)
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    this.ensureInitialized();

    try {
      if (this.debugMode) {
        console.log("[RevenueCat] Fetching offerings...");
      }

      const offerings = await Purchases.getOfferings();

      if (this.debugMode) {
        console.log(
          "[RevenueCat] Current offering:",
          offerings.current?.identifier
        );
        if (offerings.current) {
          console.log(
            "[RevenueCat] Available packages:",
            offerings.current.availablePackages.map((p) => p.identifier)
          );
        }
      }

      return offerings.current;
    } catch (error) {
      console.error("[RevenueCat] ❌ Failed to get offerings:", error);
      return null;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(
    packageToPurchase: PurchasesPackage
  ): Promise<CustomerInfo> {
    this.ensureInitialized();

    try {
      if (this.debugMode) {
        console.log(
          "[RevenueCat] Starting purchase for package:",
          packageToPurchase.identifier
        );
      }

      const { customerInfo } =
        await Purchases.purchasePackage(packageToPurchase);

      // Check if the entitlement was granted
      const hasEntitlement =
        customerInfo.entitlements.active[this.config.entitlementId] !==
        undefined;

      if (this.debugMode) {
        console.log("[RevenueCat] ✅ Purchase successful:", {
          hasEntitlement,
          entitlementId: this.config.entitlementId,
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
        });
      }

      if (!hasEntitlement) {
        console.warn(
          "[RevenueCat] ⚠️ Purchase completed but entitlement not found. Expected:",
          this.config.entitlementId
        );
      }

      return customerInfo;
    } catch (error: any) {
      console.error("[RevenueCat] ❌ Purchase failed:", error);

      // Don't throw if user cancelled
      if (error.userCancelled) {
        throw { ...error, isCancelled: true };
      }

      throw error;
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    this.ensureInitialized();

    try {
      const customerInfo = await Purchases.restorePurchases();

      if (this.debugMode) {
        console.log("[RevenueCat] ✅ Purchases restored:", {
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
        });
      }

      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] ❌ Restore purchases failed:", error);
      throw error;
    }
  }

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    this.ensureInitialized();

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error: any) {
      // Suppress known test_store deserialization error in development
      // This is a harmless RevenueCat Android SDK issue with test store API keys
      if (
        error?.message?.includes("test_store") ||
        error?.message?.includes("SerializationException")
      ) {
        if (this.debugMode) {
          console.log(
            "[RevenueCat] ⚠️ Test store deserialization warning (harmless in development)"
          );
        }
        // Still try to get customer info - this error doesn't prevent functionality
        try {
          return await Purchases.getCustomerInfo();
        } catch (retryError) {
          console.error(
            "[RevenueCat] ❌ Failed to get customer info:",
            retryError
          );
          throw retryError;
        }
      }
      console.error("[RevenueCat] ❌ Failed to get customer info:", error);
      throw error;
    }
  }

  /**
   * Check subscription status
   */
  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    this.ensureInitialized();

    try {
      let customerInfo: CustomerInfo;
      try {
        customerInfo = await this.getCustomerInfo();
      } catch (error: any) {
        // Suppress test_store deserialization errors - they don't affect functionality
        if (
          error?.message?.includes("test_store") ||
          error?.message?.includes("SerializationException")
        ) {
          // Retry once - sometimes the error is transient
          try {
            customerInfo = await Purchases.getCustomerInfo();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (retryError) {
            // If retry fails, return default status
            if (this.debugMode) {
              console.log(
                "[RevenueCat] ⚠️ Using fallback subscription status due to test store error"
              );
            }
            return {
              isPro: false,
              hasActiveSubscription: false,
            };
          }
        } else {
          throw error;
        }
      }

      // Check for active entitlements
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      const isPro = activeEntitlements.length > 0;
      const hasActiveSubscription = isPro;

      let subscriptionType: string | undefined;
      let expirationDate: Date | null | undefined;
      let isTrial = false;
      let periodType: "TRIAL" | "NORMAL" | "INTRO" | undefined;

      if (isPro) {
        // Get the active entitlement
        const entitlement =
          customerInfo.entitlements.active[this.config.entitlementId] ||
          Object.values(customerInfo.entitlements.active)[0];

        if (entitlement) {
          subscriptionType = entitlement.productIdentifier;
          expirationDate = entitlement.expirationDate
            ? new Date(entitlement.expirationDate)
            : null;
          isTrial = entitlement.periodType === "TRIAL";
          periodType = entitlement.periodType as "TRIAL" | "NORMAL" | "INTRO";
        }
      }

      if (this.debugMode) {
        console.log("[RevenueCat] Subscription status:", {
          isPro,
          hasActiveSubscription,
          subscriptionType,
          expirationDate,
          isTrial,
          activeEntitlements,
        });
      }

      return {
        isPro,
        hasActiveSubscription,
        subscriptionType,
        expirationDate,
        isTrial,
        periodType,
      };
    } catch (error) {
      console.error(
        "[RevenueCat] ❌ Failed to check subscription status:",
        error
      );
      return {
        isPro: false,
        hasActiveSubscription: false,
      };
    }
  }

  /**
   * Link user identity (used with Firebase Auth)
   * Call this when user logs in to link anonymous subscription to authenticated user
   */
  async logIn(firebaseUid: string): Promise<CustomerInfo> {
    this.ensureInitialized();

    try {
      if (this.debugMode) {
        console.log("[RevenueCat] Linking identity:", firebaseUid);
      }

      const logInResult = await Purchases.logIn(firebaseUid);
      const customerInfo = logInResult.customerInfo;

      if (this.debugMode) {
        console.log("[RevenueCat] ✅ Identity linked:", {
          created: logInResult.created,
          originalAppUserId: customerInfo.originalAppUserId,
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
        });
      }

      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] ❌ Failed to link identity:", error);
      throw error;
    }
  }

  /**
   * Log out (but keep subscription)
   */
  async logOut(): Promise<CustomerInfo> {
    this.ensureInitialized();

    try {
      const customerInfo = await Purchases.logOut();

      if (this.debugMode) {
        console.log("[RevenueCat] ✅ User logged out");
      }

      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] ❌ Failed to logout:", error);
      throw error;
    }
  }

  /**
   * Set user attributes
   */
  async setAttributes(attributes: { [key: string]: string }): Promise<void> {
    this.ensureInitialized();

    try {
      await Purchases.setAttributes(attributes);

      if (this.debugMode) {
        console.log("[RevenueCat] ✅ Attributes set:", Object.keys(attributes));
      }
    } catch (error) {
      console.error("[RevenueCat] ❌ Failed to set attributes:", error);
      throw error;
    }
  }

  /**
   * Sync purchases
   */
  async syncPurchases(): Promise<CustomerInfo> {
    this.ensureInitialized();

    try {
      await Purchases.syncPurchases();

      if (this.debugMode) {
        console.log("[RevenueCat] ✅ Purchases synced");
      }

      const customerInfo = await this.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] ❌ Error syncing purchases:", error);
      throw error;
    }
  }

  /**
   * Check if user is on trial
   */
  async checkTrialStatus(): Promise<boolean> {
    this.ensureInitialized();

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement =
        customerInfo.entitlements.active[this.config.entitlementId];

      if (entitlement && entitlement.periodType === "TRIAL") {
        if (this.debugMode) {
          console.log("[RevenueCat] User is on trial");
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("[RevenueCat] ❌ Error checking trial status:", error);
      return false;
    }
  }

  /**
   * Check for existing subscription by email
   * Useful when user signs in and might have existing subscription
   */
  async checkForExistingSubscription(
    email: string
  ): Promise<ExistingSubscriptionCheck> {
    this.ensureInitialized();

    try {
      if (this.debugMode) {
        console.log("[RevenueCat] Checking for existing subscription:", email);
      }

      // Set email as attribute to help RevenueCat find the customer
      await Purchases.setAttributes({
        $email: email,
      });

      // Wait a moment for RevenueCat to process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sync purchases to ensure we have latest data
      await Purchases.syncPurchases();

      const customerInfoAfterSync = await this.getCustomerInfo();

      const hasActiveEntitlements =
        Object.keys(customerInfoAfterSync.entitlements.active).length > 0;

      if (this.debugMode) {
        console.log("[RevenueCat] Subscription check result:", {
          hasActiveEntitlements,
          activeEntitlements: Object.keys(
            customerInfoAfterSync.entitlements.active
          ),
        });
      }

      return {
        hasSubscription: hasActiveEntitlements,
        customerInfo: customerInfoAfterSync,
        entitlements: customerInfoAfterSync.entitlements.active,
      };
    } catch (error) {
      console.error(
        "[RevenueCat] ❌ Failed to check for existing subscription:",
        error
      );
      return {
        hasSubscription: false,
        customerInfo: null,
        entitlements: {},
      };
    }
  }

  /**
   * Link existing subscription to new user ID
   */
  async linkExistingSubscription(
    userId: string,
    email: string
  ): Promise<LinkSubscriptionResult> {
    this.ensureInitialized();

    try {
      if (this.debugMode) {
        console.log(
          "[RevenueCat] Linking existing subscription to user ID:",
          userId
        );
      }

      // Set email as attribute
      await Purchases.setAttributes({
        $email: email,
      });

      // Set the new user ID
      await Purchases.logIn(userId);

      // Sync purchases to link the subscription
      await Purchases.syncPurchases();

      // Get updated customer info
      const updatedCustomerInfo = await this.getCustomerInfo();

      const hasActiveSubscription =
        Object.keys(updatedCustomerInfo.entitlements.active).length > 0;

      if (this.debugMode) {
        console.log("[RevenueCat] Linking result:", {
          success: hasActiveSubscription,
          activeEntitlements: Object.keys(
            updatedCustomerInfo.entitlements.active
          ),
        });
      }

      if (hasActiveSubscription) {
        return {
          success: true,
          customerInfo: updatedCustomerInfo,
          entitlements: updatedCustomerInfo.entitlements.active,
        };
      }

      return {
        success: false,
        customerInfo: updatedCustomerInfo,
        entitlements: updatedCustomerInfo.entitlements.active,
        error: "No active entitlements found after linking",
      };
    } catch (error) {
      console.error(
        "[RevenueCat] ❌ Error linking existing subscription:",
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Whether Purchases.configure() has completed successfully
   */
  getInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Poll until initialized or timeout. Returns false if still not ready.
   */
  async waitUntilReady(
    timeoutMs = 9000,
    intervalMs = 250
  ): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (!this.isInitialized && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return this.isInitialized;
  }

  /**
   * Ensure RevenueCat is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error("RevenueCat not initialized. Call initialize() first.");
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RevenueCatConfig {
    return { ...this.config };
  }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService;
