import { router } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { StreakCard } from '../components/StreakCard';
import { useAuth } from '../lib/auth';
import { useStreaks } from '../lib/streaks';
import { useToday } from '../lib/use-today';
import { colors, fonts, screenPadding, spacing } from '../theme';

/** Figma 1:3 "My Streaks". */
export default function StreakListScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const today = useToday();
  const { data: streaks, isPending, isError, error, refetch, isRefetching } = useStreaks();

  const initial = (user?.name ?? user?.email ?? '?').trim().charAt(0).toUpperCase();

  function openAccountMenu() {
    // The design has no account screen yet; the avatar is the natural place for sign-out.
    Alert.alert(user?.name ?? 'Account', user?.email, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  const header = (
    <View style={styles.headerRow}>
      <View style={styles.header}>
        <Text style={styles.title}>My Streaks</Text>
        <Text style={styles.subtitle}>Track your progress</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Account" onPress={openAccountMenu} style={styles.avatar}>
        <Text style={styles.avatarLetter}>{initial}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {isPending ? (
        <>
          <View style={styles.padded}>{header}</View>
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        </>
      ) : isError ? (
        <>
          <View style={styles.padded}>{header}</View>
          <View style={styles.center}>
            <Text style={styles.muted}>{error.message}</Text>
            <Button title="Try again" variant="secondary" onPress={() => refetch()} />
          </View>
        </>
      ) : (
        <FlatList
          data={streaks}
          keyExtractor={(s) => s.id}
          ListHeaderComponent={header}
          ListHeaderComponentStyle={styles.listHeader}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 56 + spacing.xxxl * 2 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <StreakCard
              streak={item}
              today={today}
              onPress={() => router.push({ pathname: '/streaks/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No streaks yet</Text>
              <Text style={styles.muted}>Tap + to start tracking something that matters to you.</Text>
            </View>
          }
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add streak"
        onPress={() => router.push('/streaks/new')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: Math.max(insets.bottom, spacing.xxxl) },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: screenPadding },
  list: { paddingHorizontal: screenPadding, flexGrow: 1 },
  listHeader: { marginBottom: spacing.xxl },
  separator: { height: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: { gap: spacing.xs },
  title: { fontFamily: fonts.semibold, fontSize: 28, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: fonts.semibold, fontSize: 18, color: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: screenPadding },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSubtle, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: screenPadding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  fabPressed: { backgroundColor: colors.accentPressed },
  fabPlus: { fontFamily: fonts.semibold, fontSize: 28, lineHeight: 34, color: colors.white },
});
