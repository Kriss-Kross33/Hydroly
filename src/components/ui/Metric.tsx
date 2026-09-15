import React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";

interface MetricProps extends TextProps {
  value: string | number;
  size?: "default" | "large" | "small";
  className?: string;
}

export function Metric({
  value,
  size = "default",
  className,
  style,
  ...props
}: MetricProps) {
  const sizeClass =
    size === "large"
      ? "text-6xl"
      : size === "small"
        ? "text-3xl"
        : "text-5xl";

  return (
    <Text
      className={`font-sans-medium text-ink ${sizeClass} ${className ?? ""}`}
      style={[
        {
          letterSpacing: size === "large" ? -1.5 : -1,
          fontVariant: ["tabular-nums"],
        } as TextStyle,
        style,
      ]}
      {...props}
    >
      {value}
    </Text>
  );
}
