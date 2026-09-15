import { registerRootComponent } from "expo";
import notifee, { EventType } from "@notifee/react-native";
import App from "./App";

// Register Notifee background event handler
// This handles notification interactions when the app is in the background
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  // Handle notification tap
  if (type === EventType.PRESS) {
    console.log("[Notifee] Notification pressed:", notification?.id);
    // You can add navigation logic here if needed
    // For example: navigate to a specific screen based on notification data
  }

  // Handle action button presses
  if (type === EventType.ACTION_PRESS && pressAction?.id) {
    console.log("[Notifee] Action pressed:", pressAction.id);
    // Handle specific actions here
  }

  // Dismiss the notification
  if (notification?.id) {
    await notifee.cancelNotification(notification.id);
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
