/**
 * Reminder Service
 *
 * Handles local notifications for hydration reminders using Notifee
 * - Schedules recurring reminders based on user settings
 * - Uses custom notification sounds
 * - Respects quiet hours
 * - Supports adaptive reminders (Pro feature)
 *
 * This service is part of the @hydroly/push-notifications package
 * and uses the shared Notifee instance.
 */

import notifee, {
  AndroidImportance,
  TriggerType,
  RepeatFrequency,
  TimestampTrigger,
} from "@notifee/react-native";
import { Platform } from "react-native";

// Reminder settings interface (to avoid circular dependencies)
export interface ReminderSettings {
  reminderFrequency:
    | "hourly"
    | "every_2_hours"
    | "every_3_hours"
    | "custom"
    | "never";
  customReminderInterval?: number;
  reminderSound: boolean;
  reminderVibration: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

const REMINDER_CHANNEL_ID = "hydration_reminders";
const REMINDER_CHANNEL_NAME = "Hydration Reminders";

// Notification IDs
const REMINDER_NOTIFICATION_ID_PREFIX = "hydration_reminder_";

/**
 * Initialize notification channels
 * Must be called before scheduling notifications
 */
export async function initializeReminderChannels(): Promise<void> {
  try {
    // Android: Create notification channel
    if (Platform.OS === "android") {
      await notifee.createChannel({
        id: REMINDER_CHANNEL_ID,
        name: REMINDER_CHANNEL_NAME,
        importance: AndroidImportance.HIGH,
        sound: "notification_alert", // Android sound resource name (from res/raw/)
        vibration: true,
        vibrationPattern: [300, 500],
      });
      console.log("[ReminderService] Android notification channel created");
    }

    // Request permissions
    const settings = await notifee.requestPermission();
    console.log("[ReminderService] Permission request result:", {
      authorizationStatus: settings.authorizationStatus,
      android: settings.android,
      ios: settings.ios,
    });

    if (settings.authorizationStatus >= 1) {
      console.log("[ReminderService] ✅ Notification permissions granted");
    } else {
      console.warn(
        "[ReminderService] ⚠️ Notification permissions denied or not authorized"
      );
      console.warn(
        "[ReminderService] Authorization status:",
        settings.authorizationStatus
      );
      console.warn(
        "[ReminderService] Reminders will not work without permissions!"
      );
    }

    // Check Android notification settings
    if (Platform.OS === "android") {
      const channelSettings = await notifee.getChannel(REMINDER_CHANNEL_ID);
      if (channelSettings?.blocked) {
        console.warn("[ReminderService] Notification channel is blocked");
      }
    }
  } catch (error) {
    console.error("[ReminderService] Error initializing channels:", error);
  }
}

/**
 * Calculate reminder intervals based on settings
 */
function calculateReminderIntervals(settings: ReminderSettings): number[] {
  const intervals: number[] = [];

  if (
    settings.reminderFrequency === "custom" &&
    settings.customReminderInterval
  ) {
    // Custom interval in minutes
    intervals.push(settings.customReminderInterval);
  } else {
    // Predefined frequencies
    switch (settings.reminderFrequency) {
      case "hourly":
        intervals.push(60); // 1 hour
        break;
      case "every_2_hours":
        intervals.push(120); // 2 hours
        break;
      case "every_3_hours":
        intervals.push(180); // 3 hours
        break;
      case "never":
        // No reminders
        return [];
      default:
        intervals.push(120); // Default: 2 hours
    }
  }

  return intervals;
}

/**
 * Check if a specific time (in minutes from midnight) is within quiet hours
 */
function isTimeInQuietHours(
  timeMinutes: number,
  settings: ReminderSettings
): boolean {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) {
    return false;
  }

  const [startHour, startMin] = settings.quietHoursStart.split(":").map(Number);
  const [endHour, endMin] = settings.quietHoursEnd.split(":").map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Handle quiet hours that span midnight
  if (startTime > endTime) {
    return timeMinutes >= startTime || timeMinutes < endTime;
  } else {
    return timeMinutes >= startTime && timeMinutes < endTime;
  }
}

/**
 * Schedule a single reminder notification at a specific time
 */
async function scheduleReminderAtTime(
  hour: number,
  minute: number,
  settings: ReminderSettings,
  notificationId: string,
  intervalMinutes: number
): Promise<boolean> {
  try {
    const timeMinutes = hour * 60 + minute;

    // Skip if in quiet hours
    if (isTimeInQuietHours(timeMinutes, settings)) {
      return false;
    }

    // Calculate next occurrence of this time
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );

    // If the time has passed today, schedule for tomorrow
    let triggerTime = today;
    if (triggerTime.getTime() <= now.getTime()) {
      triggerTime = new Date(triggerTime.getTime() + 24 * 60 * 60 * 1000);
    }

    // Determine repeat frequency based on interval
    let repeatFrequency: RepeatFrequency;
    if (intervalMinutes >= 1440) {
      repeatFrequency = RepeatFrequency.DAILY;
    } else if (intervalMinutes === 60) {
      repeatFrequency = RepeatFrequency.HOURLY;
    } else {
      // For intervals like 120, 180 minutes, or < 60 minutes, use DAILY
      // Multiple notifications are scheduled throughout the day to handle the frequency
      repeatFrequency = RepeatFrequency.DAILY;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime.getTime(),
      repeatFrequency,
    };

    // Build notification payload
    const notification: any = {
      id: notificationId,
      title: "💧 Time to Hydrate!",
      body: "Stay hydrated! Remember to drink some water.",
      android: {
        channelId: REMINDER_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        smallIcon: "ic_notification", // Make sure this exists in android/app/src/main/res/drawable
        pressAction: {
          id: "default",
        },
      },
      data: {
        type: "reminder",
        intervalMinutes: intervalMinutes.toString(),
      },
    };

    // Add iOS configuration
    if (Platform.OS === "ios") {
      notification.ios = {};
    }

    // Add sound
    if (settings.reminderSound) {
      if (Platform.OS === "android") {
        notification.android.sound = "notification_alert"; // Android: from res/raw/notification_alert.wav
      } else {
        notification.ios.sound = "notification_sound.caf"; // iOS: from assets/sounds/notification_sound.caf
      }
    }

    // Add vibration
    if (settings.reminderVibration && Platform.OS === "android") {
      notification.android.vibrationPattern = [300, 500];
    }

    await notifee.createTriggerNotification(notification, trigger);
    return true;
  } catch (error) {
    console.error("[ReminderService] Error scheduling reminder:", error);
    return false;
  }
}

/**
 * Schedule reminders for a given interval throughout the day
 * For intervals that don't match Notifee's repeat frequencies (like 120 or 180 minutes),
 * we schedule multiple notifications throughout the day
 */
async function scheduleReminderNotification(
  intervalMinutes: number,
  settings: ReminderSettings,
  baseNotificationId: string
): Promise<void> {
  try {
    // For hourly reminders, use a single notification with HOURLY repeat
    if (intervalMinutes === 60) {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: nextHour.getTime(),
        repeatFrequency: RepeatFrequency.HOURLY,
      };

      const notification: any = {
        id: baseNotificationId,
        title: "💧 Time to Hydrate!",
        body: "Stay hydrated! Remember to drink some water.",
        android: {
          channelId: REMINDER_CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          smallIcon: "ic_notification",
          pressAction: { id: "default" },
        },
        data: {
          type: "reminder",
          intervalMinutes: intervalMinutes.toString(),
        },
      };

      if (Platform.OS === "ios") {
        notification.ios = {};
      }

      if (settings.reminderSound) {
        if (Platform.OS === "android") {
          notification.android.sound = "notification_alert";
        } else {
          notification.ios.sound = "notification_sound.caf";
        }
      }

      if (settings.reminderVibration && Platform.OS === "android") {
        notification.android.vibrationPattern = [300, 500];
      }

      await notifee.createTriggerNotification(notification, trigger);
      console.log(`[ReminderService] Scheduled hourly reminder`);
      return;
    }

    // For other intervals (2 hours, 3 hours, custom), schedule multiple times throughout the day
    // Calculate all reminder times for a 24-hour period
    const reminderTimes: { hour: number; minute: number }[] = [];
    const hoursPerDay = 24;
    const minutesPerDay = hoursPerDay * 60;
    const numReminders = Math.floor(minutesPerDay / intervalMinutes);

    // Start from 6 AM (typical wake time)
    let currentMinutes = 6 * 60; // 6:00 AM

    for (let i = 0; i < numReminders && currentMinutes < minutesPerDay; i++) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;

      // Only add if not in quiet hours
      if (!isTimeInQuietHours(currentMinutes, settings)) {
        reminderTimes.push({ hour, minute });
      }

      currentMinutes += intervalMinutes;
    }

    // Schedule each reminder time
    let scheduledCount = 0;
    for (let i = 0; i < reminderTimes.length; i++) {
      const { hour, minute } = reminderTimes[i];
      const notificationId = `${baseNotificationId}_${i}`;
      const scheduled = await scheduleReminderAtTime(
        hour,
        minute,
        settings,
        notificationId,
        intervalMinutes
      );
      if (scheduled) {
        scheduledCount++;
      }
    }

    console.log(
      `[ReminderService] Scheduled ${scheduledCount} reminders for ${intervalMinutes}-minute interval`
    );
  } catch (error) {
    console.error("[ReminderService] Error scheduling reminder:", error);
  }
}

/**
 * Schedule all reminders based on settings
 */
export async function scheduleReminders(
  settings: ReminderSettings
): Promise<void> {
  try {
    console.log("[ReminderService] Starting to schedule reminders...");
    console.log("[ReminderService] Settings:", {
      reminderFrequency: settings.reminderFrequency,
      reminderSound: settings.reminderSound,
      reminderVibration: settings.reminderVibration,
      quietHoursStart: settings.quietHoursStart,
      quietHoursEnd: settings.quietHoursEnd,
    });

    // Cancel existing reminders first
    await cancelAllReminders();

    // Check if reminders are enabled
    if (!settings.reminderFrequency || settings.reminderFrequency === "never") {
      console.log("[ReminderService] Reminders disabled");
      return;
    }

    // Calculate intervals
    const intervals = calculateReminderIntervals(settings);
    console.log("[ReminderService] Calculated intervals:", intervals);

    if (intervals.length === 0) {
      console.warn("[ReminderService] No intervals to schedule");
      return;
    }

    // Schedule reminders for each interval
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const notificationId = `${REMINDER_NOTIFICATION_ID_PREFIX}${i}`;
      await scheduleReminderNotification(interval, settings, notificationId);
    }

    // Verify reminders were scheduled
    const status = await getReminderStatus();
    console.log("[ReminderService] Reminders scheduled. Status:", status);

    if (status.count === 0) {
      console.warn(
        "[ReminderService] ⚠️ No reminders were scheduled! Check permissions and settings."
      );
    } else {
      console.log(
        `[ReminderService] ✅ Successfully scheduled ${status.count} reminder(s)`
      );
    }
  } catch (error) {
    console.error("[ReminderService] Error scheduling reminders:", error);
  }
}

/**
 * Cancel all reminder notifications
 */
export async function cancelAllReminders(): Promise<void> {
  try {
    // Get all trigger notifications
    const triggerNotifications = await notifee.getTriggerNotifications();

    // Cancel all reminder notifications
    for (const notification of triggerNotifications) {
      if (
        notification.notification.id?.startsWith(
          REMINDER_NOTIFICATION_ID_PREFIX
        )
      ) {
        await notifee.cancelTriggerNotification(notification.notification.id);
      }
    }

    // Also cancel any displayed notifications
    await notifee.cancelAllNotifications();

    console.log("[ReminderService] All reminders cancelled");
  } catch (error) {
    console.error("[ReminderService] Error cancelling reminders:", error);
  }
}

/**
 * Update reminders when settings change
 */
export async function updateReminders(
  settings: ReminderSettings
): Promise<void> {
  await scheduleReminders(settings);
}

/**
 * Get reminder status
 */
export async function getReminderStatus(): Promise<{
  scheduled: boolean;
  count: number;
}> {
  try {
    const triggerNotifications = await notifee.getTriggerNotifications();
    const reminderNotifications = triggerNotifications.filter(
      (n: { notification: { id?: string } }) =>
        n.notification.id?.startsWith(REMINDER_NOTIFICATION_ID_PREFIX)
    );

    return {
      scheduled: reminderNotifications.length > 0,
      count: reminderNotifications.length,
    };
  } catch (error) {
    console.error("[ReminderService] Error getting reminder status:", error);
    return { scheduled: false, count: 0 };
  }
}
