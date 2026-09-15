import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/src/design-system";

interface ListRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
}

export function ListRow({
  label,
  value,
  onPress,
  rightElement,
  showChevron = false,
  destructive = false,
}: ListRowProps) {
  const content = (
    <View className="flex-row items-center justify-between border-b border-border-light py-4">
      <Text
        className={`flex-1 font-sans text-base ${
          destructive ? "text-warning-700" : "text-ink"
        }`}
      >
        {label}
      </Text>
      <View className="ml-3 flex-row items-center gap-2">
        {value ? (
          <Text className="font-sans text-base text-muted">{value}</Text>
        ) : null}
        {rightElement}
        {showChevron ? (
          <ChevronRight size={18} color={colors.muted} strokeWidth={1.75} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="active:opacity-70"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text className="mb-2 mt-8 font-sans-medium text-xs uppercase tracking-widest text-muted">
      {title}
    </Text>
  );
}
