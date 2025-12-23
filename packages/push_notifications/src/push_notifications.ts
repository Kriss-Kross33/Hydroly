import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import notifee, { AndroidImportance } from '@notifee/react-native';

class PushNotifications {

  async intializeMessaging(){
    console.log('🔔 Initializing push notification handlers...');
    
    // Set up foreground message handler
    messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      // console.log('📱 FOREGROUND NOTIFICATION RECEIVED:');
      // console.log('  Title:', remoteMessage.notification?.title);
      // console.log('  Body:', remoteMessage.notification?.body);
      // console.log('  Data:', remoteMessage.data);
      // console.log('  Message ID:', remoteMessage.messageId);
      // console.log('  From:', remoteMessage.from);
      // console.log('  Sent Time:', remoteMessage.sentTime);
      // console.log('  TTL:', remoteMessage.ttl);
      // console.log('  Collapse Key:', remoteMessage.collapseKey);
      // console.log('  Category:', remoteMessage.category);
      // console.log('  Thread ID:', remoteMessage.threadId);
      // console.log('  Complete message object:', JSON.stringify(remoteMessage, null, 2));
      
      notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
        },
      })
      console.log('✅ Foreground notification displayed via Notifee');
    });

    // Set up background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('🔄 BACKGROUND NOTIFICATION RECEIVED:');
      console.log('  Title:', remoteMessage.notification?.title);
      console.log('  Body:', remoteMessage.notification?.body);
      console.log('  Data:', remoteMessage.data);
      console.log('  Message ID:', remoteMessage.messageId);
      console.log('  From:', remoteMessage.from);
      console.log('  Sent Time:', remoteMessage.sentTime);
      console.log('  TTL:', remoteMessage.ttl);
      console.log('  Collapse Key:', remoteMessage.collapseKey);
      console.log('  Category:', remoteMessage.category);
      console.log('  Thread ID:', remoteMessage.threadId);
      console.log('  Complete message object:', JSON.stringify(remoteMessage, null, 2));
      
      notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
        },
      })
      console.log('✅ Background notification displayed via Notifee');
    });
    
    // Set up notification opened app handler
    messaging().onNotificationOpenedApp(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('👆 NOTIFICATION OPENED (APP WAS IN BACKGROUND):');
      console.log('  Title:', remoteMessage.notification?.title);
      console.log('  Body:', remoteMessage.notification?.body);
      console.log('  Data:', remoteMessage.data);
      console.log('  Message ID:', remoteMessage.messageId);
      console.log('  From:', remoteMessage.from);
      console.log('  Sent Time:', remoteMessage.sentTime);
      console.log('  TTL:', remoteMessage.ttl);
      console.log('  Collapse Key:', remoteMessage.collapseKey);
      console.log('  Category:', remoteMessage.category);
      console.log('  Thread ID:', remoteMessage.threadId);
      console.log('  Complete message object:', JSON.stringify(remoteMessage, null, 2));
      
      notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
        },
      })
      console.log('✅ Notification opened handler completed');
    });
    
    console.log('✅ Push notification handlers initialized successfully');
  }

  async requestPermissions() {
    if (Platform.OS === 'ios') {
      const authStatus = await getMessaging().requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      return enabled;
    } else {
      // For Android, force permission request
      try {
        console.log('=== ANDROID NOTIFICATION PERMISSION REQUEST ===');
        console.log('Android version:', Platform.Version);
        
        // Check current status first
        const currentSettings = await notifee.getNotificationSettings();
        console.log('Current notification settings:', currentSettings);
        
        // Request permission
        console.log('Requesting Android notification permission...');
        const notifeeResult = await notifee.requestPermission();
        console.log('Notifee permission result:', notifeeResult);
        
        // Check the actual authorization status after request
        const settings = await notifee.getNotificationSettings();
        console.log('Notification settings after request:', settings);
        
        // Return true if authorized (status 1 = authorized)
        const isAuthorized = settings.authorizationStatus === 1;
        console.log('Is notification permission authorized:', isAuthorized);
        console.log('=== END ANDROID NOTIFICATION PERMISSION REQUEST ===');
        
        return isAuthorized;
        
      } catch (error) {
        console.error('Error requesting Android notification permissions:', error);
        return false;
      }
    }
  }

  async getFCMToken() {
    try {
      console.log('Getting FCM token...');
      
      // For iOS, ensure we have proper initialization
      if (Platform.OS === 'ios') {
        // Check if we have authorization
        const authStatus = await messaging().hasPermission();
        console.log('iOS authorization status:', authStatus);
        
        if (authStatus !== AuthorizationStatus.AUTHORIZED && 
            authStatus !== AuthorizationStatus.PROVISIONAL) {
          console.log('No push notification permission, requesting...');
          const newAuthStatus = await messaging().requestPermission();
          console.log('New authorization status after request:', newAuthStatus);
          if (newAuthStatus !== AuthorizationStatus.AUTHORIZED && 
              newAuthStatus !== AuthorizationStatus.PROVISIONAL) {
            console.log('Push notification permission denied');
            return null;
          }
        }
        
        // Force device registration for remote messages (fixes APNS token issue)
        try {
          await messaging().registerDeviceForRemoteMessages();
          console.log('Device registered for remote messages');
          
          // Add a longer delay to ensure APNS token is ready
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (registrationError) {
          console.log('Device already registered or registration failed:', registrationError);
        }
      }
      
      const fcmToken = await messaging().getToken();
      console.log('FCM token obtained:', fcmToken ? `${fcmToken.substring(0, 20)}...` : 'null');
      return fcmToken;
      
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      
      // Enhanced retry logic based on GitHub discussion
      if (error instanceof Error && error.message) {
        const errorMessage = error.message.toLowerCase();
        
        // Handle various APNS token related errors
        if (errorMessage.includes('apns token') || 
            errorMessage.includes('no apns token specified') ||
            errorMessage.includes('messaging/unknown')) {
          
          console.log('APNS token error detected, trying to force device registration...');
          try {
            if (Platform.OS === 'ios') {
              // Force registration again
              await messaging().registerDeviceForRemoteMessages();
              console.log('Device re-registered for remote messages');
              
              // Wait longer for APNS token
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Retry getting token after registration
              const retryToken = await messaging().getToken();
              console.log('FCM token obtained after retry:', retryToken ? `${retryToken.substring(0, 20)}...` : 'null');
              return retryToken;
            }
          } catch (retryError) {
            console.log('Retry failed:', retryError);
          }
        }
      }
      return null;
    }
  }

  async onMessage(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void) {
    const messaging = getMessaging();

    return onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      callback(remoteMessage);
    });
  }

  async onNotificationOpenedApp(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void) {
    const messaging = getMessaging();
    return onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      callback(remoteMessage);
    });
  }

  async getInitialNotification() {
    try {
      console.log('🔍 Checking for initial notification...');
      const messaging = getMessaging();
      const remoteMessage = await getInitialNotification(messaging);
      
      if (remoteMessage) {
        console.log('🚀 INITIAL NOTIFICATION FOUND (APP OPENED FROM NOTIFICATION):');
        console.log('  Title:', remoteMessage.notification?.title);
        console.log('  Body:', remoteMessage.notification?.body);
        console.log('  Data:', remoteMessage.data);
        console.log('  Message ID:', remoteMessage.messageId);
        console.log('  From:', remoteMessage.from);
        console.log('  Sent Time:', remoteMessage.sentTime);
        console.log('  TTL:', remoteMessage.ttl);
        console.log('  Collapse Key:', remoteMessage.collapseKey);
        console.log('  Category:', remoteMessage.category);
        console.log('  Thread ID:', remoteMessage.threadId);
        console.log('  Complete message object:', JSON.stringify(remoteMessage, null, 2));
      } else {
        console.log('📭 No initial notification found');
      }
      
      return remoteMessage;
    } catch (error) {
      console.error('❌ Failed to get initial notification:', error);
      return null;
    }
  }

  async testPushNotificationSetup() {
    try {
      console.log('=== PUSH NOTIFICATION SETUP TEST ===');
      
      // Test 1: Check Firebase initialization
      console.log('1. Checking Firebase initialization...');
      if (!firebase.apps.length) {
        console.log('❌ Firebase not initialized');
        return false;
      }
      console.log('✅ Firebase initialized');
      
      // Test 2: Check permissions
      console.log('2. Checking permissions...');
      const permission = await this.requestPermissions();
      console.log('Permission result:', permission);
      
      // Test 3: Get FCM token
      console.log('3. Getting FCM token...');
      const token = await this.getFCMToken();
      if (token) {
        console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
      } else {
        console.log('❌ Failed to get FCM token');
        return false;
      }
      
      // Test 4: Check if messaging is initialized
      console.log('4. Initializing messaging...');
      await this.intializeMessaging();
      console.log('✅ Messaging initialized');
      
      console.log('=== PUSH NOTIFICATION SETUP TEST COMPLETE ===');
      return true;
    } catch (error) {
      console.error('❌ Push notification setup test failed:', error);
      return false;
    }
  }
}

export const pushNotifications = new PushNotifications(); 