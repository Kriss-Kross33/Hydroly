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
