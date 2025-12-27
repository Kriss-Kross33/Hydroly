# Notifee Setup Summary

## Overview

We're using **Notifee** that's already in the `@hydroly/push-notifications` package. The reminder service has been moved to that package to make it reusable.

## Architecture

### Package Structure

```
packages/push_notifications/
  ├── package.json (includes @notifee/react-native)
  ├── src/
  │   ├── push_notifications.ts (uses notifee for remote notifications)
  │   ├── reminderService.ts (NEW - uses notifee for local reminders)
  │   └── index.ts (exports everything)
```

### App Structure

```
src/services/
  └── reminderService.ts (wrapper that adapts AppSettings to ReminderSettings)
```

## Changes Made

### 1. Added Notifee to Push Notifications Package
- ✅ Added `@notifee/react-native` to `packages/push_notifications/package.json`
- ✅ Removed `@notifee/react-native` from root `package.json` (now only in package)

### 2. Created Reusable Reminder Service
- ✅ Created `packages/push_notifications/src/reminderService.ts`
- ✅ Uses shared Notifee instance (same as push notifications)
- ✅ Exports `ReminderSettings` interface (to avoid circular dependencies)
- ✅ Exports all reminder functions

### 3. Created App Wrapper
- ✅ Created `src/services/reminderService.ts` as a thin wrapper
- ✅ Converts `AppSettings` → `ReminderSettings`
- ✅ Re-exports all functions for app use

## Usage

### In App Code

```typescript
import {
  initializeReminderChannels,
  scheduleReminders,
  cancelAllReminders,
  updateReminders,
  getReminderStatus,
} from '@/src/services/reminderService';
import { useSettings } from '@/contexts/SettingsContext';

const { settings } = useSettings();

// Initialize (called in App.tsx)
await initializeReminderChannels();

// Schedule reminders
await scheduleReminders(settings);

// Update when settings change
await updateReminders(settings);
```

### Direct Package Usage (Advanced)

```typescript
import {
  scheduleReminders,
  ReminderSettings,
} from '@hydroly/push-notifications';

const reminderSettings: ReminderSettings = {
  reminderFrequency: 'every_2_hours',
  reminderSound: true,
  reminderVibration: true,
  // ...
};

await scheduleReminders(reminderSettings);
```

## Sound Files

### Android
- **Location**: `android/app/src/main/res/raw/notification_alert.wav`
- **Usage**: Referenced as `'notification_alert'` in channel and notification config

### iOS
- **Location**: `assets/sounds/notification_sound.caf`
- **Usage**: Referenced as `'notification_sound.caf'` in notification config
- **Note**: Already configured in `app.json` under `expo-notifications` plugin

## Benefits

1. **Reusability**: Reminder service can be used by other apps/projects
2. **Shared Notifee**: Uses the same Notifee instance as push notifications
3. **No Duplication**: Notifee only installed once (in package)
4. **Type Safety**: `ReminderSettings` interface avoids circular dependencies
5. **Clean Separation**: Package handles notifications, app handles settings

## Next Steps

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Restart TypeScript server** (if exports not recognized):
   - VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

3. **Verify**:
   - Check that `@hydroly/push-notifications` exports reminder functions
   - Test reminder scheduling in app

## Troubleshooting

### "Module has no exported member" Error

This is likely a TypeScript cache issue. Try:
1. Restart TypeScript server
2. Run `pnpm install` to ensure package is linked
3. Check that `packages/push_notifications/src/index.ts` exports `reminderService`

### Notifee Not Found

Ensure `@notifee/react-native` is in `packages/push_notifications/package.json` and run:
```bash
pnpm install
```


