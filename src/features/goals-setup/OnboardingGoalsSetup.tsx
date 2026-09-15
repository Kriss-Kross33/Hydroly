import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { ArrowLeft } from "lucide-react-native";
import { RootStackParamList } from "@/types/navigation";
import { useSettings } from "@/contexts/SettingsContext";
import { useWater } from "@/contexts/WaterContext";
import { ActivityLevel, AppSettings, Gender, UserProfile } from "@/types/user";
import { useHydrationGoal, GoalStyle } from "@/src/hooks/useHydrationGoal";
import {
  Button,
  LiquidMeter,
  MeasurementSelector,
  Metric,
  SelectionOption,
  SegmentedControl,
} from "@/src/components/ui";
import { colors } from "@/src/design-system";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type StepId =
  | "approach"
  | "weight"
  | "custom"
  | "activity"
  | "climate"
  | "prefs"
  | "reveal"
  | "ready";

const ACTIVITY_OPTIONS: { value: ActivityLevel; title: string; description: string }[] = [
  {
    value: "sedentary",
    title: "Mostly seated",
    description: "Desk work, light daily movement",
  },
  {
    value: "light",
    title: "Lightly active",
    description: "Short walks or occasional exercise",
  },
  {
    value: "moderate",
    title: "Moderately active",
    description: "Regular workouts a few times a week",
  },
  {
    value: "active",
    title: "Active",
    description: "Frequent training or physical work",
  },
  {
    value: "very_active",
    title: "Very active",
    description: "Intense training most days",
  },
];

const CLIMATE_OPTIONS: {
  value: "cold" | "moderate" | "hot";
  title: string;
  description: string;
}[] = [
  {
    value: "cold",
    title: "Cool",
    description: "Cooler climates or air-conditioned days",
  },
  {
    value: "moderate",
    title: "Temperate",
    description: "Mild weather for most of the year",
  },
  {
    value: "hot",
    title: "Warm",
    description: "Hot, humid, or high-heat environments",
  },
];

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(1);
}

export default function OnboardingGoalsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { updateSettings, updateProfile } = useSettings();
  const { completeOnboarding, updateGoal, dailyGoal } = useWater();

  const [step, setStep] = useState<StepId>("approach");
  const [goalStyle, setGoalStyle] = useState<GoalStyle>("smart");
  const [weight, setWeight] = useState(70);
  const [gender] = useState<Gender>("other");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<"cold" | "moderate" | "hot">("moderate");
  const [unit, setUnit] = useState<"ml" | "oz">("ml");
  const [reminderFrequency, setReminderFrequency] = useState<
    "hourly" | "every_2_hours" | "every_3_hours" | "never"
  >("every_2_hours");
  const [customGoal, setCustomGoal] = useState(2500);
  const [saving, setSaving] = useState(false);

  const tempProfile = useMemo(
    () =>
      ({
        weight,
        gender,
        activityLevel,
        climate,
        age: 30,
        useSmartGoal: goalStyle === "smart",
      }) as UserProfile,
    [weight, gender, activityLevel, climate, goalStyle]
  );

  const tempSettings = useMemo(
    () =>
      ({
        unit,
        climateSensitivity: goalStyle === "smart",
      }) as AppSettings,
    [unit, goalStyle]
  );

  const { smartGoalCalculation, validateGoal, calculateSmartGoal } =
    useHydrationGoal(dailyGoal, tempProfile, tempSettings);

  const computedGoal = useMemo(() => {
    if (goalStyle === "simple") return 2500;
    if (goalStyle === "custom") return customGoal;
    if (calculateSmartGoal) return calculateSmartGoal().goal;
    return smartGoalCalculation?.goal ?? 2500;
  }, [
    goalStyle,
    customGoal,
    calculateSmartGoal,
    smartGoalCalculation,
  ]);

  function goNext() {
    if (step === "approach") {
      if (goalStyle === "simple") {
        setStep("prefs");
        return;
      }
      if (goalStyle === "custom") {
        setStep("custom");
        return;
      }
      setStep("weight");
      return;
    }
    if (step === "weight") {
      setStep("activity");
      return;
    }
    if (step === "custom") {
      setStep("prefs");
      return;
    }
    if (step === "activity") {
      setStep("climate");
      return;
    }
    if (step === "climate") {
      setStep("prefs");
      return;
    }
    if (step === "prefs") {
      setStep("reveal");
      return;
    }
    if (step === "reveal") {
      setStep("ready");
    }
  }

  function goBack() {
    if (step === "approach") {
      navigation.goBack();
      return;
    }
    if (step === "prefs") {
      if (goalStyle === "simple") {
        setStep("approach");
        return;
      }
      if (goalStyle === "custom") {
        setStep("custom");
        return;
      }
      setStep("climate");
      return;
    }
    if (step === "custom") {
      setStep("approach");
      return;
    }
    if (step === "weight") {
      setStep("approach");
      return;
    }
    if (step === "activity") {
      setStep("weight");
      return;
    }
    if (step === "climate") {
      setStep("activity");
      return;
    }
    if (step === "reveal") {
      setStep("prefs");
      return;
    }
    if (step === "ready") {
      setStep("reveal");
    }
  }

  async function requestNotificationsQuietly() {
    try {
      await Notifications.requestPermissionsAsync();
    } catch (error) {
      console.log("Notification permission error:", error);
    }
  }

  async function handleFinish() {
    if (goalStyle === "custom") {
      const validation = validateGoal(customGoal);
      if (!validation.valid) {
        Alert.alert(
          "Check your target",
          validation.errors.join("\n") ||
            "Please enter a goal between 500 ml and 10,000 ml."
        );
        return;
      }
    }

    setSaving(true);
    try {
      updateProfile({
        weight,
        gender,
        activityLevel,
        climate,
        useSmartGoal: goalStyle === "smart",
        age: 30,
        hasCompletedGoalsOnboarding: true,
      });

      updateSettings({
        unit,
        startOfDayTime: "06:00",
        reminderFrequency,
        climateSensitivity: goalStyle === "smart",
      });

      updateGoal(computedGoal);
      await completeOnboarding();
    } finally {
      setSaving(false);
    }
  }

  async function handlePrefsContinue() {
    if (reminderFrequency !== "never") {
      await requestNotificationsQuietly();
    }
    goNext();
  }

  const showBack = step !== "approach";

  return (
    <View
      className="flex-1 bg-background-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center justify-between px-6 pt-4">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={goBack}
            className="h-10 w-10 items-center justify-center rounded-md active:opacity-70"
          >
            <ArrowLeft size={22} color={colors.ink} strokeWidth={1.75} />
          </Pressable>
        ) : (
          <View className="h-10 w-10" />
        )}
        <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
          Hydroly
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        className="flex-1 px-8"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === "approach" ? (
          <View className="flex-1 pt-10">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Your approach
            </Text>
            <Text
              className="mt-4 font-sans-medium text-3xl text-ink"
              style={{ letterSpacing: -0.5 }}
            >
              How should we set your daily target?
            </Text>
            <Text className="mt-3 font-sans text-base leading-6 text-muted">
              Choose a starting point. You can refine this anytime in settings.
            </Text>

            <View className="mt-10">
              <SelectionOption
                title="Simple"
                description="A clear 2.5 L starting target."
                selected={goalStyle === "simple"}
                onPress={() => setGoalStyle("simple")}
              />
              <SelectionOption
                title="Personal"
                description="A target shaped by your weight, activity, and climate."
                selected={goalStyle === "smart"}
                onPress={() => setGoalStyle("smart")}
              />
              <SelectionOption
                title="Custom"
                description="Set the exact daily amount yourself."
                selected={goalStyle === "custom"}
                onPress={() => setGoalStyle("custom")}
              />
            </View>
          </View>
        ) : null}

        {step === "weight" ? (
          <View className="flex-1 pt-10">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Body
            </Text>
            <Text
              className="mt-4 font-sans-medium text-3xl text-ink"
              style={{ letterSpacing: -0.5 }}
            >
              What&apos;s your weight?
            </Text>
            <Text className="mt-3 font-sans text-base leading-6 text-muted">
              Used only to personalize your hydration target.
            </Text>
            <MeasurementSelector
              value={weight}
              onChange={setWeight}
              min={35}
              max={200}
              unit="kg"
            />
          </View>
        ) : null}

        {step === "custom" ? (
          <View className="flex-1 pt-10">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Custom target
            </Text>
            <Text
              className="mt-4 font-sans-medium text-3xl text-ink"
              style={{ letterSpacing: -0.5 }}
            >
              Set your daily amount
            </Text>
            <MeasurementSelector
              value={customGoal}
              onChange={setCustomGoal}
              min={500}
              max={5000}
              step={50}
              unit="ml"
            />
          </View>
        ) : null}

        {step === "activity" ? (
          <View className="flex-1 pt-10">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Movement
            </Text>
            <Text
              className="mt-4 font-sans-medium text-3xl text-ink"
              style={{ letterSpacing: -0.5 }}
            >
              How active are you?
            </Text>
            <Text className="mt-3 font-sans text-base leading-6 text-muted">
              Activity changes how much fluid you typically need.
            </Text>
            <View className="mt-8">
              {ACTIVITY_OPTIONS.map((option) => (
                <SelectionOption
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  selected={activityLevel === option.value}
                  onPress={() => setActivityLevel(option.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {step === "climate" ? (
          <View className="flex-1 pt-10">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Environment
            </Text>
            <Text
              className="mt-4 font-sans-medium text-3xl text-ink"
              style={{ letterSpacing: -0.5 }}
            >
              What&apos;s your usual climate?
            </Text>
            <Text className="mt-3 font-sans text-base leading-6 text-muted">
              Heat and humidity gently raise hydration needs.
            </Text>
            <View className="mt-8">
              {CLIMATE_OPTIONS.map((option) => (
                <SelectionOption
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  selected={climate === option.value}
                  onPress={() => setClimate(option.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {step === "prefs" ? (
          <View className="flex-1 pt-10">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Preferences
            </Text>
            <Text
              className="mt-4 font-sans-medium text-3xl text-ink"
              style={{ letterSpacing: -0.5 }}
            >
              Units and reminders
            </Text>
            <Text className="mt-3 font-sans text-base leading-6 text-muted">
              Quiet defaults you can change later.
            </Text>

            <Text className="mb-3 mt-10 font-sans-medium text-xs uppercase tracking-widest text-muted">
              Units
            </Text>
            <SegmentedControl
              options={[
                { label: "Milliliters", value: "ml" },
                { label: "Ounces", value: "oz" },
              ]}
              value={unit}
              onChange={setUnit}
            />

            <Text className="mb-3 mt-10 font-sans-medium text-xs uppercase tracking-widest text-muted">
              Reminders
            </Text>
            <SelectionOption
              title="Every 2 hours"
              description="A calm cadence for most days"
              selected={reminderFrequency === "every_2_hours"}
              onPress={() => setReminderFrequency("every_2_hours")}
            />
            <SelectionOption
              title="Every 3 hours"
              description="Fewer, quieter nudges"
              selected={reminderFrequency === "every_3_hours"}
              onPress={() => setReminderFrequency("every_3_hours")}
            />
            <SelectionOption
              title="Hourly"
              description="More frequent check-ins"
              selected={reminderFrequency === "hourly"}
              onPress={() => setReminderFrequency("hourly")}
            />
            <SelectionOption
              title="Not now"
              description="You can enable reminders later"
              selected={reminderFrequency === "never"}
              onPress={() => setReminderFrequency("never")}
            />
          </View>
        ) : null}

        {step === "reveal" ? (
          <View className="flex-1 items-center pt-10">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
              Your hydration profile
            </Text>
            <View className="mt-10">
              <LiquidMeter progress={0.72} width={148} height={250} />
            </View>
            <Metric
              value={formatLiters(computedGoal)}
              size="large"
              className="mt-10"
            />
            <Text className="mt-2 font-sans text-base text-muted">
              L daily target
            </Text>

            <View className="mt-12 w-full">
              {goalStyle === "smart" ? (
                <>
                  <RevealRow label="Weight" value={`${weight} kg`} />
                  <RevealRow
                    label="Activity"
                    value={
                      ACTIVITY_OPTIONS.find((o) => o.value === activityLevel)
                        ?.title ?? activityLevel
                    }
                  />
                  <RevealRow
                    label="Environment"
                    value={
                      CLIMATE_OPTIONS.find((o) => o.value === climate)?.title ??
                      climate
                    }
                  />
                </>
              ) : null}
              {goalStyle === "simple" ? (
                <RevealRow label="Approach" value="Simple starting point" />
              ) : null}
              {goalStyle === "custom" ? (
                <RevealRow label="Approach" value="Custom target" />
              ) : null}
              <RevealRow
                label="Confidence"
                value={
                  goalStyle === "smart"
                    ? "Based on your profile"
                    : "Ready to refine over time"
                }
              />
            </View>
          </View>
        ) : null}

        {step === "ready" ? (
          <View className="flex-1 justify-center pt-10">
            <Text
              className="font-sans-medium text-5xl text-ink"
              style={{ letterSpacing: -1.2 }}
            >
              You&apos;re ready.
            </Text>
            <Text className="mt-5 max-w-sm font-sans text-base leading-6 text-muted">
              Log what you drink when it&apos;s convenient. Hydroly will keep
              the rest quietly in view.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View className="px-8 pb-4 pt-2">
        {step === "prefs" ? (
          <Button title="Continue" onPress={handlePrefsContinue} />
        ) : null}
        {step === "ready" ? (
          <Button
            title="Enter Hydroly"
            loading={saving}
            onPress={handleFinish}
          />
        ) : null}
        {step !== "prefs" && step !== "ready" ? (
          <Button title="Continue" onPress={goNext} />
        ) : null}
      </View>
    </View>
  );
}

function RevealRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border-light py-4">
      <Text className="font-sans text-base text-muted">{label}</Text>
      <Text className="font-sans-medium text-base text-ink">{value}</Text>
    </View>
  );
}
