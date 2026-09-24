import { logLengthDays } from '@streak-stats/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useRestartStreak, useStreak } from '../../lib/streaks';
import { useToday } from '../../lib/use-today';
import { colors, fonts, screenPadding, spacing } from '../../theme';

/** Figma 7:2 "Streak Detail" and 7:13 "Streak Detail - Restart Confirm". */
export default function StreakDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { data: streak, isError, error } = useStreak(id);
  const restart = useRestartStreak();
  const [confirming, setConfirming] = useState(false);

  const days = streak ? logLengthDays(streak.currentLog, today) : 0;

  function confirmRestart() {
    restart.mutate(
      { id, date: today },
      {
        onSuccess: () => setConfirming(false),
        onError: (err) => {
          setConfirming(false);
          Alert.alert("Couldn't restart streak", err.message);
        },
      },
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.md, paddingBottom: Math.max(insets.bottom, spacing.xxxl) },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
      </View>

      {isError ? (
        <View style={styles.center}>
          <Text style={styles.caption}>{error.message}</Text>
        </View>
      ) : !streak ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <>
          <View style={styles.content}>
            <Text style={styles.label}>{streak.label}</Text>
            <Text style={styles.days} adjustsFontSizeToFit numberOfLines={1}>
              {days}
            </Text>
            <Text style={styles.caption}>day streak</Text>
          </View>

          <View style={styles.flexSpacer} />

          <Button title="Restart streak" variant="outlineDanger" onPress={() => setConfirming(true)} />
        </>
      )}

      <ConfirmModal
        visible={confirming}
        title="Restart this streak?"
        message={`Your current ${days} day streak will end and a new one starts today. This can't be undone.`}
        confirmLabel="Restart"
        loading={restart.isPending}
        onConfirm={confirmRestart}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: screenPadding, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  back: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', gap: spacing.xs, marginTop: 60 },
  label: { fontFamily: fonts.medium, fontSize: 18, color: colors.text, textAlign: 'center' },
  days: {
    fontFamily: fonts.semibold,
    fontSize: 96,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  caption: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSubtle, textAlign: 'center' },
  flexSpacer: { flex: 1 },
});
