import { Text, View, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useSubscription,
  SUBSCRIPTION_PLANS,
} from "@/contexts/SubscriptionContext";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { revenueCatService } from "@hydroly/revenuecat-service";

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { purchase, restore, subscription, isOnTrial, getTrialDaysRemaining } =
    useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState("pro_yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  // Show only Pro tier plans (Pro Plus exists in code but not shown yet)
  // All map to 'pro' entitlement, differentiated by feature flags
  const proPlans = SUBSCRIPTION_PLANS.filter((p) => p.tier === "pro");
  const trialDays = getTrialDaysRemaining();

  // Check if user already has active subscription - if so, navigate back
  useEffect(() => {
    if (subscription.isActive && subscription.tier !== "free") {
      console.log(
        "[PaywallScreen] User already has active subscription, navigating back"
      );
      navigation.goBack();
    }
  }, [subscription.isActive, subscription.tier, navigation]);

  // Check if user is "new" (never had subscription) or "old" (had subscription before)
  // Check RevenueCat customer info for purchase history
  useEffect(() => {
    async function checkUserHistory() {
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        // Check if user has any purchase history (active or expired entitlements)
        // If they have any entitlements in 'all', they've had a subscription before
        const hasPurchaseHistory =
          Object.keys(customerInfo.entitlements.all).length > 0;

        // User is "old" if they have purchase history, "new" otherwise
        setIsNewUser(!hasPurchaseHistory);
      } catch {
        // If we can't check, default to new user (show trial option)
        console.log(
          "[PaywallScreen] Could not check user history, defaulting to new user"
        );
        setIsNewUser(true);
      }
    }

    // Only check if user is currently free (not active subscription)
    if (subscription.tier === "free" && !subscription.isActive) {
      checkUserHistory();
    } else {
      // If user has active subscription, they're definitely not new
      setIsNewUser(false);
    }
  }, [subscription.tier, subscription.isActive]);

  const handleSubscribe = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Purchase the selected plan (monthly or yearly)
      // RevenueCat will handle trial automatically if configured
      await purchase(selectedPlanId);

      // Wait a moment for state to update before navigating back
      await new Promise((resolve) => setTimeout(resolve, 500));

      navigation.goBack();
    } catch (error) {
      console.error("Purchase failed:", error);
      // Error handling - user will see error from purchase function
    } finally {
      setIsProcessing(false);
    }
  };

  const proFeatures = [
    { name: "No ads", icon: X },
    { name: "Smart hydration goals", icon: Zap },
    { name: "Advanced reminders", icon: Sparkles },
    { name: "Monthly & yearly reports", icon: Check },
    { name: "Beverage intelligence", icon: Check },
    { name: "Recovery mode", icon: Check },
    { name: "Cloud sync", icon: Check },
    { name: "Data export", icon: Check },
    { name: "Custom routines", icon: Check },
  ];

  return (
    <SafeAreaView className="flex-1 bg-sky-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 20,
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        <Pressable
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          onPress={() => navigation.goBack()}
        >
          <X size={24} color="#64748B" />
        </Pressable>

        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-amber-100 items-center justify-center mb-4">
            <Crown size={48} color="#F59E0B" />
          </View>
          <Text className="text-[32px] font-extrabold text-slate-800 mb-2 tracking-tight">
            Upgrade to Pro
          </Text>
          <Text className="text-[17px] text-slate-500 text-center font-medium px-5 leading-6">
            Unlock powerful features to build the perfect hydration habit
          </Text>
        </View>

        <View className="bg-white rounded-[20px] p-5 mb-6 shadow-sm">
          {proFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} className="flex-row items-center gap-3 py-3">
                <View className="w-8 h-8 rounded-2xl bg-sky-100 items-center justify-center">
                  <Icon size={20} color="#0EA5E9" />
                </View>
                <Text className="text-base text-slate-800 font-semibold flex-1">
                  {feature.name}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="mb-6">
          <Text className="text-xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Choose Your Plan
          </Text>
          {proPlans.map((plan) => (
            <Pressable
              key={plan.id}
              className={`bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border-2 relative ${
                selectedPlanId === plan.id
                  ? "border-sky-500 bg-sky-50"
                  : plan.isPopular
                    ? "border-amber-500"
                    : "border-slate-200"
              }`}
              onPress={() => setSelectedPlanId(plan.id)}
            >
              {plan.isPopular && (
                <View className="absolute -top-2.5 left-5 bg-amber-500 px-3 py-1 rounded-xl">
                  <Text className="text-[11px] font-extrabold text-white tracking-wide">
                    BEST VALUE
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-lg font-bold text-slate-800">
                    {plan.period === "monthly" && "Monthly"}
                    {plan.period === "yearly" && "Yearly"}
                    {plan.period === "lifetime" && "Lifetime"}
                  </Text>
                  {plan.savings && (
                    <Text className="text-[13px] font-bold text-emerald-500">
                      {plan.savings}
                    </Text>
                  )}
                </View>
                <Text className="text-2xl font-extrabold text-sky-500 tracking-tight">
                  {plan.displayPrice}
                </Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPlanId === plan.id
                    ? "border-sky-500"
                    : "border-slate-300"
                }`}
              >
                {selectedPlanId === plan.id && (
                  <View className="w-3 h-3 rounded-full bg-sky-500" />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {isOnTrial && trialDays !== null && (
          <View className="bg-amber-100 rounded-xl p-4 items-center mb-3">
            <Text className="text-[15px] font-bold text-amber-900">
              {trialDays} days left in your trial
            </Text>
          </View>
        )}

        {!isOnTrial && (
          <Pressable
            className={`${
              isNewUser ? "bg-violet-600" : "bg-sky-500"
            } rounded-2xl p-[18px] items-center flex-row justify-center gap-2 mb-4 shadow-lg ${
              isProcessing ? "opacity-50" : "active:opacity-80"
            }`}
            onPress={handleSubscribe}
            disabled={isProcessing}
          >
            {isNewUser && <Sparkles size={20} color="#FFFFFF" />}
            <Text className="text-lg font-extrabold text-white tracking-tight">
              {isProcessing
                ? "Processing..."
                : isNewUser
                  ? "Start 7-Day Free Trial"
                  : "Subscribe"}
            </Text>
          </Pressable>
        )}

        <Text className="text-xs text-slate-500 text-center leading-[18px] mb-4 font-medium">
          Cancel anytime. Subscription automatically renews unless auto-renew is
          turned off at least 24 hours before the end of the current period.
        </Text>

        <Pressable
          className="p-3 items-center"
          onPress={async () => {
            if (isProcessing) return;
            setIsProcessing(true);
            try {
              await restore();
              navigation.goBack();
            } catch (error) {
              console.error("Restore failed:", error);
              // Optionally show error message to user
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
        >
          <Text className="text-[15px] font-semibold text-sky-500">
            {isProcessing ? "Restoring..." : "Restore Purchases"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
