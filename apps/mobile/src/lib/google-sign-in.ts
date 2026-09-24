import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';

// The *Web* OAuth client ID from Google Cloud — also what the API accepts as the token audience
// (GOOGLE_CLIENT_IDS). Not the Android client ID. It isn't secret.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!WEB_CLIENT_ID) {
    throw new Error('Google sign-in is not configured: set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in apps/mobile/.env');
  }
  GoogleOneTapSignIn.configure({ webClientId: WEB_CLIENT_ID });
  configured = true;
}

/**
 * Shows Google sign-in (Android Credential Manager) and returns a Google ID token for the API
 * to verify via POST /auth/google. Returns null if the user dismissed the sheet.
 */
export async function getGoogleIdToken(): Promise<string | null> {
  ensureConfigured();

  try {
    await GoogleOneTapSignIn.checkPlayServices();

    // Library's recommended cascade: saved credential → account picker → explicit sign-in UI.
    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
    }

    if (isCancelledResponse(response)) return null;
    if (isSuccessResponse(response)) return response.data.idToken;
    throw new Error('Google sign-in did not return an account');
  } catch (err) {
    if (isErrorWithCode(err)) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) return null;
      if (err.code === statusCodes.DEVELOPER_ERROR) {
        throw new Error(
          'Google rejected this app (DEVELOPER_ERROR). Check the Android OAuth client: package name ' +
            'com.stevesuhr.streakstats and the SHA-1 of the keystore this build is signed with.',
        );
      }
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play services is missing or out of date on this device.');
      }
    }
    throw err;
  }
}

/** Clears Google's remembered account so the next sign-in shows the account picker again. */
export async function signOutOfGoogle(): Promise<void> {
  if (!configured) return;
  await GoogleOneTapSignIn.signOut();
}
