/**
 * Recovery Mode Logic
 * 
 * Formal recovery mode system that:
 * - Detects when user needs recovery
 * - Adjusts goals temporarily
 * - Provides encouraging language
 * - Triggers gentle reminders
 * 
 * Triggers:
 * - 3+ consecutive missed days
 * - Broken streak > 7 days
 * - Confidence score drops below 30
 */

import { DayRecord, DailyGoal } from "@/types/water";
import { ConfidenceScore } from "./hydrationConfidence";

export interface RecoveryModeState {
  isActive: boolean;
  reason: "missed_days" | "broken_streak" | "low_confidence" | null;
  adjustedGoal: number;
  originalGoal: number;
  daysInRecovery: number;
  encouragement: string;
  suggestions: string[];
}

/**
 * Check if recovery mode should be activated
 */
export function shouldActivateRecoveryMode(
  records: Record<string, DayRecord>,
  dailyGoal: DailyGoal,
  currentStreak: number,
  confidenceScore: ConfidenceScore
): RecoveryModeState | null {
  const recordsArray = Object.values(records);
  const sortedDates = Object.keys(records).sort().reverse();
  
  if (sortedDates.length === 0) {
    return null; // No data yet
  }

  // Check for 3+ consecutive missed days
  let consecutiveMissed = 0;
  for (let i = 0; i < Math.min(7, sortedDates.length); i++) {
    const record = records[sortedDates[i]];
    if (!record || !record.goalAchieved) {
      consecutiveMissed++;
    } else {
      break; // Streak broken
    }
  }

  // Check for broken streak > 7 days
  const hasBrokenStreak = currentStreak === 0 && sortedDates.length > 7;

  // Check for low confidence
  const lowConfidence = confidenceScore.score < 30;

  // Determine if recovery mode should activate
  let reason: RecoveryModeState["reason"] = null;
  if (consecutiveMissed >= 3) {
    reason = "missed_days";
  } else if (hasBrokenStreak) {
    reason = "broken_streak";
  } else if (lowConfidence) {
    reason = "low_confidence";
  }

  if (!reason) {
    return null; // No recovery needed
  }

  // Calculate adjusted goal (reduce by 20-30%)
  const reduction = reason === "missed_days" ? 0.3 : 0.2;
  const adjustedGoal = Math.max(
    1500, // Minimum
    Math.round(dailyGoal.goal * (1 - reduction))
  );

  // Count days in recovery (consecutive missed days)
  const daysInRecovery = consecutiveMissed;

  // Generate encouragement
  const encouragement = getEncouragement(reason, daysInRecovery);

  // Generate suggestions
  const suggestions = getSuggestions(reason, adjustedGoal, dailyGoal.goal);

  return {
    isActive: true,
    reason,
    adjustedGoal,
    originalGoal: dailyGoal.goal,
    daysInRecovery,
    encouragement,
    suggestions,
  };
}

/**
 * Get encouragement message based on recovery reason
 */
function getEncouragement(
  reason: RecoveryModeState["reason"],
  daysInRecovery: number
): string {
  if (reason === "missed_days") {
    return `You've missed ${daysInRecovery} days. That's okay! Let's get back on track with a smaller goal.`;
  }
  if (reason === "broken_streak") {
    return "Your streak was broken, but every day is a fresh start. Let's rebuild together!";
  }
  if (reason === "low_confidence") {
    return "We noticed you're struggling. Let's simplify your goal to build confidence.";
  }
  return "Let's get back on track!";
}

/**
 * Get recovery suggestions
 */
function getSuggestions(
  reason: RecoveryModeState["reason"],
  adjustedGoal: number,
  originalGoal: number
): string[] {
  const suggestions: string[] = [];

  if (reason === "missed_days") {
    suggestions.push(`We've lowered your goal to ${adjustedGoal}ml to help you succeed.`);
    suggestions.push("Focus on consistency over quantity.");
    suggestions.push("Set reminders to help you remember.");
  } else if (reason === "broken_streak") {
    suggestions.push("Start fresh with a smaller goal.");
    suggestions.push("Build a new streak, one day at a time.");
    suggestions.push("Celebrate small wins!");
  } else if (reason === "low_confidence") {
    suggestions.push(`Try ${adjustedGoal}ml per day to build confidence.`);
    suggestions.push("Log your intake regularly, even if it's small.");
    suggestions.push("Remember: progress, not perfection.");
  }

  return suggestions;
}

/**
 * Check if recovery mode should be deactivated
 */
export function shouldDeactivateRecoveryMode(
  recoveryState: RecoveryModeState,
  records: Record<string, DayRecord>,
  currentStreak: number
): boolean {
  // Deactivate if:
  // 1. User has achieved goal for 3 consecutive days
  // 2. Streak has reached 7 days
  // 3. User has been in recovery for 14+ days (prevent indefinite recovery)

  if (recoveryState.daysInRecovery >= 14) {
    return true; // Force deactivation after 14 days
  }

  if (currentStreak >= 7) {
    return true; // User has built a good streak
  }

  // Check last 3 days
  const sortedDates = Object.keys(records).sort().reverse();
  if (sortedDates.length < 3) {
    return false;
  }

  const last3Days = sortedDates.slice(0, 3);
  const allAchieved = last3Days.every((date) => {
    const record = records[date];
    return record && record.goalAchieved;
  });

  return allAchieved; // User has achieved goal for 3 consecutive days
}

/**
 * Get recovery mode progress
 */
export function getRecoveryProgress(
  recoveryState: RecoveryModeState,
  currentStreak: number
): {
  progress: number; // 0-100
  message: string;
  nextMilestone: string;
} {
  // Progress based on streak building
  const progress = Math.min(100, (currentStreak / 7) * 100);

  let message = "";
  let nextMilestone = "";

  if (currentStreak === 0) {
    message = "Start your comeback today!";
    nextMilestone = "1 day streak";
  } else if (currentStreak < 3) {
    message = "You're building momentum!";
    nextMilestone = "3 day streak";
  } else if (currentStreak < 7) {
    message = "You're almost there!";
    nextMilestone = "7 day streak";
  } else {
    message = "You've recovered! Ready to return to your normal goal?";
    nextMilestone = "Return to normal goal";
  }

  return {
    progress: Math.round(progress),
    message,
    nextMilestone,
  };
}

