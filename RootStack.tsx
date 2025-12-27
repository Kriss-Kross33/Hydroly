import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import OnboardingScreen from "./src/features/onboarding/OnboardingScreen";
import OnboardingGoalsScreen from "./src/features/goals-setup/OnboardingGoalsSetup";
import PaywallScreen from "./src/features/paywall/PaywallScreen";
import ManageSubscriptionScreen from "./src/features/settings/ManageSubscriptionScreen";
import CustomBottomTabs from "./src/navigation/BottomTabNavigation";

export type RootStackParamList = {
  OnboardingNav: undefined;
  Onboarding: undefined;
  OnboardingGoals: undefined;
  MainTabs: undefined;
  Paywall: undefined;
  ManageSubscription: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack({
  hasCompletedOnboarding,
}: {
  hasCompletedOnboarding: boolean;
}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="OnboardingNav" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="MainTabs" component={CustomBottomTabs} />
      )}
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ManageSubscription"
        component={ManageSubscriptionScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Onboarding"
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="OnboardingGoals" component={OnboardingGoalsScreen} />
    </Stack.Navigator>
  );
};
