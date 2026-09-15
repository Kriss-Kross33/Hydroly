import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { withStallion } from "react-native-stallion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { WaterProvider, useWater } from "@/contexts/WaterContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AchievementsProvider } from "@/contexts/AchievementsContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { FriendsProvider } from "@/contexts/FriendsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RevenueCatProvider } from "@/contexts/RevenueCatProvider";
import { RootStack } from "./RootStack";
import { initializeReminderChannels } from "@/src/services/reminderService";
import "@/global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppContent() {
  const { hasCompletedOnboarding, isLoading } = useWater();
  const [appReady, setAppReady] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log("[App] Starting initialization...");
        // Initialize reminder notification channels
        await initializeReminderChannels();
        console.log("[App] Reminder channels initialized");
        // Note: RevenueCat initialization is handled by RevenueCatProvider
        // No need to initialize here to avoid duplicate initialization

        // Note: If you see "test_store" deserialization errors in Android logs,
        // this is a known RevenueCat Android SDK issue with test store API keys.
        // It's harmless and doesn't affect functionality. Won't appear in production.

        // Wait briefly for splash screen
        console.log("[App] Waiting for splash...");
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log("[App] Setting appReady to true");
        setAppReady(true);
      } catch (error) {
        console.error("[App] Error initializing app:", error);
        // Still set appReady even if there's an error to prevent app from being stuck
        setAppReady(true);
      }
    }

    // Also set a safety timeout to ensure appReady is set
    const safetyTimeout = setTimeout(() => {
      console.log("[App] Safety timeout: forcing appReady to true");
      setAppReady(true);
    }, 3000);

    initializeApp().finally(() => {
      clearTimeout(safetyTimeout);
    });
  }, []);

  // Timeout fallback: force show app after 5 seconds if still loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("[App] Timeout reached, forcing app to show");
      setForceShow(true);
      SplashScreen.hideAsync();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  // Hide splash screen when ready
  useEffect(() => {
    console.log("[App] State check:", { appReady, isLoading, forceShow, fontsLoaded });
    if ((appReady && fontsLoaded && !isLoading) || forceShow) {
      console.log("[App] Hiding splash screen");
      SplashScreen.hideAsync();
    }
  }, [appReady, isLoading, forceShow, fontsLoaded]);

  // Don't render NavigationContainer until ready to prevent showing wrong screen
  // Only render when appReady is true (forceShow will ensure appReady is set via safety timeout)
  if ((!appReady || !fontsLoaded) && !forceShow) {
    console.log("[App] Waiting for appReady/fonts...");
    return null;
  }

  if (isLoading && !forceShow) {
    console.log("[App] Still loading, waiting...");
    return null;
  }

  console.log("[App] Rendering app with NavigationContainer");

  return <RootStack hasCompletedOnboarding={hasCompletedOnboarding} />;
}

export function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RevenueCatProvider>
            <SubscriptionProvider>
              <SettingsProvider>
                <AchievementsProvider>
                  <WaterProvider>
                    <FriendsProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <NavigationContainer>
                          <AppContent />
                        </NavigationContainer>
                      </GestureHandlerRootView>
                    </FriendsProvider>
                  </WaterProvider>
                </AchievementsProvider>
              </SettingsProvider>
            </SubscriptionProvider>
          </RevenueCatProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const WrappedApp = withStallion(App);
export default WrappedApp;
