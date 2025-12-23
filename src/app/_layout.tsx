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
    if (isLoading) return;

    const inOnboarding =
      segments[0] === "onboarding" || segments[0] === "onboarding-goals";

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
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
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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
