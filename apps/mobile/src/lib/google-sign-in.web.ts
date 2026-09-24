// The native Google sign-in library has no web implementation. The web build is only
// used for previewing layouts, so sign in there with the dev email login.

export async function getGoogleIdToken(): Promise<string | null> {
  throw new Error('Google sign-in is not available on web. Use dev sign-in.');
}

export async function signOutOfGoogle(): Promise<void> {}
