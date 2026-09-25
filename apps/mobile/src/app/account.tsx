import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../lib/auth';
import { colors, fonts, screenPadding, spacing } from '../theme';

/** Opened from the avatar on My Streaks. Not in the Figma file; styled to match the detail screen. */
export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut, deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initial = (user?.name ?? user?.email ?? '?').trim().charAt(0).toUpperCase();

  async function confirmDelete() {
    setDeleting(true);
    try {
      // Signing out afterwards sends the app back to the login screen.
      await deleteAccount();
    } catch (err) {
      setDeleting(false);
      setConfirming(false);
      Alert.alert("Couldn't delete account", err instanceof Error ? err.message : String(err));
    }
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

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{initial}</Text>
        </View>
        {user?.name ? <Text style={styles.name}>{user.name}</Text> : null}
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.flexSpacer} />

      <View style={styles.actions}>
        <Button title="Sign out" variant="secondary" onPress={signOut} />
        <Button title="Delete account" variant="outlineDanger" onPress={() => setConfirming(true)} />
      </View>

      <ConfirmModal
        visible={confirming}
        title="Delete your account?"
        message="This permanently deletes your account and all of your streaks. This can't be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: screenPadding, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  back: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text },
  profile: { alignItems: 'center', gap: spacing.xs, marginTop: 60 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarLetter: { fontFamily: fonts.semibold, fontSize: 36, color: colors.white },
  name: { fontFamily: fonts.medium, fontSize: 18, color: colors.text, textAlign: 'center' },
  email: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSubtle, textAlign: 'center' },
  flexSpacer: { flex: 1 },
  actions: { gap: spacing.md },
});
