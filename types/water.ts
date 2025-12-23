import { BeverageType } from './beverage';

export interface WaterIntake {
  id: string;
  amount: number;
  timestamp: number;
  date: string;
  beverageType?: BeverageType;
  netHydration?: number;
}

export interface DailyGoal {
  goal: number;
  unit: 'ml' | 'oz';
}

export interface DayRecord {
  date: string;
  total: number;
  goal: number;
  entries: WaterIntake[];
  netHydration: number;
  goalAchieved: boolean;
}

export interface HydrationTip {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HydrationDeficit {
  cumulativeDeficit: number;
  daysInDeficit: number;
  recoveryTarget?: number;
  isInRecoveryMode: boolean;
}

export interface MonthlyReport {
  month: string;
  totalHydration: number;
  averageDaily: number;
  goalsMet: number;
  totalDays: number;
  longestStreak: number;
  bestDay: number;
  worstDay: number;
  consistencyScore: number;
}

export interface YearlyReport {
  year: number;
  totalHydration: number;
  averageDaily: number;
  goalsMet: number;
  totalDays: number;
  longestStreak: number;
  bestMonth: string;
  monthlyBreakdown: MonthlyReport[];
  consistencyScore: number;
}
