import { revenueCatService } from "@hydroly/revenuecat-service";
import {
  getRevenueCatConfig,
  isRevenueCatConfigured,
} from "@/src/config/revenuecat";

/**
 * Wait for RevenueCatProvider init, or initialize lazily if still pending.
 * Returns false when API keys are missing or init cannot complete.
 */
export async function ensureRevenueCatReady(
  userId?: string | null,
  timeoutMs = 9000
): Promise<boolean> {
  if (!isRevenueCatConfigured()) {
    console.warn(
      "[RevenueCat] Not configured — set REVENUE_CAT_API_KEY in .env.staging (dev/stg) or .env.production"
    );
    return false;
  }

  const isReady = () =>
    typeof revenueCatService.getInitialized === "function" &&
    revenueCatService.getInitialized();

  if (isReady()) return true;

  // Lazy init in case the provider hasn't finished (or remount raced)
  try {
    await revenueCatService.initialize(
      getRevenueCatConfig(),
      userId || undefined,
      __DEV__
    );
    return true;
  } catch (error: any) {
    // Another caller may have won the race — treat as ok if now ready
    if (isReady()) return true;
    console.warn("[RevenueCat] Lazy initialize failed:", error?.message || error);
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isReady()) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return isReady();
}
