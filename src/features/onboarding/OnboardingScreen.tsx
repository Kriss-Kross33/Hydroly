import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWater } from "@/contexts/WaterContext";
import { useSettings } from "@/contexts/SettingsContext";
import { RootStackParamList } from "@/types/navigation";
import { Button } from "@/src/components/ui";
import { LiquidMeter } from "@/src/components/ui/LiquidMeter";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { completeOnboarding } = useWater();
  const { profile } = useSettings();

  async function handleGetStarted() {
    if (!profile.hasCompletedGoalsOnboarding) {
      navigation.navigate("OnboardingGoals");
      return;
    }
    await completeOnboarding();
  }

  return (
    <View
      className="flex-1 bg-background-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 px-8">
        <View className="mt-10">
          <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted">
            Hydroly
          </Text>
        </View>

        <View className="mt-14 flex-1 justify-center">
          <LiquidMeter progress={0.62} width={140} height={240} />

          <Text
            className="mt-12 font-sans-medium text-4xl text-ink"
            style={{ letterSpacing: -0.8, lineHeight: 44 }}
          >
            Hydration,{"\n"}made personal.
          </Text>

          <Text className="mt-5 max-w-sm font-sans text-base leading-6 text-muted">
            Hydroly learns your rhythm and helps you stay hydrated without
            getting in the way.
          </Text>
        </View>

        <View className="pb-6">
          <Button title="Get started" onPress={handleGetStarted} />
        </View>
      </View>
    </View>
  );
}
