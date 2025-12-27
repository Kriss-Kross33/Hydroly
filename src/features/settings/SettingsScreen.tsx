import {
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { useSettings } from "@/contexts/SettingsContext";
import { useWater } from "@/contexts/WaterContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../RootStack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Crown,
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Info,
  Sparkles,
  Target,
  Droplet,
  CreditCard,
} from "lucide-react-native";
import { useHydrationGoal } from "@/src/hooks/useHydrationGoal";
import { useProfileSettingsSync } from "@/src/hooks/useProfileSettingsSync";
import { LoginSection } from "./components/LoginSection";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
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
    subscription,
    isOnTrial,
    getTrialDaysRemaining,
    getDaysRemaining,
  } = useSubscription();
  const navigation = useNavigation<NavigationProp>();

  // Use the hydration goal hook for goal management
  const {
    currentGoal,
    smartGoalCalculation,
    validateGoal,
    needsRecalculation,
    calculateSmartGoal,
  } = useHydrationGoal(dailyGoal, profile, settings);

  // Use the profile settings sync hook for profile/settings management
  const {
    profileCompletion,
    settingsDisplay,
    recommendedSettings,
    validateProfile,
    validateSettings,
  } = useProfileSettingsSync(profile, settings, subscription);

  const handleGoalChange = (value: string) => {
    const numValue = parseInt(value) || 2000;
    const validation = validateGoal(numValue);
    if (validation.valid) {
      updateGoal(numValue);
    } else {
      Alert.alert("Invalid Goal", validation.errors.join("\n"));
    }
  };

  const handleProfileUpdate = (updates: Partial<typeof profile>) => {
    const validation = validateProfile(updates);
    if (validation.valid) {
      updateProfile(updates);
    } else {
      Alert.alert("Invalid Profile Data", validation.errors.join("\n"));
    }
  };

  const handleSettingsUpdate = (updates: Partial<typeof settings>) => {
    const validation = validateSettings(updates);
    if (validation.valid) {
      updateSettings(updates);
    } else {
      Alert.alert("Invalid Settings", validation.errors.join("\n"));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sky-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {!isPremium && (
          <Pressable
            className="flex-row items-center gap-4 bg-amber-100 rounded-2xl p-5 mb-6 shadow-sm"
            onPress={() => navigation.navigate("Paywall")}
          >
            <Crown size={32} color="#F59E0B" fill="#F59E0B" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-amber-900 mb-1">
                Upgrade to Pro
              </Text>
              <Text className="text-sm text-amber-800">
                Unlock smart hydration engine, advanced reports, and more
              </Text>
            </View>
          </Pressable>
        )}

        {isPremium && (
          <View className="flex-row items-center gap-4 bg-emerald-100 rounded-2xl p-5 mb-6 shadow-sm">
            <Crown size={32} color="#F59E0B" fill="#F59E0B" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-emerald-900 mb-1">
                {subscription.tier === "pro" ? "Pro" : "Pro Plus"} Member
              </Text>
              <Text className="text-sm text-emerald-800">
                {isOnTrial && getTrialDaysRemaining() !== null
                  ? `Trial: ${getTrialDaysRemaining()} days remaining`
                  : subscription.period === "lifetime"
                    ? "Lifetime access"
                    : `${getDaysRemaining()} days until renewal`}
              </Text>
            </View>
          </View>
        )}

        {/* Login Section - Optional, value-driven */}
        <LoginSection />

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <User size={20} color="#0EA5E9" />
            <Text className="text-lg font-bold text-slate-800">Profile</Text>
            {profileCompletion < 100 && (
              <Text className="text-xs text-slate-500 ml-2">
                {profileCompletion}% complete
              </Text>
            )}
          </View>

          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <Text className="text-base font-semibold text-slate-800">
                Age
              </Text>
              <TextInput
                className="bg-slate-100 rounded-lg px-3 py-2 text-base font-semibold text-slate-800 min-w-[80px] text-right"
                value={String(profile.age)}
                onChangeText={(value) => {
                  const age = parseInt(value);
                  if (!isNaN(age)) {
                    handleProfileUpdate({ age });
                  }
                }}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <Text className="text-base font-semibold text-slate-800">
                Weight (kg)
              </Text>
              <TextInput
                className="bg-slate-100 rounded-lg px-3 py-2 text-base font-semibold text-slate-800 min-w-[80px] text-right"
                value={String(profile.weight)}
                onChangeText={(value) => {
                  const weight = parseFloat(value);
                  if (!isNaN(weight)) {
                    handleProfileUpdate({ weight });
                  }
                }}
                keyboardType="numeric"
                placeholder="70"
              />
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <Text className="text-base font-semibold text-slate-800">
                Gender
              </Text>
              <View className="flex-row gap-2">
                {(["male", "female", "other"] as const).map((gender) => (
                  <Pressable
                    key={gender}
                    className={`px-4 py-2 rounded-lg ${
                      profile.gender === gender ? "bg-sky-500" : "bg-slate-100"
                    }`}
                    onPress={() => handleProfileUpdate({ gender })}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        profile.gender === gender
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="p-4 min-h-[60px]">
              <Text className="text-base font-semibold text-slate-800 mb-3">
                Activity Level
              </Text>
              <View className="flex-col gap-2 w-1/2">
                {(
                  [
                    "sedentary",
                    "light",
                    "moderate",
                    "active",
                    "very_active",
                  ] as const
                ).map((level) => (
                  <Pressable
                    key={level}
                    className={`px-3 py-2 rounded-lg ${
                      profile.activityLevel === level
                        ? "bg-sky-500"
                        : "bg-slate-100"
                    }`}
                    onPress={() =>
                      handleProfileUpdate({ activityLevel: level })
                    }
                  >
                    <Text
                      className={`text-xs font-semibold text-center ${
                        profile.activityLevel === level
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {level
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  Smart Goal Calculation
                </Text>
                <Text className="text-xs text-slate-500">
                  Calculate goal based on your profile, activity, and climate
                </Text>
              </View>
              <Switch
                value={profile.useSmartGoal}
                onValueChange={(value) => {
                  handleProfileUpdate({ useSmartGoal: value });
                }}
              />
            </View>
          </View>
        </View>

        {/* Recommended Settings Section */}
        {Object.keys(recommendedSettings).length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Info size={20} color="#F59E0B" />
              <Text className="text-lg font-bold text-slate-800">
                Recommended Settings
              </Text>
            </View>
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm p-4">
              <Text className="text-xs text-slate-500 mb-3">
                Based on your profile, we recommend these settings:
              </Text>
              {recommendedSettings.reminderFrequency && (
                <View className="flex-row items-center justify-between p-4 min-h-[60px]">
                  <Text className="text-base font-semibold text-slate-800">
                    Reminder Frequency: {settingsDisplay.frequency}
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSettingsUpdate({
                        reminderFrequency:
                          recommendedSettings.reminderFrequency,
                      })
                    }
                  >
                    <Text className="text-sky-500 font-semibold">Apply</Text>
                  </Pressable>
                </View>
              )}
              {recommendedSettings.climateSensitivity && (
                <View className="flex-row items-center justify-between p-4 min-h-[60px]">
                  <Text className="text-base font-semibold text-slate-800">
                    Enable Climate Sensitivity
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSettingsUpdate({
                        climateSensitivity: true,
                      })
                    }
                  >
                    <Text className="text-sky-500 font-semibold">Enable</Text>
                  </Pressable>
                </View>
              )}
              {recommendedSettings.adaptiveReminders && (
                <View className="flex-row items-center justify-between p-4 min-h-[60px]">
                  <Text className="text-base font-semibold text-slate-800">
                    Enable Adaptive Reminders
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSettingsUpdate({
                        adaptiveReminders: true,
                      })
                    }
                  >
                    <Text className="text-sky-500 font-semibold">Enable</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <SettingsIcon size={20} color="#0EA5E9" />
            <Text className="text-lg font-bold text-slate-800">
              General Settings
            </Text>
          </View>

          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-base font-semibold text-slate-800">
                    Daily Goal (ml)
                  </Text>
                  {currentGoal.style === "smart" && (
                    <Sparkles size={16} color="#0EA5E9" />
                  )}
                  {currentGoal.style === "simple" && (
                    <Droplet size={16} color="#64748B" />
                  )}
                  {currentGoal.style === "custom" && (
                    <Target size={16} color="#64748B" />
                  )}
                </View>
                {needsRecalculation && currentGoal.style === "smart" && (
                  <Text className="text-xs text-amber-600 mt-1">
                    ⚠️ Your profile changed. Recalculate your smart goal?
                  </Text>
                )}
                {smartGoalCalculation && currentGoal.style === "smart" && (
                  <Text className="text-xs text-slate-500 mt-1">
                    Personalized: {smartGoalCalculation.goal}ml
                  </Text>
                )}
              </View>
              <TextInput
                className="bg-slate-100 rounded-lg px-3 py-2 text-base font-semibold text-slate-800 min-w-[80px] text-right"
                value={String(dailyGoal.goal)}
                onChangeText={handleGoalChange}
                keyboardType="numeric"
                placeholder="2500"
              />
            </View>
            {needsRecalculation &&
              currentGoal.style === "smart" &&
              calculateSmartGoal && (
                <>
                  <View className="h-px bg-sky-100 mx-4" />
                  <Pressable
                    className="flex-row items-center justify-between p-4 min-h-[60px]"
                    onPress={() => {
                      const calculated = calculateSmartGoal();
                      updateGoal(calculated.goal);
                    }}
                  >
                    <Text className="text-base font-semibold text-sky-500">
                      Recalculate Smart Goal
                    </Text>
                  </Pressable>
                </>
              )}

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  Unit
                </Text>
                <Text className="text-xs text-slate-500">
                  Display measurements in ml or oz
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  className={`px-5 py-2 rounded-lg ${
                    settings.unit === "ml" ? "bg-sky-500" : "bg-slate-100"
                  }`}
                  onPress={() => handleSettingsUpdate({ unit: "ml" })}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      settings.unit === "ml" ? "text-white" : "text-slate-500"
                    }`}
                  >
                    ml
                  </Text>
                </Pressable>
                <Pressable
                  className={`px-5 py-2 rounded-lg ${
                    settings.unit === "oz" ? "bg-sky-500" : "bg-slate-100"
                  }`}
                  onPress={() => handleSettingsUpdate({ unit: "oz" })}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      settings.unit === "oz" ? "text-white" : "text-slate-500"
                    }`}
                  >
                    oz
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  Dark Mode
                </Text>
                <Text className="text-xs text-slate-500">Coming soon</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) =>
                  handleSettingsUpdate({ darkMode: value })
                }
                disabled
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Bell size={20} color="#0EA5E9" />
            <Text className="text-lg font-bold text-slate-800">Reminders</Text>
          </View>

          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <Text className="text-base font-semibold text-slate-800">
                Reminder Sound
              </Text>
              <Switch
                value={settings.reminderSound}
                onValueChange={(value) =>
                  handleSettingsUpdate({ reminderSound: value })
                }
              />
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <Text className="text-base font-semibold text-slate-800">
                Vibration
              </Text>
              <Switch
                value={settings.reminderVibration}
                onValueChange={(value) =>
                  handleSettingsUpdate({ reminderVibration: value })
                }
              />
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  Adaptive Reminders
                </Text>
                <Text className="text-xs text-slate-500">
                  {isPremium ? "Smart reminder timing" : "🔒 Premium Feature"}
                </Text>
              </View>
              <Switch
                value={settings.adaptiveReminders && isPremium}
                onValueChange={(value) => {
                  if (isPremium) {
                    handleSettingsUpdate({ adaptiveReminders: value });
                  }
                }}
                disabled={!isPremium}
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Shield size={20} color="#0EA5E9" />
            <Text className="text-lg font-bold text-slate-800">Privacy</Text>
          </View>

          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  Cloud Sync
                </Text>
                <Text className="text-xs text-slate-500">
                  {isPremium
                    ? "Sync data across devices"
                    : "🔒 Premium Feature"}
                </Text>
              </View>
              <Switch
                value={privacy.cloudSync && isPremium}
                onValueChange={(value) => {
                  if (isPremium) {
                    updatePrivacy({ cloudSync: value });
                  }
                }}
                disabled={!isPremium}
              />
            </View>

            <View className="h-px bg-sky-100 mx-4" />

            <View className="flex-row items-center justify-between p-4 min-h-[60px]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  Data Collection
                </Text>
                <Text className="text-xs text-slate-500">
                  Help improve the app
                </Text>
              </View>
              <Switch
                value={privacy.dataCollection}
                onValueChange={(value) =>
                  updatePrivacy({ dataCollection: value })
                }
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <CreditCard size={20} color="#0EA5E9" />
            <Text className="text-lg font-bold text-slate-800">
              Subscription
            </Text>
          </View>

          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <Pressable
              className="flex-row items-center justify-between p-4 min-h-[60px]"
              onPress={() => navigation.navigate("ManageSubscription")}
            >
              <View className="flex-1 mr-3">
                <Text className="text-base font-semibold text-slate-800 mb-1">
                  Manage Subscriptions
                </Text>
                <Text className="text-xs text-slate-500">
                  View subscription details, cancel, or resubscribe
                </Text>
              </View>
              <Text className="text-sky-500 font-semibold">{">"}</Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-2 py-5">
          <Info size={16} color="#94A3B8" />
          <Text className="text-sm text-slate-400">Water Tracker v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
