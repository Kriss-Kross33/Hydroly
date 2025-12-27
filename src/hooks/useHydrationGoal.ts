import { useMemo, useCallback } from "react";
import { BeverageType } from "@/types/beverage";
import { DailyGoal } from "@/types/water";
import { UserProfile, AppSettings, ActivityLevel } from "@/types/user";
import { RealmRepository } from "@hydroly/realm-repository";

export type GoalStyle = "simple" | "smart" | "custom";

export interface HydrationGoal {
  id: string;
  goalStyle: GoalStyle;
  dailyTarget: number;
  calculatedAt: Date;
  baseRecommendation?: number;
  adjustments?: {
    activityBonus?: number;
    climateBonus?: number;
    weightAdjustment?: number;
    ageAdjustment?: number;
  };
  unit: "ml" | "oz";
}

export interface HydrationEntry {
  id: string;
  amount: number;
  beverageType: BeverageType;
  createdAt: Date;
  localDate: string; // YYYY-MM-DD
  synced: boolean;
  syncedAt?: Date;
}

// Realm schema for hydration goals
const HydrationGoalSchema = {
  name: "HydrationGoal",
  primaryKey: "id",
  properties: {
    id: "string",
    goalStyle: "string",
    dailyTarget: "int",
    calculatedAt: "date",
    baseRecommendation: "int?",
    unit: "string",
  },
};

// Repository instance for hydration goals
export const hydrationGoalRepository = new RealmRepository<{
  id: string;
  goalStyle: string;
  dailyTarget: number;
  calculatedAt: Date;
  baseRecommendation?: number;
  unit: string;
}>({
  realmConfig: {
    schema: [HydrationGoalSchema],
    schemaVersion: 1,
    path: "hydration-goals.realm",
  },
  objectType: "HydrationGoal",
  idKey: "id",
});

// Standard recommendations
const STANDARD_RECOMMENDATIONS = {
  simple: 2500, // ml
  minimum: 1500, // ml - minimum safe intake
  maximum: 5000, // ml - maximum safe intake
  default: 2500, // ml
};

// Activity level multipliers
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.0,
  light: 1.1,
  moderate: 1.2,
  active: 1.3,
  very_active: 1.5,
};

// Climate adjustments
const CLIMATE_ADJUSTMENTS = {
  hot: 1.2, // +20% in hot climates
  moderate: 1.0, // No adjustment
  cold: 0.95, // -5% in cold climates
};

/**
 * Calculate smart goal based on user profile
 */
function calculateSmartGoal(
  profile: UserProfile,
  settings: AppSettings
): {
  goal: number;
  baseRecommendation: number;
  adjustments: HydrationGoal["adjustments"];
} {
  // Base recommendation by gender
  let baseGoal = profile.gender === "male" ? 2500 : 2000;

  // Weight adjustment (35ml per kg above/below 70kg)
  const weightAdjustment = (profile.weight - 70) * 35;
  baseGoal += weightAdjustment;

  // Activity level multiplier
  const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2;
  const activityBonus = baseGoal * (activityMultiplier - 1);

  // Climate adjustment
  let climateBonus = 0;
  if (settings.climateSensitivity && profile.climate) {
    const climateMultiplier = CLIMATE_ADJUSTMENTS[profile.climate] || 1.0;
    climateBonus = baseGoal * (climateMultiplier - 1);
  }

  // Age adjustment
  let ageAdjustment = 0;
  if (profile.age >= 65) {
    ageAdjustment = baseGoal * 0.1; // +10% for seniors
  } else if (profile.age >= 51) {
    ageAdjustment = baseGoal * 0.05; // +5% for mature adults
  }

  const finalGoal = Math.round(
    baseGoal + activityBonus + climateBonus + ageAdjustment
  );

  return {
    goal: Math.max(
      STANDARD_RECOMMENDATIONS.minimum,
      Math.min(STANDARD_RECOMMENDATIONS.maximum, finalGoal)
    ),
    baseRecommendation: Math.round(baseGoal),
    adjustments: {
      activityBonus: Math.round(activityBonus),
      climateBonus: Math.round(climateBonus),
      weightAdjustment: Math.round(weightAdjustment),
      ageAdjustment: Math.round(ageAdjustment),
    },
  };
}

/**
 * React hook for managing hydration goals
 */
export function useHydrationGoal(
  dailyGoal: DailyGoal,
  profile?: UserProfile,
  settings?: AppSettings,
  goalStyle?: GoalStyle
) {
  // Determine current goal style
  const currentGoalStyle = useMemo(() => {
    if (goalStyle) return goalStyle;
    if (profile?.useSmartGoal) return "smart";
    if (dailyGoal.goal === STANDARD_RECOMMENDATIONS.simple) return "simple";
    return "custom";
  }, [goalStyle, profile?.useSmartGoal, dailyGoal.goal]);

  // Calculate smart goal if profile is available
  const smartGoalCalculation = useMemo(() => {
    if (!profile || !settings || currentGoalStyle !== "smart") {
      return null;
    }
    return calculateSmartGoal(profile, settings);
  }, [profile, settings, currentGoalStyle]);

  // Get current goal with breakdown
  const currentGoal = useMemo(() => {
    const goal = dailyGoal.goal;

    if (currentGoalStyle === "smart" && smartGoalCalculation) {
      const adjustments = smartGoalCalculation.adjustments || {};
      return {
        value: goal,
        style: "smart" as GoalStyle,
        base: smartGoalCalculation.baseRecommendation,
        adjustments: smartGoalCalculation.adjustments,
        breakdown: {
          base: smartGoalCalculation.baseRecommendation,
          activity: adjustments.activityBonus || 0,
          climate: adjustments.climateBonus || 0,
          weight: adjustments.weightAdjustment || 0,
          age: adjustments.ageAdjustment || 0,
          total: goal,
        },
      };
    }

    if (currentGoalStyle === "simple") {
      return {
        value: goal,
        style: "simple" as GoalStyle,
        base: STANDARD_RECOMMENDATIONS.simple,
        adjustments: undefined,
        breakdown: {
          base: STANDARD_RECOMMENDATIONS.simple,
          total: goal,
        },
      };
    }

    // Custom goal
    return {
      value: goal,
      style: "custom" as GoalStyle,
      base: goal,
      adjustments: undefined,
      breakdown: {
        base: goal,
        total: goal,
      },
    };
  }, [dailyGoal.goal, currentGoalStyle, smartGoalCalculation]);

  // Validate goal value
  const validateGoal = useCallback(
    (value: number): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (value < STANDARD_RECOMMENDATIONS.minimum) {
        errors.push(
          `Goal must be at least ${STANDARD_RECOMMENDATIONS.minimum}ml for health`
        );
      }

      if (value > STANDARD_RECOMMENDATIONS.maximum) {
        errors.push(
          `Goal should not exceed ${STANDARD_RECOMMENDATIONS.maximum}ml (consult a doctor for higher amounts)`
        );
      }

      if (value % 50 !== 0) {
        errors.push("Goal should be rounded to nearest 50ml for simplicity");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    []
  );

  // Get recommended goal based on profile
  const recommendedGoal = useMemo(() => {
    if (!profile || !settings) {
      return {
        style: "simple" as GoalStyle,
        value: STANDARD_RECOMMENDATIONS.simple,
        reason: "Standard recommendation for average adult",
      };
    }

    const smartCalc = calculateSmartGoal(profile, settings);
    return {
      style: "smart" as GoalStyle,
      value: smartCalc.goal,
      reason: `Personalized based on your ${profile.gender} profile, ${profile.activityLevel} activity level, and ${profile.climate || "moderate"} climate`,
    };
  }, [profile, settings]);

  // Get goal suggestions (simple, smart, custom options)
  const goalSuggestions = useMemo(() => {
    const suggestions = [
      {
        style: "simple" as GoalStyle,
        value: STANDARD_RECOMMENDATIONS.simple,
        label: "Simple Goal",
        description: "Standard 2.5L daily recommendation",
        recommended: !profile?.useSmartGoal,
      },
    ];

    if (profile && settings) {
      const smartCalc = calculateSmartGoal(profile, settings);
      suggestions.push({
        style: "smart" as GoalStyle,
        value: smartCalc.goal,
        label: "Smart Goal",
        description: `Personalized: ${smartCalc.goal}ml based on your profile`,
        recommended: profile.useSmartGoal,
      });
    }

    // Add custom option
    suggestions.push({
      style: "custom" as GoalStyle,
      value: dailyGoal.goal,
      label: "Custom Goal",
      description: "Set your own daily target",
      recommended: false,
    });

    return suggestions;
  }, [profile, settings, dailyGoal.goal]);

  // Get goal adjustment factors
  const adjustmentFactors = useMemo(() => {
    if (!profile || !settings) return null;

    return {
      gender: profile.gender === "male" ? "+500ml" : "base",
      weight:
        profile.weight > 70
          ? `+${Math.round((profile.weight - 70) * 35)}ml`
          : profile.weight < 70
            ? `${Math.round((profile.weight - 70) * 35)}ml`
            : "none",
      activity: `x${ACTIVITY_MULTIPLIERS[profile.activityLevel]?.toFixed(1)}`,
      climate:
        settings.climateSensitivity && profile.climate
          ? profile.climate === "hot"
            ? "+20%"
            : profile.climate === "cold"
              ? "-5%"
              : "none"
          : "none",
      age: profile.age >= 65 ? "+10%" : profile.age >= 51 ? "+5%" : "none",
    };
  }, [profile, settings]);

  // Get goal history (if we had goal changes tracked)
  const goalHistory = useMemo(() => {
    // This would come from Realm if we're tracking goal changes
    // For now, return empty array
    return [];
  }, []);

  // Check if goal needs recalculation (profile changed)
  const needsRecalculation = useMemo(() => {
    if (currentGoalStyle !== "smart" || !profile || !settings) return false;

    const currentCalc = calculateSmartGoal(profile, settings);
    return Math.abs(currentCalc.goal - dailyGoal.goal) > 100; // More than 100ml difference
  }, [currentGoalStyle, profile, settings, dailyGoal.goal]);

  // Get goal progress info
  const goalInfo = useMemo(() => {
    return {
      current: dailyGoal.goal,
      style: currentGoalStyle,
      unit: dailyGoal.unit,
      isSmart: currentGoalStyle === "smart",
      isCustom: currentGoalStyle === "custom",
      isSimple: currentGoalStyle === "simple",
      canRecalculate: needsRecalculation,
      suggestions: goalSuggestions,
    };
  }, [dailyGoal, currentGoalStyle, needsRecalculation, goalSuggestions]);

  return {
    // Current goal data
    currentGoal,
    goalInfo,

    // Calculations
    smartGoalCalculation,
    recommendedGoal,
    goalSuggestions,
    adjustmentFactors,

    // Methods
    validateGoal,
    calculateSmartGoal:
      profile && settings ? () => calculateSmartGoal(profile, settings) : null,

    // Status
    needsRecalculation,
    goalHistory,
  };
}
