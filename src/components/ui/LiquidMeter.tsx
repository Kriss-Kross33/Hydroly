import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import { colors, motion } from "@/src/design-system";

interface LiquidMeterProps {
  /** 0–1 fill amount */
  progress: number;
  width?: number;
  height?: number;
  onSettle?: () => void;
}

export function LiquidMeter({
  progress,
  width = 160,
  height = 280,
  onSettle,
}: LiquidMeterProps) {
  const fill = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(fill, {
      toValue: clamped,
      duration: motion.duration.liquid,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && onSettle) onSettle();
    });
  }, [clamped, fill, onSettle]);

  const liquidHeight = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const waveOpacity = fill.interpolate({
    inputRange: [0, 0.02, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clamped * 100),
      }}
      style={[styles.vessel, { width, height }]}
    >
      <View style={styles.inner}>
        <Animated.View style={[styles.liquid, { height: liquidHeight }]}>
          <Animated.View style={[styles.surface, { opacity: waveOpacity }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vessel: {
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    alignSelf: "center",
  },
  inner: {
    flex: 1,
    justifyContent: "flex-end",
    overflow: "hidden",
    margin: 6,
    borderRadius: 74,
    backgroundColor: colors.mist,
  },
  liquid: {
    width: "100%",
    backgroundColor: colors.water,
    justifyContent: "flex-start",
  },
  surface: {
    height: 3,
    backgroundColor: colors.deepWater,
    opacity: 0.35,
  },
});
