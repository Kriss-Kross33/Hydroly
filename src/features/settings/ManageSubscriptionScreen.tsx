import {
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { revenueCatService } from "@hydroly/revenuecat-service";
import { CustomerInfo } from "react-native-purchases";
import { useAuth } from "@/contexts/AuthContext";
import { ensureRevenueCatReady } from "@/src/utils/ensureRevenueCatReady";
import { isRevenueCatConfigured } from "@/src/config/revenuecat";

interface SubscriptionDetails {
  amount: number;
  billing_interval: string;
  cancel_at_period_end: boolean;
  created: string;
  currency: string;
  current_period_end: string;
  current_period_start: string;
  has_subscription: boolean;
  next_billing_date: string;
  plan: string;
  plan_name: string;
  status: string;
  subscription_id: string;
  trial_end: string;
}

type TabType = "current" | "history";

export default function ManageSubscriptionScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(
    null
  );

  const getPlanDisplayName = (productId: string): string => {
    if (productId.toLowerCase().includes("yearly")) {
      return "Pro Yearly";
    } else if (productId.toLowerCase().includes("monthly")) {
      return "Pro Monthly";
    }
    return "Pro Plan";
  };

  useEffect(() => {
    async function fetchSubscriptionDetails() {
      try {
        setIsLoading(true);
        setUnavailableReason(null);

        if (!isRevenueCatConfigured()) {
          setUnavailableReason(
            "Subscriptions aren’t configured in this build. Add REVENUE_CAT_API_KEY to your env file and rebuild."
          );
          return;
        }

        const ready = await ensureRevenueCatReady(user?.uid);
        if (!ready) {
          setUnavailableReason(
            "Subscription service isn’t ready yet. Check your connection and try again."
          );
          return;
        }

        // Get customer info from RevenueCat
        const info = await revenueCatService.getCustomerInfo();
        setCustomerInfo(info);

        console.log(
          "[ManageSubscription] Customer info:",
          JSON.stringify(info, null, 2)
        );

        // Extract active entitlement (assume first active entitlement is the subscription)
        const activeEntitlement =
          info.entitlements?.active &&
          Object.values(info.entitlements.active)[0];
        const productId = activeEntitlement?.productIdentifier;
        console.log("[ManageSubscription] Product ID:", productId);

        const subscription = productId
          ? info.subscriptionsByProductIdentifier[productId]
          : null;

        // Get real price from offerings (not from subscription which shows $0 during trial)
        let realPrice = 0;
        let realCurrency = "USD";

        if (productId) {
          try {
            const offerings = await revenueCatService.getOfferings();
            const matchedPackage = offerings?.availablePackages?.find(
              (pkg) => pkg.product.identifier === productId
            );
            if (matchedPackage) {
              realPrice = matchedPackage.product.price;
              realCurrency = matchedPackage.product.currencyCode;
              console.log("[ManageSubscription] Real price from offerings:", {
                price: realPrice,
                currency: realCurrency,
                priceString: matchedPackage.product.priceString,
              });
            }
          } catch (error) {
            console.error(
              "[ManageSubscription] Failed to get real price from offerings:",
              error
            );
          }
        }

        if (subscription) {
          console.log(
            "[ManageSubscription] Full subscription:",
            JSON.stringify(subscription, null, 2)
          );
        }

        // Map RevenueCat data to SubscriptionDetails shape
        const mapped: SubscriptionDetails | null = subscription
          ? {
              amount:
                realPrice > 0
                  ? realPrice
                  : ((subscription as any).price?.amount ?? 0),
              billing_interval:
                subscription.periodType === "TRIAL" ? "trial" : "regular",
              cancel_at_period_end: !subscription.willRenew,
              created: subscription.originalPurchaseDate || "",
              currency:
                realCurrency || (subscription as any).price?.currency || "USD",
              current_period_end: subscription.expiresDate || "",
              current_period_start: subscription.purchaseDate || "",
              has_subscription: subscription.isActive,
              next_billing_date: subscription.expiresDate || "",
              plan: "pro",
              plan_name: getPlanDisplayName(productId || ""),
              status: subscription.isActive
                ? subscription.periodType === "TRIAL"
                  ? "trialing"
                  : "active"
                : "canceled",
              subscription_id: productId || "",
              trial_end:
                subscription.periodType === "TRIAL"
                  ? subscription.expiresDate || ""
                  : "",
            }
          : null;

        setSubscription(mapped);
      } catch (error: any) {
        console.error(
          "[ManageSubscription] Failed to fetch subscription details:",
          error
        );
        const message = error?.message || "Failed to load subscription details";
        if (
          typeof message === "string" &&
          message.includes("not initialized")
        ) {
          setUnavailableReason(
            "Subscription service isn’t ready yet. Check your connection and try again."
          );
        } else {
          setUnavailableReason(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptionDetails();
  }, [user?.uid, reloadToken]);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusDisplay = (
    status: string,
    cancelAtPeriodEnd: boolean
  ): string => {
    if (cancelAtPeriodEnd) {
      return `Cancelled (ends ${formatDate(
        subscription?.current_period_end || ""
      )})`;
    }

    const statusMap: { [key: string]: string } = {
      active: "Active",
      canceled: "Cancelled",
      past_due: "Past Due",
      unpaid: "Unpaid",
      trialing: "Trial",
    };

    return statusMap[status] || status;
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "To cancel your subscription, please use your device settings:\n\niOS: Settings → Apple ID → Subscriptions\nAndroid: Google Play Store → Subscriptions",
      [
        {
          text: "Open Settings",
          onPress: handleOpenStoreSettings,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleOpenStoreSettings = () => {
    try {
      if (Platform.OS === "ios") {
        Linking.openURL("https://apps.apple.com/account/subscriptions");
      } else {
        Linking.openURL(
          "https://play.google.com/store/account/subscriptions?package=com.hydroly.app"
        );
      }
    } catch (error) {
      console.error(
        "[ManageSubscription] Failed to open subscription settings:",
        error
      );
    }
  };

  const handleReactivateSubscription = () => {
    Alert.alert(
      "Reactivate Subscription",
      "To reactivate your subscription, you'll need to subscribe again through our payment screen.",
      [
        {
          text: "Subscribe Again",
          onPress: () => {
            navigation.navigate("Paywall" as never);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleRestore = async () => {
    try {
      await revenueCatService.restorePurchases();
      // Refetch subscription details after restore
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);

      const activeEntitlement =
        info.entitlements?.active && Object.values(info.entitlements.active)[0];
      const productId = activeEntitlement?.productIdentifier;
      const subscription = productId
        ? info.subscriptionsByProductIdentifier[productId]
        : null;

      if (subscription) {
        const mapped: SubscriptionDetails = {
          amount: (subscription as any).price?.amount ?? 0,
          billing_interval:
            subscription.periodType === "TRIAL" ? "trial" : "regular",
          cancel_at_period_end: !subscription.willRenew,
          created: subscription.originalPurchaseDate || "",
          currency: (subscription as any).price?.currency || "USD",
          current_period_end: subscription.expiresDate || "",
          current_period_start: subscription.purchaseDate || "",
          has_subscription: subscription.isActive,
          next_billing_date: subscription.expiresDate || "",
          plan: "pro",
          plan_name: getPlanDisplayName(productId || ""),
          status: subscription.isActive
            ? subscription.periodType === "TRIAL"
              ? "trialing"
              : "active"
            : "canceled",
          subscription_id: productId || "",
          trial_end:
            subscription.periodType === "TRIAL"
              ? subscription.expiresDate || ""
              : "",
        };
        setSubscription(mapped);
      }

      Alert.alert("Success", "Purchases restored successfully");
    } catch (error: any) {
      Alert.alert(
        "Restore Failed",
        error.message || "Failed to restore purchases. Please try again."
      );
    }
  };


  const allEntitlements = customerInfo
    ? Object.values(customerInfo.entitlements.all)
    : [];

  return (
    <View className="flex-1 bg-background-primary" style={{ flex: 1 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => navigation.goBack()}
            className="active:opacity-70"
          >
            <Text className="font-sans text-base text-muted">Close</Text>
          </Pressable>
          <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
            Subscription
          </Text>
          <View className="w-12" />
        </View>

        <View className="mx-8 mb-4 flex-row rounded-md bg-mist p-1">
          {(["current", "history"] as TabType[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 items-center rounded-sm py-2.5 ${
                activeTab === tab ? "bg-surface" : ""
              }`}
            >
              <Text
                className={`font-sans-medium text-sm ${
                  activeTab === tab ? "text-ink" : "text-muted"
                }`}
              >
                {tab === "current" ? "Current" : "History"}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          className="flex-1 px-8"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "current" ? (
            isLoading ? (
              <View className="items-center py-20">
                <ActivityIndicator color="#5EAAA6" />
              </View>
            ) : unavailableReason ? (
              <View className="pt-8">
                <Text className="font-sans-medium text-2xl text-ink">
                  Can’t load subscription
                </Text>
                <Text className="mt-3 font-sans text-base leading-6 text-muted">
                  {unavailableReason}
                </Text>
                <Pressable
                  onPress={() => setReloadToken((token) => token + 1)}
                  className="mt-8 items-center rounded-md bg-mist py-4 active:opacity-80"
                >
                  <Text className="font-sans-medium text-base text-ink">
                    Try again
                  </Text>
                </Pressable>
              </View>
            ) : !subscription ? (
              <View className="pt-8">
                <Text className="font-sans-medium text-2xl text-ink">
                  No active subscription
                </Text>
                <Text className="mt-3 font-sans text-base leading-6 text-muted">
                  Subscribe to unlock deeper insights and a more flexible
                  tracking experience.
                </Text>
                <Pressable
                  onPress={handleReactivateSubscription}
                  className="mt-8 items-center rounded-md bg-water py-4 active:opacity-80"
                >
                  <Text className="font-sans-medium text-base text-white">
                    View Hydroly Pro
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleRestore}
                  className="mt-3 items-center py-4 active:opacity-70"
                >
                  <Text className="font-sans text-base text-muted">
                    Restore purchases
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="pt-4">
                <Text className="font-sans-medium text-2xl text-ink">
                  {subscription.plan_name || "Hydroly Pro"}
                </Text>
                <View className="mt-8 border-t border-border-light">
                  <DetailRow
                    label="Status"
                    value={getStatusDisplay(
                      subscription.status,
                      subscription.cancel_at_period_end
                    )}
                  />
                  {subscription.amount > 0 ? (
                    <DetailRow
                      label="Price"
                      value={formatCurrency(
                        subscription.amount,
                        subscription.currency
                      )}
                    />
                  ) : null}
                  <DetailRow
                    label="Renews"
                    value={
                      subscription.cancel_at_period_end
                        ? "Ends " + formatDate(subscription.current_period_end)
                        : formatDate(subscription.next_billing_date)
                    }
                  />
                  <DetailRow
                    label="Started"
                    value={formatDate(subscription.current_period_start)}
                  />
                </View>

                {!subscription.cancel_at_period_end ? (
                  <Pressable
                    onPress={handleCancelSubscription}
                    className="mt-8 items-center py-4 active:opacity-70"
                  >
                    <Text className="font-sans text-base text-muted">
                      Cancel in store settings
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleReactivateSubscription}
                    className="mt-8 items-center rounded-md bg-water py-4 active:opacity-80"
                  >
                    <Text className="font-sans-medium text-base text-white">
                      Resubscribe
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleRestore}
                  className="mt-2 items-center py-4 active:opacity-70"
                >
                  <Text className="font-sans text-base text-muted">
                    Restore purchases
                  </Text>
                </Pressable>
              </View>
            )
          ) : (
            <View className="pt-4">
              {allEntitlements.length === 0 ? (
                <Text className="font-sans text-base text-muted">
                  No subscription history yet.
                </Text>
              ) : (
                allEntitlements.map((entitlement: any, index: number) => (
                  <View
                    key={`${entitlement.identifier}-${index}`}
                    className="border-b border-border-light py-4"
                  >
                    <Text className="font-sans-medium text-base text-ink">
                      {getPlanDisplayName(entitlement.productIdentifier || "")}
                    </Text>
                    <Text className="mt-1 font-sans text-sm text-muted">
                      {entitlement.isActive ? "Active" : "Expired"}
                      {entitlement.latestPurchaseDate
                        ? ` · ${formatDate(entitlement.latestPurchaseDate)}`
                        : ""}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border-light py-4">
      <Text className="font-sans text-base text-muted">{label}</Text>
      <Text className="ml-4 flex-shrink text-right font-sans-medium text-base text-ink">
        {value}
      </Text>
    </View>
  );
}
