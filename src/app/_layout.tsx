import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WaterProvider, useWater } from "@/contexts/WaterContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AchievementsProvider } from "@/contexts/AchievementsContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { FriendsProvider } from "@/contexts/FriendsContext";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { hasCompletedOnboarding, isLoading } = useWater();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to complete before making navigation decisions
    if (isLoading) {
      return;
    }

    const inOnboarding =
      segments[0] === "onboarding" || segments[0] === "onboarding-goals";

    // If onboarding not completed, always redirect to onboarding
    if (!hasCompletedOnboarding) {
      if (!inOnboarding) {
        router.replace("/onboarding");
      }
      // Keep splash screen visible for 3 seconds, then hide
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 3000);
      return;
    }

    // If onboarding completed, redirect to tabs if on onboarding screens
    if (hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }

    // Hide splash screen after navigation is determined (with 3 second delay)
    if (hasCompletedOnboarding) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 3000);
    }
  }, [hasCompletedOnboarding, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-goals" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  // Splash screen will be hidden by RootLayoutNav after navigation is determined

  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <SettingsProvider>
          <AchievementsProvider>
            <WaterProvider>
              <FriendsProvider>
                <GestureHandlerRootView>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </FriendsProvider>
            </WaterProvider>
          </AchievementsProvider>
        </SettingsProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}
