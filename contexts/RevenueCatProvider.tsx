/**
 * RevenueCat Provider
 *
 * Initializes RevenueCat early (like Macro Meals), then links Firebase UID when ready.
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
  const [isConfigured, setIsConfigured] = useState(false);

  // Early configure — do not wait for auth (matches Macro Meals App.tsx bootstrap)
  useEffect(() => {
    async function initializeRevenueCat() {
      if (!isRevenueCatConfigured()) {
        console.warn(
          "[RevenueCatProvider] RevenueCat not configured (missing API key in ENVFILE). Skipping initialization."
        );
        return;
      }

      if (
        typeof revenueCatService.getInitialized === "function" &&
        revenueCatService.getInitialized()
      ) {
        setIsConfigured(true);
        return;
      }

      try {
        const config = getRevenueCatConfig();
        await revenueCatService.initialize(
          config,
          undefined, // identify after auth via logIn
          __DEV__
        );
        setIsConfigured(true);
        console.log("[RevenueCatProvider] ✅ RevenueCat configured");
      } catch (error) {
        console.error(
          "[RevenueCatProvider] ❌ Failed to initialize RevenueCat:",
          error
        );
      }
    }

    initializeRevenueCat();
  }, []);

  // Link Firebase UID once auth is ready
  useEffect(() => {
    if (!user?.uid || !isConfigured) return;

    revenueCatService
      .logIn(user.uid)
      .then(() => {
        console.log(
          "[RevenueCatProvider] ✅ Linked RevenueCat to UID:",
          user.uid
        );
      })
      .catch((error) => {
        console.error(
          "[RevenueCatProvider] Error linking RevenueCat user:",
          error
        );
      });
  }, [user?.uid, isConfigured]);

  // Soft sync when anonymous → authenticated
  useEffect(() => {
    if (!user || !isConfigured) return;
    if (user.isAnonymous) return;

    revenueCatService.syncPurchases().catch((error) => {
      console.error("[RevenueCatProvider] Error syncing purchases:", error);
    });
  }, [user?.isAnonymous, isConfigured]);

  return <>{children}</>;
}
