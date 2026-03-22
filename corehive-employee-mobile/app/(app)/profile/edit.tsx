import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/ui/AppScreen";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppInput } from "@/src/components/ui/AppInput";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";
import { employeeApi } from "@/src/services/api/employee";
import type { EmployeeProfile } from "@/src/types/models";

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    employeeApi.getCurrentProfile().then((p) => {
      setProfile(p);
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setPhone(p.phone || "");
      setPhotoUri(p.profileImage || null);
    });
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Validation", "First name and last name are required.");
      return;
    }

    const form = new FormData();
    form.append("firstName", firstName.trim());
    form.append("lastName", lastName.trim());
    form.append("phone", phone.trim());

    if (photoUri && photoUri !== profile?.profileImage) {
      const fileName = photoUri.split("/").pop() || `profile-${Date.now()}.jpg`;
      form.append("profileImage", {
        uri: photoUri,
        name: fileName,
        type: "image/jpeg"
      } as any);
    }

    try {
      setSaving(true);
      await employeeApi.updateCurrentProfile(form);
      Alert.alert("Success", "Profile updated successfully.");
      router.replace("/(app)/profile/index");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>Edit Profile</Text>
      <AppCard>
        <View style={styles.photoRow}>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <View style={styles.photoPlaceholder} />}
          <View style={{ flex: 1, gap: 8 }}>
            <AppButton title="Change Photo" variant="secondary" onPress={pickImage} />
            <Text style={styles.tip}>JPG/PNG. clear face photo recommended.</Text>
          </View>
        </View>

        <AppInput label="First Name" value={firstName} onChangeText={setFirstName} />
        <AppInput label="Last Name" value={lastName} onChangeText={setLastName} />
        <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </AppCard>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <AppButton title="Cancel" variant="ghost" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton title="Save" loading={saving} onPress={save} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: appTheme.colors.navy },
  photoRow: { flexDirection: "row", gap: 14, marginBottom: 12, alignItems: "center" },
  photo: { width: 90, height: 90, borderRadius: 45 },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: appTheme.colors.border
  },
  tip: { color: appTheme.colors.mutedText, fontSize: 12 }
});
