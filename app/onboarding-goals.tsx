import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Switch, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import { useWater } from '@/contexts/WaterContext';
import { useState, useRef } from 'react';
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
  Check
} from 'lucide-react-native';
import { ActivityLevel, Gender } from '@/types/user';
import * as Notifications from 'expo-notifications';

type GoalStyle = 'simple' | 'smart' | 'custom';
type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56+' | 'prefer-not-say';

const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46-55', label: '46-55' },
  { value: '56+', label: '56+' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
];

export default function OnboardingGoalsScreen() {
  const router = useRouter();
  const { updateSettings, updateProfile } = useSettings();
  const { addWater, completeOnboarding } = useWater();
  
  const [step, setStep] = useState(0);
  const [goalStyle, setGoalStyle] = useState<GoalStyle>('simple');
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState<Gender>('other');
  const [ageRange, setAgeRange] = useState<AgeRange>('26-35');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [climate, setClimate] = useState<'cold' | 'moderate' | 'hot'>('moderate');
  const [reminderTimes, setReminderTimes] = useState({
    morning: true,
    afternoon: true,
    evening: true,
  });
  const [reminderFrequency, setReminderFrequency] = useState<'hourly' | 'every_2_hours' | 'every_3_hours'>('every_2_hours');
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
  const [startOfDay, setStartOfDay] = useState('06:00');
  const [customGoal, setCustomGoal] = useState('2500');
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
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
      setStep(step + 1);
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
      router.back();
      return;
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
      setStep(step - 1);
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
    
    updateProfile({
      weight: weightNum,
      gender,
      activityLevel,
      climate,
      useSmartGoal: goalStyle === 'smart',
      age: ageRange === 'prefer-not-say' ? 30 : parseInt(ageRange.split('-')[0]),
      hasCompletedGoalsOnboarding: true,
    });

    updateSettings({
      unit,
      startOfDayTime: startOfDay,
      reminderFrequency,
      climateSensitivity: goalStyle === 'smart',
    });

    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        Alert.alert('Success!', 'You will receive gentle hydration reminders throughout the day.');
      }
    } catch (error) {
      console.log('Notification permission error:', error);
    }
    handleNext();
  };

  const handleFirstDrink = () => {
    addWater(250, 'water');
    setTimeout(() => {
      Alert.alert(
        '🎉 Great start!',
        "You've logged your first glass! You're on your way to building a healthy hydration habit.",
        [{ text: 'Continue', onPress: handleNext }]
      );
    }, 300);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Sparkles size={64} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Let&apos;s build a simple hydration habit that fits your life</Text>
            <Text style={styles.stepDescription}>
              This will only take a minute. We&apos;ll personalize your experience to help you stay consistently hydrated.
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Target size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Choose Your Goal Style</Text>
            <Text style={styles.stepDescription}>How would you like us to calculate your daily hydration goal?</Text>
            
            <View style={styles.optionsContainer}>
              <Pressable
                style={[styles.optionCard, goalStyle === 'simple' && styles.optionCardActive]}
                onPress={() => setGoalStyle('simple')}
              >
                <View style={styles.optionHeader}>
                  <Droplet size={24} color={goalStyle === 'simple' ? '#0EA5E9' : '#64748B'} />
                  <Text style={[styles.optionTitle, goalStyle === 'simple' && styles.optionTitleActive]}>
                    Simple Goal
                  </Text>
                </View>
                <Text style={styles.optionDescription}>2.5L daily recommendation</Text>
                <Text style={styles.recommendedBadge}>Recommended</Text>
              </Pressable>

              <Pressable
                style={[styles.optionCard, goalStyle === 'smart' && styles.optionCardActive]}
                onPress={() => setGoalStyle('smart')}
              >
                <View style={styles.optionHeader}>
                  <Sparkles size={24} color={goalStyle === 'smart' ? '#0EA5E9' : '#64748B'} />
                  <Text style={[styles.optionTitle, goalStyle === 'smart' && styles.optionTitleActive]}>
                    Smart Goal
                  </Text>
                </View>
                <Text style={styles.optionDescription}>Personalized based on your profile</Text>
              </Pressable>

              <Pressable
                style={[styles.optionCard, goalStyle === 'custom' && styles.optionCardActive]}
                onPress={() => setGoalStyle('custom')}
              >
                <View style={styles.optionHeader}>
                  <Target size={24} color={goalStyle === 'custom' ? '#0EA5E9' : '#64748B'} />
                  <Text style={[styles.optionTitle, goalStyle === 'custom' && styles.optionTitleActive]}>
                    Custom Goal
                  </Text>
                </View>
                <Text style={styles.optionDescription}>Set your own daily target</Text>
              </Pressable>
            </View>

            {goalStyle === 'custom' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Daily Goal (ml)</Text>
                <TextInput
                  style={styles.input}
                  value={customGoal}
                  onChangeText={setCustomGoal}
                  keyboardType="numeric"
                  placeholder="2500"
                />
              </View>
            )}
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Weight size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Body Basics</Text>
            <Text style={styles.stepDescription}>
              {goalStyle === 'smart' ? 'Help us calculate your personalized hydration goal' : 'Optional but helps us provide better insights'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg) {goalStyle !== 'smart' && '(Optional)'}</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="70"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender (Optional)</Text>
              <View style={styles.segmentedControl}>
                {(['male', 'female', 'other'] as Gender[]).map((g) => (
                  <Pressable
                    key={g}
                    style={[styles.segment, gender === g && styles.segmentActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age Range (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageScroll}>
                {AGE_RANGES.map((age) => (
                  <Pressable
                    key={age.value}
                    style={[styles.ageButton, ageRange === age.value && styles.ageButtonActive]}
                    onPress={() => setAgeRange(age.value)}
                  >
                    <Text style={[styles.ageButtonText, ageRange === age.value && styles.ageButtonTextActive]}>
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
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Dumbbell size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Activity Level</Text>
            <Text style={styles.stepDescription}>This directly affects your daily water needs</Text>

            <View style={styles.activityContainer}>
              {[
                { value: 'sedentary' as ActivityLevel, icon: '🪑', label: 'Mostly Sedentary', desc: 'Desk job, minimal movement' },
                { value: 'light' as ActivityLevel, icon: '🚶', label: 'Light Activity', desc: 'Some walking, light exercise' },
                { value: 'moderate' as ActivityLevel, icon: '🏃', label: 'Active', desc: 'Regular exercise 3-4x/week' },
                { value: 'active' as ActivityLevel, icon: '🏋️', label: 'Very Active', desc: 'Daily intense workouts' },
              ].map((activity) => (
                <Pressable
                  key={activity.value}
                  style={[styles.activityCard, activityLevel === activity.value && styles.activityCardActive]}
                  onPress={() => setActivityLevel(activity.value)}
                >
                  <View style={styles.activityIcon}>
                    <Dumbbell size={24} color={activityLevel === activity.value ? '#0EA5E9' : '#64748B'} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityLabel, activityLevel === activity.value && styles.activityLabelActive]}>
                      {activity.label}
                    </Text>
                    <Text style={styles.activityDesc}>{activity.desc}</Text>
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
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Cloud size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Climate Awareness</Text>
            <Text style={styles.stepDescription}>Hotter days may increase your water needs</Text>

            <View style={styles.climateContainer}>
              {[
                { value: 'cold' as const, label: 'Cool Climate', desc: 'Generally cold weather' },
                { value: 'moderate' as const, label: 'Moderate Climate', desc: 'Comfortable temperatures' },
                { value: 'hot' as const, label: 'Hot Climate', desc: 'Usually hot weather' },
              ].map((c) => (
                <Pressable
                  key={c.value}
                  style={[styles.climateCard, climate === c.value && styles.climateCardActive]}
                  onPress={() => setClimate(c.value)}
                >
                  <Cloud size={32} color={climate === c.value ? '#0EA5E9' : '#64748B'} />
                  <Text style={[styles.climateLabel, climate === c.value && styles.climateLabelActive]}>
                    {c.label}
                  </Text>
                  <Text style={styles.climateDesc}>{c.desc}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Bell size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Reminder Setup</Text>
            <Text style={styles.stepDescription}>When should we remind you to hydrate?</Text>

            <View style={styles.reminderOptions}>
              <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>Morning (7 AM - 12 PM)</Text>
                <Switch
                  value={reminderTimes.morning}
                  onValueChange={(val) => setReminderTimes({ ...reminderTimes, morning: val })}
                  trackColor={{ false: '#CBD5E1', true: '#7DD3FC' }}
                  thumbColor={reminderTimes.morning ? '#0EA5E9' : '#F1F5F9'}
                />
              </View>
              <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>Afternoon (12 PM - 6 PM)</Text>
                <Switch
                  value={reminderTimes.afternoon}
                  onValueChange={(val) => setReminderTimes({ ...reminderTimes, afternoon: val })}
                  trackColor={{ false: '#CBD5E1', true: '#7DD3FC' }}
                  thumbColor={reminderTimes.afternoon ? '#0EA5E9' : '#F1F5F9'}
                />
              </View>
              <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>Evening (6 PM - 10 PM)</Text>
                <Switch
                  value={reminderTimes.evening}
                  onValueChange={(val) => setReminderTimes({ ...reminderTimes, evening: val })}
                  trackColor={{ false: '#CBD5E1', true: '#7DD3FC' }}
                  thumbColor={reminderTimes.evening ? '#0EA5E9' : '#F1F5F9'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reminder Frequency</Text>
              <View style={styles.segmentedControl}>
                <Pressable
                  style={[styles.segment, reminderFrequency === 'hourly' && styles.segmentActive]}
                  onPress={() => setReminderFrequency('hourly')}
                >
                  <Text style={[styles.segmentText, reminderFrequency === 'hourly' && styles.segmentTextActive]}>
                    Every 1hr
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, reminderFrequency === 'every_2_hours' && styles.segmentActive]}
                  onPress={() => setReminderFrequency('every_2_hours')}
                >
                  <Text style={[styles.segmentText, reminderFrequency === 'every_2_hours' && styles.segmentTextActive]}>
                    Every 2hrs
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, reminderFrequency === 'every_3_hours' && styles.segmentActive]}
                  onPress={() => setReminderFrequency('every_3_hours')}
                >
                  <Text style={[styles.segmentText, reminderFrequency === 'every_3_hours' && styles.segmentTextActive]}>
                    Every 3hrs
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Bell size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Enable Notifications</Text>
            <Text style={styles.stepDescription}>
              HydraTrack reminds you gently — never spam. Stay on track with timely hydration reminders throughout your day.
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitRow}>
                <Check size={20} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.benefitText}>Gentle, context-aware reminders</Text>
              </View>
              <View style={styles.benefitRow}>
                <Check size={20} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.benefitText}>Adapts to your drinking patterns</Text>
              </View>
              <View style={styles.benefitRow}>
                <Check size={20} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.benefitText}>Respects your quiet hours</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={requestNotificationPermission}
              >
                <Text style={styles.primaryButtonText}>Enable Reminders</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={handleNext}
              >
                <Text style={styles.secondaryButtonText}>Not Now</Text>
              </Pressable>
            </View>
          </Animated.View>
        );

      case 7:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Clock size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Units & Preferences</Text>
            <Text style={styles.stepDescription}>Customize your tracking preferences</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Measurement Unit</Text>
              <View style={styles.segmentedControl}>
                <Pressable
                  style={[styles.segment, unit === 'ml' && styles.segmentActive]}
                  onPress={() => setUnit('ml')}
                >
                  <Text style={[styles.segmentText, unit === 'ml' && styles.segmentTextActive]}>
                    Milliliters (ml)
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, unit === 'oz' && styles.segmentActive]}
                  onPress={() => setUnit('oz')}
                >
                  <Text style={[styles.segmentText, unit === 'oz' && styles.segmentTextActive]}>
                    Ounces (oz)
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start of Day</Text>
              <Text style={styles.inputHint}>When does your day typically start?</Text>
              <View style={styles.timeSelector}>
                {['05:00', '06:00', '07:00', '08:00', '09:00'].map((time) => (
                  <Pressable
                    key={time}
                    style={[styles.timeButton, startOfDay === time && styles.timeButtonActive]}
                    onPress={() => setStartOfDay(time)}
                  >
                    <Text style={[styles.timeButtonText, startOfDay === time && styles.timeButtonTextActive]}>
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
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.iconWrapper}>
              <Droplet size={56} color="#0EA5E9" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Log Your First Glass!</Text>
            <Text style={styles.stepDescription}>
              Let&apos;s start your hydration journey with your first entry. Tap below to log a glass of water.
            </Text>

            <View style={styles.firstDrinkContainer}>
              <Pressable
                style={({ pressed }) => [styles.firstDrinkButton, pressed && styles.buttonPressed]}
                onPress={handleFirstDrink}
              >
                <Droplet size={40} color="#FFFFFF" />
                <Text style={styles.firstDrinkButtonText}>Log 250ml</Text>
                <Text style={styles.firstDrinkButtonSubtext}>Your first glass</Text>
              </Pressable>
            </View>

            <Text style={styles.motivationText}>
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
        return goalStyle !== 'smart' || (weight !== '' && parseFloat(weight) > 0);
      case 3:
        return activityLevel !== null;
      default:
        return true;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#0C4A6E" />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((step + 1) / 9) * 100}%` }]} />
        </View>
        {step < 8 && (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 8 ? (
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              !canContinue() && styles.continueButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleNext}
            disabled={!canContinue()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
            onPress={handleComplete}
          >
            <Text style={styles.continueButtonText}>Complete Setup</Text>
            <Check size={20} color="#FFFFFF" strokeWidth={3} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0F2FE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 3,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepDescription: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  optionCardActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#64748B',
  },
  optionTitleActive: {
    color: '#0EA5E9',
  },
  optionDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 20,
  },
  recommendedBadge: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#10B981',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0C4A6E',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    borderWidth: 2,
    borderColor: '#E0F2FE',
    color: '#0C4A6E',
    fontWeight: '600' as const,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#0EA5E9',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  ageScroll: {
    marginTop: 8,
  },
  ageButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  ageButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  ageButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  ageButtonTextActive: {
    color: '#FFFFFF',
  },
  activityContainer: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  activityCardActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#64748B',
    marginBottom: 2,
  },
  activityLabelActive: {
    color: '#0EA5E9',
  },
  activityDesc: {
    fontSize: 14,
    color: '#64748B',
  },
  climateContainer: {
    gap: 12,
  },
  climateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  climateCardActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  climateLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#64748B',
    marginTop: 12,
    marginBottom: 4,
  },
  climateLabelActive: {
    color: '#0EA5E9',
  },
  climateDesc: {
    fontSize: 14,
    color: '#64748B',
  },
  reminderOptions: {
    gap: 16,
    marginBottom: 24,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0C4A6E',
  },
  benefitsList: {
    gap: 16,
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#0C4A6E',
    fontWeight: '500' as const,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0EA5E9',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  timeButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  timeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  timeButtonTextActive: {
    color: '#FFFFFF',
  },
  firstDrinkContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  firstDrinkButton: {
    backgroundColor: '#0EA5E9',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  firstDrinkButtonText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 12,
  },
  firstDrinkButtonSubtext: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#E0F2FE',
    marginTop: 4,
  },
  motivationText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0F2FE',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0EA5E9',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
