import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { withStallion } from "react-native-stallion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize reminder notification channels
        await initializeReminderChannels();
        // Note: RevenueCat initialization is handled by RevenueCatProvider
        // No need to initialize here to avoid duplicate initialization

        // Wait 2 seconds for splash screen
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setAppReady(true);
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    }

    initializeApp();
  }, []);

  // Hide splash screen when ready (after 5 seconds and data is loaded)
  useEffect(() => {
    if (appReady && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [appReady, isLoading]);

  // Don't render NavigationContainer until ready to prevent showing wrong screen
  if (!appReady || isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack hasCompletedOnboarding={hasCompletedOnboarding} />
    </NavigationContainer>
  );
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
                        <AppContent />
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
