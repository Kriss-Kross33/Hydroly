import React from "react";
import { Pressable, Text, View } from "react-native";

interface SelectionOptionProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectionOption({
  title,
  description,
  selected,
  onPress,
}: SelectionOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mb-3 border px-5 py-5 ${
        selected
          ? "border-water bg-mist"
          : "border-border-light bg-surface"
      } rounded-md active:opacity-80`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-sans-medium text-lg text-ink">{title}</Text>
          {description ? (
            <Text className="mt-1.5 font-sans text-sm leading-5 text-muted">
              {description}
            </Text>
          ) : null}
        </View>
        <View
          className={`mt-1 h-5 w-5 rounded-full border-2 ${
            selected ? "border-water bg-water" : "border-border-default bg-transparent"
          }`}
        />
      </View>
    </Pressable>
  );
}
