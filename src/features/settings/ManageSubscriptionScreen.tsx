import {
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../RootStack";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Crown,
  Calendar,
  DollarSign,
  RefreshCw,
  History,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { revenueCatService } from "@hydroly/revenuecat-service";
import { CustomerInfo } from "react-native-purchases";
import { SUBSCRIPTION_PLANS } from "@/contexts/SubscriptionContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ManageSubscriptionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { subscription, restore, getDaysRemaining } = useSubscription();
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomerInfo();
  }, []);

  const loadCustomerInfo = async () => {
    try {
      setIsLoading(true);
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error("[ManageSubscription] Error loading customer info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (planId: string): string => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    return plan?.displayPrice || "N/A";
  };

  const getPlanName = (productId: string | undefined): string => {
    if (!productId) return "Unknown Plan";
    if (productId.toLowerCase().includes("yearly")) return "Yearly";
    if (productId.toLowerCase().includes("monthly")) return "Monthly";
    return "Pro";
  };

  const handleRestore = async () => {
    try {
      await restore();
      await loadCustomerInfo();
      Alert.alert("Success", "Purchases restored successfully");
    } catch (error: any) {
      Alert.alert(
        "Restore Failed",
        error.message || "Failed to restore purchases. Please try again."
      );
    }
  };

  const handleOpenStoreSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("https://apps.apple.com/account/subscriptions");
    } else {
      Linking.openURL(
        "https://play.google.com/store/account/subscriptions?package=com.hydroly.app"
      );
    }
  };

  const handleResubscribe = () => {
    navigation.navigate("Paywall");
  };

  // Get current subscription info
  const activeEntitlement = customerInfo
    ? Object.values(customerInfo.entitlements.active)[0]
    : null;

  // Get all entitlements (active + expired) for history
  const allEntitlements = customerInfo
    ? Object.values(customerInfo.entitlements.all)
    : [];

  const daysRemaining = getDaysRemaining();

  return (
    <SafeAreaView className="flex-1 bg-sky-50" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
        <Text className="text-2xl font-extrabold text-slate-800">
          Manage Subscription
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
        >
          <X size={24} color="#64748B" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-slate-200">
        <Pressable
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === "current"
              ? "border-sky-500"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("current")}
        >
          <Text
            className={`text-base font-semibold ${
              activeTab === "current" ? "text-sky-500" : "text-slate-500"
            }`}
          >
            Current
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === "history"
              ? "border-sky-500"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("history")}
        >
          <Text
            className={`text-base font-semibold ${
              activeTab === "history" ? "text-sky-500" : "text-slate-500"
            }`}
          >
            History
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {activeTab === "current" && (
          <View>
            {isLoading ? (
              <View className="items-center py-10">
                <Text className="text-slate-500">Loading...</Text>
              </View>
            ) : subscription.isActive && activeEntitlement ? (
              <>
                {/* Active Subscription Card */}
                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center">
                      <CheckCircle2 size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-extrabold text-slate-800">
                        Active Subscription
                      </Text>
                      <Text className="text-sm text-slate-500">
                        {getPlanName(activeEntitlement.productIdentifier)}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <View className="flex-row items-center justify-between py-3 border-b border-slate-100 mb-3">
                      <View className="flex-row items-center gap-3">
                        <DollarSign size={20} color="#64748B" />
                        <Text className="text-base font-semibold text-slate-700">
                          Plan Amount
                        </Text>
                      </View>
                      <Text className="text-base font-bold text-slate-800">
                        {formatPrice(
                          activeEntitlement.productIdentifier.includes("yearly")
                            ? "pro_yearly"
                            : "pro_monthly"
                        )}
                        {activeEntitlement.productIdentifier.includes("yearly")
                          ? "/year"
                          : "/month"}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between py-3 border-b border-slate-100 mb-3">
                      <View className="flex-row items-center gap-3">
                        <Calendar size={20} color="#64748B" />
                        <Text className="text-base font-semibold text-slate-700">
                          {subscription.willRenew
                            ? "Renews On"
                            : "Expires On"}
                        </Text>
                      </View>
                      <Text className="text-base font-bold text-slate-800">
                        {formatDate(activeEntitlement.expirationDate)}
                      </Text>
                    </View>

                    {daysRemaining !== null && (
                      <View className="flex-row items-center justify-between py-3 mb-3">
                        <View className="flex-row items-center gap-3">
                          <Crown size={20} color="#64748B" />
                          <Text className="text-base font-semibold text-slate-700">
                            Days Remaining
                          </Text>
                        </View>
                        <Text className="text-base font-bold text-slate-800">
                          {daysRemaining} days
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View>
                  <Pressable
                    className="bg-white rounded-2xl p-5 flex-row items-center justify-between shadow-sm mb-3"
                    onPress={handleOpenStoreSettings}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <ExternalLink size={20} color="#0EA5E9" />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-800">
                          Manage in {Platform.OS === "ios" ? "App Store" : "Play Store"}
                        </Text>
                        <Text className="text-sm text-slate-500">
                          Cancel or modify your subscription
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    className="bg-white rounded-2xl p-5 flex-row items-center justify-between shadow-sm mb-3"
                    onPress={handleRestore}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <RefreshCw size={20} color="#0EA5E9" />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-800">
                          Restore Purchases
                        </Text>
                        <Text className="text-sm text-slate-500">
                          Restore purchases from another device
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                {/* No Active Subscription */}
                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center">
                      <XCircle size={24} color="#64748B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-extrabold text-slate-800">
                        No Active Subscription
                      </Text>
                      <Text className="text-sm text-slate-500">
                        You don't have an active subscription
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions for cancelled/expired subscription */}
                <View>
                  <Pressable
                    className="bg-sky-500 rounded-2xl p-5 items-center shadow-lg mb-3"
                    onPress={handleResubscribe}
                  >
                    <Text className="text-lg font-extrabold text-white">
                      Resubscribe
                    </Text>
                  </Pressable>

                  <Pressable
                    className="bg-white rounded-2xl p-5 flex-row items-center justify-between shadow-sm mb-3"
                    onPress={handleRestore}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <RefreshCw size={20} color="#0EA5E9" />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-800">
                          Restore Purchases
                        </Text>
                        <Text className="text-sm text-slate-500">
                          Restore purchases from another device
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        {activeTab === "history" && (
          <View>
            {isLoading ? (
              <View className="items-center py-10">
                <Text className="text-slate-500">Loading...</Text>
              </View>
            ) : allEntitlements.length > 0 ? (
              <View>
                {allEntitlements.map((entitlement, index) => {
                  const isActive =
                    customerInfo?.entitlements.active[entitlement.identifier] !==
                    undefined;
                  const isExpired =
                    entitlement.expirationDate &&
                    new Date(entitlement.expirationDate) < new Date();

                  return (
                    <View
                      key={entitlement.identifier || index}
                      className="bg-white rounded-2xl p-5 shadow-sm mb-3"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-3">
                          <History size={20} color="#64748B" />
                          <Text className="text-base font-semibold text-slate-800">
                            {getPlanName(entitlement.productIdentifier)}
                          </Text>
                        </View>
                        {isActive ? (
                          <View className="bg-emerald-100 px-3 py-1 rounded-full">
                            <Text className="text-xs font-bold text-emerald-700">
                              Active
                            </Text>
                          </View>
                        ) : isExpired ? (
                          <View className="bg-slate-100 px-3 py-1 rounded-full">
                            <Text className="text-xs font-bold text-slate-700">
                              Expired
                            </Text>
                          </View>
                        ) : (
                          <View className="bg-amber-100 px-3 py-1 rounded-full">
                            <Text className="text-xs font-bold text-amber-700">
                              Cancelled
                            </Text>
                          </View>
                        )}
                      </View>

                      <View>
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-sm text-slate-500">Amount</Text>
                          <Text className="text-sm font-semibold text-slate-800">
                            {formatPrice(
                              entitlement.productIdentifier.includes("yearly")
                                ? "pro_yearly"
                                : "pro_monthly"
                            )}
                            {entitlement.productIdentifier.includes("yearly")
                              ? "/year"
                              : "/month"}
                          </Text>
                        </View>

                        {entitlement.expirationDate && (
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-sm text-slate-500">
                              {isActive ? "Renews On" : "Expired On"}
                            </Text>
                            <Text className="text-sm font-semibold text-slate-800">
                              {formatDate(entitlement.expirationDate)}
                            </Text>
                          </View>
                        )}

                        {entitlement.periodType && (
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm text-slate-500">Type</Text>
                            <Text className="text-sm font-semibold text-slate-800 capitalize">
                              {entitlement.periodType.toLowerCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="bg-white rounded-2xl p-6 items-center">
                <View className="mb-3">
                  <History size={48} color="#94A3B8" />
                </View>
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  No Subscription History
                </Text>
                <Text className="text-sm text-slate-500 text-center">
                  You haven't had any subscriptions yet
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

