import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
} from "react-native";
import { colors } from "@/src/design-system";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string; spinner: string }
> = {
  primary: {
    container: "bg-water",
    text: "text-white",
    spinner: colors.surface,
  },
  secondary: {
    container: "bg-mist",
    text: "text-ink",
    spinner: colors.ink,
  },
  ghost: {
    container: "bg-transparent",
    text: "text-muted",
    spinner: colors.muted,
  },
};

export function Button({
  title,
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`h-12 items-center justify-center rounded-md px-6 ${styles.container} ${
        fullWidth ? "w-full" : ""
      } ${isDisabled ? "opacity-50" : "active:opacity-80"} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={styles.spinner} />
      ) : (
        <Text
          className={`font-sans-medium text-base ${styles.text}`}
          style={{ letterSpacing: -0.1 }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
