import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  Droplet,
  Calendar,
  BarChart3,
  Award,
  Settings,
} from "lucide-react-native";
import HomeScreen from "../features/track/TrackScreen";
import HistoryScreen from "../features/history/HistoryScreen";
import StatsScreen from "../features/stats/StatsScreen";
import AchievementsScreen from "../features/achievements/AchievementScreen";
import SettingsScreen from "../features/settings/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function CustomBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#0EA5E9",
        tabBarInactiveTintColor: "#94A3B8",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E0F2FE",
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Track"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Droplet color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          tabBarIcon: ({ color }) => <Award color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
}
