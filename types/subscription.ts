export type SubscriptionTier = 'free' | 'pro' | 'pro_plus';

export type SubscriptionPeriod = 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  period: SubscriptionPeriod;
  price: number;
  currency: string;
  displayPrice: string;
  savings?: string;
  isPopular?: boolean;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: number;
  period?: SubscriptionPeriod;
  willRenew: boolean;
}

export interface FeatureAccess {
  smartGoals: boolean;
  advancedReminders: boolean;
  monthlyReports: boolean;
  yearlyReports: boolean;
  beverageIntelligence: boolean;
  recoveryMode: boolean;
  cloudSync: boolean;
  dataExport: boolean;
  customRoutines: boolean;
  noAds: boolean;
  aiCoach: boolean;
  healthCorrelations: boolean;
  predictiveAlerts: boolean;
  wearableIntegration: boolean;
}

export type UpsellTrigger = 
  | 'seven_day_streak'
  | 'monthly_report_view'
  | 'smart_reminder_enable'
  | 'beverage_track'
  | 'three_day_dehydration'
  | 'manual';

export interface UpsellContext {
  trigger: UpsellTrigger;
  featureName: string;
  message: string;
}
