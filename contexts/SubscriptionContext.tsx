import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { 
  SubscriptionTier, 
  SubscriptionStatus, 
  SubscriptionPlan, 
  FeatureAccess,
  UpsellTrigger 
} from '@/types/subscription';

const SUBSCRIPTION_KEY = '@water_tracker_subscription';
const TRIAL_KEY = '@water_tracker_trial';
const UPSELL_TRIGGERS_KEY = '@water_tracker_upsell_triggers';

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  tier: 'free',
  isActive: false,
  willRenew: false,
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'pro_monthly',
    tier: 'pro',
    period: 'monthly',
    price: 2.99,
    currency: 'USD',
    displayPrice: '$2.99',
  },
  {
    id: 'pro_yearly',
    tier: 'pro',
    period: 'yearly',
    price: 19.99,
    currency: 'USD',
    displayPrice: '$19.99',
    savings: 'Save 44%',
    isPopular: true,
  },
  {
    id: 'pro_lifetime',
    tier: 'pro',
    period: 'lifetime',
    price: 34.99,
    currency: 'USD',
    displayPrice: '$34.99',
  },
  {
    id: 'pro_plus_monthly',
    tier: 'pro_plus',
    period: 'monthly',
    price: 4.99,
    currency: 'USD',
    displayPrice: '$4.99',
  },
  {
    id: 'pro_plus_yearly',
    tier: 'pro_plus',
    period: 'yearly',
    price: 29.99,
    currency: 'USD',
    displayPrice: '$29.99',
    savings: 'Save 50%',
  },
];

function getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
  const baseAccess: FeatureAccess = {
    smartGoals: false,
    advancedReminders: false,
    monthlyReports: false,
    yearlyReports: false,
    beverageIntelligence: false,
    recoveryMode: false,
    cloudSync: false,
    dataExport: false,
    customRoutines: false,
    noAds: false,
    aiCoach: false,
    healthCorrelations: false,
    predictiveAlerts: false,
    wearableIntegration: false,
  };

  if (tier === 'pro_plus') {
    return {
      ...baseAccess,
      smartGoals: true,
      advancedReminders: true,
      monthlyReports: true,
      yearlyReports: true,
      beverageIntelligence: true,
      recoveryMode: true,
      cloudSync: true,
      dataExport: true,
      customRoutines: true,
      noAds: true,
      aiCoach: true,
      healthCorrelations: true,
      predictiveAlerts: true,
      wearableIntegration: true,
    };
  }

  if (tier === 'pro') {
    return {
      ...baseAccess,
      smartGoals: true,
      advancedReminders: true,
      monthlyReports: true,
      yearlyReports: true,
      beverageIntelligence: true,
      recoveryMode: true,
      cloudSync: true,
      dataExport: true,
      customRoutines: true,
      noAds: true,
    };
  }

  return baseAccess;
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>(DEFAULT_SUBSCRIPTION);
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<number | null>(null);
  const [triggeredUpsells, setTriggeredUpsells] = useState<Set<UpsellTrigger>>(new Set());

  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      return stored ? (JSON.parse(stored) as SubscriptionStatus) : DEFAULT_SUBSCRIPTION;
    },
  });

  const trialQuery = useQuery({
    queryKey: ['trial'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(TRIAL_KEY);
      return stored ? JSON.parse(stored) : { isOnTrial: false, expiresAt: null };
    },
  });

  const upsellTriggersQuery = useQuery({
    queryKey: ['upsellTriggers'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(UPSELL_TRIGGERS_KEY);
      return stored ? new Set<UpsellTrigger>(JSON.parse(stored)) : new Set<UpsellTrigger>();
    },
  });

  const saveSubscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionStatus) => {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveTrialMutation = useMutation({
    mutationFn: async (data: { isOnTrial: boolean; expiresAt: number | null }) => {
      await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveUpsellTriggersMutation = useMutation({
    mutationFn: async (triggers: Set<UpsellTrigger>) => {
      await AsyncStorage.setItem(UPSELL_TRIGGERS_KEY, JSON.stringify(Array.from(triggers)));
      return triggers;
    },
  });

  useEffect(() => {
    if (subscriptionQuery.data) {
      setSubscription(subscriptionQuery.data);
    }
  }, [subscriptionQuery.data]);

  useEffect(() => {
    if (trialQuery.data) {
      setIsOnTrial(trialQuery.data.isOnTrial);
      setTrialExpiresAt(trialQuery.data.expiresAt);
    }
  }, [trialQuery.data]);

  useEffect(() => {
    if (upsellTriggersQuery.data) {
      setTriggeredUpsells(upsellTriggersQuery.data);
    }
  }, [upsellTriggersQuery.data]);

  const startTrial = async () => {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const trialData = { isOnTrial: true, expiresAt };
    setIsOnTrial(true);
    setTrialExpiresAt(expiresAt);
    saveTrialMutation.mutate(trialData);

    const trialSubscription: SubscriptionStatus = {
      tier: 'pro',
      isActive: true,
      expiresAt,
      period: 'monthly',
      willRenew: false,
    };
    setSubscription(trialSubscription);
    saveSubscriptionMutation.mutate(trialSubscription);
  };

  const purchase = async (planId: string) => {
    console.log('Mock purchase initiated for:', planId);
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return;

    const expiresAt = plan.period === 'lifetime' 
      ? undefined 
      : Date.now() + (plan.period === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000;

    const newSubscription: SubscriptionStatus = {
      tier: plan.tier,
      isActive: true,
      expiresAt,
      period: plan.period,
      willRenew: plan.period !== 'lifetime',
    };

    setSubscription(newSubscription);
    saveSubscriptionMutation.mutate(newSubscription);

    if (isOnTrial) {
      setIsOnTrial(false);
      setTrialExpiresAt(null);
      saveTrialMutation.mutate({ isOnTrial: false, expiresAt: null });
    }
  };

  const restore = async () => {
    console.log('Mock restore initiated');
  };

  const cancelSubscription = async () => {
    const updated: SubscriptionStatus = {
      ...subscription,
      willRenew: false,
    };
    setSubscription(updated);
    saveSubscriptionMutation.mutate(updated);
  };

  const markUpsellTriggered = (trigger: UpsellTrigger) => {
    const updated = new Set(triggeredUpsells);
    updated.add(trigger);
    setTriggeredUpsells(updated);
    saveUpsellTriggersMutation.mutate(updated);
  };

  const shouldShowUpsell = (trigger: UpsellTrigger): boolean => {
    if (subscription.isActive && subscription.tier !== 'free') return false;
    return !triggeredUpsells.has(trigger);
  };

  const isPremium = subscription.isActive && (subscription.tier === 'pro' || subscription.tier === 'pro_plus');
  const features = getFeatureAccess(subscription.tier);

  const getDaysRemaining = (): number | null => {
    if (!subscription.expiresAt) return null;
    const days = Math.ceil((subscription.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return days > 0 ? days : 0;
  };

  const getTrialDaysRemaining = (): number | null => {
    if (!isOnTrial || !trialExpiresAt) return null;
    const days = Math.ceil((trialExpiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return days > 0 ? days : 0;
  };

  return {
    subscription,
    isOnTrial,
    trialExpiresAt,
    isPremium,
    features,
    startTrial,
    purchase,
    restore,
    cancelSubscription,
    markUpsellTriggered,
    shouldShowUpsell,
    getDaysRemaining,
    getTrialDaysRemaining,
    isLoading: subscriptionQuery.isLoading || trialQuery.isLoading,
  };
});
