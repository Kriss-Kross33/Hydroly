export type BadgeType = 
  | 'first_day'
  | 'week_streak'
  | 'month_streak'
  | 'perfect_week'
  | 'hydration_hero'
  | 'early_bird'
  | 'night_owl'
  | 'milestone_7'
  | 'milestone_30'
  | 'milestone_100'
  | 'recovery_champion'
  | 'consistency_king';

export type PersonalityType = 'camel' | 'sipper' | 'weekend_dehydrator' | 'office_dry_mouth' | 'balanced';

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: number;
  isEarned: boolean;
}

export interface Streak {
  current: number;
  longest: number;
  lastUpdated: string;
}

export interface Milestone {
  days: number;
  reached: boolean;
  reachedAt?: number;
}

export interface PersonalityProfile {
  type: PersonalityType;
  confidence: number;
  traits: string[];
  tips: string[];
}

export const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'earnedAt' | 'isEarned'>> = {
  first_day: {
    id: 'first_day',
    name: 'First Drop',
    description: 'Completed your first day of hydration tracking',
    icon: '💧',
    color: '#0EA5E9',
  },
  week_streak: {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Maintained a 7-day hydration streak',
    icon: '🔥',
    color: '#F59E0B',
  },
  month_streak: {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Achieved a 30-day hydration streak',
    icon: '🏆',
    color: '#8B5CF6',
  },
  perfect_week: {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Met your goal every day for a week',
    icon: '⭐',
    color: '#10B981',
  },
  hydration_hero: {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Drank over 3L in a single day',
    icon: '💪',
    color: '#3B82F6',
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Started hydrating before 8 AM for 7 days',
    icon: '🌅',
    color: '#EC4899',
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Hydrated consistently in the evening',
    icon: '🦉',
    color: '#6366F1',
  },
  milestone_7: {
    id: 'milestone_7',
    name: '7 Days Strong',
    description: 'Tracked hydration for 7 days',
    icon: '🎯',
    color: '#14B8A6',
  },
  milestone_30: {
    id: 'milestone_30',
    name: '30 Days Champion',
    description: 'Tracked hydration for 30 days',
    icon: '🎖️',
    color: '#F43F5E',
  },
  milestone_100: {
    id: 'milestone_100',
    name: '100 Days Legend',
    description: 'Tracked hydration for 100 days',
    icon: '👑',
    color: '#A855F7',
  },
  recovery_champion: {
    id: 'recovery_champion',
    name: 'Recovery Champion',
    description: 'Successfully recovered from hydration deficit',
    icon: '🎪',
    color: '#06B6D4',
  },
  consistency_king: {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Met your goal 20 out of 30 days',
    icon: '🔱',
    color: '#84CC16',
  },
};
