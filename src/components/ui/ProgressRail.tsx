import React from "react";
import { View } from "react-native";

interface ProgressRailProps {
  progress: number;
  className?: string;
}

export function ProgressRail({ progress, className }: ProgressRailProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      className={`h-1 overflow-hidden rounded-full bg-mist ${className ?? ""}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View
        className="h-full rounded-full bg-water"
        style={{ width: `${clamped * 100}%` }}
      />
    </View>
  );
}
