/**
 * Day Boundary Service
 *
 * Centralizes all "hydration day" logic to prevent:
 * - Double streaks
 * - Missed days
 * - Timezone bugs
 * - Inconsistent day boundaries across the app
 *
 * A "hydration day" can start at a custom time (e.g., 5am-9am)
 * to accommodate different sleep schedules.
 */

/**
 * Parse time string (HH:MM) to hours and minutes
 */
function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
}

/**
 * Get the hydration date key for a given timestamp
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param startOfDayTime - Time when hydration day starts (e.g., "06:00")
 * @returns Date key in YYYY-MM-DD format for the hydration day
 *
 * Example:
 * - Current time: 2024-01-15 02:30 (2:30 AM)
 * - Start of day: 06:00
 * - Result: "2024-01-14" (still previous hydration day)
 *
 * - Current time: 2024-01-15 07:30 (7:30 AM)
 * - Start of day: 06:00
 * - Result: "2024-01-15" (new hydration day started)
 */
export function getHydrationDateKey(
  timestamp: number = Date.now(),
  startOfDayTime: string = "06:00"
): string {
  const date = new Date(timestamp);
  const { hours, minutes } = parseTime(startOfDayTime);

  // Create a date at the start of day boundary
  const dayStart = new Date(date);
  dayStart.setHours(hours, minutes, 0, 0);

  // If current time is before the start of day boundary,
  // we're still in the previous hydration day
  if (date < dayStart) {
    dayStart.setDate(dayStart.getDate() - 1);
  }

  return dayStart.toISOString().split("T")[0];
}

/**
 * Get the current hydration date key
 * Uses the current time and user's start of day setting
 */
export function getCurrentHydrationDateKey(
  startOfDayTime: string = "06:00"
): string {
  return getHydrationDateKey(Date.now(), startOfDayTime);
}

/**
 * Get hydration date key for a specific date object
 */
export function getHydrationDateKeyFromDate(
  date: Date,
  startOfDayTime: string = "06:00"
): string {
  return getHydrationDateKey(date.getTime(), startOfDayTime);
}

/**
 * Check if a timestamp belongs to today's hydration day
 */
export function isToday(
  timestamp: number,
  startOfDayTime: string = "06:00"
): boolean {
  const hydrationDate = getHydrationDateKey(timestamp, startOfDayTime);
  const todayDate = getCurrentHydrationDateKey(startOfDayTime);
  return hydrationDate === todayDate;
}

/**
 * Get the start timestamp of the current hydration day
 */
export function getCurrentDayStartTimestamp(
  startOfDayTime: string = "06:00"
): number {
  const today = getCurrentHydrationDateKey(startOfDayTime);
  const { hours, minutes } = parseTime(startOfDayTime);
  const date = new Date(today);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

/**
 * Get the end timestamp of the current hydration day
 */
export function getCurrentDayEndTimestamp(
  startOfDayTime: string = "06:00"
): number {
  const start = getCurrentDayStartTimestamp(startOfDayTime);
  return start + 24 * 60 * 60 * 1000 - 1; // 24 hours - 1ms
}

/**
 * Get all date keys in a range (inclusive)
 */
export function getDateKeysInRange(
  startDate: Date,
  endDate: Date,
  startOfDayTime: string = "06:00"
): string[] {
  const keys: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    keys.push(getHydrationDateKeyFromDate(current, startOfDayTime));
    current.setDate(current.getDate() + 1);
  }

  // Remove duplicates and sort
  return [...new Set(keys)].sort();
}

/**
 * Get yesterday's hydration date key
 */
export function getYesterdayDateKey(startOfDayTime: string = "06:00"): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getHydrationDateKeyFromDate(yesterday, startOfDayTime);
}

/**
 * Get the number of hydration days between two timestamps
 */
export function getDaysBetween(
  startTimestamp: number,
  endTimestamp: number,
  startOfDayTime: string = "06:00"
): number {
  const startKey = getHydrationDateKey(startTimestamp, startOfDayTime);
  const endKey = getHydrationDateKey(endTimestamp, startOfDayTime);

  const start = new Date(startKey);
  const end = new Date(endKey);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Validate start of day time format
 */
export function isValidStartOfDayTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}
