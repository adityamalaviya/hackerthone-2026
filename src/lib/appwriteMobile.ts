import { Client, Account, OAuthProvider, Models } from 'react-native-appwrite';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Project Configuration
export const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '6aa3a24400158be49594';
export const APPWRITE_SCHEME = 'appwrite-callback-6aa3a24400158be49594';

export const client: Client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account: Account = new Account(client);

export type AppwriteUser = Models.User<Models.Preferences>;

/**
 * Initiates the Appwrite OAuth2 Token flow for Google sign-in.
 * Opens the auth session via WebBrowser and completes session creation
 * using the extracted userId and secret tokens from the redirect callback.
 */
export async function signInWithProvider(): Promise<Models.Session> {
  const deepLink = new URL(
    makeRedirectUri({
      scheme: APPWRITE_SCHEME,
      preferLocalhost: true,
    })
  );
  const scheme = `${deepLink.protocol}//`;

  const loginUrl = await account.createOAuth2Token({
    provider: OAuthProvider.Google,
    success: `${deepLink}`,
    failure: `${deepLink}`,
  });

  const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);
  if (result.type !== 'success' || !('url' in result) || !result.url) {
    throw new Error('OAuth was cancelled or failed');
  }

  const url = new URL(result.url);
  const secret = url.searchParams.get('secret');
  const userId = url.searchParams.get('userId');

  if (!secret || !userId) {
    throw new Error('Missing OAuth credentials');
  }

  return await account.createSession({ userId, secret });
}

export const signInWithGoogle = signInWithProvider;

/**
 * Loads current authenticated user details from Appwrite Account.
 * Returns null if not authenticated or session check fails.
 */
export async function getCurrentUser(): Promise<AppwriteUser | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function loadDashboard(): Promise<AppwriteUser> {
  const user = await account.get();
  return user;
}

/**
 * Terminates the current Appwrite session.
 */
export async function signOut(): Promise<Record<string, unknown>> {
  return await account.deleteSession('current');
}
