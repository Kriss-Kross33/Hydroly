import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Droplet, Calendar, BarChart3, Settings } from "lucide-react-native";
import HomeScreen from "../features/track/TrackScreen";
import HistoryScreen from "../features/history/HistoryScreen";
import StatsScreen from "../features/stats/StatsScreen";
import SettingsScreen from "../features/settings/SettingsScreen";
import { colors } from "@/src/design-system";

const Tab = createBottomTabNavigator();

export default function CustomBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.water,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: "DMSans_500Medium",
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          paddingTop: 6,
          height: 88,
        },
      }}
    >
      <Tab.Screen
        name="Track"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Droplet color={color} size={size ?? 22} strokeWidth={1.75} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size ?? 22} strokeWidth={1.75} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size ?? 22} strokeWidth={1.75} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size ?? 22} strokeWidth={1.75} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
