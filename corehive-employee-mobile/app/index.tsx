import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { appTheme } from "@/src/theme/palette";

export default function RootIndex() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (isBootstrapping) return;
    if (isAuthenticated) {
      router.replace("/(app)/(tabs)/home");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isBootstrapping]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appTheme.colors.background
      }}
    >
      <ActivityIndicator color={appTheme.colors.primary} size="large" />
    </View>
  );
}
