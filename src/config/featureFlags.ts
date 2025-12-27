/**
 * Feature Flags
 *
 * Centralized feature flag management
 * Use to enable/disable features without code changes
 */

export const FEATURE_FLAGS = {
  /**
   * Friends / Social Features
   *
   * DISABLED for v1:
   * - Requires moderation
   * - Requires abuse handling
   * - Triggers policy scrutiny
   * - Ship without it, add later if traction justifies
   */
  FRIENDS_ENABLED: false,

  /**
   * Leaderboard
   *
   * DISABLED for v1 (depends on FRIENDS_ENABLED)
   */
  LEADERBOARD_ENABLED: false,

  /**
   * Recovery Mode
   *
   * ENABLED for v1
   */
  RECOVERY_MODE_ENABLED: true,

  /**
   * Hydration Confidence Score
   *
   * ENABLED for v1
   */
  CONFIDENCE_SCORE_ENABLED: true,

  /**
   * Smart Goal Calculation
   *
   * ENABLED for v1 (now free for all users)
   */
  SMART_GOAL_ENABLED: true,

  /**
   * Day Boundary Service
   *
   * ENABLED for v1 (must be wired everywhere)
   */
  DAY_BOUNDARY_ENABLED: true,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag] === true;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}
