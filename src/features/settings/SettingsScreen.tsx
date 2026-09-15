import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSettings } from "@/contexts/SettingsContext";
import { useWater } from "@/contexts/WaterContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useHydrationGoal } from "@/src/hooks/useHydrationGoal";
import { useProfileSettingsSync } from "@/src/hooks/useProfileSettingsSync";
import { LoginSection } from "./components/LoginSection";
import {
  Button,
  ListRow,
  SectionHeader,
  SelectionOption,
  Sheet,
} from "@/src/components/ui";
import { colors } from "@/src/design-system";
import { ReminderFrequency } from "@/types/user";
import { RootStackParamList } from "@/types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FREQUENCY_OPTIONS: {
  value: ReminderFrequency;
  title: string;
  description: string;
}[] = [
  {
    value: "hourly",
    title: "Hourly",
    description: "Gentle check-ins each hour",
  },
  {
    value: "every_2_hours",
    title: "Every 2 hours",
    description: "A calm default cadence",
  },
  {
    value: "every_3_hours",
    title: "Every 3 hours",
    description: "Fewer reminders across the day",
  },
  {
    value: "never",
    title: "Off",
    description: "No scheduled reminders",
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    settings,
    profile,
    privacy,
    updateSettings,
    updateProfile,
    updatePrivacy,
  } = useSettings();
  const { updateGoal, dailyGoal } = useWater();
  const {
    isPremium,
    features,
    isOnTrial,
    getTrialDaysRemaining,
    subscription,
  } = useSubscription();
  const { validateGoal, calculateSmartGoal } = useHydrationGoal(
    dailyGoal,
    profile,
    settings
  );
  const { validateProfile, validateSettings } = useProfileSettingsSync(
    profile,
    settings,
    subscription
  );

  const [goalDraft, setGoalDraft] = useState(String(dailyGoal.goal));
  const [weightDraft, setWeightDraft] = useState(String(profile.weight));
  const [showFrequencySheet, setShowFrequencySheet] = useState(false);

  function handleGoalChange(value: string) {
    setGoalDraft(value);
    const numValue = parseInt(value, 10) || 2000;
    const validation = validateGoal(numValue);
    if (validation.valid) {
      updateGoal(numValue);
    }
  }

  function handleWeightBlur() {
    const weight = parseFloat(weightDraft) || profile.weight;
    const validation = validateProfile({ weight });
    if (validation.valid) {
      updateProfile({ weight });
    } else {
      Alert.alert("Invalid weight", validation.errors.join("\n"));
      setWeightDraft(String(profile.weight));
    }
  }

  function handleSettingsUpdate(updates: Partial<typeof settings>) {
    const validation = validateSettings(updates);
    if (validation.valid) {
      updateSettings(updates);
    } else {
      Alert.alert("Invalid settings", validation.errors.join("\n"));
    }
  }

  function recalculateSmartGoal() {
    if (!calculateSmartGoal) return;
    const result = calculateSmartGoal();
    updateGoal(result.goal);
    setGoalDraft(String(result.goal));
    updateProfile({ useSmartGoal: true });
  }

  const frequencyLabel =
    FREQUENCY_OPTIONS.find((o) => o.value === settings.reminderFrequency)
      ?.title ?? "Every 2 hours";

  return (
    <View
      className="flex-1 bg-background-primary"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-8 pt-6">
          <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
            Settings
          </Text>
          <Text
            className="mt-3 font-sans-medium text-3xl text-ink"
            style={{ letterSpacing: -0.5 }}
          >
            Preferences
          </Text>

          {!isPremium ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("Paywall")}
              className="mt-8 rounded-md bg-mist px-5 py-5 active:opacity-80"
            >
              <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
                Hydroly Pro
              </Text>
              <Text className="mt-2 font-sans-medium text-lg text-ink">
                A hydration routine that adapts with you
              </Text>
              <Text className="mt-1 font-sans text-sm text-muted">
                Deeper insights, flexible history, and more
              </Text>
            </Pressable>
          ) : (
            <View className="mt-8 rounded-md border border-border-light px-5 py-5">
              <Text className="font-sans-medium text-base text-ink">
                Hydroly Pro active
              </Text>
              <Text className="mt-1 font-sans text-sm text-muted">
                {isOnTrial
                  ? `${getTrialDaysRemaining() ?? 0} days left in trial`
                  : "Thank you for supporting Hydroly"}
              </Text>
            </View>
          )}

          <View className="mt-4">
            <LoginSection />
          </View>

          <SectionHeader title="Profile" />
          <View className="border-t border-border-light">
            <View className="flex-row items-center justify-between border-b border-border-light py-4">
              <Text className="font-sans text-base text-ink">Weight</Text>
              <TextInput
                value={weightDraft}
                onChangeText={setWeightDraft}
                onBlur={handleWeightBlur}
                keyboardType="decimal-pad"
                className="min-w-[80px] text-right font-sans text-base text-muted"
                accessibilityLabel="Weight in kilograms"
              />
            </View>
            <ListRow
              label="Activity"
              value={profile.activityLevel.replace("_", " ")}
            />
            <ListRow
              label="Climate"
              value={profile.climate ?? "moderate"}
            />
          </View>

          <SectionHeader title="Hydration" />
          <View className="border-t border-border-light">
            <View className="flex-row items-center justify-between border-b border-border-light py-4">
              <Text className="font-sans text-base text-ink">Daily goal</Text>
              <TextInput
                value={goalDraft}
                onChangeText={handleGoalChange}
                keyboardType="number-pad"
                className="min-w-[100px] text-right font-sans text-base text-muted"
                accessibilityLabel="Daily goal in milliliters"
              />
            </View>
            <ListRow
              label="Personal target"
              value={profile.useSmartGoal ? "On" : "Off"}
              rightElement={
                <Switch
                  value={profile.useSmartGoal}
                  onValueChange={(value) => {
                    updateProfile({ useSmartGoal: value });
                    if (value) recalculateSmartGoal();
                  }}
                  trackColor={{ false: colors.border, true: colors.water }}
                  thumbColor={colors.surface}
                />
              }
            />
            {profile.useSmartGoal ? (
              <ListRow
                label="Recalculate target"
                showChevron
                onPress={recalculateSmartGoal}
              />
            ) : null}
            <ListRow
              label="Units"
              value={settings.unit.toUpperCase()}
              onPress={() =>
                handleSettingsUpdate({
                  unit: settings.unit === "ml" ? "oz" : "ml",
                })
              }
              showChevron
            />
            {features.recoveryMode ? (
              <ListRow
                label="Recovery mode"
                value={settings.recoveryMode ? "On" : "Off"}
                rightElement={
                  <Switch
                    value={settings.recoveryMode}
                    onValueChange={(value) =>
                      handleSettingsUpdate({ recoveryMode: value })
                    }
                    trackColor={{ false: colors.border, true: colors.water }}
                    thumbColor={colors.surface}
                  />
                }
              />
            ) : null}
          </View>

          <SectionHeader title="Reminders" />
          <View className="border-t border-border-light">
            <ListRow
              label="Frequency"
              value={frequencyLabel}
              showChevron
              onPress={() => setShowFrequencySheet(true)}
            />
            <ListRow
              label="Sound"
              rightElement={
                <Switch
                  value={settings.reminderSound}
                  onValueChange={(value) =>
                    handleSettingsUpdate({ reminderSound: value })
                  }
                  trackColor={{ false: colors.border, true: colors.water }}
                  thumbColor={colors.surface}
                />
              }
            />
            <ListRow
              label="Vibration"
              rightElement={
                <Switch
                  value={settings.reminderVibration}
                  onValueChange={(value) =>
                    handleSettingsUpdate({ reminderVibration: value })
                  }
                  trackColor={{ false: colors.border, true: colors.water }}
                  thumbColor={colors.surface}
                />
              }
            />
          </View>

          <SectionHeader title="Appearance" />
          <View className="border-t border-border-light">
            <ListRow label="Dark mode" value="Coming soon" />
          </View>

          <SectionHeader title="Subscription" />
          <View className="border-t border-border-light">
            <ListRow
              label="Manage subscription"
              showChevron
              onPress={() => navigation.navigate("ManageSubscription")}
            />
            {!isPremium ? (
              <ListRow
                label="Upgrade to Pro"
                showChevron
                onPress={() => navigation.navigate("Paywall")}
              />
            ) : null}
          </View>

          <SectionHeader title="About" />
          <View className="border-t border-border-light">
            <ListRow
              label="Achievements"
              showChevron
              onPress={() => navigation.navigate("Achievements")}
            />
            <ListRow
              label="Data collection"
              rightElement={
                <Switch
                  value={privacy.dataCollection}
                  onValueChange={(value) =>
                    updatePrivacy({ dataCollection: value })
                  }
                  trackColor={{ false: colors.border, true: colors.water }}
                  thumbColor={colors.surface}
                />
              }
            />
            <ListRow label="Version" value="1.0.0" />
          </View>
        </View>
      </ScrollView>

      <Sheet
        visible={showFrequencySheet}
        onClose={() => setShowFrequencySheet(false)}
        title="Reminder frequency"
      >
        {FREQUENCY_OPTIONS.map((option) => (
          <SelectionOption
            key={option.value}
            title={option.title}
            description={option.description}
            selected={settings.reminderFrequency === option.value}
            onPress={() => {
              handleSettingsUpdate({ reminderFrequency: option.value });
              setShowFrequencySheet(false);
            }}
          />
        ))}
        <View className="mt-4">
          <Button
            title="Close"
            variant="secondary"
            onPress={() => setShowFrequencySheet(false)}
          />
        </View>
      </Sheet>
    </View>
  );
}
