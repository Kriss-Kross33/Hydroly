import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWater, useWeeklyStats } from "@/contexts/WaterContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useStreak } from "@/src/hooks/useStreak";
import {
  confidenceLevelLabel,
  useConfidenceScore,
} from "@/src/hooks/useConfidenceScore";
import { ChartBars, SegmentedControl, Button } from "@/src/components/ui";
import { RootStackParamList } from "@/types/navigation";

type ReportPeriod = "week" | "month" | "year";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const weeklyStats = useWeeklyStats();
  const { getMonthlyReport, getYearlyReport, records, dailyGoal } = useWater();
  const { features, markUpsellTriggered, shouldShowUpsell } = useSubscription();
  const { streak: storedStreak } = useAchievements();
  const { longest } = useStreak(records, dailyGoal, storedStreak);
  const confidence = useConfidenceScore();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("week");

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

  const weekBars = useMemo(() => {
    return (weeklyStats.weekData || []).map(
      (day: { date: string; total: number; dayName: string }) => ({
        id: day.date,
        label: day.dayName.slice(0, 2),
        value: day.total,
        max: dailyGoal.goal,
      })
    );
  }, [weeklyStats, dailyGoal.goal]);

  function selectPeriod(period: ReportPeriod) {
    if (period === "month" && !features.monthlyReports) {
      if (shouldShowUpsell("monthly_report_view")) {
        markUpsellTriggered("monthly_report_view");
      }
      navigation.navigate("Paywall");
      return;
    }
    if (period === "year" && !features.yearlyReports) {
      if (shouldShowUpsell("monthly_report_view")) {
        markUpsellTriggered("monthly_report_view");
      }
      navigation.navigate("Paywall");
      return;
    }
    setSelectedPeriod(period);
  }

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
            Insights
          </Text>
          <Text
            className="mt-3 font-sans-medium text-3xl text-ink"
            style={{ letterSpacing: -0.5 }}
          >
            Patterns over time
          </Text>

          <View className="mt-8">
            <SegmentedControl
              options={[
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
                { label: "Year", value: "year" },
              ]}
              value={selectedPeriod}
              onChange={selectPeriod}
            />
          </View>

          {confidence ? (
            <View className="mt-10">
              <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
                Confidence
              </Text>
              <Text className="mt-3 font-sans-medium text-2xl text-ink">
                {confidenceLevelLabel(confidence.level)}
              </Text>
              <Text className="mt-2 font-sans text-sm leading-5 text-muted">
                {confidence.insights[0] ||
                  "Your target is shaped by the information you’ve shared and how consistently you log."}
              </Text>
            </View>
          ) : null}

          {selectedPeriod === "week" ? (
            <View className="mt-10">
              <View className="mb-8 flex-row justify-between">
                <InsightStat
                  label="Total"
                  value={`${Math.round(weeklyStats.weekTotal / 1000)} L`}
                />
                <InsightStat
                  label="Daily avg"
                  value={`${Math.round(weeklyStats.averageDaily || 0)} ml`}
                />
                <InsightStat
                  label="Best streak"
                  value={`${longest}d`}
                />
              </View>
              <ChartBars data={weekBars} unitLabel="Daily intake vs target" />
              <Text className="mt-6 font-sans text-sm text-muted">
                Consistency: {weeklyStats.daysCompleted}/7 days near target
              </Text>
            </View>
          ) : null}

          {selectedPeriod === "month" && features.monthlyReports ? (
            <View className="mt-10">
              <InsightStat
                label="Monthly total"
                value={`${Math.round((monthlyReport?.totalHydration || 0) / 1000)} L`}
              />
              <View className="mt-6">
                <InsightStat
                  label="Days logged"
                  value={`${monthlyReport?.totalDays ?? 0}`}
                />
              </View>
              <View className="mt-6">
                <InsightStat
                  label="Goals met"
                  value={`${monthlyReport?.goalsMet ?? 0}`}
                />
              </View>
            </View>
          ) : null}

          {selectedPeriod === "year" && features.yearlyReports ? (
            <View className="mt-10">
              <InsightStat
                label="Yearly total"
                value={`${Math.round((yearlyReport?.totalHydration || 0) / 1000)} L`}
              />
              <View className="mt-6">
                <InsightStat
                  label="Active months"
                  value={`${yearlyReport?.monthlyBreakdown?.length ?? 0}`}
                />
              </View>
            </View>
          ) : null}

          {(selectedPeriod === "month" && !features.monthlyReports) ||
          (selectedPeriod === "year" && !features.yearlyReports) ? (
            <View className="mt-12">
              <Text className="font-sans-medium text-xl text-ink">
                Deeper history with Pro
              </Text>
              <Text className="mt-3 font-sans text-sm leading-5 text-muted">
                Month and year insights unlock with Hydroly Pro.
              </Text>
              <View className="mt-6">
                <Button
                  title="View Hydroly Pro"
                  onPress={() => navigation.navigate("Paywall")}
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function InsightStat({ label, value }: { label: string; value: string }) {
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
