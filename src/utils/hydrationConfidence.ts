/**
 * Hydration Confidence Score
 *
 * A 0-100 score based on:
 * - Consistency (streak, regularity)
 * - Goal accuracy (how close to goal)
 * - Logging habits (frequency, completeness)
 *
 * Used for:
 * - AI Coach tone
 * - Personalized tips
 * - Recovery mode triggers
 */

import { DayRecord, DailyGoal } from "@/types/water";

export interface ConfidenceScore {
  score: number; // 0-100
  breakdown: {
    consistency: number; // 0-100
    accuracy: number; // 0-100
    logging: number; // 0-100
  };
  level: "excellent" | "good" | "fair" | "needs_improvement";
  insights: string[];
}

/**
 * Calculate hydration confidence score
 */
export function calculateConfidenceScore(
  records: Record<string, DayRecord>,
  dailyGoal: DailyGoal,
  currentStreak: number,
  longestStreak: number
): ConfidenceScore {
  const recordsArray = Object.values(records);
  const totalDays = recordsArray.length;

  if (totalDays === 0) {
    return {
      score: 0,
      breakdown: {
        consistency: 0,
        accuracy: 0,
        logging: 0,
      },
      level: "needs_improvement",
      insights: ["Start logging your hydration to build confidence!"],
    };
  }

  // 1. Consistency Score (0-100)
  // Based on: streak length, regularity, completion rate
  const completedDays = recordsArray.filter((r) => r.goalAchieved).length;
  const completionRate = (completedDays / totalDays) * 100;

  // Streak contribution (max 40 points)
  const streakScore = Math.min(40, (currentStreak / 30) * 40);

  // Regularity contribution (max 30 points)
  // Days with any logging activity
  const activeDays = recordsArray.filter((r) => r.entries.length > 0).length;
  const regularityScore = Math.min(30, (activeDays / totalDays) * 30);

  // Completion rate contribution (max 30 points)
  const completionScore = Math.min(30, (completionRate / 100) * 30);

  const consistency = Math.round(
    streakScore + regularityScore + completionScore
  );

  // 2. Accuracy Score (0-100)
  // Based on: how close to goal, variance
  const goalDeviations = recordsArray.map((r) => {
    const deviation = Math.abs(r.netHydration - dailyGoal.goal);
    const percentage = (deviation / dailyGoal.goal) * 100;
    return Math.max(0, 100 - percentage); // Closer = higher score
  });

  const averageAccuracy =
    goalDeviations.reduce((sum, acc) => sum + acc, 0) / totalDays;

  // Bonus for consistency (low variance)
  const variance = calculateVariance(goalDeviations);
  const varianceBonus = Math.max(0, 20 - variance / 5); // Lower variance = higher bonus

  const accuracy = Math.round(Math.min(100, averageAccuracy + varianceBonus));

  // 3. Logging Score (0-100)
  // Based on: entry frequency, timeliness, completeness
  const totalEntries = recordsArray.reduce(
    (sum, r) => sum + r.entries.length,
    0
  );
  const avgEntriesPerDay = totalEntries / totalDays;

  // Ideal: 8-12 entries per day (every 1-2 hours)
  const entryFrequencyScore = Math.min(50, (avgEntriesPerDay / 10) * 50);

  // Timeliness: entries spread throughout the day
  const timelinessScore = calculateTimelinessScore(recordsArray);

  // Completeness: days with entries vs empty days
  const completenessScore = (activeDays / totalDays) * 30;

  const logging = Math.round(
    entryFrequencyScore + timelinessScore + completenessScore
  );

  // Overall score (weighted average)
  const score = Math.round(
    consistency * 0.4 + // 40% weight
      accuracy * 0.35 + // 35% weight
      logging * 0.25 // 25% weight
  );

  // Determine level
  let level: ConfidenceScore["level"];
  if (score >= 80) level = "excellent";
  else if (score >= 60) level = "good";
  else if (score >= 40) level = "fair";
  else level = "needs_improvement";

  // Generate insights
  const insights = generateInsights(
    score,
    consistency,
    accuracy,
    logging,
    currentStreak,
    completionRate
  );

  return {
    score,
    breakdown: {
      consistency,
      accuracy,
      logging,
    },
    level,
    insights,
  };
}

/**
 * Calculate variance of an array
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate timeliness score based on entry distribution
 */
function calculateTimelinessScore(records: DayRecord[]): number {
  if (records.length === 0) return 0;

  // Check if entries are spread throughout the day
  let timelinessScore = 0;
  let checkedDays = 0;

  records.forEach((record) => {
    if (record.entries.length === 0) return;

    // Group entries by hour
    const hourGroups: number[] = [];
    record.entries.forEach((entry) => {
      const hour = new Date(entry.timestamp).getHours();
      hourGroups.push(hour);
    });

    // Check distribution (should have entries across different hours)
    const uniqueHours = new Set(hourGroups).size;
    const distributionScore = Math.min(30, (uniqueHours / 8) * 30); // Ideal: 8+ hours

    timelinessScore += distributionScore;
    checkedDays++;
  });

  return checkedDays > 0 ? timelinessScore / checkedDays : 0;
}

/**
 * Generate personalized insights
 */
function generateInsights(
  score: number,
  consistency: number,
  accuracy: number,
  logging: number,
  currentStreak: number,
  completionRate: number
): string[] {
  const insights: string[] = [];

  if (score >= 80) {
    insights.push("🎉 Excellent hydration habits! You're on fire!");
    if (currentStreak >= 30) {
      insights.push("Your consistency streak is impressive!");
    }
  } else if (score >= 60) {
    insights.push("Great progress! Keep up the momentum.");
    if (consistency < 60) {
      insights.push("Try to maintain your streak for better consistency.");
    }
    if (accuracy < 60) {
      insights.push("Aim to get closer to your daily goal.");
    }
  } else if (score >= 40) {
    insights.push("You're building good habits. Keep going!");
    if (completionRate < 50) {
      insights.push("Try to meet your goal more often.");
    }
    if (logging < 50) {
      insights.push("Log your water intake more frequently.");
    }
  } else {
    insights.push("Every journey starts with a single step!");
    if (currentStreak === 0) {
      insights.push("Start a streak today to boost your confidence.");
    }
    if (completionRate < 30) {
      insights.push("Try setting a smaller goal to build momentum.");
    }
  }

  // Specific recommendations
  if (consistency < 50 && currentStreak < 7) {
    insights.push("💡 Tip: Focus on building a 7-day streak first.");
  }

  if (accuracy < 50) {
    insights.push(
      "💡 Tip: Track your intake throughout the day for better accuracy."
    );
  }

  if (logging < 50) {
    insights.push("💡 Tip: Set reminders to log water regularly.");
  }

  return insights;
}
