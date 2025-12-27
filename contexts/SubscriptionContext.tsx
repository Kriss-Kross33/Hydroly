import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionPlan,
  SubscriptionPeriod,
  FeatureAccess,
  UpsellTrigger,
} from "@/types/subscription";
import { revenueCatService } from "@hydroly/revenuecat-service";
import { PurchasesPackage } from "react-native-purchases";
import { Platform } from "react-native";
import { getRevenueCatConfig } from "@/src/config/revenuecat";
import NetInfo from "@react-native-community/netinfo";

const SUBSCRIPTION_KEY = "@water_tracker_subscription";
const TRIAL_KEY = "@water_tracker_trial";
const UPSELL_TRIGGERS_KEY = "@water_tracker_upsell_triggers";

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  tier: "free",
  isActive: false,
  willRenew: false,
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // Pro Tier - $2.99/month, $24.99/year (30% off)
  {
    id: "pro_monthly",
    tier: "pro",
    period: "monthly",
    price: 2.99,
    currency: "USD",
    displayPrice: "$2.99",
  },
  {
    id: "pro_yearly",
    tier: "pro",
    period: "yearly",
    price: 24.99,
    currency: "USD",
    displayPrice: "$24.99",
    savings: "Save 30%",
    isPopular: true,
  },
  // Pro Plus Tier - $7.99/month, $67.12/year (30% off)
  // Note: Pro Plus exists in code but features are not shown yet
  // Yearly calculation: $7.99 * 12 = $95.88, 30% off = $67.12
  {
    id: "pro_plus_monthly",
    tier: "pro_plus",
    period: "monthly",
    price: 7.99,
    currency: "USD",
    displayPrice: "$7.99",
  },
  {
    id: "pro_plus_yearly",
    tier: "pro_plus",
    period: "yearly",
    price: 67.12,
    currency: "USD",
    displayPrice: "$67.12",
    savings: "Save 30%",
  },
];

function getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
  const baseAccess: FeatureAccess = {
    smartGoals: false,
    advancedReminders: false,
    monthlyReports: false,
    yearlyReports: false,
    beverageIntelligence: false,
    recoveryMode: false,
    cloudSync: false,
    dataExport: false,
    customRoutines: false,
    noAds: false,
    aiCoach: false,
    healthCorrelations: false,
    predictiveAlerts: false,
    wearableIntegration: false,
  };

  // All paid tiers map to 'pro' entitlement
  // Feature flags (from backend) will differentiate Pro and Pro Plus
  // For now, we grant base Pro features to all paid tiers
  // Server-side feature flags will enable Pro Plus features

  if (tier === "pro_plus" || tier === "pro") {
    // Base Pro features (available to all paid tiers)
    // Server-side feature flags will add Pro Plus features:
    // - Advanced analytics, goal history, deeper insights, priority reminders, basic exports
    return {
      ...baseAccess,
      smartGoals: true,
      advancedReminders: true,
      monthlyReports: true,
      yearlyReports: true,
      beverageIntelligence: true,
      recoveryMode: true,
      cloudSync: false, // Will be enabled via feature flags for Pro Plus
      dataExport: false, // Will be enabled via feature flags for Pro Plus
      customRoutines: true,
      noAds: true,
      aiCoach: false, // Will be enabled via feature flags for Pro Plus
      healthCorrelations: false, // Will be enabled via feature flags for Pro Plus
      predictiveAlerts: false, // Will be enabled via feature flags for Pro Plus
      wearableIntegration: false, // Will be enabled via feature flags for Pro Plus
    };
  }

  return baseAccess;
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [subscription, setSubscription] =
    useState<SubscriptionStatus>(DEFAULT_SUBSCRIPTION);
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<number | null>(null);
  const [triggeredUpsells, setTriggeredUpsells] = useState<Set<UpsellTrigger>>(
    new Set()
  );
  const [isCheckingRevenueCat, setIsCheckingRevenueCat] = useState(false);

  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      return stored
        ? (JSON.parse(stored) as SubscriptionStatus)
        : DEFAULT_SUBSCRIPTION;
    },
  });

  const trialQuery = useQuery({
    queryKey: ["trial"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(TRIAL_KEY);
      return stored
        ? JSON.parse(stored)
        : { isOnTrial: false, expiresAt: null };
    },
  });

  const upsellTriggersQuery = useQuery({
    queryKey: ["upsellTriggers"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(UPSELL_TRIGGERS_KEY);
      return stored
        ? new Set<UpsellTrigger>(JSON.parse(stored))
        : new Set<UpsellTrigger>();
    },
  });

  const saveSubscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionStatus) => {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveTrialMutation = useMutation({
    mutationFn: async (data: {
      isOnTrial: boolean;
      expiresAt: number | null;
    }) => {
      await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveUpsellTriggersMutation = useMutation({
    mutationFn: async (triggers: Set<UpsellTrigger>) => {
      await AsyncStorage.setItem(
        UPSELL_TRIGGERS_KEY,
        JSON.stringify(Array.from(triggers))
      );
      return triggers;
    },
  });

  useEffect(() => {
    if (subscriptionQuery.data) {
      setSubscription(subscriptionQuery.data);
    }
  }, [subscriptionQuery.data]);

  useEffect(() => {
    if (trialQuery.data) {
      setIsOnTrial(trialQuery.data.isOnTrial);
      setTrialExpiresAt(trialQuery.data.expiresAt);
    }
  }, [trialQuery.data]);

  useEffect(() => {
    if (upsellTriggersQuery.data) {
      setTriggeredUpsells(upsellTriggersQuery.data);
    }
  }, [upsellTriggersQuery.data]);

  // Check RevenueCat subscription status on mount and when subscription changes
  useEffect(() => {
    async function checkRevenueCatStatus() {
      // Skip if already checking
      if (isCheckingRevenueCat) return;

      try {
        setIsCheckingRevenueCat(true);

        // Check network connectivity first
        const netInfo = await NetInfo.fetch();
        const isOnline =
          netInfo.isConnected === true && netInfo.isInternetReachable !== false;

        if (!isOnline) {
          console.log(
            "[SubscriptionContext] No internet connection, skipping RevenueCat check"
          );
          // Keep local subscription status when offline
          return;
        }

        // Wait a bit to ensure RevenueCat is initialized by RevenueCatProvider
        // RevenueCatProvider initializes asynchronously, so we need to retry if not ready
        let retries = 0;
        const maxRetries = 5;
        let status;

        while (retries < maxRetries) {
          try {
            status = await revenueCatService.checkSubscriptionStatus();
            break; // Success, exit retry loop
          } catch (error: any) {
            if (error?.message?.includes("not initialized")) {
              retries++;
              if (retries < maxRetries) {
                // Wait 500ms before retrying
                await new Promise((resolve) => setTimeout(resolve, 500));
                continue;
              }
            }
            // If it's a different error or max retries reached, throw
            throw error;
          }
        }

        if (!status) {
          // If we couldn't get status after retries, fallback to local storage
          return;
        }

        if (status.hasActiveSubscription) {
          // All RevenueCat subscriptions map to 'pro' entitlement
          // Feature flags (Pro+ features) are determined server-side
          const expiresAt = status.expirationDate?.getTime();
          const period: SubscriptionPeriod = status.subscriptionType
            ?.toLowerCase()
            .includes("yearly")
            ? "yearly"
            : "monthly";

          const revenueCatSubscription: SubscriptionStatus = {
            tier: "pro", // Always 'pro' if has active subscription
            isActive: true,
            expiresAt,
            period,
            willRenew: !!expiresAt,
          };

          // Update state if different from current
          if (
            JSON.stringify(revenueCatSubscription) !==
            JSON.stringify(subscription)
          ) {
            setSubscription(revenueCatSubscription);
            saveSubscriptionMutation.mutate(revenueCatSubscription);
          }

          // Check if on trial
          if (status.isTrial) {
            setIsOnTrial(true);
            if (expiresAt) {
              setTrialExpiresAt(expiresAt);
              saveTrialMutation.mutate({ isOnTrial: true, expiresAt });
            }
          } else {
            setIsOnTrial(false);
            setTrialExpiresAt(null);
            saveTrialMutation.mutate({ isOnTrial: false, expiresAt: null });
          }
        } else {
          // No active subscription in RevenueCat - reset to free
          // This ensures users who had simulated pro are reset when online
          const freeSubscription: SubscriptionStatus = {
            tier: "free",
            isActive: false,
            willRenew: false,
          };

          // Only update if current subscription is not free (to avoid unnecessary updates)
          if (subscription.tier !== "free" || subscription.isActive) {
            console.log(
              "[SubscriptionContext] No active subscription in RevenueCat, resetting to free"
            );
            setSubscription(freeSubscription);
            saveSubscriptionMutation.mutate(freeSubscription);
            setIsOnTrial(false);
            setTrialExpiresAt(null);
            saveTrialMutation.mutate({ isOnTrial: false, expiresAt: null });
          }
        }
      } catch (error) {
        console.error(
          "[SubscriptionContext] Error checking RevenueCat status:",
          error
        );
        // Fallback to local storage on error (might be offline or RevenueCat issue)
      } finally {
        setIsCheckingRevenueCat(false);
      }
    }

    // Check RevenueCat status after local storage loads
    if (!subscriptionQuery.isLoading) {
      checkRevenueCatStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionQuery.isLoading]);

  const startTrial = async () => {
    // Note: Trials are handled automatically by RevenueCat when purchasing
    // This function is kept for backward compatibility but should trigger a purchase
    // with a trial-enabled product. For now, we'll attempt to purchase the monthly plan
    // which should have a trial if configured in RevenueCat.
    try {
      // Get offerings to find a package with trial
      const offering = await revenueCatService.getOfferings();
      if (!offering || !offering.availablePackages.length) {
        throw new Error("No offerings available for trial");
      }

      // Find monthly package (typically has trial)
      const monthlyPackage = offering.availablePackages.find((pkg) => {
        const productId = pkg.product.identifier.toLowerCase();
        return productId.includes("monthly");
      });

      if (!monthlyPackage) {
        throw new Error("No monthly package available for trial");
      }

      // Purchase the package (RevenueCat will handle trial automatically)
      await purchase("pro_monthly");
    } catch (error: any) {
      console.error("[SubscriptionContext] Trial start failed:", error);
      throw error;
    }
  };

  const purchase = async (planId: string) => {
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) {
        throw new Error(`Plan not found: ${planId}`);
      }

      // Get offerings from RevenueCat
      const offering = await revenueCatService.getOfferings();
      if (!offering || !offering.availablePackages.length) {
        throw new Error("No offerings available from RevenueCat");
      }

      // Find the package that matches our plan by product identifier
      // All products map to the same 'pro' entitlement, so we match by product ID
      let packageToPurchase: PurchasesPackage | null = null;

      const config = getRevenueCatConfig();
      const platform = Platform.OS as "ios" | "android";

      // Determine expected product ID based on plan
      let expectedProductId: string | undefined;

      if (plan.period === "monthly") {
        expectedProductId = config.productIds.monthly[platform];
      } else if (plan.period === "yearly") {
        expectedProductId = config.productIds.yearly[platform];
      }

      // Match package by product identifier
      // RevenueCat packages contain a product with an identifier
      if (expectedProductId) {
        packageToPurchase =
          offering.availablePackages.find((pkg) => {
            // Access product identifier from package
            const pkgProductId = pkg.product.identifier;
            return pkgProductId === expectedProductId;
          }) || null;
      }

      // Fallback: try to match by package identifier patterns
      if (!packageToPurchase) {
        // Try common RevenueCat package identifier patterns
        const possibleIdentifiers = [
          planId,
          planId.replace("_", "$"),
          planId.replace("_", "-"),
          `$${planId}`,
        ];

        packageToPurchase =
          offering.availablePackages.find((pkg) =>
            possibleIdentifiers.includes(pkg.identifier)
          ) || null;
      }

      // Last resort: use first available package matching the period
      if (!packageToPurchase) {
        const periodMatch = offering.availablePackages.find((pkg) => {
          const pkgProductId = pkg.product.identifier.toLowerCase();
          const isMonthly =
            plan.period === "monthly" && pkgProductId.includes("monthly");
          const isYearly =
            plan.period === "yearly" && pkgProductId.includes("yearly");
          return isMonthly || isYearly;
        });

        packageToPurchase =
          periodMatch || offering.availablePackages[0] || null;

        if (packageToPurchase) {
          console.warn(
            `[SubscriptionContext] Using fallback package for ${planId}:`,
            packageToPurchase.identifier
          );
        }
      }

      if (!packageToPurchase) {
        throw new Error("No package available for purchase");
      }

      console.log("[SubscriptionContext] Purchasing package:", {
        planId,
        packageIdentifier: packageToPurchase.identifier,
        productId: packageToPurchase.product.identifier,
      });

      // Purchase via RevenueCat
      await revenueCatService.purchasePackage(packageToPurchase);

      // Update subscription from RevenueCat response
      // Use checkSubscriptionStatus as source of truth - it checks for any active entitlement
      // This handles cases where RevenueCat uses different entitlement IDs (e.g., "Hydroly Pro" vs "pro")
      const status = await revenueCatService.checkSubscriptionStatus();
      const expiresAt = status.expirationDate?.getTime();

      // Determine period from subscription type or product identifier
      let period: SubscriptionPeriod = "monthly";
      if (
        status.subscriptionType?.toLowerCase().includes("yearly") ||
        packageToPurchase.product.identifier.toLowerCase().includes("yearly")
      ) {
        period = "yearly";
      }

      // All purchases map to 'pro' entitlement (architecture requirement)
      // Use status.hasActiveSubscription as the source of truth since it checks for any active entitlement
      const newSubscription: SubscriptionStatus = {
        tier: status.hasActiveSubscription ? "pro" : "free",
        isActive: status.hasActiveSubscription,
        expiresAt,
        period,
        willRenew: !!expiresAt && status.hasActiveSubscription,
      };

      console.log(
        "[SubscriptionContext] Updating subscription after purchase:",
        {
          newSubscription,
          statusFromRevenueCat: status,
        }
      );

      // Force update subscription state
      setSubscription(newSubscription);
      await saveSubscriptionMutation.mutateAsync(newSubscription);

      // Update trial status from RevenueCat
      if (status.isTrial) {
        setIsOnTrial(true);
        if (expiresAt) {
          setTrialExpiresAt(expiresAt);
          saveTrialMutation.mutate({ isOnTrial: true, expiresAt });
        }
      } else {
        setIsOnTrial(false);
        setTrialExpiresAt(null);
        saveTrialMutation.mutate({ isOnTrial: false, expiresAt: null });
      }
    } catch (error: any) {
      console.error("[SubscriptionContext] Purchase failed:", error);

      // Re-throw with user-friendly message
      if (error.isCancelled || error.userCancelled) {
        throw new Error("Purchase cancelled");
      }
      throw error;
    }
  };

  const restore = async () => {
    try {
      // Restore purchases from RevenueCat
      await revenueCatService.restorePurchases();

      // Check subscription status after restore
      // Use checkSubscriptionStatus as source of truth - it checks for any active entitlement
      // This handles cases where RevenueCat uses different entitlement IDs (e.g., "Hydroly Pro" vs "pro")
      const status = await revenueCatService.checkSubscriptionStatus();

      if (status.hasActiveSubscription) {
        const expiresAt = status.expirationDate?.getTime();
        const period: SubscriptionPeriod = status.subscriptionType
          ?.toLowerCase()
          .includes("yearly")
          ? "yearly"
          : "monthly";

        // All restored subscriptions map to 'pro' entitlement
        const restoredSubscription: SubscriptionStatus = {
          tier: "pro",
          isActive: true,
          expiresAt,
          period,
          willRenew: !!expiresAt,
        };

        setSubscription(restoredSubscription);
        saveSubscriptionMutation.mutate(restoredSubscription);

        // Update trial status from RevenueCat
        if (status.isTrial) {
          setIsOnTrial(true);
          if (expiresAt) {
            setTrialExpiresAt(expiresAt);
            saveTrialMutation.mutate({ isOnTrial: true, expiresAt });
          }
        } else {
          setIsOnTrial(false);
          setTrialExpiresAt(null);
          saveTrialMutation.mutate({ isOnTrial: false, expiresAt: null });
        }
      } else {
        // No active subscription found
        const freeSubscription: SubscriptionStatus = {
          tier: "free",
          isActive: false,
          willRenew: false,
        };
        setSubscription(freeSubscription);
        saveSubscriptionMutation.mutate(freeSubscription);
        setIsOnTrial(false);
        setTrialExpiresAt(null);
        saveTrialMutation.mutate({ isOnTrial: false, expiresAt: null });
      }
    } catch (error) {
      console.error("[SubscriptionContext] Restore failed:", error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    const updated: SubscriptionStatus = {
      ...subscription,
      willRenew: false,
    };
    setSubscription(updated);
    saveSubscriptionMutation.mutate(updated);
  };

  const markUpsellTriggered = (trigger: UpsellTrigger) => {
    const updated = new Set(triggeredUpsells);
    updated.add(trigger);
    setTriggeredUpsells(updated);
    saveUpsellTriggersMutation.mutate(updated);
  };

  const shouldShowUpsell = (trigger: UpsellTrigger): boolean => {
    if (subscription.isActive && subscription.tier !== "free") return false;
    return !triggeredUpsells.has(trigger);
  };

  const isPremium =
    subscription.isActive &&
    (subscription.tier === "pro" || subscription.tier === "pro_plus");
  const features = getFeatureAccess(subscription.tier);

  const getDaysRemaining = (): number | null => {
    if (!subscription.expiresAt) return null;
    const days = Math.ceil(
      (subscription.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)
    );
    return days > 0 ? days : 0;
  };

  const getTrialDaysRemaining = (): number | null => {
    if (!isOnTrial || !trialExpiresAt) return null;
    const days = Math.ceil(
      (trialExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)
    );
    return days > 0 ? days : 0;
  };

  return {
    subscription,
    isOnTrial,
    trialExpiresAt,
    isPremium,
    features,
    startTrial,
    purchase,
    restore,
    cancelSubscription,
    markUpsellTriggered,
    shouldShowUpsell,
    getDaysRemaining,
    getTrialDaysRemaining,
    isLoading: subscriptionQuery.isLoading || trialQuery.isLoading,
  };
});
