import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import OnboardingScreen from "./src/features/onboarding/OnboardingScreen";
import OnboardingGoalsScreen from "./src/features/goals-setup/OnboardingGoalsSetup";
import PaywallScreen from "./src/features/paywall/PaywallScreen";
import AchievementsScreen from "./src/features/achievements/AchievementScreen";
import CustomBottomTabs from "./src/navigation/BottomTabNavigation";
import ManageSubscriptionScreenWrapper from "./src/features/settings/ManageSubscriptionScreenWrapper";
import { RootStackParamList } from "./types/navigation";

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
        <Stack.Screen name="MainTabs" component={MainNavigator} />
      )}
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={CustomBottomTabs} />
      <Stack.Screen
        name="ManageSubscription"
        component={ManageSubscriptionScreenWrapper}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

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
