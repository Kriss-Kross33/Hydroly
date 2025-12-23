import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { WaterIntake, DayRecord, DailyGoal, MonthlyReport, YearlyReport } from '@/types/water';
import { BeverageType, HYDRATION_COEFFICIENTS } from '@/types/beverage';

const STORAGE_KEY = '@water_tracker_data';
const GOAL_STORAGE_KEY = '@water_tracker_goal';
const ONBOARDING_STORAGE_KEY = '@water_tracker_onboarding';

interface StorageData {
  records: Record<string, DayRecord>;
}

const DEFAULT_GOAL: DailyGoal = {
  goal: 2500,
  unit: 'ml',
};

function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export const [WaterProvider, useWater] = createContextHook(() => {
  const [records, setRecords] = useState<Record<string, DayRecord>>({});
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(DEFAULT_GOAL);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  const dataQuery = useQuery({
    queryKey: ['waterData'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as StorageData) : { records: {} };
    },
  });

  const goalQuery = useQuery({
    queryKey: ['dailyGoal'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as DailyGoal) : DEFAULT_GOAL;
    },
  });

  const onboardingQuery = useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      return stored === 'true';
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: StorageData) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    },
  });

  const saveGoalMutation = useMutation({
    mutationFn: async (goal: DailyGoal) => {
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal));
      return goal;
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setRecords(dataQuery.data.records);
    }
  }, [dataQuery.data]);

  useEffect(() => {
    if (goalQuery.data) {
      setDailyGoal(goalQuery.data);
    }
  }, [goalQuery.data]);

  useEffect(() => {
    if (onboardingQuery.data !== undefined) {
      setHasCompletedOnboarding(onboardingQuery.data);
    }
  }, [onboardingQuery.data]);

  const addWater = (amount: number, beverageType: BeverageType = 'water') => {
    const dateKey = getDateKey();
    const timestamp = Date.now();
    const coefficient = HYDRATION_COEFFICIENTS[beverageType] || 1.0;
    const netHydration = amount * coefficient;

    const newEntry: WaterIntake = {
      id: `${timestamp}`,
      amount,
      timestamp,
      date: dateKey,
      beverageType,
      netHydration,
    };

    const existingRecord = records[dateKey] || {
      date: dateKey,
      total: 0,
      goal: dailyGoal.goal,
      entries: [],
      netHydration: 0,
      goalAchieved: false,
    };

    const newTotal = existingRecord.total + amount;
    const newNetHydration = existingRecord.netHydration + netHydration;

    const updatedRecord: DayRecord = {
      ...existingRecord,
      total: newTotal,
      netHydration: newNetHydration,
      entries: [...existingRecord.entries, newEntry],
      goalAchieved: newNetHydration >= dailyGoal.goal,
    };

    const updatedRecords = {
      ...records,
      [dateKey]: updatedRecord,
    };

    setRecords(updatedRecords);
    saveMutation.mutate({ records: updatedRecords });
  };

  const removeWater = (entryId: string) => {
    const dateKey = getDateKey();
    const existingRecord = records[dateKey];
    
    if (!existingRecord) return;

    const entry = existingRecord.entries.find((e) => e.id === entryId);
    if (!entry) return;

    const newTotal = existingRecord.total - entry.amount;
    const newNetHydration = existingRecord.netHydration - (entry.netHydration || entry.amount);

    const updatedRecord: DayRecord = {
      ...existingRecord,
      total: newTotal,
      netHydration: newNetHydration,
      entries: existingRecord.entries.filter((e) => e.id !== entryId),
      goalAchieved: newNetHydration >= dailyGoal.goal,
    };

    const updatedRecords = {
      ...records,
      [dateKey]: updatedRecord,
    };

    setRecords(updatedRecords);
    saveMutation.mutate({ records: updatedRecords });
  };

  const updateGoal = (newGoal: number) => {
    const updated = { ...dailyGoal, goal: newGoal };
    setDailyGoal(updated);
    saveGoalMutation.mutate(updated);
  };

  const getTodayRecord = (): DayRecord => {
    const dateKey = getDateKey();
    return (
      records[dateKey] || {
        date: dateKey,
        total: 0,
        goal: dailyGoal.goal,
        entries: [],
        netHydration: 0,
        goalAchieved: false,
      }
    );
  };

  const getRecordByDate = (date: Date): DayRecord | null => {
    const dateKey = getDateKey(date);
    return records[dateKey] || null;
  };

  const getAllDatesWithData = (): string[] => {
    return Object.keys(records).sort().reverse();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
  };

  const getMonthlyReport = (year: number, month: number): MonthlyReport => {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const monthRecords = Object.values(records).filter(r => r.date.startsWith(monthKey));

    if (monthRecords.length === 0) {
      return {
        month: monthKey,
        totalHydration: 0,
        averageDaily: 0,
        goalsMet: 0,
        totalDays: 0,
        longestStreak: 0,
        bestDay: 0,
        worstDay: 0,
        consistencyScore: 0,
      };
    }

    const totalHydration = monthRecords.reduce((sum, r) => sum + r.netHydration, 0);
    const goalsMet = monthRecords.filter(r => r.goalAchieved).length;
    const bestDay = Math.max(...monthRecords.map(r => r.netHydration));
    const worstDay = Math.min(...monthRecords.map(r => r.netHydration));

    let longestStreak = 0;
    let currentStreak = 0;
    monthRecords.sort((a, b) => a.date.localeCompare(b.date)).forEach(record => {
      if (record.goalAchieved) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return {
      month: monthKey,
      totalHydration,
      averageDaily: totalHydration / monthRecords.length,
      goalsMet,
      totalDays: monthRecords.length,
      longestStreak,
      bestDay,
      worstDay,
      consistencyScore: (goalsMet / monthRecords.length) * 100,
    };
  };

  const getYearlyReport = (year: number): YearlyReport => {
    const yearRecords = Object.values(records).filter(r => r.date.startsWith(String(year)));

    if (yearRecords.length === 0) {
      return {
        year,
        totalHydration: 0,
        averageDaily: 0,
        goalsMet: 0,
        totalDays: 0,
        longestStreak: 0,
        bestMonth: '',
        monthlyBreakdown: [],
        consistencyScore: 0,
      };
    }

    const monthlyBreakdown: MonthlyReport[] = [];
    for (let month = 1; month <= 12; month++) {
      const report = getMonthlyReport(year, month);
      if (report.totalDays > 0) {
        monthlyBreakdown.push(report);
      }
    }

    const bestMonth = monthlyBreakdown.reduce((best, current) => 
      current.consistencyScore > best.consistencyScore ? current : best
    , monthlyBreakdown[0])?.month || '';

    const totalHydration = yearRecords.reduce((sum, r) => sum + r.netHydration, 0);
    const goalsMet = yearRecords.filter(r => r.goalAchieved).length;

    let longestStreak = 0;
    let currentStreak = 0;
    yearRecords.sort((a, b) => a.date.localeCompare(b.date)).forEach(record => {
      if (record.goalAchieved) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return {
      year,
      totalHydration,
      averageDaily: totalHydration / yearRecords.length,
      goalsMet,
      totalDays: yearRecords.length,
      longestStreak,
      bestMonth,
      monthlyBreakdown,
      consistencyScore: (goalsMet / yearRecords.length) * 100,
    };
  };

  return {
    records,
    dailyGoal,
    addWater,
    removeWater,
    updateGoal,
    getTodayRecord,
    getRecordByDate,
    getAllDatesWithData,
    getMonthlyReport,
    getYearlyReport,
    hasCompletedOnboarding,
    completeOnboarding,
    isLoading: dataQuery.isLoading || goalQuery.isLoading || onboardingQuery.isLoading,
  };
});

export function useWeeklyStats() {
  const { records, dailyGoal } = useWater();

  return useMemo(() => {
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = getDateKey(date);
      const record = records[dateKey];

      weekData.push({
        date: dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: record?.netHydration || 0,
        goal: dailyGoal.goal,
        percentage: record ? (record.netHydration / dailyGoal.goal) * 100 : 0,
      });
    }

    const weekTotal = weekData.reduce((sum, day) => sum + day.total, 0);
    const weekGoal = dailyGoal.goal * 7;
    const averageDaily = weekTotal / 7;
    const daysCompleted = weekData.filter((day) => day.total >= dailyGoal.goal).length;

    return {
      weekData,
      weekTotal,
      weekGoal,
      averageDaily,
      daysCompleted,
      weekPercentage: (weekTotal / weekGoal) * 100,
    };
  }, [records, dailyGoal]);
}
