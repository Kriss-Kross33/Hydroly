import { Text, View, ScrollView } from "react-native";
import { useWater } from "@/contexts/WaterContext";
import {
  Calendar,
  Droplet,
  CheckCircle2,
  Clock,
  Target,
  Flame,
} from "lucide-react-native";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStreak } from "@/src/hooks/useStreak";
import { useAchievements } from "@/contexts/AchievementsContext";

export default function HistoryScreen() {
  const { records, dailyGoal, getAllDatesWithData } = useWater();
  const { streak: storedStreak } = useAchievements();
  const dates = getAllDatesWithData();

  // Use the streak hook for accurate streak calculations
  const { current, longest, display, isAtRisk } = useStreak(
    records,
    dailyGoal,
    storedStreak
  );

  const stats = useMemo(() => {
    const recordsArray = Object.values(records);
    const totalDays = recordsArray.length;
    const completedDays = recordsArray.filter(
      (r) => r.total >= dailyGoal.goal
    ).length;
    const totalWater = recordsArray.reduce((sum, r) => sum + r.total, 0);
    const avgDaily = totalDays > 0 ? totalWater / totalDays : 0;

    return {
      totalDays,
      completedDays,
      avgDaily: Math.round(avgDaily),
      currentStreak: current, // Use from hook
      longestStreak: longest, // Use from hook
    };
  }, [records, dailyGoal, current, longest]);

  const getProgressColor = (total: number, goal: number) => {
    const percentage = (total / goal) * 100;
    if (percentage >= 100) return "#10B981";
    if (percentage >= 75) return "#3B82F6";
    if (percentage >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getFirstAndLastEntryTime = (
    entries: (typeof records)[string]["entries"]
  ) => {
    if (entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    return {
      first: formatTime(sorted[0].timestamp),
      last: formatTime(sorted[sorted.length - 1].timestamp),
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-background-accent" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg">
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mb-2">
              <Flame
                size={24}
                color={isAtRisk ? "#EF4444" : "#F59E0B"}
                fill={isAtRisk ? "#EF4444" : "#F59E0B"}
              />
            </View>
            <Text className="text-2xl font-extrabold text-text-primary mb-1">
              {current}
            </Text>
            <Text className="text-xs text-text-muted font-medium">
              {display.current}
            </Text>
            {isAtRisk && (
              <Text className="text-xs text-orange-700 font-semibold mt-1">
                💧 Keep your streak going
              </Text>
            )}
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg">
            <View className="w-12 h-12 rounded-full bg-success-100 items-center justify-center mb-2">
              <CheckCircle2 size={24} color="#10B981" />
            </View>
            <Text className="text-2xl font-extrabold text-text-primary mb-1">
              {stats.completedDays}
            </Text>
            <Text className="text-xs text-text-muted font-medium">
              Goals Met
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg">
            <View className="w-12 h-12 rounded-full bg-primary-50 items-center justify-center mb-2">
              <Droplet size={24} color="#0EA5E9" fill="#0EA5E9" />
            </View>
            <Text className="text-2xl font-extrabold text-text-primary mb-1">
              {stats.avgDaily}
            </Text>
            <Text className="text-xs text-text-muted font-medium">
              Avg ml/day
            </Text>
          </View>
        </View>

        {/* Daily History */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Calendar size={24} color="#0C4A6E" />
            <Text className="text-xl font-extrabold text-text-primary tracking-tight">
              Daily History
            </Text>
          </View>

          {dates.length === 0 ? (
            <View className="bg-white rounded-2xl p-12 items-center shadow-md">
              <View className="w-16 h-16 rounded-full bg-background-secondary items-center justify-center mb-4">
                <Calendar size={32} color="#94A3B8" />
              </View>
              <Text className="text-lg font-bold text-text-secondary mb-2">
                No history yet
              </Text>
              <Text className="text-sm text-text-muted text-center px-8">
                Start tracking your water intake to see your history
              </Text>
            </View>
          ) : (
            dates.map((dateKey) => {
              const record = records[dateKey];
              const date = new Date(dateKey);
              const isToday =
                dateKey === new Date().toISOString().split("T")[0];
              const percentage = Math.min(
                (record.total / record.goal) * 100,
                100
              );
              const progressColor = getProgressColor(record.total, record.goal);
              const timeRange = getFirstAndLastEntryTime(record.entries);

              // Format date
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const monthDay = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <View
                  key={dateKey}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-md"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-base font-extrabold text-text-primary">
                          {dayName}
                        </Text>
                        {isToday && (
                          <View className="bg-primary-100 px-2 py-0.5 rounded-full">
                            <Text className="text-xs font-bold text-primary-600">
                              Today
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-text-muted font-medium">
                        {monthDay}
                      </Text>
                    </View>

                    <View className="items-end">
                      <View className="flex-row items-baseline gap-1">
                        <Text
                          className="text-xl font-extrabold"
                          style={{ color: progressColor }}
                        >
                          {record.total}
                        </Text>
                        <Text className="text-sm text-text-muted font-medium">
                          ml
                        </Text>
                      </View>
                      <Text className="text-xs text-text-muted font-medium">
                        of {record.goal}ml
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="mb-3">
                    <View className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: progressColor,
                        }}
                      />
                    </View>
                    <View className="flex-row items-center justify-between mt-1">
                      <View className="flex-row items-center gap-1">
                        {record.goalAchieved ? (
                          <>
                            <CheckCircle2 size={14} color="#10B981" />
                            <Text className="text-xs font-bold text-success-600">
                              Goal Achieved
                            </Text>
                          </>
                        ) : (
                          <>
                            <Target size={14} color={progressColor} />
                            <Text
                              className="text-xs font-medium"
                              style={{ color: progressColor }}
                            >
                              {Math.round(percentage)}% Complete
                            </Text>
                          </>
                        )}
                      </View>
                      {timeRange && (
                        <View className="flex-row items-center gap-1">
                          <Clock size={12} color="#94A3B8" />
                          <Text className="text-xs text-text-muted font-medium">
                            {timeRange.first} - {timeRange.last}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Entries Summary */}
                  <View className="flex-row items-center justify-between pt-2 border-t border-border-light">
                    <View className="flex-row items-center gap-2">
                      <Droplet size={16} color="#0EA5E9" fill="#0EA5E9" />
                      <Text className="text-sm font-bold text-text-primary">
                        {record.entries.length}{" "}
                        {record.entries.length === 1 ? "Entry" : "Entries"}
                      </Text>
                    </View>
                    <Text className="text-xs text-text-muted font-medium">
                      Net: {Math.round(record.netHydration)}ml
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
