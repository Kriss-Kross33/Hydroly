import { StyleSheet, Text, View, ScrollView, Pressable, Switch, TextInput } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useWater } from '@/contexts/WaterContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRouter } from 'expo-router';
import { Crown, User, Settings as SettingsIcon, Bell, Shield, Info } from 'lucide-react-native';
export default function SettingsScreen() {
  const { settings, profile, privacy, updateSettings, updateProfile, updatePrivacy } = useSettings();
  const { updateGoal, dailyGoal } = useWater();
  const { isPremium, subscription, isOnTrial, getTrialDaysRemaining, getDaysRemaining } = useSubscription();
  const router = useRouter();

  const handleGoalChange = (value: string) => {
    const numValue = parseInt(value) || 2000;
    if (numValue >= 500 && numValue <= 10000) {
      updateGoal(numValue);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isPremium && (
        <Pressable 
          style={styles.premiumCard}
          onPress={() => router.push('/paywall')}
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
              {subscription.tier === 'pro' ? 'Pro' : 'Pro Plus'} Member
            </Text>
            <Text style={styles.premiumSubtitle}>
              {isOnTrial && getTrialDaysRemaining() !== null
                ? `Trial: ${getTrialDaysRemaining()} days remaining`
                : subscription.period === 'lifetime'
                ? 'Lifetime access'
                : `${getDaysRemaining()} days until renewal`}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={20} color="#0EA5E9" />
          <Text style={styles.sectionTitle}>Profile</Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Age</Text>
            <TextInput
              style={styles.input}
              value={String(profile.age)}
              onChangeText={(value) => updateProfile({ age: parseInt(value) || 30 })}
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
              onChangeText={(value) => updateProfile({ weight: parseInt(value) || 70 })}
              keyboardType="numeric"
              placeholder="70"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              {(['male', 'female', 'other'] as const).map((gender) => (
                <Pressable
                  key={gender}
                  style={[
                    styles.genderButton,
                    profile.gender === gender && styles.genderButtonActive,
                  ]}
                  onPress={() => updateProfile({ gender })}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      profile.gender === gender && styles.genderButtonTextActive,
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
              {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const).map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.activityButton,
                    profile.activityLevel === level && styles.activityButtonActive,
                  ]}
                  onPress={() => updateProfile({ activityLevel: level })}
                >
                  <Text
                    style={[
                      styles.activityButtonText,
                      profile.activityLevel === level && styles.activityButtonTextActive,
                    ]}
                  >
                    {level.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
                {isPremium ? 'Calculate goal based on profile' : '🔒 Premium Feature'}
              </Text>
            </View>
            <Switch
              value={profile.useSmartGoal && isPremium}
              onValueChange={(value) => {
                if (isPremium) {
                  updateProfile({ useSmartGoal: value });
                }
              }}
              disabled={!isPremium}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SettingsIcon size={20} color="#0EA5E9" />
          <Text style={styles.sectionTitle}>General Settings</Text>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Daily Goal (ml)</Text>
            <TextInput
              style={styles.input}
              value={String(dailyGoal.goal)}
              onChangeText={handleGoalChange}
              keyboardType="numeric"
              placeholder="2500"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Unit</Text>
              <Text style={styles.settingDescription}>Display measurements in ml or oz</Text>
            </View>
            <View style={styles.unitButtons}>
              <Pressable
                style={[styles.unitButton, settings.unit === 'ml' && styles.unitButtonActive]}
                onPress={() => updateSettings({ unit: 'ml' })}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    settings.unit === 'ml' && styles.unitButtonTextActive,
                  ]}
                >
                  ml
                </Text>
              </Pressable>
              <Pressable
                style={[styles.unitButton, settings.unit === 'oz' && styles.unitButtonActive]}
                onPress={() => updateSettings({ unit: 'oz' })}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    settings.unit === 'oz' && styles.unitButtonTextActive,
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
              onValueChange={(value) => updateSettings({ darkMode: value })}
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
              onValueChange={(value) => updateSettings({ reminderSound: value })}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={settings.reminderVibration}
              onValueChange={(value) => updateSettings({ reminderVibration: value })}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Adaptive Reminders</Text>
              <Text style={styles.settingDescription}>
                {isPremium ? 'Smart reminder timing' : '🔒 Premium Feature'}
              </Text>
            </View>
            <Switch
              value={settings.adaptiveReminders && isPremium}
              onValueChange={(value) => {
                if (isPremium) {
                  updateSettings({ adaptiveReminders: value });
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
                {isPremium ? 'Sync data across devices' : '🔒 Premium Feature'}
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
              <Text style={styles.settingDescription}>Help improve the app</Text>
            </View>
            <Switch
              value={privacy.dataCollection}
              onValueChange={(value) => updatePrivacy({ dataCollection: value })}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Info size={16} color="#94A3B8" />
        <Text style={styles.footerText}>Water Tracker v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
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
    fontWeight: '700' as const,
    color: '#92400E',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#92400E',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0C4A6E',
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 60,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0C4A6E',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0F2FE',
    marginHorizontal: 16,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0C4A6E',
    minWidth: 80,
    textAlign: 'right',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  genderButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  activityButtons: {
    flexDirection: 'column',
    gap: 8,
    width: '50%',
  },
  activityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  activityButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  activityButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748B',
    textAlign: 'center',
  },
  activityButtonTextActive: {
    color: '#FFFFFF',
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  unitButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  premiumActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});
