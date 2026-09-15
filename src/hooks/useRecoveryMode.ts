import { useMemo } from "react";
import { useWater } from "@/contexts/WaterContext";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  shouldActivateRecoveryMode,
  type RecoveryModeState,
} from "@/src/utils/recoveryMode";
import { calculateConfidenceScore } from "@/src/utils/hydrationConfidence";
import { isFeatureEnabled } from "@/src/config/featureFlags";

export function useRecoveryMode(): RecoveryModeState | null {
  const { records, dailyGoal } = useWater();
  const { streak } = useAchievements();
  const { settings } = useSettings();
  const { features } = useSubscription();

  return useMemo(() => {
    if (!isFeatureEnabled("RECOVERY_MODE_ENABLED")) return null;
    const optedIn = settings.recoveryMode || features.recoveryMode;
    if (!optedIn) return null;

    const confidence = calculateConfidenceScore(
      records,
      dailyGoal,
      streak.current,
      streak.longest
    );

    return shouldActivateRecoveryMode(
      records,
      dailyGoal,
      streak.current,
      confidence
    );
  }, [
    records,
    dailyGoal,
    streak.current,
    streak.longest,
    settings.recoveryMode,
    features.recoveryMode,
  ]);
}

/** Remaining ml redistributed across leftover waking hours (supportive, not aggressive). */
export function getRecoveryPlan(
  remainingMl: number,
  hoursLeftInDay: number
): { sips: number; amountPerSip: number; message: string } {
  const hours = Math.max(1, Math.min(12, Math.floor(hoursLeftInDay)));
  const sips = Math.max(2, Math.min(6, hours));
  const amountPerSip = Math.round(remainingMl / sips / 50) * 50 || 250;

  return {
    sips,
    amountPerSip: Math.max(150, Math.min(400, amountPerSip)),
    message:
      "Spread the rest of today’s target across the hours you still have — no need to rush.",
  };
}
