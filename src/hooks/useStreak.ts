import { useMemo } from "react";
import { Streak } from "@/types/achievements";
import { DayRecord, DailyGoal } from "@/types/water";
import { RealmRepository } from "@hydroly/realm-repository";

// Realm schema for streak persistence (matching the Streak type from types/achievements.ts)
const StreakSchema = {
  name: "Streak",
  primaryKey: "id",
  properties: {
    id: "string",
    current: "int",
    longest: "int",
    lastUpdated: "string", // YYYY-MM-DD format
  },
};

// Repository instance for streaks
export const streakRepository = new RealmRepository<{
  id: string;
  current: number;
  longest: number;
  lastUpdated: string;
}>({
  realmConfig: {
    schema: [StreakSchema],
    schemaVersion: 1,
    path: "streak.realm",
  },
  objectType: "Streak",
  idKey: "id",
});

/**
 * Calculate current streak from records
 */
function calculateCurrentStreak(
  records: Record<string, DayRecord>,
  dailyGoal: DailyGoal,
  referenceDate?: Date
): number {
  const today = referenceDate || new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateKey = checkDate.toISOString().split("T")[0];
    const record = records[dateKey];

    if (record && record.goalAchieved) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak from records
 */
function calculateLongestStreak(records: Record<string, DayRecord>): number {
  const sortedRecords = Object.values(records)
    .filter((r) => r.goalAchieved)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedRecords.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 1;
  let lastDate: Date | null = null;

  sortedRecords.forEach((record) => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    if (lastDate) {
      const daysDiff = Math.floor(
        (recordDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Streak broken
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    lastDate = recordDate;
  });

  return Math.max(longestStreak, currentStreak);
}

/**
 * Calculate streak for a specific date range
 */
function calculateStreakInRange(
  records: Record<string, DayRecord>,
  startDate: Date,
  endDate: Date
): number {
  let streak = 0;
  const currentDate = new Date(endDate);
  currentDate.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  while (currentDate >= start) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const record = records[dateKey];

    if (record && record.goalAchieved) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get streak milestones (7, 30, 100 days, etc.)
 */
function getStreakMilestones(currentStreak: number): {
  next: number | null;
  progress: number;
  achieved: number[];
} {
  const milestones = [7, 30, 50, 100, 200, 365];
  const achieved = milestones.filter((m) => currentStreak >= m);
  const next = milestones.find((m) => currentStreak < m) || null;

  let progress = 0;
  if (next) {
    const previousMilestone =
      achieved.length > 0 ? achieved[achieved.length - 1] : 0;
    const range = next - previousMilestone;
    const current = currentStreak - previousMilestone;
    progress = Math.min(100, Math.round((current / range) * 100));
  }

  return {
    next,
    progress,
    achieved,
  };
}

/**
 * React hook for managing and calculating streaks
 */
export function useStreak(
  records: Record<string, DayRecord>,
  dailyGoal: DailyGoal,
  storedStreak?: Streak
) {
  // Calculate current streak from records
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(records, dailyGoal);
  }, [records, dailyGoal]);

  // Calculate longest streak from records
  const longestStreak = useMemo(() => {
    return calculateLongestStreak(records);
  }, [records]);

  // Get today's date key
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split("T")[0];
  }, []);

  // Get streak milestones
  const milestones = useMemo(() => {
    return getStreakMilestones(currentStreak);
  }, [currentStreak]);

  // Check if streak is at risk (missed yesterday but not today)
  const isAtRisk = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    const yesterdayRecord = records[yesterdayKey];
    const todayRecord = records[today];

    return (
      (!yesterdayRecord || !yesterdayRecord.goalAchieved) &&
      (!todayRecord || !todayRecord.goalAchieved)
    );
  }, [records, today]);

  // Get streak history (last 30 days)
  const streakHistory = useMemo(() => {
    const history: { date: string; achieved: boolean; streak: number }[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    let runningStreak = 0;
    for (let i = 0; i <= 30; i++) {
      const checkDate = new Date(endDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];
      const record = records[dateKey];

      if (record && record.goalAchieved) {
        runningStreak++;
      } else {
        runningStreak = 0;
      }

      history.unshift({
        date: dateKey,
        achieved: record?.goalAchieved || false,
        streak: runningStreak,
      });
    }

    return history;
  }, [records]);

  // Get weekly streak (last 7 days)
  const weeklyStreak = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return calculateStreakInRange(records, startDate, endDate);
  }, [records]);

  // Get monthly streak (last 30 days)
  const monthlyStreak = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return calculateStreakInRange(records, startDate, endDate);
  }, [records]);

  // Calculate streak statistics
  const statistics = useMemo(() => {
    const allRecords = Object.values(records);
    const totalDays = allRecords.length;
    const completedDays = allRecords.filter((r) => r.goalAchieved).length;
    const streakDays = allRecords.filter((r) => {
      // Count days that are part of any streak
      return r.goalAchieved;
    }).length;

    return {
      totalDays,
      completedDays,
      streakDays,
      completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
      averageStreakLength: longestStreak > 0 ? streakDays / longestStreak : 0,
    };
  }, [records, longestStreak]);

  // Get formatted streak display
  const display = useMemo(() => {
    const formatStreak = (days: number): string => {
      if (days === 0) return "No streak";
      if (days === 1) return "1 day";
      if (days < 7) return `${days} days`;
      if (days < 30) {
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;
        if (remainingDays === 0) return `${weeks} week${weeks > 1 ? "s" : ""}`;
        return `${weeks} week${weeks > 1 ? "s" : ""} ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
      }
      if (days < 365) {
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        if (remainingDays === 0)
          return `${months} month${months > 1 ? "s" : ""}`;
        return `${months} month${months > 1 ? "s" : ""} ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
      }
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      if (remainingDays === 0) return `${years} year${years > 1 ? "s" : ""}`;
      return `${years} year${years > 1 ? "s" : ""} ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
    };

    return {
      current: formatStreak(currentStreak),
      longest: formatStreak(longestStreak),
      nextMilestone: milestones.next
        ? `${milestones.next} days (${milestones.progress}% there)`
        : "All milestones achieved! 🎉",
    };
  }, [currentStreak, longestStreak, milestones]);

  // Get streak status
  const status = useMemo(() => {
    if (currentStreak === 0) return "none";
    if (isAtRisk) return "at_risk";
    if (currentStreak >= 100) return "legendary";
    if (currentStreak >= 30) return "excellent";
    if (currentStreak >= 7) return "good";
    return "building";
  }, [currentStreak, isAtRisk]);

  return {
    // Core streak data
    current: currentStreak,
    longest: longestStreak,
    lastUpdated: storedStreak?.lastUpdated || today,

    // Computed values
    milestones,
    isAtRisk,
    status,
    weeklyStreak,
    monthlyStreak,
    streakHistory,
    statistics,
    display,

    // Helper methods
    calculateForDate: (date: Date) =>
      calculateCurrentStreak(records, dailyGoal, date),
    calculateInRange: (startDate: Date, endDate: Date) =>
      calculateStreakInRange(records, startDate, endDate),
  };
}
