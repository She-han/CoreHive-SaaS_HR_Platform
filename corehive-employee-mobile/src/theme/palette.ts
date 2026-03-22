export const palette = {
  textPrimary: "#333333",
  primary: "#02C39A",
  textMuted: "#9B9B9B",
  success: "#1ED292",
  navy: "#0C397A",
  backgroundSoft: "#F1FDF9",
  secondary: "#05668D",
  white: "#FFFFFF",
  danger: "#EF4444",
  warning: "#F59E0B",
  border: "#E5E7EB"
} as const;

export const appTheme = {
  colors: {
    background: palette.backgroundSoft,
    card: palette.white,
    primary: palette.primary,
    secondary: palette.secondary,
    text: palette.textPrimary,
    mutedText: palette.textMuted,
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
    border: palette.border,
    navy: palette.navy
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20
  }
};
