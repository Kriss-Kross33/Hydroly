import React from "react";
import { Text, View } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center px-8 py-16">
      <Text className="text-center font-sans-medium text-xl text-ink">
        {title}
      </Text>
      {description ? (
        <Text className="mt-3 text-center font-sans text-base leading-6 text-muted">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-8 w-full max-w-xs">
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
