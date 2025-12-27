export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female' | 'other';
export type ReminderFrequency = 'hourly' | 'every_2_hours' | 'every_3_hours' | 'custom' | 'never';
export type Unit = 'ml' | 'oz';

export interface UserProfile {
  age: number;
  weight: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  country?: string;
  climate?: 'hot' | 'moderate' | 'cold';
  useSmartGoal: boolean;
  hasCompletedGoalsOnboarding?: boolean;
}

export interface AppSettings {
  unit: Unit;
  darkMode: boolean;
  startOfDayTime: string;
  reminderSound: boolean;
  reminderVibration: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  reminderFrequency: ReminderFrequency;
  customReminderInterval?: number;
  adaptiveReminders: boolean;
  weekendBehavior: 'same' | 'different';
  climateSensitivity: boolean;
  recoveryMode: boolean;
}

export interface PrivacySettings {
  offlineOnly: boolean;
  cloudSync: boolean;
  dataCollection: boolean;
}

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionType?: 'monthly' | 'yearly' | 'lifetime';
  expiryDate?: number;
}
