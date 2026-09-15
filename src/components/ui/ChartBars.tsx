import React from "react";
import { Text, View } from "react-native";

interface ChartBarItem {
  label: string;
  value: number;
  max?: number;
  id?: string;
}

interface ChartBarsProps {
  data: ChartBarItem[];
  unitLabel?: string;
}

export function ChartBars({ data, unitLabel }: ChartBarsProps) {
  const maxValue = Math.max(
    1,
    ...data.map((d) => d.max ?? d.value),
    ...data.map((d) => d.value)
  );

  return (
    <View className="w-full">
      <View className="h-40 flex-row items-end justify-between gap-2">
        {data.map((item, index) => {
          const heightPct = Math.max(0.04, item.value / maxValue);
          const met = item.max ? item.value >= item.max * 0.95 : false;
          return (
            <View
              key={item.id ?? `${item.label}-${index}`}
              className="flex-1 items-center"
            >
              <View className="h-36 w-full justify-end">
                <View
                  className={`w-full rounded-sm ${met ? "bg-water-deep" : "bg-water"}`}
                  style={{ height: `${heightPct * 100}%`, minHeight: 4 }}
                />
              </View>
              <Text className="mt-2 font-sans text-xs text-muted">
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
      {unitLabel ? (
        <Text className="mt-3 font-sans text-xs text-muted">{unitLabel}</Text>
      ) : null}
    </View>
  );
}
