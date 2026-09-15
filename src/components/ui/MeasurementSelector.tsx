import React from "react";
import { Pressable, Text, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { colors } from "@/src/design-system";

interface MeasurementSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit: string;
  formatValue?: (value: number) => string;
}

export function MeasurementSelector({
  value,
  onChange,
  min = 30,
  max = 200,
  step = 1,
  unit,
  formatValue,
}: MeasurementSelectorProps) {
  function decrement() {
    onChange(Math.max(min, value - step));
  }

  function increment() {
    onChange(Math.min(max, value + step));
  }

  const display = formatValue ? formatValue(value) : String(value);

  return (
    <View className="items-center py-8">
      <View className="flex-row items-center gap-8">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${unit}`}
          onPress={decrement}
          className="h-12 w-12 items-center justify-center rounded-md bg-mist active:opacity-70"
        >
          <Minus size={22} color={colors.ink} strokeWidth={1.75} />
        </Pressable>

        <View className="min-w-[140px] items-center">
          <Text
            className="font-sans-medium text-6xl text-ink"
            style={{
              letterSpacing: -1.5,
              fontVariant: ["tabular-nums"],
            }}
          >
            {display}
          </Text>
          <Text className="mt-2 font-sans-medium text-xs uppercase tracking-widest text-muted">
            {unit}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${unit}`}
          onPress={increment}
          className="h-12 w-12 items-center justify-center rounded-md bg-mist active:opacity-70"
        >
          <Plus size={22} color={colors.ink} strokeWidth={1.75} />
        </Pressable>
      </View>
    </View>
  );
}
