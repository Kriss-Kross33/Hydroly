import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  UserProfile,
  AppSettings,
  PrivacySettings,
  PremiumStatus,
  ActivityLevel,
} from "@/types/user";
import {
  initializeReminderChannels,
  scheduleReminders,
} from "@/src/services/reminderService";

const SETTINGS_KEY = "@water_tracker_settings";
const PROFILE_KEY = "@water_tracker_profile";
const PRIVACY_KEY = "@water_tracker_privacy";
const PREMIUM_KEY = "@water_tracker_premium";

const DEFAULT_SETTINGS: AppSettings = {
  unit: "ml",
  darkMode: false,
  startOfDayTime: "06:00",
  reminderSound: true,
  reminderVibration: true,
  reminderFrequency: "every_2_hours",
  adaptiveReminders: false,
  weekendBehavior: "same",
  climateSensitivity: false,
  recoveryMode: false,
};

const DEFAULT_PROFILE: UserProfile = {
  age: 30,
  weight: 70,
  gender: "other",
  activityLevel: "moderate",
  useSmartGoal: false,
  hasCompletedGoalsOnboarding: false,
};

const DEFAULT_PRIVACY: PrivacySettings = {
  offlineOnly: false,
  cloudSync: false,
  dataCollection: true,
};

const DEFAULT_PREMIUM: PremiumStatus = {
  isPremium: false,
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [premium, setPremium] = useState<PremiumStatus>(DEFAULT_PREMIUM);

  const settingsQuery = useQuery({
    queryKey: ["appSettings"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      return stored ? (JSON.parse(stored) as AppSettings) : DEFAULT_SETTINGS;
    },
  });

  const profileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      return stored ? (JSON.parse(stored) as UserProfile) : DEFAULT_PROFILE;
    },
  });

  const privacyQuery = useQuery({
    queryKey: ["privacySettings"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PRIVACY_KEY);
      return stored ? (JSON.parse(stored) as PrivacySettings) : DEFAULT_PRIVACY;
    },
  });

  const premiumQuery = useQuery({
    queryKey: ["premiumStatus"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PREMIUM_KEY);
      return stored ? (JSON.parse(stored) as PremiumStatus) : DEFAULT_PREMIUM;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: AppSettings) => {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
      return data;
    },
  });

  const savePrivacyMutation = useMutation({
    mutationFn: async (data: PrivacySettings) => {
      await AsyncStorage.setItem(PRIVACY_KEY, JSON.stringify(data));
      return data;
    },
  });

  const savePremiumMutation = useMutation({
    mutationFn: async (data: PremiumStatus) => {
      await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(data));
      return data;
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (privacyQuery.data) {
      setPrivacy(privacyQuery.data);
    }
  }, [privacyQuery.data]);

  useEffect(() => {
    if (premiumQuery.data) {
      setPremium(premiumQuery.data);
    }
  }, [premiumQuery.data]);

  // Initialize reminder channels and schedule reminders when settings load
  useEffect(() => {
    async function initializeReminders() {
      if (!settingsQuery.isLoading && settings) {
        try {
          // Initialize channels first
          await initializeReminderChannels();

          // Schedule reminders based on current settings
          await scheduleReminders(settings);
        } catch (error) {
          console.error(
            "[SettingsContext] Error initializing reminders:",
            error
          );
        }
      }
    }

    initializeReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsQuery.isLoading, settings?.reminderFrequency]);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveSettingsMutation.mutate(updated);

    // Update reminders if reminder-related settings changed
    const reminderKeys: (keyof AppSettings)[] = [
      "reminderFrequency",
      "customReminderInterval",
      "reminderSound",
      "reminderVibration",
      "quietHoursStart",
      "quietHoursEnd",
    ];

    const hasReminderChanges = Object.keys(updates).some((key) =>
      reminderKeys.includes(key as keyof AppSettings)
    );

    if (hasReminderChanges) {
      // Schedule reminders with updated settings
      const finalSettings = { ...settings, ...updates };
      scheduleReminders(finalSettings).catch((error) => {
        console.error("[SettingsContext] Error updating reminders:", error);
      });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    saveProfileMutation.mutate(updated);
  };

  const updatePrivacy = (updates: Partial<PrivacySettings>) => {
    const updated = { ...privacy, ...updates };
    setPrivacy(updated);
    savePrivacyMutation.mutate(updated);
  };

  const updatePremium = (updates: Partial<PremiumStatus>) => {
    const updated = { ...premium, ...updates };
    setPremium(updated);
    savePremiumMutation.mutate(updated);
  };

  return {
    settings,
    profile,
    privacy,
    premium,
    updateSettings,
    updateProfile,
    updatePrivacy,
    updatePremium,
    isLoading:
      settingsQuery.isLoading ||
      profileQuery.isLoading ||
      privacyQuery.isLoading ||
      premiumQuery.isLoading,
  };
});
