import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { appTheme } from "@/src/theme/palette";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export const AppScreen = ({ children, scroll = true, style }: Props) => {
  const content = <View style={[styles.container, style]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: appTheme.colors.background
  },
  scroll: {
    paddingBottom: appTheme.spacing.xxl
  },
  container: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.lg,
    gap: appTheme.spacing.lg
  }
});
