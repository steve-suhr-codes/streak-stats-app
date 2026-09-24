/**
 * Returns a Google ID token for the API to verify (POST /auth/google).
 *
 * Not wired up yet. Expo now recommends a native library over expo-auth-session:
 * react-native-nitro-google-signin (supports Android Credential Manager) or
 * @react-native-google-signin/google-signin. Either needs Google Cloud OAuth
 * client IDs and a development build (not Expo Go).
 * See https://docs.expo.dev/guides/google-authentication/
 */
export async function getGoogleIdToken(): Promise<string> {
  throw new Error('Google sign-in is not configured yet. Use dev sign-in for now.');
}
