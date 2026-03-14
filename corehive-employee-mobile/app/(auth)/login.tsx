import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { AppCard } from "@/src/components/ui/AppCard";
import { AppInput } from "@/src/components/ui/AppInput";
import { AppButton } from "@/src/components/ui/AppButton";
import { appTheme } from "@/src/theme/palette";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email සහ password දෙකම අවශ්‍යයි.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await signIn(email.trim(), password);
      router.replace("/(app)/(tabs)/home");
    } catch (err: any) {
      if (!err?.response) {
        setError("Cannot reach backend. Check phone and PC are on same network and API URL is correct.");
      } else {
        setError(err?.response?.data?.message || "Login failed. Please check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>CoreHive Employee</Text>
        <Text style={styles.sub}>Securely access your employee workspace</Text>
      </View>

      <AppCard>
        <Text style={styles.title}>Sign In</Text>
        <AppInput
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
        />
        <AppInput
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <AppButton title="Login" loading={loading} onPress={onLogin} />
      </AppCard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: appTheme.spacing.xl,
    backgroundColor: appTheme.colors.background
  },
  header: {
    marginBottom: appTheme.spacing.xl,
    gap: appTheme.spacing.xs
  },
  brand: {
    fontSize: 30,
    fontWeight: "800",
    color: appTheme.colors.navy
  },
  sub: {
    color: appTheme.colors.mutedText,
    fontSize: 14
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: appTheme.colors.text,
    marginBottom: appTheme.spacing.sm
  },
  error: {
    color: appTheme.colors.danger,
    marginTop: 4
  }
});
