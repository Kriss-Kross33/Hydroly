import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  useSubscription,
  SUBSCRIPTION_PLANS,
} from "@/contexts/SubscriptionContext";
import { Button, SelectionOption } from "@/src/components/ui";
import { revenueCatService } from "@hydroly/revenuecat-service";

const PRO_FEATURES = [
  "Month and year insights",
  "Beverage-aware logging",
  "Recovery mode support",
  "Flexible reminder preferences",
  "Advanced history views",
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { purchase, restore, subscription, getTrialDaysRemaining } =
    useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState("pro_yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  const proPlans = SUBSCRIPTION_PLANS.filter((p) => p.tier === "pro");
  const trialDays = getTrialDaysRemaining();

  useEffect(() => {
    if (subscription.isActive && subscription.tier !== "free") {
      navigation.goBack();
    }
  }, [subscription.isActive, subscription.tier, navigation]);

  useEffect(() => {
    async function checkUserHistory() {
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        const hasPurchaseHistory =
          Object.keys(customerInfo.entitlements.all).length > 0;
        setIsNewUser(!hasPurchaseHistory);
      } catch {
        setIsNewUser(true);
      }
    }

    if (subscription.tier === "free" && !subscription.isActive) {
      void checkUserHistory();
    } else {
      setIsNewUser(false);
    }
  }, [subscription.tier, subscription.isActive]);

  async function handleSubscribe() {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await purchase(selectedPlanId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigation.goBack();
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRestore() {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await restore();
      navigation.goBack();
    } catch (error) {
      console.error("Restore failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <View
      className="flex-1 bg-background-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-row justify-end px-6 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => navigation.goBack()}
          className="px-2 py-2 active:opacity-70"
        >
          <Text className="font-sans text-base text-muted">Close</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-8"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-4 font-sans-medium text-xs uppercase tracking-widest text-muted">
          Hydroly Pro
        </Text>
        <Text
          className="mt-4 font-sans-medium text-3xl text-ink"
          style={{ letterSpacing: -0.5 }}
        >
          A hydration routine that adapts with you.
        </Text>
        <Text className="mt-4 font-sans text-base leading-6 text-muted">
          Unlock deeper insights and a more flexible tracking experience —
          without noisy upsells or artificial urgency.
        </Text>

        <View className="mt-10">
          {PRO_FEATURES.map((feature) => (
            <View
              key={feature}
              className="border-b border-border-light py-3.5"
            >
              <Text className="font-sans text-base text-ink">{feature}</Text>
            </View>
          ))}
        </View>

        <Text className="mb-3 mt-10 font-sans-medium text-xs uppercase tracking-widest text-muted">
          Choose a plan
        </Text>

        {proPlans.map((plan) => {
          const selected = selectedPlanId === plan.id;
          const isYearly = plan.period === "yearly";
          return (
            <SelectionOption
              key={plan.id}
              title={`${plan.displayPrice} / ${isYearly ? "year" : "month"}`}
              description={
                isYearly
                  ? `${plan.savings ?? "Best value"} · billed annually`
                  : "Flexible month to month"
              }
              selected={selected}
              onPress={() => setSelectedPlanId(plan.id)}
            />
          );
        })}

        {isNewUser ? (
          <Text className="mt-2 font-sans text-sm text-muted">
            Includes a 7-day free trial where available. Cancel anytime before
            the trial ends to avoid charges.
          </Text>
        ) : (trialDays ?? 0) > 0 ? (
          <Text className="mt-2 font-sans text-sm text-muted">
            {trialDays} days remaining in your trial.
          </Text>
        ) : null}

        <View className="mt-8">
          <Button
            title={isNewUser ? "Start free trial" : "Subscribe"}
            loading={isProcessing}
            onPress={handleSubscribe}
          />
          <View className="mt-3">
            <Button
              title="Restore purchases"
              variant="ghost"
              disabled={isProcessing}
              onPress={handleRestore}
            />
          </View>
        </View>

        <Text className="mt-6 font-sans text-xs leading-5 text-muted">
          Payment will be charged to your Apple ID or Google Play account at
          confirmation. Subscriptions renew automatically unless cancelled at
          least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </View>
  );
}
