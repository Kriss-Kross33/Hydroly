import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { Badge, BadgeType, Streak, Milestone, PersonalityProfile, BADGE_DEFINITIONS } from '@/types/achievements';

const BADGES_KEY = '@water_tracker_badges';
const STREAK_KEY = '@water_tracker_streak';

interface BadgesStorage {
  badges: Record<BadgeType, Badge>;
}

const DEFAULT_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastUpdated: new Date().toISOString().split('T')[0],
};

function initializeBadges(): Record<BadgeType, Badge> {
  const badges: Record<BadgeType, Badge> = {} as Record<BadgeType, Badge>;
  Object.entries(BADGE_DEFINITIONS).forEach(([key, definition]) => {
    badges[key as BadgeType] = {
      ...definition,
      isEarned: false,
    };
  });
  return badges;
}

export const [AchievementsProvider, useAchievements] = createContextHook(() => {
  const [badges, setBadges] = useState<Record<BadgeType, Badge>>(initializeBadges());
  const [streak, setStreak] = useState<Streak>(DEFAULT_STREAK);

  const badgesQuery = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(BADGES_KEY);
      if (stored) {
        const data = JSON.parse(stored) as BadgesStorage;
        return data.badges;
      }
      return initializeBadges();
    },
  });

  const streakQuery = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      return stored ? (JSON.parse(stored) as Streak) : DEFAULT_STREAK;
    },
  });

  const saveBadgesMutation = useMutation({
    mutationFn: async (data: Record<BadgeType, Badge>) => {
      await AsyncStorage.setItem(BADGES_KEY, JSON.stringify({ badges: data }));
      return data;
    },
  });

  const saveStreakMutation = useMutation({
    mutationFn: async (data: Streak) => {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return data;
    },
  });

  useEffect(() => {
    if (badgesQuery.data) {
      setBadges(badgesQuery.data);
    }
  }, [badgesQuery.data]);

  useEffect(() => {
    if (streakQuery.data) {
      setStreak(streakQuery.data);
    }
  }, [streakQuery.data]);

  const unlockBadge = (badgeId: BadgeType) => {
    if (badges[badgeId].isEarned) return;

    const updated = {
      ...badges,
      [badgeId]: {
        ...badges[badgeId],
        isEarned: true,
        earnedAt: Date.now(),
      },
    };

    setBadges(updated);
    saveBadgesMutation.mutate(updated);
  };

  const updateStreak = (goalAchieved: boolean, date: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (date !== today) return;

    let newStreak = { ...streak };

    if (goalAchieved) {
      if (streak.lastUpdated === yesterday || streak.lastUpdated === today) {
        newStreak.current = streak.lastUpdated === today ? streak.current : streak.current + 1;
      } else {
        newStreak.current = 1;
      }

      newStreak.longest = Math.max(newStreak.longest, newStreak.current);
      newStreak.lastUpdated = today;

      setStreak(newStreak);
      saveStreakMutation.mutate(newStreak);

      if (newStreak.current === 7) unlockBadge('week_streak');
      if (newStreak.current === 30) unlockBadge('month_streak');
    }
  };

  const milestones: Milestone[] = useMemo(() => [
    { days: 7, reached: badges.milestone_7.isEarned, reachedAt: badges.milestone_7.earnedAt },
    { days: 30, reached: badges.milestone_30.isEarned, reachedAt: badges.milestone_30.earnedAt },
    { days: 100, reached: badges.milestone_100.isEarned, reachedAt: badges.milestone_100.earnedAt },
  ], [badges]);

  const earnedBadges = useMemo(() => 
    Object.values(badges).filter(badge => badge.isEarned)
  , [badges]);

  const calculatePersonality = (records: { total: number; goal: number; entries: { timestamp: number }[] }[]): PersonalityProfile => {
    if (records.length < 7) {
      return {
        type: 'balanced',
        confidence: 0,
        traits: ['Just getting started'],
        tips: ['Track for at least a week to get your personality profile'],
      };
    }

    let largeInfrequent = 0;
    let smallFrequent = 0;
    let weekendLow = 0;

    records.forEach((record) => {
      const avgPerEntry = record.entries.length > 0 ? record.total / record.entries.length : 0;
      
      if (avgPerEntry > 500 && record.entries.length < 4) largeInfrequent++;
      if (avgPerEntry < 300 && record.entries.length > 6) smallFrequent++;

      const date = new Date(record.entries[0]?.timestamp || Date.now());
      const dayOfWeek = date.getDay();
      if ((dayOfWeek === 0 || dayOfWeek === 6) && record.total < record.goal * 0.7) {
        weekendLow++;
      }
    });

    if (largeInfrequent > records.length * 0.6) {
      return {
        type: 'camel',
        confidence: (largeInfrequent / records.length) * 100,
        traits: ['Drinks large amounts', 'Infrequent hydration', 'Can go long without water'],
        tips: ['Try smaller, more frequent sips', 'Set hourly reminders', 'Keep water nearby'],
      };
    }

    if (smallFrequent > records.length * 0.6) {
      return {
        type: 'sipper',
        confidence: (smallFrequent / records.length) * 100,
        traits: ['Regular small sips', 'Consistent hydration', 'Good habit formation'],
        tips: ['You\'re doing great!', 'Consider increasing volume per sip', 'Maintain this consistency'],
      };
    }

    if (weekendLow > 2) {
      return {
        type: 'weekend_dehydrator',
        confidence: (weekendLow / records.filter(r => {
          const d = new Date(r.entries[0]?.timestamp || Date.now());
          return d.getDay() === 0 || d.getDay() === 6;
        }).length) * 100,
        traits: ['Strong weekday routine', 'Weekend hydration drops', 'Schedule-dependent'],
        tips: ['Set weekend reminders', 'Place water bottles around the house', 'Create a weekend routine'],
      };
    }

    return {
      type: 'balanced',
      confidence: 80,
      traits: ['Balanced hydration pattern', 'Adapts to different situations', 'Consistent effort'],
      tips: ['Keep up the good work!', 'Share your habits with friends', 'Try new hydration challenges'],
    };
  };

  return {
    badges,
    streak,
    milestones,
    earnedBadges,
    unlockBadge,
    updateStreak,
    calculatePersonality,
    isLoading: badgesQuery.isLoading || streakQuery.isLoading,
  };
});
