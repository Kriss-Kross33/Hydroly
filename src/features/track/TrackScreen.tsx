import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWater } from "@/contexts/WaterContext";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useHydrationGoal } from "@/src/hooks/useHydrationGoal";
import { useStreak } from "@/src/hooks/useStreak";
import {
  useRecoveryMode,
  getRecoveryPlan,
} from "@/src/hooks/useRecoveryMode";
import { Button, LiquidMeter, Metric, Sheet } from "@/src/components/ui";
import { BeverageType } from "@/types/beverage";
import { RootStackParamList } from "@/types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QUICK_AMOUNTS = [250, 350, 500];

function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

function formatMonthDay(date: Date): string {
  return date.toLocaleDateString(undefined, {
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

function hoursLeftInDay(date = new Date()): number {
  return Math.max(1, 22 - date.getHours());
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { getTodayRecord, addWater, removeWater, dailyGoal, records } =
    useWater();
  const { updateStreak, unlockBadge, streak: storedStreak } = useAchievements();
  const { features, isPremium } = useSubscription();
  const { profile, settings } = useSettings();
  const recovery = useRecoveryMode();

  const todayRecord = getTodayRecord();
  const { currentGoal, smartGoalCalculation } = useHydrationGoal(
    dailyGoal,
    profile,
    settings
  );
  const { current: currentStreak } = useStreak(
    records,
    dailyGoal,
    storedStreak
  );

  const progress =
    dailyGoal.goal > 0
      ? Math.min(1, todayRecord.netHydration / dailyGoal.goal)
      : 0;
  const remaining = Math.max(0, dailyGoal.goal - todayRecord.netHydration);

  const [confirmAmount, setConfirmAmount] = useState<number | null>(null);
  const [showTargetSheet, setShowTargetSheet] = useState(false);
  const [showBeverageSheet, setShowBeverageSheet] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(250);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedRef = useRef("");

  const recoveryPlan = useMemo(() => {
    if (!recovery?.isActive || remaining <= 0) return null;
    return getRecoveryPlan(remaining, hoursLeftInDay());
  }, [recovery, remaining]);

  useEffect(() => {
    const stateKey = `${todayRecord.date}-${todayRecord.goalAchieved}-${todayRecord.netHydration}-${todayRecord.entries.length}`;
    if (lastProcessedRef.current === stateKey) return;
    lastProcessedRef.current = stateKey;

    updateStreak(todayRecord.goalAchieved, todayRecord.date);
    if (todayRecord.goalAchieved && todayRecord.entries.length === 1) {
      unlockBadge("first_day");
    }
    if (todayRecord.netHydration > 3000) {
      unlockBadge("hydration_hero");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    todayRecord.goalAchieved,
    todayRecord.netHydration,
    todayRecord.entries.length,
    todayRecord.date,
  ]);

  const showLoggedConfirmation = useCallback((amount: number) => {
    setConfirmAmount(amount);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmAmount(null), 1600);
  }, []);

  const handleAddWater = useCallback(
    async (amount: number, beverageType: BeverageType = "water") => {
      addWater(amount, beverageType);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable on some platforms/simulators
      }
      showLoggedConfirmation(amount);
      setShowBeverageSheet(false);
    },
    [addWater, showLoggedConfirmation]
  );

  function handleQuickAdd(amount: number) {
    if (features.beverageIntelligence && isPremium) {
      setPendingAmount(amount);
      setShowBeverageSheet(true);
      return;
    }
    void handleAddWater(amount);
  }

  const now = new Date();
  const sortedEntries = [...todayRecord.entries].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <View
      className="flex-1 bg-background-primary"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-8 pt-6">
          <Text className="font-sans text-sm text-muted">
            {formatWeekday(now)}
          </Text>
          <Text className="mt-0.5 font-sans-medium text-base text-ink">
            {formatMonthDay(now)}
          </Text>

          <Text className="mt-8 font-sans-medium text-xs uppercase tracking-widest text-muted">
            {getGreeting(now)}
          </Text>

          <View className="mt-3 flex-row items-end">
            <Metric
              value={Math.round(todayRecord.netHydration).toLocaleString()}
              size="large"
            />
            <Text className="mb-2 ml-2 font-sans text-base text-muted">ml</Text>
          </View>
          <Text className="mt-1 font-sans text-base text-muted">
            of {dailyGoal.goal.toLocaleString()} ml
          </Text>

          {currentStreak > 0 ? (
            <Text className="mt-3 font-sans text-sm text-muted">
              {currentStreak}-day streak
            </Text>
          ) : null}
        </View>

        <View className="mt-10 items-center">
          <LiquidMeter progress={progress} width={152} height={260} />
        </View>

        <View className="mt-8 px-8">
          <View className="flex-row items-baseline justify-between">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Remaining
            </Text>
            <Text
              className="font-sans-medium text-xl text-ink"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {Math.round(remaining).toLocaleString()} ml
            </Text>
          </View>

          {confirmAmount !== null ? (
            <Text className="mt-4 font-sans text-sm text-water-deep">
              Logged +{confirmAmount} ml
            </Text>
          ) : null}

          {recovery?.isActive && recoveryPlan ? (
            <View className="mt-6 border border-border-light bg-surface px-5 py-5 rounded-md">
              <Text className="font-sans-medium text-base text-ink">
                You&apos;re behind today.
              </Text>
              <Text className="mt-2 font-sans text-sm leading-5 text-muted">
                That&apos;s okay. {recoveryPlan.message}
              </Text>
              <Text className="mt-3 font-sans-medium text-sm text-ink">
                About {recoveryPlan.sips} calm sips of ~
                {recoveryPlan.amountPerSip} ml
              </Text>
            </View>
          ) : null}

          <Text className="mb-3 mt-10 font-sans-medium text-xs uppercase tracking-widest text-muted">
            Quick log
          </Text>
          <View className="flex-row gap-3">
            {QUICK_AMOUNTS.map((amount) => (
              <Pressable
                key={amount}
                accessibilityRole="button"
                accessibilityLabel={`Add ${amount} milliliters`}
                onPress={() => handleQuickAdd(amount)}
                className="flex-1 items-center rounded-md bg-mist py-4 active:opacity-70"
              >
                <Text
                  className="font-sans-medium text-base text-ink"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  +{amount}
                </Text>
                <Text className="mt-1 font-sans text-xs text-muted">ml</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowTargetSheet(true)}
            className="mt-8 active:opacity-70"
          >
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Your target
            </Text>
            <Text className="mt-2 font-sans-medium text-lg text-ink">
              {(dailyGoal.goal / 1000).toFixed(1)} L / day
              {currentGoal?.style === "smart"
                ? " · Personal"
                : currentGoal?.style === "custom"
                  ? " · Custom"
                  : " · Simple"}
            </Text>
            <Text className="mt-1 font-sans text-sm text-muted">
              Why this target
            </Text>
          </Pressable>

          {sortedEntries.length > 0 ? (
            <View className="mt-12">
              <Text className="mb-4 font-sans-medium text-xs uppercase tracking-widest text-muted">
                Today
              </Text>
              {sortedEntries.map((entry) => (
                <View
                  key={entry.id}
                  className="flex-row items-center justify-between border-b border-border-light py-3.5"
                >
                  <Text className="font-sans text-base text-muted">
                    {formatTime(entry.timestamp)}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <Text
                      className="font-sans-medium text-base text-ink"
                      style={{ fontVariant: ["tabular-nums"] }}
                    >
                      {Math.round(entry.amount)} ml
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove entry"
                      onPress={() => removeWater(entry.id)}
                      className="active:opacity-60"
                    >
                      <Text className="font-sans text-sm text-muted">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="mt-12 font-sans text-sm text-muted">
              No drinks logged yet today.
            </Text>
          )}
        </View>
      </ScrollView>

      <Sheet
        visible={showTargetSheet}
        onClose={() => setShowTargetSheet(false)}
        title="Your target"
      >
        <Text
          className="font-sans-medium text-4xl text-ink"
          style={{ fontVariant: ["tabular-nums"], letterSpacing: -1 }}
        >
          {(dailyGoal.goal / 1000).toFixed(1)} L
        </Text>
        <Text className="mt-1 font-sans text-base text-muted">per day</Text>

        <View className="mt-8">
          {profile.useSmartGoal || currentGoal?.style === "smart" ? (
            <>
              <TargetRow label="Weight" value={`${profile.weight} kg`} />
              <TargetRow
                label="Activity"
                value={profile.activityLevel.replace("_", " ")}
              />
              <TargetRow
                label="Environment"
                value={profile.climate ?? "moderate"}
              />
              {smartGoalCalculation ? (
                <Text className="mt-4 font-sans text-sm leading-5 text-muted">
                  Built from your profile with activity and climate
                  adjustments, then kept within a safe daily range.
                </Text>
              ) : null}
            </>
          ) : (
            <Text className="font-sans text-sm leading-5 text-muted">
              This is your current daily hydration target. You can change the
              approach anytime in Settings.
            </Text>
          )}
        </View>

        <View className="mt-8">
          <Button
            title="Close"
            variant="secondary"
            onPress={() => setShowTargetSheet(false)}
          />
        </View>
      </Sheet>

      <Sheet
        visible={showBeverageSheet}
        onClose={() => setShowBeverageSheet(false)}
        title="Log drink"
      >
        <Text className="mb-6 font-sans text-base text-muted">
          +{pendingAmount} ml
        </Text>
        {(
          [
            ["water", "Water"],
            ["coffee", "Coffee"],
            ["tea", "Tea"],
            ["juice", "Juice"],
          ] as const
        ).map(([type, label]) => (
          <Pressable
            key={type}
            accessibilityRole="button"
            onPress={() => void handleAddWater(pendingAmount, type)}
            className="border-b border-border-light py-4 active:opacity-70"
          >
            <Text className="font-sans-medium text-base text-ink">{label}</Text>
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

function TargetRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border-light py-3.5">
      <Text className="font-sans text-base text-muted">{label}</Text>
      <Text className="font-sans-medium text-base capitalize text-ink">
        {value}
      </Text>
    </View>
  );
}
