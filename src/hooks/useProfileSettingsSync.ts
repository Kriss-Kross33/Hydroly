import { useMemo, useCallback } from "react";
import { UserProfile, AppSettings, ActivityLevel, Gender } from "@/types/user";
import { SubscriptionStatus } from "@/types/subscription";
import { RealmRepository } from "@hydroly/realm-repository";

// Realm schema for user profile persistence
const UserProfileSchema = {
  name: "UserProfile",
  primaryKey: "id",
  properties: {
    id: "string",
    age: "int",
    weight: "double",
    gender: "string",
    activityLevel: "string",
    country: "string?",
    climate: "string?",
    useSmartGoal: "bool",
    hasCompletedGoalsOnboarding: "bool?",
    createdAt: "date",
    updatedAt: "date",
  },
};

// Repository instance for user profiles
export const userProfileRepository = new RealmRepository<{
  id: string;
  age: number;
  weight: number;
  gender: string;
  activityLevel: string;
  country?: string;
  climate?: string;
  useSmartGoal: boolean;
  hasCompletedGoalsOnboarding?: boolean;
  createdAt: Date;
  updatedAt: Date;
}>({
  realmConfig: {
    schema: [UserProfileSchema],
    schemaVersion: 2,
    path: "user-profile.realm",
  },
  objectType: "UserProfile",
  idKey: "id",
});

/**
 * React hook for syncing and managing profile and settings
 * Provides computed values, validation, and sync utilities
 */
export function useProfileSettingsSync(
  profile: UserProfile,
  settings: AppSettings,
  subscription?: SubscriptionStatus
) {
  // Check if profile is complete
  const isProfileComplete = useMemo(() => {
    return (
      profile.age > 0 &&
      profile.weight > 0 &&
      profile.gender !== undefined &&
      profile.activityLevel !== undefined
    );
  }, [profile]);

  // Check if onboarding is complete
  const isOnboardingComplete = useMemo(() => {
    return profile.hasCompletedGoalsOnboarding === true;
  }, [profile.hasCompletedGoalsOnboarding]);

  // Get profile completion percentage
  const profileCompletion = useMemo(() => {
    const fields = [
      profile.age,
      profile.weight,
      profile.gender,
      profile.activityLevel,
      profile.country,
      profile.climate,
    ];
    const filled = fields.filter((f) => f !== undefined && f !== null).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  // Calculate smart goal based on profile
  const calculateSmartGoal = useCallback(
    (customWeight?: number, customActivity?: ActivityLevel): number => {
      if (!profile.useSmartGoal) return 2500;

      const weight = customWeight || profile.weight;
      const activityLevel = customActivity || profile.activityLevel;

      // Base goal by gender
      let baseGoal = profile.gender === "male" ? 2500 : 2000;

      // Adjust for weight (35ml per kg above/below 70kg)
      baseGoal += (weight - 70) * 35;

      // Activity multipliers
      const activityMultipliers: Record<ActivityLevel, number> = {
        sedentary: 1.0,
        light: 1.1,
        moderate: 1.2,
        active: 1.3,
        very_active: 1.5,
      };

      baseGoal *= activityMultipliers[activityLevel] || 1.2;

      // Climate adjustment
      if (settings.climateSensitivity && profile.climate === "hot") {
        baseGoal *= 1.2;
      } else if (settings.climateSensitivity && profile.climate === "cold") {
        baseGoal *= 0.95;
      }

      return Math.max(1500, Math.round(baseGoal));
    },
    [profile, settings.climateSensitivity]
  );

  // Get current goal (smart or default)
  const currentGoal = useMemo(() => {
    return calculateSmartGoal();
  }, [calculateSmartGoal]);

  // Get profile display info
  const profileDisplay = useMemo(() => {
    const ageDisplay = profile.age ? `${profile.age} years` : "Not set";
    const weightDisplay = profile.weight ? `${profile.weight} kg` : "Not set";
    const activityDisplay =
      profile.activityLevel
        ?.replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Not set";
    const genderDisplay =
      profile.gender?.charAt(0).toUpperCase() + profile.gender?.slice(1) ||
      "Not set";

    return {
      age: ageDisplay,
      weight: weightDisplay,
      activity: activityDisplay,
      gender: genderDisplay,
      climate: profile.climate
        ? profile.climate.charAt(0).toUpperCase() + profile.climate.slice(1)
        : "Not set",
    };
  }, [profile]);

  // Get settings display info
  const settingsDisplay = useMemo(() => {
    const unitDisplay = settings.unit.toUpperCase();
    const frequencyDisplay = settings.reminderFrequency
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const weekendDisplay =
      settings.weekendBehavior === "same"
        ? "Same as weekdays"
        : "Different schedule";

    return {
      unit: unitDisplay,
      frequency: frequencyDisplay,
      weekend: weekendDisplay,
      startOfDay: settings.startOfDayTime,
      darkMode: settings.darkMode ? "On" : "Off",
      adaptiveReminders: settings.adaptiveReminders ? "Enabled" : "Disabled",
      climateSensitivity: settings.climateSensitivity ? "On" : "Off",
      recoveryMode: settings.recoveryMode ? "Active" : "Inactive",
    };
  }, [settings]);

  // Validate profile data
  const validateProfile = useCallback(
    (updates: Partial<UserProfile>): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (updates.age !== undefined) {
        if (updates.age < 1 || updates.age > 120) {
          errors.push("Age must be between 1 and 120");
        }
      }

      if (updates.weight !== undefined) {
        if (updates.weight < 20 || updates.weight > 300) {
          errors.push("Weight must be between 20 and 300 kg");
        }
      }

      if (updates.activityLevel !== undefined) {
        const validLevels: ActivityLevel[] = [
          "sedentary",
          "light",
          "moderate",
          "active",
          "very_active",
        ];
        if (!validLevels.includes(updates.activityLevel)) {
          errors.push("Invalid activity level");
        }
      }

      if (updates.gender !== undefined) {
        const validGenders: Gender[] = ["male", "female", "other"];
        if (!validGenders.includes(updates.gender)) {
          errors.push("Invalid gender");
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    []
  );

  // Validate settings data
  const validateSettings = useCallback(
    (updates: Partial<AppSettings>): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (updates.startOfDayTime !== undefined) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(updates.startOfDayTime)) {
          errors.push("Start of day time must be in HH:MM format");
        }
      }

      if (updates.quietHoursStart !== undefined && updates.quietHoursStart) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(updates.quietHoursStart)) {
          errors.push("Quiet hours start must be in HH:MM format");
        }
      }

      if (updates.quietHoursEnd !== undefined && updates.quietHoursEnd) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(updates.quietHoursEnd)) {
          errors.push("Quiet hours end must be in HH:MM format");
        }
      }

      if (
        updates.customReminderInterval !== undefined &&
        updates.customReminderInterval < 15
      ) {
        errors.push("Custom reminder interval must be at least 15 minutes");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    []
  );

  // Get recommended settings based on profile
  const recommendedSettings = useMemo(() => {
    const recommendations: Partial<AppSettings> = {};

    // Recommend reminder frequency based on activity level
    if (
      profile.activityLevel === "very_active" ||
      profile.activityLevel === "active"
    ) {
      recommendations.reminderFrequency = "every_2_hours";
    } else if (profile.activityLevel === "sedentary") {
      recommendations.reminderFrequency = "every_3_hours";
    }

    // Recommend climate sensitivity if climate is set
    if (profile.climate && !settings.climateSensitivity) {
      recommendations.climateSensitivity = true;
    }

    // Recommend adaptive reminders for active users
    if (
      (profile.activityLevel === "active" ||
        profile.activityLevel === "very_active") &&
      !settings.adaptiveReminders
    ) {
      recommendations.adaptiveReminders = true;
    }

    return recommendations;
  }, [profile, settings]);

  // Get profile statistics
  const profileStats = useMemo(() => {
    return {
      completion: profileCompletion,
      isComplete: isProfileComplete,
      isOnboardingComplete,
      fieldsFilled: {
        basic: profile.age && profile.weight && profile.gender ? 3 : 0,
        activity: profile.activityLevel ? 1 : 0,
        location: profile.country || profile.climate ? 1 : 0,
        total: [
          profile.age,
          profile.weight,
          profile.gender,
          profile.activityLevel,
          profile.country,
          profile.climate,
        ].filter((f) => f !== undefined && f !== null).length,
      },
    };
  }, [profile, profileCompletion, isProfileComplete, isOnboardingComplete]);

  // Check if profile needs update (for sync purposes)
  const needsSync = useMemo(() => {
    // This would check if Realm and AsyncStorage are out of sync
    // For now, return false as sync logic would be implemented separately
    return false;
  }, []);

  // Premium/Pro user status
  const isPremium = useMemo(() => {
    if (!subscription) return false;
    return (
      subscription.isActive &&
      (subscription.tier === "pro" || subscription.tier === "pro_plus")
    );
  }, [subscription]);

  const isPro = useMemo(() => {
    if (!subscription) return false;
    return subscription.isActive && subscription.tier === "pro";
  }, [subscription]);

  const isProPlus = useMemo(() => {
    if (!subscription) return false;
    return subscription.isActive && subscription.tier === "pro_plus";
  }, [subscription]);

  const isFree = useMemo(() => {
    if (!subscription) return true;
    return !subscription.isActive || subscription.tier === "free";
  }, [subscription]);

  const subscriptionTier = useMemo(() => {
    return subscription?.tier || "free";
  }, [subscription]);

  const subscriptionStatus = useMemo(() => {
    return {
      isPremium,
      isPro,
      isProPlus,
      isFree,
      tier: subscriptionTier,
      isActive: subscription?.isActive || false,
      willRenew: subscription?.willRenew || false,
      expiresAt: subscription?.expiresAt,
    };
  }, [isPremium, isPro, isProPlus, isFree, subscriptionTier, subscription]);

  return {
    // Profile data
    profile,
    settings,

    // Computed values
    isProfileComplete,
    isOnboardingComplete,
    profileCompletion,
    currentGoal,
    profileDisplay,
    settingsDisplay,
    recommendedSettings,
    profileStats,

    // Premium/Subscription status
    isPremium,
    isPro,
    isProPlus,
    isFree,
    subscriptionTier,
    subscriptionStatus,

    // Methods
    calculateSmartGoal,
    validateProfile,
    validateSettings,

    // Sync status
    needsSync,
  };
}
