import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useWater, useWeeklyStats } from "@/contexts/WaterContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../RootStack";
import {
  BarChart3,
  Droplet,
  Award,
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react-native";
import { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStreak } from "@/src/hooks/useStreak";
import { useAchievements } from "@/contexts/AchievementsContext";

type ReportPeriod = "week" | "month" | "year";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StatsScreen() {
  const weeklyStats = useWeeklyStats();
  const { getMonthlyReport, getYearlyReport, records, dailyGoal } = useWater();
  const { features, markUpsellTriggered, shouldShowUpsell } = useSubscription();
  const { streak: storedStreak } = useAchievements();
  const navigation = useNavigation<NavigationProp>();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("week");

  // Use the streak hook for accurate streak calculations
  const { longest } = useStreak(records, dailyGoal, storedStreak);

  const currentDate = useMemo(() => new Date(), []);
  const monthlyReport = useMemo(
    () =>
      getMonthlyReport(currentDate.getFullYear(), currentDate.getMonth() + 1),
    [currentDate, getMonthlyReport]
  );

  const yearlyReport = useMemo(
    () => getYearlyReport(currentDate.getFullYear()),
    [currentDate, getYearlyReport]
  );

  const maxHeight = 180;

  return (
    <SafeAreaView className="flex-1 bg-background-accent" edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.periodSelector}>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === "week" && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod("week")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "week" && styles.periodButtonTextActive,
              ]}
            >
              Week
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === "month" && styles.periodButtonActive,
              !features.monthlyReports && styles.periodButtonLocked,
            ]}
            onPress={() => {
              if (features.monthlyReports) {
                setSelectedPeriod("month");
              } else {
                if (shouldShowUpsell("monthly_report_view")) {
                  markUpsellTriggered("monthly_report_view");
                }
                navigation.navigate("Paywall");
              }
            }}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "month" && styles.periodButtonTextActive,
                !features.monthlyReports && styles.periodButtonTextLocked,
              ]}
            >
              Month
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === "year" && styles.periodButtonActive,
              !features.yearlyReports && styles.periodButtonLocked,
            ]}
            onPress={() => {
              if (features.yearlyReports) {
                setSelectedPeriod("year");
              } else {
                if (shouldShowUpsell("monthly_report_view")) {
                  markUpsellTriggered("monthly_report_view");
                }
                navigation.navigate("Paywall");
              }
            }}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "year" && styles.periodButtonTextActive,
                !features.yearlyReports && styles.periodButtonTextLocked,
              ]}
            >
              Year
            </Text>
          </Pressable>
        </View>

        {selectedPeriod === "week" && (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <BarChart3 size={28} color="#0EA5E9" />
                </View>
                <View>
                  <Text style={styles.summaryTitle}>Weekly Summary</Text>
                  <Text style={styles.summarySubtitle}>
                    Last 7 days performance
                  </Text>
                </View>
              </View>

              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {Math.round(weeklyStats.weekTotal / 1000)}L
                  </Text>
                  <Text style={styles.summaryStatLabel}>Total Water</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {Math.round(weeklyStats.averageDaily)}ml
                  </Text>
                  <Text style={styles.summaryStatLabel}>Daily Average</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {weeklyStats.daysCompleted}/7
                  </Text>
                  <Text style={styles.summaryStatLabel}>Goals Met</Text>
                </View>
              </View>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Daily Breakdown</Text>

              <View style={styles.chart}>
                {weeklyStats.weekData.map((day) => {
                  const barHeight = (day.total / day.goal) * maxHeight;
                  const clampedHeight = Math.min(barHeight, maxHeight);
                  const isComplete = day.total >= day.goal;

                  return (
                    <View key={day.date} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        {day.total > 0 && (
                          <Text style={styles.barValue}>
                            {Math.round(day.total / 1000)}L
                          </Text>
                        )}
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.bar,
                              { height: clampedHeight },
                              isComplete
                                ? styles.barComplete
                                : styles.barIncomplete,
                            ]}
                          >
                            {barHeight > maxHeight && (
                              <View style={styles.overflowIndicator}>
                                <Droplet size={12} color="#FFF" fill="#FFF" />
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      <Text style={styles.barLabel}>{day.dayName}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#10B981" }]}
                  />
                  <Text style={styles.legendText}>Goal reached</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#0EA5E9" }]}
                  />
                  <Text style={styles.legendText}>In progress</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {selectedPeriod === "month" && features.monthlyReports && (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <Calendar size={28} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.summaryTitle}>Monthly Summary</Text>
                  <Text style={styles.summarySubtitle}>
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {Math.round(monthlyReport.totalHydration / 1000)}L
                  </Text>
                  <Text style={styles.summaryStatLabel}>Total</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {Math.round(monthlyReport.averageDaily)}ml
                  </Text>
                  <Text style={styles.summaryStatLabel}>Daily Avg</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {monthlyReport.goalsMet}/{monthlyReport.totalDays}
                  </Text>
                  <Text style={styles.summaryStatLabel}>Goals Met</Text>
                </View>
              </View>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.chartTitle}>Monthly Insights</Text>

              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <TrendingUp size={20} color="#10B981" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Consistency Score</Text>
                  <Text style={styles.insightValue}>
                    {Math.round(monthlyReport.consistencyScore)}%
                  </Text>
                </View>
              </View>

              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <Award size={20} color="#F59E0B" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Longest Streak</Text>
                  <Text style={styles.insightValue}>{longest} days</Text>
                </View>
              </View>

              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <Droplet size={20} color="#0EA5E9" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Best Day</Text>
                  <Text style={styles.insightValue}>
                    {Math.round(monthlyReport.bestDay)}ml
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {selectedPeriod === "year" && features.yearlyReports && (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <Target size={28} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.summaryTitle}>Yearly Summary</Text>
                  <Text style={styles.summarySubtitle}>
                    {currentDate.getFullYear()}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {Math.round(yearlyReport.totalHydration / 1000)}L
                  </Text>
                  <Text style={styles.summaryStatLabel}>Total</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>
                    {Math.round(yearlyReport.consistencyScore)}%
                  </Text>
                  <Text style={styles.summaryStatLabel}>Consistency</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>{longest}</Text>
                  <Text style={styles.summaryStatLabel}>Best Streak</Text>
                </View>
              </View>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.chartTitle}>Yearly Insights</Text>

              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <Calendar size={20} color="#8B5CF6" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Total Days Tracked</Text>
                  <Text style={styles.insightValue}>
                    {yearlyReport.totalDays} days
                  </Text>
                </View>
              </View>

              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <Target size={20} color="#10B981" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Goals Achieved</Text>
                  <Text style={styles.insightValue}>
                    {yearlyReport.goalsMet} days
                  </Text>
                </View>
              </View>

              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <Droplet size={20} color="#0EA5E9" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Daily Average</Text>
                  <Text style={styles.insightValue}>
                    {Math.round(yearlyReport.averageDaily)}ml
                  </Text>
                </View>
              </View>

              {yearlyReport.bestMonth && (
                <View style={styles.insightRow}>
                  <View style={styles.insightIconContainer}>
                    <Award size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightLabel}>Best Month</Text>
                    <Text style={styles.insightValue}>
                      {new Date(
                        yearlyReport.bestMonth + "-01"
                      ).toLocaleDateString("en-US", { month: "long" })}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.achievementsCard}>
          <View style={styles.achievementHeader}>
            <Award size={24} color="#F59E0B" />
            <Text style={styles.achievementTitle}>Quick Stats</Text>
          </View>

          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#DBEAFE" }]}
              >
                <Target size={20} color="#3B82F6" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementLabel}>Completion Rate</Text>
                <Text style={styles.achievementValue}>
                  {Math.round((weeklyStats.daysCompleted / 7) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#E0F2FE" }]}
              >
                <Droplet size={20} color="#0EA5E9" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementLabel}>Total Hydration</Text>
                <Text style={styles.achievementValue}>
                  {(weeklyStats.weekTotal / 1000).toFixed(1)}L
                </Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Award size={20} color="#F59E0B" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementLabel}>Best Day</Text>
                <Text style={styles.achievementValue}>
                  {Math.max(...weeklyStats.weekData.map((d) => d.total))}ml
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 4,
    borderRadius: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#0EA5E9",
  },
  periodButtonLocked: {
    opacity: 0.5,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#64748B",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  periodButtonTextLocked: {
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#0C4A6E",
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStatItem: {
    alignItems: "center",
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#0EA5E9",
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#E0F2FE",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0C4A6E",
    marginBottom: 20,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 220,
    marginBottom: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  barValue: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#64748B",
    marginBottom: 4,
  },
  barTrack: {
    width: "70%",
    height: 180,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 8,
    position: "relative",
  },
  barComplete: {
    backgroundColor: "#10B981",
  },
  barIncomplete: {
    backgroundColor: "#0EA5E9",
  },
  overflowIndicator: {
    position: "absolute",
    top: 4,
    alignSelf: "center",
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#64748B",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0F2FE",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#64748B",
  },
  insightsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  insightLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  insightValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#0C4A6E",
  },
  achievementsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0C4A6E",
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementInfo: {
    flex: 1,
  },
  achievementLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  achievementValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0C4A6E",
  },
});
