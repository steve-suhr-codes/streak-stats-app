import { logLengthDays, type StreakDto } from '@streak-stats/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme';

type Props = {
  streak: StreakDto;
  today: string;
  onPress: () => void;
};

/** Figma 2:6 "Streak Card". */
export function StreakCard({ streak, today, onPress }: Props) {
  const days = logLengthDays(streak.currentLog, today);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${streak.label}, ${days} day streak`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.labelBlock}>
        <Text style={styles.label} numberOfLines={2}>
          {streak.label}
        </Text>
        <Text style={styles.caption}>day streak</Text>
      </View>
      <Text style={styles.days}>{days}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  labelBlock: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.medium, fontSize: 16, color: colors.textCard },
  caption: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSubtle },
  days: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
});
