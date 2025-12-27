# Notification Setup Guide

## Overview

Hydroly uses **Notifee** for local reminder notifications with custom sounds.

## Sound Files

### Android
- **Location**: `android/app/src/main/res/raw/notification_alert.wav`
- **Usage**: Referenced as `notification_alert` in notification channel and notification config
- **Format**: WAV file

### iOS
- **Location**: `assets/sounds/notification_sound.caf`
- **Usage**: Referenced as `notification_sound.caf` in notification config
- **Format**: CAF file (Core Audio Format)

## Setup

### 1. Install Notifee

```bash
pnpm add @notifee/react-native
```

### 2. Android Configuration

#### Add Sound File
1. Place `notification_alert.wav` in `android/app/src/main/res/raw/`
2. The file will be automatically available as a resource

#### Create Notification Icon (Optional but Recommended)
1. Create `ic_notification.png` (white icon on transparent background)
2. Place in `android/app/src/main/res/drawable/`
3. Or use existing launcher icon

#### Permissions
Already configured in `AndroidManifest.xml`:
- `android.permission.RECEIVE_BOOT_COMPLETED`
- `android.permission.SCHEDULE_EXACT_ALARM`

### 3. iOS Configuration

#### Add Sound File
1. Place `notification_sound.caf` in `assets/sounds/`
2. Ensure it's included in Xcode project bundle
3. The file is already configured in `app.json` under `expo-notifications` plugin

### 4. Initialize Reminders

Reminders are automatically initialized when:
- App starts (via `App.tsx`)
- Settings change (via `SettingsContext`)

## Usage

### Schedule Reminders

Reminders are automatically scheduled based on user settings:

```typescript
import { scheduleReminders } from '@/src/services/reminderService';
import { useSettings } from '@/contexts/SettingsContext';

const { settings } = useSettings();

// Reminders are automatically scheduled when settings change
// Or manually:
await scheduleReminders(settings);
```

### Cancel Reminders

```typescript
import { cancelAllReminders } from '@/src/services/reminderService';

await cancelAllReminders();
```

### Check Reminder Status

```typescript
import { getReminderStatus } from '@/src/services/reminderService';

const status = await getReminderStatus();
console.log('Scheduled:', status.scheduled);
console.log('Count:', status.count);
```

## Reminder Settings

Reminders respect the following settings:
- `reminderFrequency`: 'hourly' | 'every_2_hours' | 'every_3_hours' | 'custom' | 'never'
- `customReminderInterval`: Custom interval in minutes (if frequency is 'custom')
- `reminderSound`: Enable/disable sound
- `reminderVibration`: Enable/disable vibration (Android)
- `quietHoursStart`: Start of quiet hours (HH:MM format)
- `quietHoursEnd`: End of quiet hours (HH:MM format)

## Notification Channel (Android)

- **Channel ID**: `hydration_reminders`
- **Channel Name**: "Hydration Reminders"
- **Importance**: HIGH
- **Sound**: `notification_alert`
- **Vibration**: Enabled

## Testing

### Test Reminder Scheduling

1. Open Settings
2. Enable reminders
3. Set reminder frequency
4. Check console logs for:
   - `[ReminderService] Android notification channel created`
   - `[ReminderService] Scheduled reminder: X minutes`

### Test Notification

1. Set reminder frequency to "hourly" (for quick testing)
2. Wait for notification
3. Verify:
   - Sound plays (if enabled)
   - Vibration works (Android, if enabled)
   - Notification appears

### Test Quiet Hours

1. Set quiet hours (e.g., 22:00 - 06:00)
2. Schedule reminder during quiet hours
3. Verify reminder is skipped

## Troubleshooting

### No Sound on Android

1. Check sound file exists: `android/app/src/main/res/raw/notification_alert.wav`
2. Verify channel sound is set: `sound: 'notification_alert'`
3. Check device volume is not muted
4. Verify notification channel is not blocked

### No Sound on iOS

1. Check sound file exists: `assets/sounds/notification_sound.caf`
2. Verify file is included in Xcode bundle
3. Check device is not in silent mode
4. Verify notification permissions are granted

### Reminders Not Scheduling

1. Check notification permissions are granted
2. Verify reminder frequency is not 'never'
3. Check console logs for errors
4. Verify `initializeReminderChannels()` was called

### Reminders Not Repeating

1. Check `repeatFrequency` is set correctly in trigger
2. Verify interval is valid (>= 15 minutes)
3. Check device battery optimization settings (Android)

## Notes

- Reminders are cancelled and rescheduled when settings change
- Quiet hours are respected (reminders skipped during quiet hours)
- Custom intervals must be at least 15 minutes
- Notifee handles notification display and scheduling automatically

