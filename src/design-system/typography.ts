export const fontFamilies = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
} as const;

export const typography = {
  display: {
    fontFamily: fontFamilies.medium,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: fontFamilies.medium,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  heading: {
    fontFamily: fontFamilies.medium,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  metric: {
    fontFamily: fontFamilies.medium,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[],
  },
  metricLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.2,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[],
  },
} as const;
