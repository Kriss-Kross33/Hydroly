import {
  StyleSheet,
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
    <SafeAreaView className="flex-1 bg-background-accent" edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {!isPremium && (
          <Pressable
            style={styles.premiumCard}
            onPress={() => navigation.navigate("Paywall")}
          >
            <Crown size={32} color="#F59E0B" fill="#F59E0B" />
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Upgrade to Pro</Text>
              <Text style={styles.premiumSubtitle}>
                Unlock smart hydration engine, advanced reports, and more
              </Text>
            </View>
          </Pressable>
        )}

        {isPremium && (
          <View style={styles.premiumActiveCard}>
            <Crown size={32} color="#F59E0B" fill="#F59E0B" />
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>
                {subscription.tier === "pro" ? "Pro" : "Pro Plus"} Member
              </Text>
              <Text style={styles.premiumSubtitle}>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Profile</Text>
            {profileCompletion < 100 && (
              <Text style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>
                {profileCompletion}% complete
              </Text>
            )}
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Age</Text>
              <TextInput
                style={styles.input}
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

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
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

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Gender</Text>
              <View style={styles.genderButtons}>
                {(["male", "female", "other"] as const).map((gender) => (
                  <Pressable
                    key={gender}
                    style={[
                      styles.genderButton,
                      profile.gender === gender && styles.genderButtonActive,
                    ]}
                    onPress={() => handleProfileUpdate({ gender })}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        profile.gender === gender &&
                          styles.genderButtonTextActive,
                      ]}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Activity Level</Text>
              <View style={styles.activityButtons}>
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
                    style={[
                      styles.activityButton,
                      profile.activityLevel === level &&
                        styles.activityButtonActive,
                    ]}
                    onPress={() =>
                      handleProfileUpdate({ activityLevel: level })
                    }
                  >
                    <Text
                      style={[
                        styles.activityButtonText,
                        profile.activityLevel === level &&
                          styles.activityButtonTextActive,
                      ]}
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

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Smart Goal Calculation</Text>
                <Text style={styles.settingDescription}>
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Recommended Settings</Text>
            </View>
            <View style={styles.settingCard}>
              <Text style={[styles.settingDescription, { marginBottom: 12 }]}>
                Based on your profile, we recommend these settings:
              </Text>
              {recommendedSettings.reminderFrequency && (
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>
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
                    <Text style={{ color: "#0EA5E9", fontWeight: "600" }}>
                      Apply
                    </Text>
                  </Pressable>
                </View>
              )}
              {recommendedSettings.climateSensitivity && (
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>
                    Enable Climate Sensitivity
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSettingsUpdate({
                        climateSensitivity: true,
                      })
                    }
                  >
                    <Text style={{ color: "#0EA5E9", fontWeight: "600" }}>
                      Enable
                    </Text>
                  </Pressable>
                </View>
              )}
              {recommendedSettings.adaptiveReminders && (
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>
                    Enable Adaptive Reminders
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSettingsUpdate({
                        adaptiveReminders: true,
                      })
                    }
                  >
                    <Text style={{ color: "#0EA5E9", fontWeight: "600" }}>
                      Enable
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SettingsIcon size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>General Settings</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <Text style={styles.settingLabel}>Daily Goal (ml)</Text>
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
                  <Text
                    style={{ fontSize: 12, color: "#F59E0B", marginTop: 4 }}
                  >
                    ⚠️ Your profile changed. Recalculate your smart goal?
                  </Text>
                )}
                {smartGoalCalculation && currentGoal.style === "smart" && (
                  <Text
                    style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}
                  >
                    Personalized: {smartGoalCalculation.goal}ml
                  </Text>
                )}
              </View>
              <TextInput
                style={styles.input}
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
                  <View style={styles.divider} />
                  <Pressable
                    style={styles.settingRow}
                    onPress={() => {
                      const calculated = calculateSmartGoal();
                      updateGoal(calculated.goal);
                    }}
                  >
                    <Text style={[styles.settingLabel, { color: "#0EA5E9" }]}>
                      Recalculate Smart Goal
                    </Text>
                  </Pressable>
                </>
              )}

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Unit</Text>
                <Text style={styles.settingDescription}>
                  Display measurements in ml or oz
                </Text>
              </View>
              <View style={styles.unitButtons}>
                <Pressable
                  style={[
                    styles.unitButton,
                    settings.unit === "ml" && styles.unitButtonActive,
                  ]}
                  onPress={() => handleSettingsUpdate({ unit: "ml" })}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      settings.unit === "ml" && styles.unitButtonTextActive,
                    ]}
                  >
                    ml
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.unitButton,
                    settings.unit === "oz" && styles.unitButtonActive,
                  ]}
                  onPress={() => handleSettingsUpdate({ unit: "oz" })}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      settings.unit === "oz" && styles.unitButtonTextActive,
                    ]}
                  >
                    oz
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Coming soon</Text>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Reminders</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Reminder Sound</Text>
              <Switch
                value={settings.reminderSound}
                onValueChange={(value) =>
                  handleSettingsUpdate({ reminderSound: value })
                }
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Switch
                value={settings.reminderVibration}
                onValueChange={(value) =>
                  handleSettingsUpdate({ reminderVibration: value })
                }
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Adaptive Reminders</Text>
                <Text style={styles.settingDescription}>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Privacy</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Cloud Sync</Text>
                <Text style={styles.settingDescription}>
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

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Data Collection</Text>
                <Text style={styles.settingDescription}>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Subscription</Text>
          </View>

          <View style={styles.settingCard}>
            <Pressable
              style={styles.settingRow}
              onPress={() => navigation.navigate("ManageSubscription")}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Manage Subscriptions</Text>
                <Text style={styles.settingDescription}>
                  View subscription details, cancel, or resubscribe
                </Text>
              </View>
              <Text style={{ color: "#0EA5E9", fontWeight: "600" }}>
                {">"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Info size={16} color="#94A3B8" />
          <Text style={styles.footerText}>Water Tracker v1.0.0</Text>
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
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#92400E",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0C4A6E",
  },
  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 60,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0F2FE",
    marginHorizontal: 16,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0C4A6E",
    minWidth: 80,
    textAlign: "right",
  },
  genderButtons: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  genderButtonActive: {
    backgroundColor: "#0EA5E9",
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#64748B",
  },
  genderButtonTextActive: {
    color: "#FFFFFF",
  },
  activityButtons: {
    flexDirection: "column",
    gap: 8,
    width: "50%",
  },
  activityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  activityButtonActive: {
    backgroundColor: "#0EA5E9",
  },
  activityButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#64748B",
    textAlign: "center",
  },
  activityButtonTextActive: {
    color: "#FFFFFF",
  },
  unitButtons: {
    flexDirection: "row",
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  unitButtonActive: {
    backgroundColor: "#0EA5E9",
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#64748B",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  premiumActiveCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});
