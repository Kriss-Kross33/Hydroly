/**
 * RevenueCat Service Types
 */

import {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

export interface SubscriptionStatus {
  isPro: boolean;
  hasActiveSubscription: boolean;
  subscriptionType?: string;
  expirationDate?: Date | null;
  isTrial?: boolean;
  periodType?: "TRIAL" | "NORMAL" | "INTRO";
}

export interface RevenueCatConfig {
  iosApiKey: string;
  androidApiKey: string;
  entitlementId: string;
  productIds: {
    monthly: {
      ios: string;
      android: string;
    };
    yearly: {
      ios: string;
      android: string;
    };
  };
}

export interface ExistingSubscriptionCheck {
  hasSubscription: boolean;
  customerInfo: CustomerInfo | null;
  entitlements: Record<string, any>;
}

export interface LinkSubscriptionResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  entitlements?: Record<string, any>;
  error?: string;
}

export type { CustomerInfo, PurchasesOffering, PurchasesPackage };
