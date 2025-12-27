import { Text, View, ScrollView, Pressable } from "react-native";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useFriends } from "@/contexts/FriendsContext";
import { useWater } from "@/contexts/WaterContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  Trophy,
  Flame,
  Lock,
  Sparkles,
  Users,
  ChevronRight,
  Crown,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStreak } from "@/src/hooks/useStreak";
import { useAchievement } from "@/src/features/achievements/hooks/useAchievement";
import { isFeatureEnabled } from "@/src/config/featureFlags";

export default function AchievementsScreen() {
  const { badges, streak: storedStreak, milestones } = useAchievements();
  const { subscription } = useSubscription();
  const { friends } = useFriends();
  const { records, dailyGoal } = useWater();

  // Use the streak hook for accurate streak data
  const {
    display,
    isAtRisk,
    milestones: streakMilestones,
    weeklyStreak,
  } = useStreak(records, dailyGoal, storedStreak);

  // Use the achievement hook for achievement management
  const {
    earnedBadges: hookEarnedBadges,
    lockedBadges: hookLockedBadges,
    statistics,
    isPremium: isPremiumFromHook,
    requiresPremium,
    isAccessible,
    progress: achievementProgress,
  } = useAchievement(badges, subscription);

  const isPremiumFeature = !isPremiumFromHook;

  return (
    <SafeAreaView className="flex-1 bg-background-accent" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {isPremiumFeature && (
          <View className="flex-row items-center justify-center gap-2 bg-warning-100 py-3 px-4 rounded-xl mb-5">
            <Sparkles size={20} color="#F59E0B" />
            <Text className="text-sm font-semibold text-warning-800">
              Unlock full achievements with Premium
            </Text>
            <Sparkles size={20} color="#F59E0B" />
          </View>
        )}

        {isFeatureEnabled("FRIENDS_ENABLED") && (
          <Pressable
            className="bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between border border-border-light shadow-md"
            style={({ pressed }) => [
              {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              // Navigate to friends screen - may need to add to navigation structure
              console.log("Navigate to friends");
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Users size={28} color="#0EA5E9" />
              <View className="flex-1">
                <Text className="text-lg font-bold text-text-primary mb-0.5">
                  Friends
                </Text>
                <Text className="text-sm text-text-muted">
                  {friends.length} {friends.length === 1 ? "friend" : "friends"}
                </Text>
              </View>
            </View>
            <ChevronRight size={24} color="#94A3B8" />
          </Pressable>
        )}

        <View
          className="bg-white rounded-3xl p-5 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center gap-4 mb-4">
            <Flame
              size={32}
              color={isAtRisk ? "#EF4444" : "#F59E0B"}
              fill={isAtRisk ? "#EF4444" : "#F59E0B"}
            />
            <View className="flex-1">
              <Text className="text-base text-text-muted mb-1">
                Current Streak
              </Text>
              <Text className="text-3xl font-extrabold text-warning-500">
                {display.current}
              </Text>
              {isAtRisk && (
                <Text className="text-xs text-orange-700 font-semibold mt-1">
                  💧 Keep your streak going
                </Text>
              )}
              {streakMilestones.next && (
                <Text className="text-xs text-text-muted mt-1">
                  Next: {streakMilestones.next} days (
                  {streakMilestones.progress}%)
                </Text>
              )}
            </View>
          </View>
          <View className="h-px bg-border-light my-4" />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm text-text-muted mb-1">
                Longest Streak
              </Text>
              <Text className="text-xl font-bold text-text-primary">
                {display.longest}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-text-muted mb-1">
                Weekly Streak
              </Text>
              <Text className="text-xl font-bold text-text-primary">
                {weeklyStreak} days
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-text-primary mb-4">
            Milestones
          </Text>
          <View className="flex-row gap-3">
            {milestones.map((milestone) => (
              <View
                key={milestone.days}
                className={`flex-1 bg-white rounded-2xl p-4 items-center border-2 ${
                  milestone.reached
                    ? "border-success-500 bg-success-50"
                    : "border-slate-200"
                }`}
              >
                <Trophy
                  size={28}
                  color={milestone.reached ? "#10B981" : "#94A3B8"}
                  fill={milestone.reached ? "#10B981" : "transparent"}
                />
                <Text
                  className={`text-sm font-semibold mt-2 ${
                    milestone.reached ? "text-success-600" : "text-text-muted"
                  }`}
                >
                  {milestone.days} Days
                </Text>
                {milestone.reached && (
                  <Text className="text-[10px] text-text-disabled mt-1">
                    {new Date(milestone.reachedAt!).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Achievement Progress */}
        <View className="mb-6 bg-white rounded-2xl p-4 shadow-md">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-text-primary">
              Achievement Progress
            </Text>
            <Text className="text-lg font-extrabold text-primary-500">
              {achievementProgress}%
            </Text>
          </View>
          <View className="h-2 bg-background-secondary rounded-full overflow-hidden">
            <View
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${achievementProgress}%` }}
            />
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs text-text-muted">
              {statistics.earned} of {statistics.availableBadges} badges earned
            </Text>
            {!isPremiumFromHook && (
              <View className="flex-row items-center gap-1">
                <Crown size={12} color="#F59E0B" />
                <Text className="text-xs text-warning-600 font-semibold">
                  +{statistics.premiumBadgesCount} premium
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-text-primary">
              Earned Badges
            </Text>
            <View className="bg-primary-100 px-3 py-1 rounded-xl">
              <Text className="text-lg font-semibold text-primary-500">
                {hookEarnedBadges.length}
              </Text>
            </View>
          </View>
          {hookEarnedBadges.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {hookEarnedBadges.map((badge) => {
                const needsPremium = requiresPremium(badge.id);
                const accessible = isAccessible(badge.id);
                return (
                  <View
                    key={badge.id}
                    className="w-[48%] bg-white rounded-2xl p-4 items-center border-2 shadow-md relative"
                    style={{
                      borderColor: badge.color,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                      opacity: accessible ? 1 : 0.6,
                    }}
                  >
                    {needsPremium && !isPremiumFromHook && (
                      <View className="absolute top-2 right-2">
                        <Crown size={16} color="#F59E0B" fill="#F59E0B" />
                      </View>
                    )}
                    <Text className="text-4xl mb-2">{badge.icon}</Text>
                    <Text className="text-sm font-bold text-text-primary text-center mb-1">
                      {badge.name}
                    </Text>
                    <Text
                      className="text-[11px] text-text-muted text-center mb-2"
                      numberOfLines={2}
                    >
                      {badge.description}
                    </Text>
                    {badge.earnedAt && (
                      <Text className="text-[10px] text-text-disabled">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center py-10">
              <Trophy size={48} color="#CBD5E1" />
              <Text className="text-base font-semibold text-text-muted mt-4">
                No badges earned yet
              </Text>
              <Text className="text-sm text-text-disabled mt-1">
                Keep hydrating to unlock achievements!
              </Text>
            </View>
          )}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-text-primary">
              Locked Badges
            </Text>
            <View className="bg-primary-100 px-3 py-1 rounded-xl">
              <Text className="text-lg font-semibold text-primary-500">
                {hookLockedBadges.length}
              </Text>
            </View>
          </View>
          {!isPremiumFromHook && (
            <View className="mb-4 bg-warning-50 rounded-xl p-3 border border-warning-200">
              <View className="flex-row items-center gap-2">
                <Crown size={16} color="#F59E0B" />
                <Text className="text-xs text-warning-800 font-semibold flex-1">
                  {statistics.premiumBadgesCount} premium badges locked. Upgrade
                  to unlock epic and legendary achievements!
                </Text>
              </View>
            </View>
          )}
          <View className="flex-row flex-wrap gap-3">
            {hookLockedBadges
              .slice(0, isPremiumFromHook ? 10 : 6)
              .map((badge) => {
                const needsPremium = requiresPremium(badge.id);
                const accessible = isAccessible(badge.id);
                return (
                  <View
                    key={badge.id}
                    className="w-[48%] bg-background-secondary rounded-2xl p-4 items-center border-2 border-slate-200 relative"
                    style={{
                      opacity: accessible ? 0.6 : 0.4,
                    }}
                  >
                    {needsPremium && !isPremiumFromHook && (
                      <View className="absolute top-2 right-2">
                        <Crown size={16} color="#F59E0B" fill="#F59E0B" />
                      </View>
                    )}
                    <Lock size={24} color="#94A3B8" />
                    <Text className="text-sm font-semibold text-text-muted text-center mt-2 mb-1">
                      {badge.name}
                    </Text>
                    <Text
                      className="text-[11px] text-text-disabled text-center"
                      numberOfLines={2}
                    >
                      {badge.description}
                    </Text>
                    {needsPremium && !isPremiumFromHook && (
                      <Text className="text-[10px] text-warning-600 font-semibold mt-1">
                        Premium
                      </Text>
                    )}
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
