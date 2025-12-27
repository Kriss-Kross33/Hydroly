import {
  Text,
  View,
  Pressable,
  ScrollView,
  Animated,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWater } from "@/contexts/WaterContext";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../RootStack";
import { useHydrationGoal } from "@/src/hooks/useHydrationGoal";
import { useStreak } from "@/src/hooks/useStreak";
import { useAchievement } from "@/src/features/achievements/hooks/useAchievement";
import {
  Droplet,
  Minus,
  Plus,
  X,
  Lightbulb,
  Coffee,
  Wine,
  Droplets,
  Coffee as Tea,
  Zap,
  Brain,
  Heart,
  Sparkles,
  Thermometer,
  Shield,
  Activity,
  Target,
  Crown,
  ArrowRight,
  Flame,
  Trophy,
} from "lucide-react-native";
import { useEffect, useRef, useState, useMemo } from "react";
import { BeverageType, BEVERAGE_INFO } from "@/types/beverage";
import { HYDRATION_TIPS } from "@/constants/tips";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { getTodayRecord, addWater, removeWater, dailyGoal, records } =
    useWater();
  const {
    updateStreak,
    unlockBadge,
    streak: storedStreak,
    badges,
  } = useAchievements();
  const {
    features,
    markUpsellTriggered,
    shouldShowUpsell,
    subscription,
    isPremium,
  } = useSubscription();
  const { profile, settings } = useSettings();
  const navigation = useNavigation<NavigationProp>();
  const todayRecord = getTodayRecord();

  // Get goal style information
  const { currentGoal, smartGoalCalculation } = useHydrationGoal(
    dailyGoal,
    profile,
    settings
  );

  // Get streak information
  const {
    current: currentStreak,
    display: streakDisplay,
    isAtRisk,
    milestones: streakMilestones,
  } = useStreak(records, dailyGoal, storedStreak);

  // Get achievement information
  const {
    recentAchievements,
    statistics: achievementStats,
    progress: achievementProgress,
  } = useAchievement(badges, subscription);
  const percentage = Math.min(
    dailyGoal.goal > 0 ? (todayRecord.netHydration / dailyGoal.goal) * 100 : 0,
    100
  );

  const [showBeverageModal, setShowBeverageModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(250);

  const fillAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const lastProcessedRef = useRef<string>("");

  useEffect(() => {
    Animated.spring(fillAnimation, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [percentage, fillAnimation]);

  useEffect(() => {
    // Create a unique key for this state to prevent duplicate processing
    const stateKey = `${todayRecord.date}-${todayRecord.goalAchieved}-${todayRecord.netHydration}-${todayRecord.entries.length}`;

    // Only process if this state hasn't been processed yet
    if (lastProcessedRef.current === stateKey) {
      return;
    }

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

  const handleAddWater = (
    amount: number,
    beverageType: BeverageType = "water"
  ) => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    addWater(amount, beverageType);
    setShowBeverageModal(false);
  };

  const interpolatedHeight = fillAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const interpolatedColor = fillAnimation.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ["#E0F2FE", "#38BDF8", "#0EA5E9"],
  });

  const quickAmounts = [250, 500, 750, 1000];

  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );
    return HYDRATION_TIPS[dayOfYear % HYDRATION_TIPS.length];
  }, []);

  const getTipIcon = (iconName: string) => {
    const iconProps = { size: 24, color: "#F59E0B" };
    switch (iconName) {
      case "zap":
        return <Zap {...iconProps} />;
      case "brain":
        return <Brain {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "sparkles":
        return <Sparkles {...iconProps} />;
      case "thermometer":
        return <Thermometer {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "activity":
        return <Activity {...iconProps} />;
      case "target":
        return <Target {...iconProps} />;
      default:
        return <Lightbulb {...iconProps} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-accent" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-1.5">
            <Text className="text-4xl font-extrabold text-text-primary tracking-tight">
              Stay Hydrated
            </Text>
            {isPremium && (
              <LinearGradient
                colors={["#FBBF24", "#F59E0B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-3 py-1 rounded-full flex-row items-center gap-1.5"
              >
                <Crown size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text className="text-xs font-bold text-white uppercase tracking-wide">
                  Pro
                </Text>
              </LinearGradient>
            )}
          </View>
          <Text className="text-lg text-text-muted font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <Animated.View
          className="items-center mb-10"
          style={{ transform: [{ scale: scaleAnimation }] }}
        >
          <View
            className="p-2 rounded-[32px] bg-white"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="w-[200px] h-[280px] rounded-3xl border-[3px] border-primary-100 overflow-hidden relative bg-[#FAFBFC]">
              <Animated.View
                className="absolute bottom-0 left-0 right-0 rounded-[20px]"
                style={{
                  height: interpolatedHeight,
                  backgroundColor: interpolatedColor,
                }}
              />
              <View className="absolute inset-0 items-center justify-center gap-2">
                <Droplet size={48} color="#0EA5E9" strokeWidth={2} />
                <Text className="text-[56px] font-extrabold text-text-primary mt-2 tracking-tight">
                  {Math.round(percentage)}%
                </Text>
                <Text className="text-2xl font-bold text-primary-400 tracking-tight">
                  {Math.round(todayRecord.netHydration)}ml
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-base text-text-muted font-medium">
                    of {dailyGoal.goal}ml
                  </Text>
                  {currentGoal.style === "smart" && (
                    <View className="flex-row items-center gap-1">
                      <Sparkles size={14} color="#0EA5E9" strokeWidth={2.5} />
                      <Text className="text-xs text-primary-400 font-semibold">
                        Smart
                      </Text>
                    </View>
                  )}
                  {currentGoal.style === "simple" && (
                    <View className="flex-row items-center gap-1">
                      <Droplet size={14} color="#64748B" strokeWidth={2.5} />
                      <Text className="text-xs text-text-muted font-semibold">
                        Simple
                      </Text>
                    </View>
                  )}
                  {currentGoal.style === "custom" && (
                    <View className="flex-row items-center gap-1">
                      <Target size={14} color="#64748B" strokeWidth={2.5} />
                      <Text className="text-xs text-text-muted font-semibold">
                        Custom
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Streak Info */}
        {currentStreak > 0 && (
          <View className="mb-4 bg-orange-50 rounded-xl p-3 border border-orange-200">
            <View className="flex-row items-center gap-2 mb-2">
              <Flame
                size={16}
                color={isAtRisk ? "#EF4444" : "#F59E0B"}
                fill={isAtRisk ? "#EF4444" : "#F59E0B"}
                strokeWidth={2.5}
              />
              <Text className="text-sm font-bold text-orange-900">
                Current Streak: {streakDisplay.current}
              </Text>
            </View>
            {isAtRisk && (
              <Text className="text-xs text-orange-700 font-semibold">
                💧 Keep your streak going
              </Text>
            )}
            {streakMilestones.next && !isAtRisk && (
              <Text className="text-xs text-orange-700">
                Next milestone: {streakMilestones.next} days (
                {streakMilestones.progress}% there)
              </Text>
            )}
          </View>
        )}

        {/* Smart Goal Breakdown Info */}
        {currentGoal.style === "smart" && smartGoalCalculation && (
          <View className="mb-4 bg-sky-50 rounded-xl p-3 border border-sky-200">
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={16} color="#0EA5E9" strokeWidth={2.5} />
              <Text className="text-sm font-bold text-sky-900">
                Personalized Goal Breakdown
              </Text>
            </View>
            {smartGoalCalculation.adjustments && (
              <View className="gap-1">
                <Text className="text-xs text-slate-600">
                  Base: {smartGoalCalculation.baseRecommendation}ml
                </Text>
                {smartGoalCalculation.adjustments.activityBonus !== undefined &&
                  smartGoalCalculation.adjustments.activityBonus !== 0 && (
                    <Text className="text-xs text-slate-600">
                      Activity: +
                      {smartGoalCalculation.adjustments.activityBonus}ml
                    </Text>
                  )}
                {smartGoalCalculation.adjustments.climateBonus !== undefined &&
                  smartGoalCalculation.adjustments.climateBonus !== 0 && (
                    <Text className="text-xs text-slate-600">
                      Climate: +{smartGoalCalculation.adjustments.climateBonus}
                      ml
                    </Text>
                  )}
                {smartGoalCalculation.adjustments.weightAdjustment !==
                  undefined &&
                  smartGoalCalculation.adjustments.weightAdjustment !== 0 && (
                    <Text className="text-xs text-slate-600">
                      Weight:{" "}
                      {smartGoalCalculation.adjustments.weightAdjustment > 0
                        ? "+"
                        : ""}
                      {smartGoalCalculation.adjustments.weightAdjustment}ml
                    </Text>
                  )}
                {smartGoalCalculation.adjustments.ageAdjustment !== undefined &&
                  smartGoalCalculation.adjustments.ageAdjustment !== 0 && (
                    <Text className="text-xs text-slate-600">
                      Age: +{smartGoalCalculation.adjustments.ageAdjustment}ml
                    </Text>
                  )}
              </View>
            )}
          </View>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Trophy size={20} color="#F59E0B" />
              <Text className="text-xl font-extrabold text-text-primary tracking-tight">
                Recent Achievements
              </Text>
            </View>
            <View className="flex-row gap-3">
              {recentAchievements.slice(0, 3).map((badge) => (
                <View
                  key={badge.id}
                  className="flex-1 bg-white rounded-2xl p-3 items-center border-2 shadow-md"
                  style={{
                    borderColor: badge.color,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text className="text-3xl mb-1">{badge.icon}</Text>
                  <Text
                    className="text-xs font-bold text-text-primary text-center"
                    numberOfLines={1}
                  >
                    {badge.name}
                  </Text>
                </View>
              ))}
            </View>
            {achievementProgress < 100 && (
              <View className="mt-3 bg-background-secondary rounded-xl p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold text-text-primary">
                    Progress: {achievementProgress}%
                  </Text>
                  <Text className="text-xs text-text-muted">
                    {achievementStats.earned}/{achievementStats.availableBadges}{" "}
                    badges
                  </Text>
                </View>
                <View className="h-1.5 bg-background-primary rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${achievementProgress}%` }}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        <View className="mb-6">
          <Text className="text-[22px] font-extrabold text-text-primary mb-4 tracking-tight">
            Quick Add Water
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {quickAmounts.map((amount) => (
              <Pressable
                key={amount}
                className="flex-1 min-w-[47%] bg-white rounded-2xl p-5 items-center shadow-lg"
                style={({ pressed }) => [
                  {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                    opacity: pressed ? 0.7 : 1,
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  },
                ]}
                onPress={() => handleAddWater(amount, "water")}
              >
                <Text className="text-[28px] font-extrabold text-primary-400 mb-1 tracking-tight">
                  {amount}ml
                </Text>
                <Text className="text-[15px] text-text-muted font-medium">
                  {amount === 250
                    ? "Glass"
                    : amount === 500
                      ? "Bottle"
                      : amount === 750
                        ? "Large"
                        : "Liter"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {features.beverageIntelligence && (
          <View className="mb-6">
            <Text className="text-[22px] font-extrabold text-text-primary mb-4 tracking-tight">
              Other Beverages
            </Text>
            <Pressable
              className="flex-row items-center justify-center gap-2 bg-white rounded-2xl p-4 border-2 border-light border-dashed"
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                },
              ]}
              onPress={() => setShowBeverageModal(true)}
            >
              <Plus size={20} color="#0EA5E9" />
              <Text className="text-lg font-bold text-primary-400">
                Track Other Drink
              </Text>
            </Pressable>
          </View>
        )}

        {!features.beverageIntelligence && (
          <Pressable
            className="rounded-2xl p-5 mb-6 overflow-hidden"
            style={({ pressed }) => [
              {
                backgroundColor: "#FFFBEB",
                borderWidth: 2,
                borderColor: "#FEF3C7",
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
                opacity: pressed ? 0.9 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              },
            ]}
            onPress={() => {
              if (shouldShowUpsell("beverage_track")) {
                markUpsellTriggered("beverage_track");
              }
              navigation.navigate("Paywall");
            }}
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-warning-200 items-center justify-center flex-shrink-0">
                <Crown size={24} color="#F59E0B" fill="#F59E0B" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-base font-extrabold text-warning-900">
                    Unlock Pro Features
                  </Text>
                  <Sparkles size={16} color="#F59E0B" />
                </View>
                <Text className="text-sm font-medium text-warning-800 leading-5">
                  Track coffee, tea, and more with Pro
                </Text>
              </View>
              <View className="flex-row items-center gap-1 bg-warning-500 px-4 py-2.5 rounded-xl">
                <Text className="text-sm font-bold text-white">Upgrade</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
          </Pressable>
        )}

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 rounded-xl bg-warning-100 items-center justify-center">
              <Lightbulb size={18} color="#F59E0B" fill="#F59E0B" />
            </View>
            <Text className="text-xl font-extrabold text-text-primary tracking-tight">
              Daily Tip
            </Text>
          </View>
          <View
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{
              backgroundColor: "#FFFBEB",
              borderWidth: 1,
              borderColor: "#FEF3C7",
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute top-0 right-0 w-32 h-32 bg-warning-100/30 rounded-full -mr-16 -mt-16" />
            <View className="flex-row items-start gap-4">
              <View className="w-14 h-14 rounded-2xl bg-warning-100 items-center justify-center flex-shrink-0">
                {getTipIcon(dailyTip.icon)}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-warning-900 mb-2 tracking-tight">
                  {dailyTip.title}
                </Text>
                <Text className="text-base text-warning-800 leading-6 font-medium">
                  {dailyTip.description}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {todayRecord.entries.length > 0 && (
          <View className="mb-5">
            <Text className="text-[22px] font-extrabold text-text-primary mb-4 tracking-tight">
              Today&apos;s Log
            </Text>
            {todayRecord.entries
              .slice()
              .reverse()
              .map((entry) => {
                const beverage = BEVERAGE_INFO[entry.beverageType || "water"];
                const iconColor =
                  entry.beverageType === "water"
                    ? "#0EA5E9"
                    : entry.beverageType === "coffee"
                      ? "#92400E"
                      : entry.beverageType === "tea"
                        ? "#10B981"
                        : entry.beverageType === "juice"
                          ? "#F59E0B"
                          : entry.beverageType === "soda"
                            ? "#EF4444"
                            : "#7C3AED";
                const iconBgColor =
                  entry.beverageType === "water"
                    ? "#E0F2FE"
                    : entry.beverageType === "coffee"
                      ? "#FEF3C7"
                      : entry.beverageType === "tea"
                        ? "#D1FAE5"
                        : entry.beverageType === "juice"
                          ? "#FEF3C7"
                          : entry.beverageType === "soda"
                            ? "#FEE2E2"
                            : "#EDE9FE";
                return (
                  <View
                    key={entry.id}
                    className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: iconBgColor }}
                    >
                      {entry.beverageType === "water" && (
                        <Droplet size={28} color={iconColor} fill={iconColor} />
                      )}
                      {entry.beverageType === "coffee" && (
                        <Coffee size={28} color={iconColor} />
                      )}
                      {entry.beverageType === "tea" && (
                        <Tea size={28} color={iconColor} />
                      )}
                      {entry.beverageType === "juice" && (
                        <Droplets size={28} color={iconColor} />
                      )}
                      {entry.beverageType === "soda" && (
                        <Droplets size={28} color={iconColor} />
                      )}
                      {entry.beverageType === "alcohol" && (
                        <Wine size={28} color={iconColor} />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-baseline gap-2 mb-1">
                        <Text className="text-xl font-extrabold text-text-primary">
                          {entry.amount}ml
                        </Text>
                        <Text className="text-base font-semibold text-text-secondary">
                          {beverage.name}
                        </Text>
                      </View>
                      {entry.netHydration !== entry.amount && (
                        <Text className="text-sm text-text-muted font-medium">
                          Net: {Math.round(entry.netHydration || entry.amount)}
                          ml
                        </Text>
                      )}
                      <Text className="text-sm text-text-muted font-medium mt-1">
                        {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => removeWater(entry.id)}
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={({ pressed }) => [
                        {
                          backgroundColor: pressed ? "#FEE2E2" : "#FEF2F2",
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Minus size={20} color="#EF4444" strokeWidth={3} />
                    </Pressable>
                  </View>
                );
              })}
          </View>
        )}

        <Modal
          visible={showBeverageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBeverageModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View
              className="bg-white rounded-t-3xl p-6"
              style={{ maxHeight: "80%" }}
            >
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-[26px] font-extrabold text-text-primary tracking-tight">
                  Select Beverage
                </Text>
                <Pressable onPress={() => setShowBeverageModal(false)}>
                  <X size={24} color="#64748B" />
                </Pressable>
              </View>

              <View className="mb-6">
                <Text className="text-lg font-bold text-text-primary mb-3">
                  Amount
                </Text>
                <View className="flex-row gap-2">
                  {[250, 350, 500, 750].map((amount) => (
                    <Pressable
                      key={amount}
                      className={`flex-1 py-3 rounded-xl items-center ${selectedAmount === amount ? "bg-primary-400" : "bg-slate-100"}`}
                      onPress={() => setSelectedAmount(amount)}
                    >
                      <Text
                        className={`text-[15px] font-bold ${selectedAmount === amount ? "text-white" : "text-text-muted"}`}
                      >
                        {amount}ml
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <ScrollView style={{ maxHeight: 400 }}>
                {(Object.keys(BEVERAGE_INFO) as BeverageType[])
                  .filter((key) => key !== "water")
                  .map((beverageType) => {
                    const beverage = BEVERAGE_INFO[beverageType];
                    const BeverageIcon =
                      beverageType === "coffee"
                        ? Coffee
                        : beverageType === "tea"
                          ? Tea
                          : beverageType === "alcohol"
                            ? Wine
                            : Droplets;
                    const iconColor =
                      beverageType === "coffee"
                        ? "#92400E"
                        : beverageType === "tea"
                          ? "#10B981"
                          : beverageType === "juice"
                            ? "#F59E0B"
                            : beverageType === "soda"
                              ? "#EF4444"
                              : "#7C3AED";
                    return (
                      <Pressable
                        key={beverageType}
                        className="flex-row items-center gap-4 p-4 bg-background-secondary rounded-xl mb-2"
                        style={({ pressed }) => [
                          {
                            backgroundColor: pressed ? "#E0F2FE" : "#F8FAFC",
                          },
                        ]}
                        onPress={() =>
                          handleAddWater(selectedAmount, beverageType)
                        }
                      >
                        <View className="w-12 h-12 rounded-full bg-background-accent items-center justify-center">
                          <BeverageIcon size={32} color={iconColor} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xl font-bold text-text-primary">
                            {beverage.name}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
