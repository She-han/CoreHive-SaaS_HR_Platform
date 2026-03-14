import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppButton } from "@/src/components/ui/AppButton";
import { useAuth } from "@/src/context/AuthContext";
import { appTheme } from "@/src/theme/palette";

export default function MoreTab() {
  const { signOut } = useAuth();

  const menu = [
    { title: "My Profile", route: "/(app)/profile/index" },
    { title: "Edit Profile", route: "/(app)/profile/edit" },
    { title: "Feedback", route: "/(app)/feedback" },
    { title: "Notices", route: "/(app)/notices" },
    { title: "Surveys", route: "/(app)/surveys" },
    { title: "Support & Bug Report", route: "/(app)/support" }
  ];

  return (
    <AppScreen>
      <Text style={styles.heading}>More</Text>
      <AppCard>
        <View style={{ gap: 4 }}>
          {menu.map((item) => (
            <Pressable key={item.title} style={styles.row} onPress={() => router.push(item.route as any)}>
              <Text style={styles.rowText}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </AppCard>

      <AppButton
        title="Logout"
        variant="danger"
        onPress={async () => {
          await signOut();
          router.replace("/(auth)/login");
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: appTheme.colors.navy,
    fontWeight: "800",
    fontSize: 26
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border
  },
  rowText: {
    color: appTheme.colors.text,
    fontWeight: "600"
  },
  chevron: {
    color: appTheme.colors.mutedText,
    fontSize: 20,
    fontWeight: "600"
  }
});
