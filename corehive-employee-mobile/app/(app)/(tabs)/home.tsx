import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { EmployeeProfile } from "@/src/types/models";

export default function HomeTab() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);

  useEffect(() => {
    employeeApi.getCurrentProfile().then(setProfile).catch(() => undefined);
  }, []);

  const cards = [
    { title: "My Profile", route: "/(app)/profile/index", icon: "👤" },
    { title: "Feedback", route: "/(app)/feedback", icon: "💬" },
    { title: "Notices", route: "/(app)/notices", icon: "📢" },
    { title: "Surveys", route: "/(app)/surveys", icon: "📝" },
    { title: "Support", route: "/(app)/support", icon: "🛟" }
  ];

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.welcome}>Welcome Back</Text>
        <Text style={styles.name}>{profile?.firstName || "Employee"}</Text>
        <Text style={styles.subtitle}>{profile?.designation || "CoreHive Team"}</Text>
      </View>

      <AppCard>
        <Text style={styles.sectionTitle}>Quick Summary</Text>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Employee ID</Text>
            <Text style={styles.summaryValue}>{profile?.employeeCode || "-"}</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={[styles.summaryValue, { color: appTheme.colors.success }]}>Active</Text>
          </View>
        </View>
      </AppCard>

      <View style={styles.grid}>
        {cards.map((c) => (
          <Pressable key={c.title} style={styles.tile} onPress={() => router.push(c.route as any)}>
            <Text style={styles.tileIcon}>{c.icon}</Text>
            <Text style={styles.tileText}>{c.title}</Text>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: appTheme.colors.navy,
    borderRadius: appTheme.radius.xl,
    padding: appTheme.spacing.xl
  },
  welcome: { color: appTheme.colors.background, opacity: 0.9, fontSize: 13 },
  name: { color: appTheme.colors.card, fontSize: 28, fontWeight: "800", marginTop: 4 },
  subtitle: { color: appTheme.colors.background, opacity: 0.92, marginTop: 4 },
  sectionTitle: { fontWeight: "700", color: appTheme.colors.text, marginBottom: 12, fontSize: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: appTheme.colors.mutedText, fontSize: 12 },
  summaryValue: { color: appTheme.colors.text, fontWeight: "700", marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "48%",
    backgroundColor: appTheme.colors.card,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.lg,
    padding: appTheme.spacing.lg,
    alignItems: "center",
    gap: 8
  },
  tileIcon: { fontSize: 24 },
  tileText: { color: appTheme.colors.text, fontWeight: "600" }
});
