import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useWater } from '@/contexts/WaterContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Droplet, TrendingUp, Award, Bell, ArrowRight } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: typeof Droplet;
  color: string;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    title: 'Track Your Hydration',
    description: 'Log your daily water intake and build a healthy hydration habit that lasts.',
    icon: Droplet,
    color: '#0EA5E9',
    gradient: ['#E0F2FE', '#BAE6FD'],
  },
  {
    title: 'Smart Reminders',
    description: 'Get timely notifications throughout the day to keep you hydrated and energized.',
    icon: Bell,
    color: '#8B5CF6',
    gradient: ['#EDE9FE', '#DDD6FE'],
  },
  {
    title: 'Monitor Progress',
    description: 'Visualize your hydration trends with detailed stats and beautiful insights.',
    icon: TrendingUp,
    color: '#10B981',
    gradient: ['#D1FAE5', '#A7F3D0'],
  },
  {
    title: 'Achieve Your Goals',
    description: 'Build streaks, earn achievements, and become the healthiest version of yourself.',
    icon: Award,
    color: '#F59E0B',
    gradient: ['#FEF3C7', '#FDE68A'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useWater();
  const { profile } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const iconBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.spring(iconBounceAnim, {
          toValue: 1.1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(iconBounceAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [iconRotateAnim, iconBounceAnim]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(currentIndex + 1);
        Animated.parallel([
          Animated.spring(fadeAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleSkip = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      if (!profile.hasCompletedGoalsOnboarding) {
        router.replace('/onboarding-goals');
      } else {
        await completeOnboarding();
        router.replace('/(tabs)');
      }
    });
  };

  const handleGetStarted = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      if (!profile.hasCompletedGoalsOnboarding) {
        router.replace('/onboarding-goals');
      } else {
        await completeOnboarding();
        router.replace('/(tabs)');
      }
    });
  };

  const currentSlide = slides[currentIndex];
  const Icon = currentSlide.icon;

  const iconRotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.gradient[0] }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.header}>
          {currentIndex < slides.length - 1 && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.iconCircle,
              {
                backgroundColor: currentSlide.gradient[1],
                transform: [
                  { rotate: iconRotate },
                  { scale: iconBounceAnim },
                ],
              },
            ]}
          >
            <Icon size={80} color={currentSlide.color} strokeWidth={2.5} />
          </Animated.View>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: currentSlide.color }]}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
                index === currentIndex && { backgroundColor: currentSlide.color },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentIndex < slides.length - 1 ? (
            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: currentSlide.color },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.getStartedButton,
                { backgroundColor: currentSlide.color },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 32,
    borderRadius: 5,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  getStartedButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
