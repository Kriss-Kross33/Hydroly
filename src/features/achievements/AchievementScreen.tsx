import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useWater } from "@/contexts/WaterContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useStreak } from "@/src/hooks/useStreak";
import { useAchievement } from "@/src/features/achievements/hooks/useAchievement";
import { colors } from "@/src/design-system";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { badges, streak: storedStreak } = useAchievements();
  const { subscription } = useSubscription();
  const { records, dailyGoal } = useWater();
  const { current, longest } = useStreak(records, dailyGoal, storedStreak);
  const { earnedBadges, lockedBadges } = useAchievement(badges, subscription);

  const canGoBack = navigation.canGoBack();

  return (
    <View
      className="flex-1 bg-background-primary"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-6 pt-4">
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-md active:opacity-70"
          >
            <ArrowLeft size={22} color={colors.ink} strokeWidth={1.75} />
          </Pressable>
        ) : (
          <View className="h-10 w-10" />
        )}
        <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
          Achievements
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        className="flex-1 px-8"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="mt-8 font-sans-medium text-3xl text-ink"
          style={{ letterSpacing: -0.5 }}
        >
          Consistency
        </Text>
        <Text className="mt-3 font-sans text-base text-muted">
          Quiet milestones for showing up — not a scoreboard.
        </Text>

        <View className="mt-10 flex-row justify-between">
          <View>
            <Text
              className="font-sans-medium text-3xl text-ink"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {current}
            </Text>
            <Text className="mt-1 font-sans text-xs text-muted">
              Current streak
            </Text>
          </View>
          <View>
            <Text
              className="font-sans-medium text-3xl text-ink"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {longest}
            </Text>
            <Text className="mt-1 font-sans text-xs text-muted">
              Longest streak
            </Text>
          </View>
        </View>

        <Text className="mb-4 mt-12 font-sans-medium text-xs uppercase tracking-widest text-muted">
          Earned
        </Text>
        {earnedBadges.length === 0 ? (
          <Text className="font-sans text-sm text-muted">
            Keep logging — your first milestones will appear here.
          </Text>
        ) : (
          earnedBadges.map((badge) => (
            <View
              key={badge.id}
              className="border-b border-border-light py-4"
            >
              <Text className="font-sans-medium text-base text-ink">
                {badge.name}
              </Text>
              <Text className="mt-1 font-sans text-sm text-muted">
                {badge.description}
              </Text>
            </View>
          ))
        )}

        <Text className="mb-4 mt-12 font-sans-medium text-xs uppercase tracking-widest text-muted">
          Still ahead
        </Text>
        {lockedBadges.map((badge) => (
          <View key={badge.id} className="border-b border-border-light py-4 opacity-60">
            <Text className="font-sans-medium text-base text-ink">
              {badge.name}
            </Text>
            <Text className="mt-1 font-sans text-sm text-muted">
              {badge.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
