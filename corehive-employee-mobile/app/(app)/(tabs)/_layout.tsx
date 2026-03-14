import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appTheme } from "@/src/theme/palette";

export default function EmployeeTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: appTheme.colors.card,
          borderTopColor: appTheme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="leave"
        options={{
          title: "Leave",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="payslips"
        options={{
          title: "Payslips",
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
