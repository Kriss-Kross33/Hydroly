import { Text, View, Pressable, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWater } from "@/contexts/WaterContext";
import { useSettings } from "@/contexts/SettingsContext";
import { RootStackParamList } from "../../../RootStack";
import {
  Droplet,
  TrendingUp,
  Award,
  Bell,
  ArrowRight,
} from "lucide-react-native";
import { useState, useRef, useEffect } from "react";

interface OnboardingSlide {
  title: string;
  description: string;
  icon: typeof Droplet;
  color: string;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    title: "Track Your Hydration",
    description:
      "Log your daily water intake and build a healthy hydration habit that lasts.",
    icon: Droplet,
    color: "#0EA5E9",
    gradient: ["#E0F2FE", "#BAE6FD"],
  },
  {
    title: "Smart Reminders",
    description:
      "Get timely notifications throughout the day to keep you hydrated and energized.",
    icon: Bell,
    color: "#8B5CF6",
    gradient: ["#EDE9FE", "#DDD6FE"],
  },
  {
    title: "Monitor Progress",
    description:
      "Visualize your hydration trends with detailed stats and beautiful insights.",
    icon: TrendingUp,
    color: "#10B981",
    gradient: ["#D1FAE5", "#A7F3D0"],
  },
  {
    title: "Achieve Your Goals",
    description:
      "Build streaks, earn achievements, and become the healthiest version of yourself.",
    icon: Award,
    color: "#F59E0B",
    gradient: ["#FEF3C7", "#FDE68A"],
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
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
        navigation.navigate("OnboardingGoals");
      } else {
        await completeOnboarding();
        // RootStack will automatically show MainTabs when hasCompletedOnboarding changes
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
        navigation.navigate("OnboardingGoals");
      } else {
        await completeOnboarding();
        // RootStack will automatically show MainTabs when hasCompletedOnboarding changes
      }
    });
  };

  const currentSlide = slides[currentIndex];
  const Icon = currentSlide.icon;

  const iconRotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "15deg"],
  });

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: currentSlide.gradient[0] }}
    >
      <Animated.View
        className="flex-1 px-6 py-[60px]"
        style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
      >
        <View className="items-end mb-5">
          {currentIndex < slides.length - 1 && (
            <Pressable onPress={handleSkip} className="py-2 px-4">
              <Text className="text-base font-semibold text-slate-500">
                Skip
              </Text>
            </Pressable>
          )}
        </View>

        <View className="flex-1 items-center justify-center">
          <Animated.View
            className="w-[200px] h-[200px] rounded-full items-center justify-center"
            style={{
              backgroundColor: currentSlide.gradient[1],
              transform: [{ rotate: iconRotate }, { scale: iconBounceAnim }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Icon size={80} color={currentSlide.color} strokeWidth={2.5} />
          </Animated.View>
        </View>

        <View className="items-center mb-10">
          <Text
            className="text-[32px] font-extrabold text-center mb-4"
            style={{ color: currentSlide.color }}
          >
            {currentSlide.title}
          </Text>
          <Text className="text-lg text-slate-600 text-center leading-[26px] px-2">
            {currentSlide.description}
          </Text>
        </View>

        <View className="flex-row justify-center items-center gap-2 mb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`w-2.5 h-2.5 rounded-full ${
                index === currentIndex ? "w-8 rounded-[5px]" : "bg-slate-300"
              }`}
              style={
                index === currentIndex
                  ? { backgroundColor: currentSlide.color }
                  : undefined
              }
            />
          ))}
        </View>

        <View className="items-center">
          {currentIndex < slides.length - 1 ? (
            <Pressable
              className="flex-row items-center justify-center gap-2 py-[18px] px-12 rounded-2xl w-full max-w-[320px]"
              style={({ pressed }) => [
                {
                  borderWidth: 2,
                  borderColor: currentSlide.color,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: pressed ? 0.8 : 1,
                  transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                },
              ]}
              onPress={handleNext}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: currentSlide.color }}
              >
                Next
              </Text>
              <ArrowRight
                size={20}
                color={currentSlide.color}
                strokeWidth={2.5}
              />
            </Pressable>
          ) : (
            <Pressable
              className="py-[18px] px-12 rounded-2xl w-full max-w-[320px] items-center"
              style={({ pressed }) => [
                {
                  backgroundColor: currentSlide.color,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: pressed ? 0.8 : 1,
                  transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                },
              ]}
              onPress={handleGetStarted}
            >
              <Text className="text-lg font-bold text-[#F59E0B]">
                Get Started
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}
