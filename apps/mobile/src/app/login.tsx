import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../lib/auth';
import { getGoogleIdToken } from '../lib/google-sign-in';
import { colors, fonts, radius, spacing } from '../theme';

/** Figma 4:5 "Login / Splash". */
export default function LoginScreen() {
  const { signInWithGoogle, signInDev } = useAuth();
  const [pending, setPending] = useState<'google' | 'dev' | null>(null);
  const [devEmail, setDevEmail] = useState('');

  async function run(kind: 'google' | 'dev', action: () => Promise<void>) {
    setPending(kind);
    try {
      await action();
    } catch (err) {
      Alert.alert('Sign-in failed', err instanceof Error ? err.message : String(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.logoBlock}>
        <View style={styles.appMark}>
          <Text style={styles.appMarkLetter}>S</Text>
        </View>
        <Text style={styles.title}>Streak Stats</Text>
        <Text style={styles.tagline}>Build habits. Break bad ones.</Text>
      </View>

      <View style={styles.signInBlock}>
        <Pressable
          accessibilityRole="button"
          disabled={pending !== null}
          onPress={() =>
            run('google', async () => {
              const idToken = await getGoogleIdToken();
              if (idToken) await signInWithGoogle(idToken); // null = user dismissed the sheet
            })
          }
          style={({ pressed }) => [styles.googleButton, pressed && styles.googleButtonPressed]}
        >
          {pending === 'google' ? (
            <ActivityIndicator color={colors.textCard} />
          ) : (
            <>
              <View style={styles.googleMark}>
                <Text style={styles.googleMarkLetter}>G</Text>
              </View>
              <Text style={styles.googleLabel}>Continue with Google</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.legal}>By continuing, you agree to the Terms & Privacy Policy.</Text>

        {__DEV__ ? (
          <View style={styles.dev}>
            <Text style={styles.devLabel}>Dev sign-in (API needs ALLOW_DEV_LOGIN=true)</Text>
            <View style={styles.devRow}>
              <TextInput
                style={styles.devInput}
                value={devEmail}
                onChangeText={setDevEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textSubtle}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              <Pressable
                accessibilityRole="button"
                disabled={pending !== null || !devEmail.includes('@')}
                onPress={() => run('dev', () => signInDev(devEmail.trim()))}
                style={({ pressed }) => [
                  styles.devButton,
                  (pending !== null || !devEmail.includes('@')) && styles.disabled,
                  pressed && styles.googleButtonPressed,
                ]}
              >
                {pending === 'dev' ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Text style={styles.devButtonLabel}>Go</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: spacing.xxxl,
  },
  logoBlock: { alignItems: 'center', gap: spacing.lg },
  appMark: {
    width: 88,
    height: 88,
    borderRadius: radius.appMark,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appMarkLetter: { fontFamily: fonts.semibold, fontSize: 40, color: colors.accent },
  title: { fontFamily: fonts.semibold, fontSize: 32, color: colors.white, textAlign: 'center' },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
    opacity: 0.85,
    textAlign: 'center',
  },
  signInBlock: { alignSelf: 'stretch', alignItems: 'center', gap: spacing.md },
  googleButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  googleButtonPressed: { opacity: 0.85 },
  googleMark: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.google,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMarkLetter: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  googleLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.textCard },
  legal: {
    width: 280,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.white,
    opacity: 0.7,
    textAlign: 'center',
  },
  // Not in the design: dev builds only.
  dev: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  devLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.white, opacity: 0.85 },
  devRow: { flexDirection: 'row', gap: spacing.sm },
  devInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  devButton: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  devButtonLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.accent },
  disabled: { opacity: 0.5 },
});
