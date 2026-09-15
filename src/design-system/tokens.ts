export const colors = {
  ink: "#10201F",
  background: "#F7F8F6",
  surface: "#FFFFFF",
  water: "#5EAAA6",
  deepWater: "#277C78",
  mist: "#E6F1EF",
  muted: "#71807E",
  border: "#D8E0DE",
  borderSubtle: "#E8EEEC",
  danger: "#B54A3F",
  warning: "#B07A2E",
  success: "#3D7A5A",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typeRoles = {
  display: { size: 40, lineHeight: 46, weight: "500" as const },
  title: { size: 28, lineHeight: 34, weight: "500" as const },
  heading: { size: 20, lineHeight: 26, weight: "500" as const },
  body: { size: 16, lineHeight: 24, weight: "400" as const },
  bodySmall: { size: 14, lineHeight: 20, weight: "400" as const },
  label: { size: 12, lineHeight: 16, weight: "500" as const },
  metric: { size: 48, lineHeight: 52, weight: "500" as const },
  metricLarge: { size: 56, lineHeight: 60, weight: "500" as const },
} as const;

export type HydrolyColor = keyof typeof colors;
