import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export default function AppLayout() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isBootstrapping]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile/index" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="notices" />
      <Stack.Screen name="surveys" />
      <Stack.Screen name="support" />
    </Stack>
  );
}
