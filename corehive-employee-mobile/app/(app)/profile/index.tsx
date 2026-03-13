import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { EmployeeProfile } from "@/src/types/models";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);

  useEffect(() => {
    employeeApi.getCurrentProfile().then(setProfile).catch(() => undefined);
  }, []);

  const initials = `${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <AppScreen>
      <Text style={styles.title}>My Profile</Text>
      <AppCard>
        <View style={styles.header}>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}><Text style={styles.avatarText}>{initials || "EM"}</Text></View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.firstName} {profile?.lastName}</Text>
            <Text style={styles.meta}>{profile?.designation || "-"}</Text>
            <Text style={styles.meta}>Employee ID: {profile?.employeeCode || "-"}</Text>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <Field label="Email" value={profile?.email} />
        <Field label="Phone" value={profile?.phone} />
        <Field label="National ID" value={profile?.nationalId} />
        <Field label="Department" value={profile?.department?.name} />
        <Field label="Date of Joining" value={profile?.dateOfJoining} />
        <Field label="Salary Type" value={profile?.salaryType} />
      </AppCard>

      <AppButton title="Edit Profile" onPress={() => router.push("/(app)/profile/edit")} />
    </AppScreen>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "N/A"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: appTheme.colors.navy },
  header: { flexDirection: "row", gap: 14, alignItems: "center" },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.secondary
  },
  avatarText: { color: appTheme.colors.card, fontWeight: "800", fontSize: 28 },
  name: { color: appTheme.colors.text, fontWeight: "700", fontSize: 20 },
  meta: { color: appTheme.colors.mutedText, marginTop: 4 },
  field: {
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
    paddingVertical: 10
  },
  label: { color: appTheme.colors.mutedText, fontSize: 12 },
  value: { color: appTheme.colors.text, fontWeight: "600", marginTop: 2 }
});
