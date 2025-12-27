/**
 * RevenueCat Provider
 *
 * Initializes RevenueCat on app launch with anonymous Firebase UID
 * Syncs subscription status with SubscriptionContext
 */

import React, { useEffect, useState } from "react";
import { revenueCatService } from "@hydroly/revenuecat-service";
import {
  getRevenueCatConfig,
  isRevenueCatConfigured,
} from "@/src/config/revenuecat";
import { useAuth } from "./AuthContext";

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeRevenueCat() {
      // Wait for Firebase Auth to create anonymous user
      if (!user) {
        return;
      }

      // Check if RevenueCat is configured
      if (!isRevenueCatConfigured()) {
        console.warn(
          "[RevenueCatProvider] RevenueCat not configured. Skipping initialization."
        );
        return;
      }

      // Don't initialize twice
      if (isInitialized) {
        return;
      }

      try {
        const config = getRevenueCatConfig();

        // Initialize RevenueCat with anonymous Firebase UID
        await revenueCatService.initialize(
          config,
          user.uid, // Use Firebase UID as RevenueCat App User ID
          __DEV__ // Enable debug mode in development
        );

        setIsInitialized(true);
        console.log(
          "[RevenueCatProvider] ✅ RevenueCat initialized with UID:",
          user.uid
        );

        // Check subscription status and sync
        // This will be handled by SubscriptionContext
      } catch (error) {
        console.error(
          "[RevenueCatProvider] ❌ Failed to initialize RevenueCat:",
          error
        );
        // Don't block app if RevenueCat fails
      }
    }

    initializeRevenueCat();
  }, [user, isInitialized]);

  // Re-initialize if user changes (e.g., anonymous → authenticated)
  useEffect(() => {
    if (user && isInitialized) {
      // If user logged in, RevenueCat identity should already be linked via AuthContext
      // But we can sync purchases here
      revenueCatService.syncPurchases().catch((error) => {
        console.error("[RevenueCatProvider] Error syncing purchases:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isAnonymous, isInitialized]);

  return <>{children}</>;
}
