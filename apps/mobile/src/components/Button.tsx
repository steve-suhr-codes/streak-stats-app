import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'outlineDanger';

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
};

const labelColor: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.text,
  danger: colors.white,
  outlineDanger: colors.danger,
};

export function Button({ title, variant = 'primary', loading, disabled, style, ...rest }: Props) {
  const large = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        large ? styles.large : styles.regular,
        styles[variant],
        state.pressed && pressedStyles[variant],
        (disabled || loading) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor[variant]} />
      ) : (
        <Text style={[large ? styles.labelLarge : styles.labelRegular, { color: labelColor[variant] }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Create Streak button (Figma 9:24)
  large: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    minHeight: 51,
  },
  // Restart streak and dialog buttons (Figma 7:22, 7:29, 7:31)
  regular: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 42,
  },
  labelLarge: { fontFamily: fonts.semibold, fontSize: 16 },
  labelRegular: { fontFamily: fonts.medium, fontSize: 15 },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceMuted },
  danger: { backgroundColor: colors.danger },
  outlineDanger: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder },
  disabled: { opacity: 0.5 },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.accentPressed },
  secondary: { backgroundColor: colors.inputBorder },
  danger: { backgroundColor: colors.dangerPressed },
  outlineDanger: { backgroundColor: colors.surfaceMuted },
});
