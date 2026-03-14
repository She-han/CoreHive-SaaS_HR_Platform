import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { appTheme } from "@/src/theme/palette";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export const AppButton = ({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary"
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
}) => {
  const styleByVariant = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
    danger: styles.danger
  }[variant];

  const textByVariant = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
    danger: styles.primaryText
  }[variant];

  return (
    <Pressable
      style={[styles.base, styleByVariant, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color={variant === "ghost" ? appTheme.colors.primary : appTheme.colors.card} /> : <Text style={[styles.text, textByVariant]}>{title}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: appTheme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: appTheme.spacing.lg
  },
  primary: {
    backgroundColor: appTheme.colors.primary
  },
  secondary: {
    backgroundColor: appTheme.colors.secondary
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: appTheme.colors.primary
  },
  danger: {
    backgroundColor: appTheme.colors.danger
  },
  disabled: {
    opacity: 0.55
  },
  text: {
    fontSize: 16,
    fontWeight: "700"
  },
  primaryText: {
    color: appTheme.colors.card
  },
  secondaryText: {
    color: appTheme.colors.card
  },
  ghostText: {
    color: appTheme.colors.primary
  }
});
