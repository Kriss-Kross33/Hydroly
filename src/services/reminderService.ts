/**
 * Reminder Service Wrapper
 *
 * Wraps the reminder service from @hydroly/push-notifications
 * and adapts it to work with AppSettings from the app
 */

import {
  initializeReminderChannels as initChannels,
  scheduleReminders as scheduleRemindersBase,
  cancelAllReminders as cancelAllRemindersBase,
  updateReminders as updateRemindersBase,
  getReminderStatus as getReminderStatusBase,
  ReminderSettings,
} from "@hydroly/push-notifications";
import { AppSettings } from "@/types/user";

/**
 * Convert AppSettings to ReminderSettings
 */
function toReminderSettings(settings: AppSettings): ReminderSettings {
  return {
    reminderFrequency: settings.reminderFrequency,
    customReminderInterval: settings.customReminderInterval,
    reminderSound: settings.reminderSound,
    reminderVibration: settings.reminderVibration,
    quietHoursStart: settings.quietHoursStart,
    quietHoursEnd: settings.quietHoursEnd,
  };
}

/**
 * Initialize reminder notification channels
 */
export async function initializeReminderChannels(): Promise<void> {
  return initChannels();
}

/**
 * Schedule all reminders based on settings
 */
export async function scheduleReminders(settings: AppSettings): Promise<void> {
  const reminderSettings = toReminderSettings(settings);
  await scheduleRemindersBase(reminderSettings);
}

/**
 * Cancel all reminder notifications
 */
export async function cancelAllReminders(): Promise<void> {
  return cancelAllRemindersBase();
}

/**
 * Update reminders when settings change
 */
export async function updateReminders(settings: AppSettings): Promise<void> {
  const reminderSettings = toReminderSettings(settings);
  await updateRemindersBase(reminderSettings);
}

/**
 * Get reminder status
 */
export async function getReminderStatus(): Promise<{
  scheduled: boolean;
  count: number;
}> {
  return getReminderStatusBase();
}
