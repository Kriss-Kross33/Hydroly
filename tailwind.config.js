/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./packages/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    screens: {
      // Mobile breakpoints based on device widths
      xs: "320px", // iPhone SE, small Android phones
      sm: "375px", // iPhone 12 mini, iPhone 13 mini
      md: "390px", // iPhone 12, iPhone 13, iPhone 14
      lg: "414px", // iPhone 12 Pro Max, iPhone 13 Pro Max, iPhone 14 Plus
      xl: "428px", // iPhone 14 Pro Max, iPhone 15 Pro Max
      "2xl": "430px", // iPhone 16, iPhone 16 Plus
      "3xl": "480px", // Large Android phones, small tablets
    },
    fontFamily: {
      // Make Inter the default font family
      sans: ["Inter-Regular", "system-ui", "sans-serif"],
      // Keep specific weight classes for when you need them
      "sans-light": ["Inter-Light", "system-ui", "sans-serif"],
      "sans-medium": ["Inter-Medium", "system-ui", "sans-serif"],
      "sans-semibold": ["Inter-SemiBold", "system-ui", "sans-serif"],
      "sans-bold": ["Inter-Bold", "system-ui", "sans-serif"],
      "sans-extrabold": ["Inter-ExtraBold", "system-ui", "sans-serif"],
    },
    fontSize: {
      xs: "12px", // Smallest text (captions, labels)
      sm: "14px", // Small text (secondary text)
      base: "16px", // Body text
      lg: "18px", // Slightly larger body text
      xl: "20px", // Subheadings
      "2xl": "24px", // Headings
      "3xl": "30px", // Large headings
      "4xl": "36px", // Extra large headings
      "5xl": "48px", // Hero text
    },
    extend: {
      colors: {
        // Primary colors - Sky blue (main brand color)
        primary: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9", // Main primary color
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        },
        // Secondary colors - Violet/Purple
        secondary: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6", // Main secondary color
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        // Success colors - Emerald/Green
        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981", // Main success color
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        // Warning colors - Amber/Orange
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Main warning color
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Text colors
        text: {
          primary: "#0C4A6E", // Dark blue for headings
          secondary: "#475569", // Slate-600 for body text
          muted: "#64748B", // Slate-500 for secondary text
          disabled: "#94A3B8", // Slate-400 for disabled states
          inverse: "#FFFFFF", // White text for dark backgrounds
        },
        // Background colors
        background: {
          primary: "#FFFFFF", // White
          secondary: "#F8FAFC", // Slate-50
          tertiary: "#F1F5F9", // Slate-100
          accent: "#F0F9FF", // Sky-50
        },
        // Border colors
        border: {
          light: "#E0F2FE", // Sky-100
          default: "#CBD5E1", // Slate-300
          dark: "#94A3B8", // Slate-400
        },
        // Legacy/Utility colors
        "auth-subtitle": "#666666",
      },
      spacing: {
        11.3: "11.3rem", // 181px
        4.25: "4.25rem", // 68px
        43: "43px", // 43px icon
        280: "280px", // quick add card width
      },
    },
  },
  plugins: [],
};
