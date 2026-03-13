import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { appTheme } from "@/src/theme/palette";

export const AppCard = ({
  children,
  style
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.card,
    borderRadius: appTheme.radius.lg,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    padding: appTheme.spacing.lg,
    shadowColor: appTheme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2
  }
});
