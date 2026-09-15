import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWater } from "@/contexts/WaterContext";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useStreak } from "@/src/hooks/useStreak";
import { EmptyState, ProgressRail } from "@/src/components/ui";

function formatDayHeader(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { records, dailyGoal, getAllDatesWithData } = useWater();
  const { streak: storedStreak } = useAchievements();
  const dates = getAllDatesWithData();
  const { current, longest } = useStreak(records, dailyGoal, storedStreak);
  const [expandedDate, setExpandedDate] = useState<string | null>(
    dates[0] ?? null
  );

  const stats = useMemo(() => {
    const recordsArray = Object.values(records);
    const completedDays = recordsArray.filter(
      (r) => r.netHydration >= dailyGoal.goal || r.goalAchieved
    ).length;
    const totalWater = recordsArray.reduce(
      (sum, r) => sum + (r.netHydration || r.total),
      0
    );
    const avgDaily =
      recordsArray.length > 0 ? Math.round(totalWater / recordsArray.length) : 0;

    return { completedDays, avgDaily, current, longest };
  }, [records, dailyGoal, current, longest]);

  return (
    <View
      className="flex-1 bg-background-primary"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-8 pt-6">
          <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
            History
          </Text>
          <Text
            className="mt-3 font-sans-medium text-3xl text-ink"
            style={{ letterSpacing: -0.5 }}
          >
            Your days
          </Text>

          <View className="mt-8 flex-row justify-between">
            <Stat label="Streak" value={`${stats.current}`} />
            <Stat label="Goals met" value={`${stats.completedDays}`} />
            <Stat label="Avg / day" value={`${stats.avgDaily}`} />
          </View>
        </View>

        <View className="mt-10 px-8">
          {dates.length === 0 ? (
            <EmptyState
              title="No history yet"
              description="Once you start logging, your days will appear here as a quiet journal."
            />
          ) : (
            dates.map((dateKey) => {
              const record = records[dateKey];
              if (!record) return null;
              const intake = Math.round(record.netHydration || record.total);
              const progress =
                dailyGoal.goal > 0
                  ? Math.min(1, intake / dailyGoal.goal)
                  : 0;
              const expanded = expandedDate === dateKey;
              const entries = [...record.entries].sort(
                (a, b) => a.timestamp - b.timestamp
              );

              return (
                <View key={dateKey} className="mb-8">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setExpandedDate(expanded ? null : dateKey)
                    }
                    className="active:opacity-70"
                  >
                    <View className="flex-row items-baseline justify-between">
                      <Text className="font-sans-medium text-base text-ink">
                        {formatDayHeader(dateKey)}
                      </Text>
                      <Text
                        className="font-sans-medium text-base text-ink"
                        style={{ fontVariant: ["tabular-nums"] }}
                      >
                        {intake.toLocaleString()} ml
                      </Text>
                    </View>
                    <ProgressRail progress={progress} className="mt-3" />
                    <Text className="mt-2 font-sans text-xs text-muted">
                      {record.goalAchieved || intake >= dailyGoal.goal
                        ? "Target met"
                        : `${Math.round(progress * 100)}% of target`}
                      {" · "}
                      {entries.length}{" "}
                      {entries.length === 1 ? "entry" : "entries"}
                    </Text>
                  </Pressable>

                  {expanded ? (
                    <View className="mt-4">
                      {entries.map((entry) => (
                        <View
                          key={entry.id}
                          className="flex-row items-center justify-between py-3"
                        >
                          <Text className="font-sans text-base text-muted">
                            {formatTime(entry.timestamp)}
                          </Text>
                          <Text
                            className="font-sans-medium text-base text-ink"
                            style={{ fontVariant: ["tabular-nums"] }}
                          >
                            {Math.round(entry.amount)} ml
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text
        className="font-sans-medium text-2xl text-ink"
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
      <Text className="mt-1 font-sans text-xs text-muted">{label}</Text>
    </View>
  );
}
