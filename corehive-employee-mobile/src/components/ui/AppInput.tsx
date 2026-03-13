import React from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { appTheme } from "@/src/theme/palette";

export const AppInput = ({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, !!error && styles.inputError, props.style]}
        placeholderTextColor={appTheme.colors.mutedText}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    color: appTheme.colors.text,
    fontSize: 13,
    fontWeight: "600"
  },
  input: {
    minHeight: 46,
    borderRadius: appTheme.radius.md,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: appTheme.colors.card,
    paddingHorizontal: appTheme.spacing.md,
    color: appTheme.colors.text
  },
  inputError: {
    borderColor: appTheme.colors.danger
  },
  error: {
    color: appTheme.colors.danger,
    fontSize: 12
  }
});
