import {
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Animated,
  Alert,
  BackHandler,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../RootStack";
import { useSettings } from "@/contexts/SettingsContext";
import { useWater } from "@/contexts/WaterContext";
import { useState, useRef, useMemo } from "react";
import {
  Target,
  Weight,
  Dumbbell,
  Cloud,
  Bell,
  Clock,
  Droplet,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react-native";
import { ActivityLevel, Gender, UserProfile, AppSettings } from "@/types/user";
import * as Notifications from "expo-notifications";
import { useHydrationGoal, GoalStyle } from "@/src/hooks/useHydrationGoal";

type AgeRange =
  | "18-25"
  | "26-35"
  | "36-45"
  | "46-55"
  | "56+"
  | "prefer-not-say";

const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: "18-25", label: "18-25" },
  { value: "26-35", label: "26-35" },
  { value: "36-45", label: "36-45" },
  { value: "46-55", label: "46-55" },
  { value: "56+", label: "56+" },
  { value: "prefer-not-say", label: "Prefer not to say" },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingGoalsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { updateSettings, updateProfile } = useSettings();
  const { addWater, completeOnboarding, updateGoal, dailyGoal } = useWater();

  const [step, setStep] = useState(0);
  const [goalStyle, setGoalStyle] = useState<GoalStyle>("simple");
  const [weight, setWeight] = useState("70");
  const [gender, setGender] = useState<Gender>("other");
  const [ageRange, setAgeRange] = useState<AgeRange>("26-35");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<"cold" | "moderate" | "hot">(
    "moderate"
  );
  const [reminderTimes, setReminderTimes] = useState({
    morning: true,
    afternoon: true,
    evening: true,
  });
  const [reminderFrequency, setReminderFrequency] = useState<
    "hourly" | "every_2_hours" | "every_3_hours"
  >("every_2_hours");
  const [unit, setUnit] = useState<"ml" | "oz">("ml");
  const [startOfDay, setStartOfDay] = useState("06:00");
  const [customGoal, setCustomGoal] = useState("2500");

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Create temporary profile and settings from onboarding state for goal calculation
  const tempProfile: Partial<UserProfile> = useMemo(
    () => ({
      weight: parseFloat(weight) || 70,
      gender,
      activityLevel,
      climate,
      age:
        ageRange === "prefer-not-say"
          ? 30
          : parseInt(ageRange.split("-")[0]) || 30,
      useSmartGoal: goalStyle === "smart",
    }),
    [weight, gender, activityLevel, climate, ageRange, goalStyle]
  );

  const tempSettings: Partial<AppSettings> = useMemo(
    () => ({
      unit,
      climateSensitivity: goalStyle === "smart",
    }),
    [unit, goalStyle]
  );

  // Use the hydration goal hook with temporary profile
  const {
    smartGoalCalculation,
    validateGoal,
    calculateSmartGoal: getCalculateSmartGoal,
  } = useHydrationGoal(
    dailyGoal,
    tempProfile as UserProfile,
    tempSettings as AppSettings
  );

  const handleNext = () => {
    // If on goal style selection step (step 1) and simple or custom is selected, skip to reminder step (step 5)
    let nextStep = step + 1;
    if (step === 1 && (goalStyle === "simple" || goalStyle === "custom")) {
      nextStep = 5; // Jump to reminder setup step
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleBack = () => {
    if (step === 0) {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit? Your progress will not be saved.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => {
              if (Platform.OS === "android") {
                BackHandler.exitApp();
              } else {
                // On iOS, we can't exit programmatically, so just navigate back
                navigation.goBack();
              }
            },
          },
        ]
      );
      return;
    }

    // If on reminder step (step 5) and came from simple/custom goal, go back to step 1
    let prevStep = step - 1;
    if (step === 5 && (goalStyle === "simple" || goalStyle === "custom")) {
      prevStep = 1; // Go back to goal style selection
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(prevStep);
      slideAnim.setValue(-50);
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSkip = () => {
    if (step < 8) {
      handleNext();
    }
  };

  const handleComplete = async () => {
    const weightNum = parseFloat(weight) || 70;

    // Calculate and set the goal based on selected style
    let finalGoal: number;

    if (goalStyle === "simple") {
      // Simple goal: 2500ml (2.5L)
      finalGoal = 2500;
    } else if (goalStyle === "smart") {
      // Smart goal: Use calculated value from hook
      if (getCalculateSmartGoal) {
        const calculated = getCalculateSmartGoal();
        finalGoal = calculated.goal;
      } else {
        // Fallback: calculate manually if hook doesn't provide function
        finalGoal = smartGoalCalculation?.goal || 2500;
      }
    } else {
      // Custom goal: Validate and use user input
      const customGoalNum = parseFloat(customGoal) || 2500;
      const validation = validateGoal(customGoalNum);
      if (!validation.valid) {
        Alert.alert(
          "Invalid Goal",
          validation.errors.join("\n") ||
            "Please enter a valid goal between 500ml and 10000ml"
        );
        return;
      }
      finalGoal = customGoalNum;
    }

    // Update profile with user selections
    updateProfile({
      weight: weightNum,
      gender,
      activityLevel,
      climate,
      useSmartGoal: goalStyle === "smart",
      age:
        ageRange === "prefer-not-say" ? 30 : parseInt(ageRange.split("-")[0]),
      hasCompletedGoalsOnboarding: true,
    });

    // Update settings
    updateSettings({
      unit,
      startOfDayTime: startOfDay,
      reminderFrequency,
      climateSensitivity: goalStyle === "smart",
    });

    // Set the calculated goal
    updateGoal(finalGoal);

    await completeOnboarding();
    // RootStack will automatically show MainTabs when hasCompletedOnboarding changes
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        Alert.alert(
          "Success!",
          "You will receive gentle hydration reminders throughout the day."
        );
      }
    } catch (error) {
      console.log("Notification permission error:", error);
    }
    handleNext();
  };

  const handleFirstDrink = () => {
    addWater(250, "water");
    setTimeout(() => {
      Alert.alert(
        "🎉 Great start!",
        "You've logged your first glass! You're on your way to building a healthy hydration habit.",
        [{ text: "Continue", onPress: handleNext }]
      );
    }, 300);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Sparkles size={64} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Let&apos;s build a simple hydration habit that fits your life
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              This will only take a minute. We&apos;ll personalize your
              experience to help you stay consistently hydrated.
            </Text>
            {/* <View className="gap-3">
              <Pressable
                className="flex-row items-center justify-center gap-2 bg-sky-500 py-[18px] rounded-2xl shadow-lg"
                style={({ pressed }) =>
                  pressed ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : {}
                }
                onPress={handleNext}
              >
                <Text className="text-lg font-bold text-white">
                  Get Started
                </Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </Pressable>
            </View> */}
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Target size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Choose Your Goal Style
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              How would you like us to calculate your daily hydration goal?
            </Text>

            <View className="gap-3">
              <Pressable
                className={`bg-white rounded-2xl p-5 border-2 ${
                  goalStyle === "simple"
                    ? "border-sky-500 bg-sky-50"
                    : "border-sky-100"
                }`}
                onPress={() => setGoalStyle("simple")}
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <Droplet
                    size={24}
                    color={goalStyle === "simple" ? "#0EA5E9" : "#64748B"}
                  />
                  <View className="flex-row items-center justify-center gap-2">
                    <Text
                      className={`text-xl font-bold ${
                        goalStyle === "simple"
                          ? "text-sky-500"
                          : "text-slate-500"
                      }`}
                    >
                      Simple Goal
                    </Text>
                    <Text className="text-xs font-bold text-emerald-500 mt-2 uppercase">
                      (Recommended)
                    </Text>
                  </View>
                </View>
                <Text className="text-[13px] text-primary-900 mb-1.5 leading-5">
                  Quick setup, no personal data
                </Text>
                <Text className="text-[14px] font-bold text-slate-500 leading-5">
                  2.5L daily recommendation
                </Text>
              </Pressable>

              <Pressable
                className={`bg-white rounded-2xl p-5 border-2 ${
                  goalStyle === "smart"
                    ? "border-sky-500 bg-sky-50"
                    : "border-sky-100"
                }`}
                onPress={() => setGoalStyle("smart")}
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <Sparkles
                    size={24}
                    color={goalStyle === "smart" ? "#0EA5E9" : "#64748B"}
                  />
                  <Text
                    className={`text-xl font-bold ${
                      goalStyle === "smart" ? "text-sky-500" : "text-slate-500"
                    }`}
                  >
                    Smart Goal
                  </Text>
                </View>
                <Text className="text-[13px] text-primary-900 mb-1.5 leading-5">
                  Personalized based on your profile
                </Text>
                <Text className="text-[14px] font-bold text-slate-500 leading-5">
                  Based on profile & activity
                </Text>
              </Pressable>

              <Pressable
                className={`bg-white rounded-2xl p-5 border-2 ${
                  goalStyle === "custom"
                    ? "border-sky-500 bg-sky-50"
                    : "border-sky-100"
                }`}
                onPress={() => setGoalStyle("custom")}
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <Target
                    size={24}
                    color={goalStyle === "custom" ? "#0EA5E9" : "#64748B"}
                  />
                  <Text
                    className={`text-xl font-bold ${
                      goalStyle === "custom" ? "text-sky-500" : "text-slate-500"
                    }`}
                  >
                    Custom Goal
                  </Text>
                </View>

                <Text className="text-[13px] text-primary-900 mb-1.5 uppercase">
                  Full Control
                </Text>

                <Text className="text-[14px] text-primary-900 mb-1.5 leading-5">
                  Set your own daily target
                </Text>
              </Pressable>
            </View>

            {goalStyle === "custom" && (
              <View className="mb-6">
                <Text className="text-[17px] font-bold text-sky-900 mb-2">
                  Your Daily Goal (ml)
                </Text>
                <TextInput
                  className="bg-white rounded-xl p-4 text-[17px] border-2 border-sky-100 text-sky-900 font-semibold"
                  value={customGoal}
                  onChangeText={setCustomGoal}
                  keyboardType="numeric"
                  placeholder="2500"
                />
                {customGoal && (
                  <View className="mt-2">
                    {(() => {
                      const validation = validateGoal(
                        parseFloat(customGoal) || 0
                      );
                      return validation.valid ? (
                        <Text className="text-sm text-emerald-600 font-medium">
                          ✓ Valid goal
                        </Text>
                      ) : (
                        <Text className="text-sm text-red-600 font-medium">
                          {validation.errors[0] ||
                            "Goal must be between 500ml and 10000ml"}
                        </Text>
                      );
                    })()}
                  </View>
                )}
              </View>
            )}

            {goalStyle === "smart" && smartGoalCalculation && (
              <View className="mt-4 bg-sky-50 rounded-xl p-4 border-2 border-sky-200">
                <Text className="text-[15px] font-bold text-sky-900 mb-2">
                  Your Personalized Goal
                </Text>
                <Text className="text-2xl font-extrabold text-sky-600 mb-2">
                  {smartGoalCalculation.goal.toLocaleString()}ml
                </Text>
                {smartGoalCalculation.adjustments && (
                  <View className="mt-2 gap-1">
                    {smartGoalCalculation.adjustments.activityBonus !==
                      undefined &&
                      smartGoalCalculation.adjustments.activityBonus !== 0 && (
                        <Text className="text-xs text-slate-600">
                          Activity: +
                          {smartGoalCalculation.adjustments.activityBonus}ml
                        </Text>
                      )}
                    {smartGoalCalculation.adjustments.climateBonus !==
                      undefined &&
                      smartGoalCalculation.adjustments.climateBonus !== 0 && (
                        <Text className="text-xs text-slate-600">
                          Climate: +
                          {smartGoalCalculation.adjustments.climateBonus}ml
                        </Text>
                      )}
                    {smartGoalCalculation.adjustments.weightAdjustment !==
                      undefined &&
                      smartGoalCalculation.adjustments.weightAdjustment !==
                        0 && (
                        <Text className="text-xs text-slate-600">
                          Weight:{" "}
                          {smartGoalCalculation.adjustments.weightAdjustment > 0
                            ? "+"
                            : ""}
                          {smartGoalCalculation.adjustments.weightAdjustment}ml
                        </Text>
                      )}
                    {smartGoalCalculation.adjustments.ageAdjustment !==
                      undefined &&
                      smartGoalCalculation.adjustments.ageAdjustment !== 0 && (
                        <Text className="text-xs text-slate-600">
                          Age: +{smartGoalCalculation.adjustments.ageAdjustment}
                          ml
                        </Text>
                      )}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Weight size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Body Basics
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              {goalStyle === "smart"
                ? "Help us calculate your personalized hydration goal"
                : "Optional but helps us provide better insights"}
            </Text>

            <View className="mb-6">
              <Text className="text-[17px] font-bold text-sky-900 mb-2">
                Weight (kg) {goalStyle !== "smart" && "(Optional)"}
              </Text>
              <TextInput
                className="bg-white rounded-xl p-4 text-[17px] border-2 border-sky-100 text-sky-900 font-semibold"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="70"
              />
            </View>

            <View className="mb-6">
              <Text className="text-[17px] font-bold text-sky-900 mb-2">
                Gender (Optional)
              </Text>
              <View className="flex-row bg-white rounded-xl p-1 border-2 border-sky-100">
                {(["male", "female", "other"] as Gender[]).map((g) => (
                  <Pressable
                    key={g}
                    className={`flex-1 py-3 items-center rounded-lg ${
                      gender === g ? "bg-sky-500" : ""
                    }`}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      className={`text-[15px] font-semibold ${
                        gender === g ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[17px] font-bold text-sky-900 mb-2">
                Age Range (Optional)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-2"
              >
                {AGE_RANGES.map((age) => (
                  <Pressable
                    key={age.value}
                    className={`py-3 px-4 rounded-xl mr-2 border-2 ${
                      ageRange === age.value
                        ? "bg-sky-500 border-sky-500"
                        : "bg-white border-sky-100"
                    }`}
                    onPress={() => setAgeRange(age.value)}
                  >
                    <Text
                      className={`text-[15px] font-semibold ${
                        ageRange === age.value ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {age.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Dumbbell size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Activity Level
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              This directly affects your daily water needs
            </Text>

            <View className="gap-3">
              {[
                {
                  value: "sedentary" as ActivityLevel,
                  icon: "🪑",
                  label: "Mostly Sedentary",
                  desc: "Desk job, minimal movement",
                },
                {
                  value: "light" as ActivityLevel,
                  icon: "🚶",
                  label: "Light Activity",
                  desc: "Some walking, light exercise",
                },
                {
                  value: "moderate" as ActivityLevel,
                  icon: "🏃",
                  label: "Active",
                  desc: "Regular exercise 3-4x/week",
                },
                {
                  value: "active" as ActivityLevel,
                  icon: "🏋️",
                  label: "Very Active",
                  desc: "Daily intense workouts",
                },
              ].map((activity) => (
                <Pressable
                  key={activity.value}
                  className={`flex-row items-center gap-4 bg-white rounded-2xl p-4 border-2 ${
                    activityLevel === activity.value
                      ? "border-sky-500 bg-sky-50"
                      : "border-sky-100"
                  }`}
                  onPress={() => setActivityLevel(activity.value)}
                >
                  <View className="w-12 h-12 rounded-full bg-sky-50 items-center justify-center">
                    <Dumbbell
                      size={24}
                      color={
                        activityLevel === activity.value ? "#0EA5E9" : "#64748B"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-[17px] font-bold mb-0.5 ${
                        activityLevel === activity.value
                          ? "text-sky-500"
                          : "text-slate-500"
                      }`}
                    >
                      {activity.label}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {activity.desc}
                    </Text>
                  </View>
                  {activityLevel === activity.value && (
                    <Check size={20} color="#0EA5E9" strokeWidth={3} />
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Cloud size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Climate Awareness
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              Hotter days may increase your water needs
            </Text>

            <View className="gap-3">
              {[
                {
                  value: "cold" as const,
                  label: "Cool Climate",
                  desc: "Generally cold weather",
                },
                {
                  value: "moderate" as const,
                  label: "Moderate Climate",
                  desc: "Comfortable temperatures",
                },
                {
                  value: "hot" as const,
                  label: "Hot Climate",
                  desc: "Usually hot weather",
                },
              ].map((c) => (
                <Pressable
                  key={c.value}
                  className={`bg-white rounded-2xl p-6 items-center border-2 ${
                    climate === c.value
                      ? "border-sky-500 bg-sky-50"
                      : "border-sky-100"
                  }`}
                  onPress={() => setClimate(c.value)}
                >
                  <Cloud
                    size={32}
                    color={climate === c.value ? "#0EA5E9" : "#64748B"}
                  />
                  <Text
                    className={`text-lg font-bold mt-3 mb-1 ${
                      climate === c.value ? "text-sky-500" : "text-slate-500"
                    }`}
                  >
                    {c.label}
                  </Text>
                  <Text className="text-sm text-slate-500">{c.desc}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Bell size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Reminder Setup
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              When should we remind you to hydrate?
            </Text>

            <View className="gap-4 mb-6">
              <View className="flex-row items-center justify-between bg-white rounded-xl p-4 border-2 border-sky-100">
                <Text className="text-base font-semibold text-sky-900">
                  Morning (7 AM - 12 PM)
                </Text>
                <Switch
                  value={reminderTimes.morning}
                  onValueChange={(val) =>
                    setReminderTimes({ ...reminderTimes, morning: val })
                  }
                  trackColor={{ false: "#CBD5E1", true: "#7DD3FC" }}
                  thumbColor={reminderTimes.morning ? "#0EA5E9" : "#F1F5F9"}
                />
              </View>
              <View className="flex-row items-center justify-between bg-white rounded-xl p-4 border-2 border-sky-100">
                <Text className="text-base font-semibold text-sky-900">
                  Afternoon (12 PM - 6 PM)
                </Text>
                <Switch
                  value={reminderTimes.afternoon}
                  onValueChange={(val) =>
                    setReminderTimes({ ...reminderTimes, afternoon: val })
                  }
                  trackColor={{ false: "#CBD5E1", true: "#7DD3FC" }}
                  thumbColor={reminderTimes.afternoon ? "#0EA5E9" : "#F1F5F9"}
                />
              </View>
              <View className="flex-row items-center justify-between bg-white rounded-xl p-4 border-2 border-sky-100">
                <Text className="text-base font-semibold text-sky-900">
                  Evening (6 PM - 10 PM)
                </Text>
                <Switch
                  value={reminderTimes.evening}
                  onValueChange={(val) =>
                    setReminderTimes({ ...reminderTimes, evening: val })
                  }
                  trackColor={{ false: "#CBD5E1", true: "#7DD3FC" }}
                  thumbColor={reminderTimes.evening ? "#0EA5E9" : "#F1F5F9"}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[17px] font-bold text-sky-900 mb-2">
                Reminder Frequency
              </Text>
              <View className="flex-row bg-white rounded-xl p-1 border-2 border-sky-100">
                <Pressable
                  className={`flex-1 py-3 items-center rounded-lg ${
                    reminderFrequency === "hourly" ? "bg-sky-500" : ""
                  }`}
                  onPress={() => setReminderFrequency("hourly")}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      reminderFrequency === "hourly"
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Every 1hr
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 py-3 items-center rounded-lg ${
                    reminderFrequency === "every_2_hours" ? "bg-sky-500" : ""
                  }`}
                  onPress={() => setReminderFrequency("every_2_hours")}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      reminderFrequency === "every_2_hours"
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Every 2hrs
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 py-3 items-center rounded-lg ${
                    reminderFrequency === "every_3_hours" ? "bg-sky-500" : ""
                  }`}
                  onPress={() => setReminderFrequency("every_3_hours")}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      reminderFrequency === "every_3_hours"
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Every 3hrs
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Bell size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Enable Notifications
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              HydraTrack reminds you gently — never spam. Stay on track with
              timely hydration reminders throughout your day.
            </Text>

            <View className="gap-4 mb-8">
              <View className="flex-row items-center gap-3">
                <Check size={20} color="#10B981" strokeWidth={2.5} />
                <Text className="text-base text-sky-900 font-medium">
                  Gentle, context-aware reminders
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Check size={20} color="#10B981" strokeWidth={2.5} />
                <Text className="text-base text-sky-900 font-medium">
                  Adapts to your drinking patterns
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Check size={20} color="#10B981" strokeWidth={2.5} />
                <Text className="text-base text-sky-900 font-medium">
                  Respects your quiet hours
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <Pressable
                className="flex-row items-center justify-center gap-2 bg-sky-500 py-[18px] rounded-2xl shadow-lg"
                style={({ pressed }) =>
                  pressed ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : {}
                }
                onPress={requestNotificationPermission}
              >
                <Text className="text-lg font-bold text-white">
                  Enable Reminders
                </Text>
              </Pressable>
              <Pressable
                className="py-[18px] items-center"
                style={({ pressed }) =>
                  pressed ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : {}
                }
                onPress={handleNext}
              >
                <Text className="text-base font-semibold text-slate-500">
                  Not Now
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        );

      case 7:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Clock size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Units & Preferences
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              Customize your tracking preferences
            </Text>

            <View className="mb-6">
              <Text className="text-[17px] font-bold text-sky-900 mb-2">
                Measurement Unit
              </Text>
              <View className="flex-row bg-white rounded-xl p-1 border-2 border-sky-100">
                <Pressable
                  className={`flex-1 py-3 items-center rounded-lg ${
                    unit === "ml" ? "bg-sky-500" : ""
                  }`}
                  onPress={() => setUnit("ml")}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      unit === "ml" ? "text-white" : "text-slate-500"
                    }`}
                  >
                    Milliliters (ml)
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 py-3 items-center rounded-lg ${
                    unit === "oz" ? "bg-sky-500" : ""
                  }`}
                  onPress={() => setUnit("oz")}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      unit === "oz" ? "text-white" : "text-slate-500"
                    }`}
                  >
                    Ounces (oz)
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[17px] font-bold text-sky-900 mb-2">
                Start of Day
              </Text>
              <Text className="text-sm text-slate-500 mb-3">
                When does your day typically start?
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {["05:00", "06:00", "07:00", "08:00", "09:00"].map((time) => (
                  <Pressable
                    key={time}
                    className={`py-3 px-5 rounded-xl border-2 ${
                      startOfDay === time
                        ? "bg-sky-500 border-sky-500"
                        : "bg-white border-sky-100"
                    }`}
                    onPress={() => setStartOfDay(time)}
                  >
                    <Text
                      className={`text-[15px] font-semibold ${
                        startOfDay === time ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {time}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>
        );

      case 8:
        return (
          <Animated.View
            className="py-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View className="items-center mb-6">
              <Droplet size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text className="text-[32px] font-extrabold text-sky-900 text-center mb-3 tracking-tight">
              Log Your First Glass!
            </Text>
            <Text className="text-[17px] text-slate-500 text-center leading-6 mb-8 px-2">
              Let&apos;s start your hydration journey with your first entry. Tap
              below to log a glass of water.
            </Text>

            <View className="items-center my-8">
              <Pressable
                className="bg-sky-500 w-[200px] h-[200px] rounded-full items-center justify-center shadow-lg"
                style={({ pressed }) =>
                  pressed
                    ? {
                        opacity: 0.7,
                        transform: [{ scale: 0.98 }],
                        shadowColor: "#0EA5E9",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                    : {
                        shadowColor: "#0EA5E9",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                }
                onPress={handleFirstDrink}
              >
                <Droplet size={40} color="#FFFFFF" />
                <Text className="text-2xl font-extrabold text-white mt-3">
                  Log 250ml
                </Text>
                <Text className="text-sm font-medium text-sky-100 mt-1">
                  Your first glass
                </Text>
              </Pressable>
            </View>

            <Text className="text-base text-slate-500 text-center leading-[22px] italic">
              This is the beginning of a healthier, more energized you!
            </Text>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return goalStyle !== null;
      case 2:
        return (
          goalStyle !== "smart" || (weight !== "" && parseFloat(weight) > 0)
        );
      case 3:
        return activityLevel !== null;
      default:
        return true;
    }
  };

  return (
    <View className="flex-1 bg-sky-50">
      <View
        className="flex-row items-center px-5 pb-5 gap-3"
        style={{ paddingTop: 60 }}
      >
        <Pressable onPress={handleBack} className="p-2">
          <ArrowLeft size={24} color="#0C4A6E" />
        </Pressable>
        <View className="flex-1 h-1.5 bg-sky-100 rounded-sm overflow-hidden">
          <View
            className="h-full bg-sky-500 rounded-sm"
            style={{ width: `${((step + 1) / 9) * 100}%` }}
          />
        </View>
        {step < 8 && (
          <Pressable onPress={handleSkip} className="p-2">
            <Text className="text-base font-semibold text-slate-500">Skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        {renderStep()}
      </ScrollView>

      <View className="px-5 py-4 pb-8 bg-white border-t border-sky-100">
        {step < 8 ? (
          <Pressable
            className={`flex-row items-center justify-center gap-2 py-[18px] rounded-2xl shadow-lg ${
              !canContinue() ? "bg-slate-300 opacity-60" : "bg-sky-500"
            }`}
            style={({ pressed }) =>
              pressed ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : {}
            }
            onPress={handleNext}
            disabled={!canContinue()}
          >
            <Text className="text-lg font-bold text-white">Continue</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            className="flex-row items-center justify-center gap-2 bg-sky-500 py-[18px] rounded-2xl shadow-lg"
            style={({ pressed }) =>
              pressed ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : {}
            }
            onPress={handleComplete}
          >
            <Text className="text-lg font-bold text-white">Complete Setup</Text>
            <Check size={20} color="#FFFFFF" strokeWidth={3} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
