import { useMemo } from "react";
import { useWater } from "@/contexts/WaterContext";
import { useAchievements } from "@/contexts/AchievementsContext";
import {
  calculateConfidenceScore,
  type ConfidenceScore,
} from "@/src/utils/hydrationConfidence";
import { isFeatureEnabled } from "@/src/config/featureFlags";

export function confidenceLevelLabel(level: ConfidenceScore["level"]): string {
  switch (level) {
    case "excellent":
      return "High confidence";
    case "good":
      return "Solid confidence";
    case "fair":
      return "Building confidence";
    case "needs_improvement":
      return "Early confidence";
    default:
      return "Building confidence";
  }
}

export function useConfidenceScore(): ConfidenceScore | null {
  const { records, dailyGoal } = useWater();
  const { streak } = useAchievements();

  return useMemo(() => {
    if (!isFeatureEnabled("CONFIDENCE_SCORE_ENABLED")) return null;
    return calculateConfidenceScore(
      records,
      dailyGoal,
      streak.current,
      streak.longest
    );
  }, [records, dailyGoal, streak.current, streak.longest]);
}
