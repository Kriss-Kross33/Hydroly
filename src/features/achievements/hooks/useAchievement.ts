import { useMemo } from "react";
import { BadgeType, Badge } from "@/types/achievements";
import { SubscriptionStatus } from "@/types/subscription";
import { RealmRepository } from "@hydroly/realm-repository";

// Realm schema for achievements persistence
const AchievementSchema = {
  name: "Achievement",
  primaryKey: "id",
  properties: {
    id: "string",
    name: "string",
    description: "string",
    icon: "string",
    color: "string",
    type: "string", // BadgeType
    unlockedAt: "string", // ISO date string
    achieved: "boolean",
  },
};

// Repository instance for achievements
export const achievementRepository = new RealmRepository<{
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: string;
  unlockedAt: string;
  achieved: boolean;
}>({
  realmConfig: {
    schema: [AchievementSchema],
    schemaVersion: 1,
    path: "achievements.realm",
  },
  objectType: "Achievement",
  idKey: "id",
});

/**
 * React hook for managing achievements
 * Provides methods to interact with achievements and computed values
 * Supports premium/pro user features
 */
export function useAchievement(
  badges: Record<BadgeType, Badge>,
  subscription?: SubscriptionStatus
) {
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

  // Get achievement rarity/rarity level
  // Define this function before useMemo hooks that use it
  const getRarity = (
    id: BadgeType
  ): "common" | "rare" | "epic" | "legendary" => {
    const rarityMap: Record<
      BadgeType,
      "common" | "rare" | "epic" | "legendary"
    > = {
      first_day: "common",
      week_streak: "common",
      perfect_week: "rare",
      early_bird: "rare",
      night_owl: "rare",
      milestone_7: "common",
      consistency_king: "rare",
      month_streak: "epic",
      milestone_30: "epic",
      hydration_hero: "epic",
      recovery_champion: "epic",
      milestone_100: "legendary",
    };

    return rarityMap[id] || "common";
  };

  // Get all badges as an array
  const allBadges = useMemo(() => Object.values(badges), [badges]);

  // Get earned badges sorted by unlock date (newest first)
  const earnedBadges = useMemo(() => {
    return allBadges
      .filter((badge) => badge.isEarned)
      .sort((a, b) => {
        const dateA = a.earnedAt || 0;
        const dateB = b.earnedAt || 0;
        return dateB - dateA; // Newest first
      });
  }, [allBadges]);

  // Get locked badges (filter premium badges for free users)
  const lockedBadges = useMemo(() => {
    const locked = allBadges.filter((badge) => !badge.isEarned);

    // For free users, show premium badges as locked with premium indicator
    // For premium users, show all badges
    return locked;
  }, [allBadges]);

  // Get premium-only badges (epic and legendary for free users)
  const premiumBadges = useMemo(() => {
    return allBadges.filter((badge) => {
      const rarity = getRarity(badge.id);
      return rarity === "epic" || rarity === "legendary";
    });
  }, [allBadges]);

  // Get free-tier badges (common and rare)
  const freeBadges = useMemo(() => {
    return allBadges.filter((badge) => {
      const rarity = getRarity(badge.id);
      return rarity === "common" || rarity === "rare";
    });
  }, [allBadges]);

  // Get badges by category/type
  const badgesByCategory = useMemo(() => {
    const categories: Record<string, Badge[]> = {
      streaks: [],
      milestones: [],
      habits: [],
      special: [],
    };

    allBadges.forEach((badge) => {
      if (badge.id.includes("streak") || badge.id.includes("milestone")) {
        if (badge.id.includes("streak")) {
          categories.streaks.push(badge);
        } else {
          categories.milestones.push(badge);
        }
      } else if (
        badge.id === "early_bird" ||
        badge.id === "night_owl" ||
        badge.id === "perfect_week" ||
        badge.id === "consistency_king"
      ) {
        categories.habits.push(badge);
      } else {
        categories.special.push(badge);
      }
    });

    return categories;
  }, [allBadges]);

  // Calculate achievement progress percentage
  const progress = useMemo(() => {
    const total = allBadges.length;
    const earned = earnedBadges.length;
    return total > 0 ? Math.round((earned / total) * 100) : 0;
  }, [allBadges.length, earnedBadges.length]);

  // Get recent achievements (last 5 unlocked)
  const recentAchievements = useMemo(() => {
    return earnedBadges.slice(0, 5);
  }, [earnedBadges]);

  // Get achievement by ID
  const getAchievement = (id: BadgeType): Badge | undefined => {
    return badges[id];
  };

  // Check if achievement is earned
  const isEarned = (id: BadgeType): boolean => {
    return badges[id]?.isEarned ?? false;
  };

  // Get achievement progress towards unlocking (for progress-based achievements)
  const getProgress = (
    id: BadgeType
  ): { current: number; target: number; percentage: number } | null => {
    const badge = badges[id];
    if (!badge || badge.isEarned) return null;

    // Define progress requirements for specific badges
    const progressMap: Record<BadgeType, { target: number }> = {
      week_streak: { target: 7 },
      month_streak: { target: 30 },
      milestone_7: { target: 7 },
      milestone_30: { target: 30 },
      milestone_100: { target: 100 },
      perfect_week: { target: 7 },
      consistency_king: { target: 20 },
      first_day: { target: 1 },
      hydration_hero: { target: 3000 },
      early_bird: { target: 7 },
      night_owl: { target: 7 },
      recovery_champion: { target: 1 },
    };

    const requirement = progressMap[id];
    if (!requirement) return null;

    // This would need to be connected to actual progress tracking
    // For now, return a placeholder structure
    return {
      current: 0,
      target: requirement.target,
      percentage: 0,
    };
  };

  // Get next achievable badge (closest to being unlocked)
  const getNextAchievable = (): Badge | null => {
    const locked = lockedBadges
      .map((badge) => ({
        badge,
        progress: getProgress(badge.id),
      }))
      .filter((item) => item.progress !== null)
      .sort((a, b) => {
        const progressA = a.progress!.percentage;
        const progressB = b.progress!.percentage;
        return progressB - progressA; // Highest progress first
      });

    return locked.length > 0 ? locked[0].badge : null;
  };

  // Get achievement statistics
  const statistics = useMemo(() => {
    const total = allBadges.length;
    const earned = earnedBadges.length;
    const locked = lockedBadges.length;
    const byRarity = {
      common: allBadges.filter((b) => getRarity(b.id) === "common").length,
      rare: allBadges.filter((b) => getRarity(b.id) === "rare").length,
      epic: allBadges.filter((b) => getRarity(b.id) === "epic").length,
      legendary: allBadges.filter((b) => getRarity(b.id) === "legendary")
        .length,
    };

    // Calculate available badges based on subscription
    const availableBadges = isPremium ? total : freeBadges.length;
    const availableEarned = isPremium
      ? earned
      : earnedBadges.filter((b) => freeBadges.some((fb) => fb.id === b.id))
          .length;
    const availableProgress =
      availableBadges > 0
        ? Math.round((availableEarned / availableBadges) * 100)
        : 0;

    return {
      total,
      earned,
      locked,
      progress,
      byRarity,
      availableBadges,
      availableEarned,
      availableProgress,
      premiumBadgesCount: premiumBadges.length,
      freeBadgesCount: freeBadges.length,
    };
  }, [
    allBadges,
    earnedBadges,
    lockedBadges.length,
    progress,
    isPremium,
    freeBadges,
    premiumBadges,
  ]);

  // Check if badge requires premium
  const requiresPremium = (id: BadgeType): boolean => {
    const rarity = getRarity(id);
    return rarity === "epic" || rarity === "legendary";
  };

  // Check if badge is accessible to current user
  const isAccessible = (id: BadgeType): boolean => {
    if (isPremium) return true;
    return !requiresPremium(id);
  };

  return {
    // Data
    allBadges,
    earnedBadges,
    lockedBadges,
    badgesByCategory,
    recentAchievements,
    statistics,
    premiumBadges,
    freeBadges,

    // Methods
    getAchievement,
    isEarned,
    getProgress,
    getRarity,
    getNextAchievable,
    requiresPremium,
    isAccessible,

    // Premium status
    isPremium,
    isPro,
    isProPlus,
    isFree,

    // Computed values
    progress,
  };
}
