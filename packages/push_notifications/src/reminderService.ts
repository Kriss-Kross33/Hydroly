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
} from '@notifee/react-native';
import { Platform } from 'react-native';

// Reminder settings interface (to avoid circular dependencies)
export interface ReminderSettings {
  reminderFrequency: 'hourly' | 'every_2_hours' | 'every_3_hours' | 'custom' | 'never';
  customReminderInterval?: number;
  reminderSound: boolean;
  reminderVibration: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

const REMINDER_CHANNEL_ID = 'hydration_reminders';
const REMINDER_CHANNEL_NAME = 'Hydration Reminders';

// Notification IDs
const REMINDER_NOTIFICATION_ID_PREFIX = 'hydration_reminder_';

/**
 * Initialize notification channels
 * Must be called before scheduling notifications
 */
export async function initializeReminderChannels(): Promise<void> {
  try {
    // Android: Create notification channel
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: REMINDER_CHANNEL_ID,
        name: REMINDER_CHANNEL_NAME,
        importance: AndroidImportance.HIGH,
        sound: 'notification_alert', // Android sound resource name (from res/raw/)
        vibration: true,
        vibrationPattern: [300, 500],
      });
      console.log('[ReminderService] Android notification channel created');
    }

    // Request permissions
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= 1) {
      console.log('[ReminderService] Notification permissions granted');
    } else {
      console.warn('[ReminderService] Notification permissions denied');
    }

    // Check Android notification settings
    if (Platform.OS === 'android') {
      const channelSettings = await notifee.getChannel(REMINDER_CHANNEL_ID);
      if (channelSettings?.blocked) {
        console.warn('[ReminderService] Notification channel is blocked');
      }
    }
  } catch (error) {
    console.error('[ReminderService] Error initializing channels:', error);
  }
}

/**
 * Calculate reminder intervals based on settings
 */
function calculateReminderIntervals(settings: ReminderSettings): number[] {
  const intervals: number[] = [];

  if (settings.reminderFrequency === 'custom' && settings.customReminderInterval) {
    // Custom interval in minutes
    intervals.push(settings.customReminderInterval);
  } else {
    // Predefined frequencies
    switch (settings.reminderFrequency) {
      case 'hourly':
        intervals.push(60); // 1 hour
        break;
      case 'every_2_hours':
        intervals.push(120); // 2 hours
        break;
      case 'every_3_hours':
        intervals.push(180); // 3 hours
        break;
      case 'never':
        // No reminders
        return [];
      default:
        intervals.push(120); // Default: 2 hours
    }
  }

  return intervals;
}

/**
 * Check if current time is within quiet hours
 */
function isQuietHours(settings: ReminderSettings): boolean {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Handle quiet hours that span midnight
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  } else {
    return currentTime >= startTime && currentTime < endTime;
  }
}

/**
 * Schedule a single reminder notification
 */
async function scheduleReminderNotification(
  intervalMinutes: number,
  settings: ReminderSettings,
  notificationId: string
): Promise<void> {
  try {
    // Calculate trigger time
    const now = new Date();
    const triggerTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);

    // Skip if in quiet hours
    if (isQuietHours(settings)) {
      console.log('[ReminderService] Skipping reminder - quiet hours');
      return;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime.getTime(),
      repeatFrequency: RepeatFrequency.HOURLY, // Will be adjusted based on interval
    };

    // Adjust repeat frequency based on interval
    if (intervalMinutes >= 1440) {
      trigger.repeatFrequency = RepeatFrequency.DAILY;
    } else if (intervalMinutes >= 60) {
      trigger.repeatFrequency = RepeatFrequency.HOURLY;
    } else {
      // For intervals less than 1 hour, use MINUTELY
      trigger.repeatFrequency = RepeatFrequency.MINUTELY;
    }

    // Build notification payload
    const notification: any = {
      id: notificationId,
      title: '💧 Time to Hydrate!',
      body: 'Stay hydrated! Remember to drink some water.',
      android: {
        channelId: REMINDER_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification', // Make sure this exists in android/app/src/main/res/drawable
        pressAction: {
          id: 'default',
        },
      },
      data: {
        type: 'reminder',
        intervalMinutes: intervalMinutes.toString(),
      },
    };

    // Add sound
    if (settings.reminderSound) {
      if (Platform.OS === 'android') {
        notification.android.sound = 'notification_alert'; // Android: from res/raw/notification_alert.wav
      } else {
        notification.ios.sound = 'notification_sound.caf'; // iOS: from assets/sounds/notification_sound.caf
      }
    }

    // Add vibration
    if (settings.reminderVibration && Platform.OS === 'android') {
      notification.android.vibrationPattern = [300, 500];
    }

    await notifee.createTriggerNotification(notification, trigger);
    console.log(`[ReminderService] Scheduled reminder: ${intervalMinutes} minutes`);
  } catch (error) {
    console.error('[ReminderService] Error scheduling reminder:', error);
  }
}

/**
 * Schedule all reminders based on settings
 */
export async function scheduleReminders(settings: ReminderSettings): Promise<void> {
  try {
    // Cancel existing reminders first
    await cancelAllReminders();

    // Check if reminders are enabled
    if (!settings.reminderFrequency || settings.reminderFrequency === 'never') {
      console.log('[ReminderService] Reminders disabled');
      return;
    }

    // Calculate intervals
    const intervals = calculateReminderIntervals(settings);

    // Schedule reminders for each interval
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const notificationId = `${REMINDER_NOTIFICATION_ID_PREFIX}${i}`;
      await scheduleReminderNotification(interval, settings, notificationId);
    }

    console.log('[ReminderService] All reminders scheduled');
  } catch (error) {
    console.error('[ReminderService] Error scheduling reminders:', error);
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
      if (notification.notification.id?.startsWith(REMINDER_NOTIFICATION_ID_PREFIX)) {
        await notifee.cancelTriggerNotification(notification.notification.id);
      }
    }

    // Also cancel any displayed notifications
    await notifee.cancelAllNotifications();

    console.log('[ReminderService] All reminders cancelled');
  } catch (error) {
    console.error('[ReminderService] Error cancelling reminders:', error);
  }
}

/**
 * Update reminders when settings change
 */
export async function updateReminders(settings: ReminderSettings): Promise<void> {
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
    const reminderNotifications = triggerNotifications.filter((n: { notification: { id?: string } }) =>
      n.notification.id?.startsWith(REMINDER_NOTIFICATION_ID_PREFIX)
    );

    return {
      scheduled: reminderNotifications.length > 0,
      count: reminderNotifications.length,
    };
  } catch (error) {
    console.error('[ReminderService] Error getting reminder status:', error);
    return { scheduled: false, count: 0 };
  }
}


