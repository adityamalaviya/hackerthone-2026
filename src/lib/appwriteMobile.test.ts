import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted so variables are available inside hoisted vi.mock factories
const {
  mockCreateOAuth2Token,
  mockCreateSession,
  mockGet,
  mockDeleteSession,
  mockSetEndpoint,
  mockSetProject,
  mockOpenAuthSessionAsync,
  mockMakeRedirectUri,
} = vi.hoisted(() => {
  const setEndpoint = vi.fn();
  const setProject = vi.fn();
  setEndpoint.mockReturnThis();
  setProject.mockReturnThis();
  return {
    mockCreateOAuth2Token: vi.fn(),
    mockCreateSession: vi.fn(),
    mockGet: vi.fn(),
    mockDeleteSession: vi.fn(),
    mockSetEndpoint: setEndpoint,
    mockSetProject: setProject,
    mockOpenAuthSessionAsync: vi.fn(),
    mockMakeRedirectUri: vi.fn(),
  };
});

vi.mock('react-native-appwrite', () => {
  class MockClient {
    setEndpoint = mockSetEndpoint;
    setProject = mockSetProject;
  }
  class MockAccount {
    createOAuth2Token = mockCreateOAuth2Token;
    createSession = mockCreateSession;
    get = mockGet;
    deleteSession = mockDeleteSession;
  }
  return {
    Client: MockClient,
    Account: MockAccount,
    OAuthProvider: {
      Google: 'google',
    },
  };
});

vi.mock('expo-auth-session', () => ({
  makeRedirectUri: (...args: unknown[]) => mockMakeRedirectUri(...args),
}));

vi.mock('expo-web-browser', () => ({
  openAuthSessionAsync: (...args: unknown[]) => mockOpenAuthSessionAsync(...args),
}));

import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_SCHEME,
  client,
  account,
  signInWithProvider,
  signInWithGoogle,
  getCurrentUser,
  loadDashboard,
  signOut,
} from './appwriteMobile';

describe('Appwrite Mobile Google OAuth2 Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMakeRedirectUri.mockReturnValue('appwrite-callback-6aa3a24400158be49594://auth');
  });

  it('initializes Appwrite Client with the designated project ID and endpoint', () => {
    expect(APPWRITE_ENDPOINT).toBe('https://fra.cloud.appwrite.io/v1');
    expect(APPWRITE_PROJECT_ID).toBe('6aa3a24400158be49594');
    expect(APPWRITE_SCHEME).toBe('appwrite-callback-6aa3a24400158be49594');
    expect(client).toBeDefined();
    expect(account).toBeDefined();
  });

  describe('signInWithProvider / signInWithGoogle', () => {
    it('creates an OAuth2 token using Google provider and correct deep link URL', async () => {
      const mockLoginUrl = 'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=6aa3a24400158be49594';
      mockCreateOAuth2Token.mockResolvedValueOnce(mockLoginUrl);
      mockOpenAuthSessionAsync.mockResolvedValueOnce({
        type: 'success',
        url: 'appwrite-callback-6aa3a24400158be49594://auth?userId=usr_12345&secret=sec_secret_token_987',
      });
      mockCreateSession.mockResolvedValueOnce({
        $id: 'sess_abc',
        userId: 'usr_12345',
      });

      const session = await signInWithProvider();

      expect(mockMakeRedirectUri).toHaveBeenCalledWith({
        scheme: 'appwrite-callback-6aa3a24400158be49594',
        preferLocalhost: true,
      });

      expect(mockCreateOAuth2Token).toHaveBeenCalledWith({
        provider: 'google',
        success: 'appwrite-callback-6aa3a24400158be49594://auth',
        failure: 'appwrite-callback-6aa3a24400158be49594://auth',
      });

      expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
        mockLoginUrl,
        'appwrite-callback-6aa3a24400158be49594://'
      );

      expect(mockCreateSession).toHaveBeenCalledWith({
        userId: 'usr_12345',
        secret: 'sec_secret_token_987',
      });

      expect(session).toEqual({
        $id: 'sess_abc',
        userId: 'usr_12345',
      });
    });

    it('aliases signInWithGoogle to signInWithProvider', () => {
      expect(signInWithGoogle).toBe(signInWithProvider);
    });

    it('throws when WebBrowser fails or is dismissed without success', async () => {
      mockCreateOAuth2Token.mockResolvedValueOnce('https://fra.cloud.appwrite.io/v1/oauth');
      mockOpenAuthSessionAsync.mockResolvedValueOnce({
        type: 'cancel',
      });

      await expect(signInWithProvider()).rejects.toThrow('OAuth was cancelled or failed');
      expect(mockCreateSession).not.toHaveBeenCalled();
    });

    it('throws when callback URL is missing secret or userId parameter', async () => {
      mockCreateOAuth2Token.mockResolvedValueOnce('https://fra.cloud.appwrite.io/v1/oauth');
      mockOpenAuthSessionAsync.mockResolvedValueOnce({
        type: 'success',
        url: 'appwrite-callback-6aa3a24400158be49594://auth?userId=usr_123', // missing secret
      });

      await expect(signInWithProvider()).rejects.toThrow('Missing OAuth credentials');
      expect(mockCreateSession).not.toHaveBeenCalled();
    });
  });

  describe('User and Session Management', () => {
    it('getCurrentUser returns user from account.get() on success', async () => {
      const mockUser = {
        $id: 'usr_123',
        name: 'Aditya Citizen',
        email: 'aditya@example.com',
      };
      mockGet.mockResolvedValueOnce(mockUser);

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('getCurrentUser returns null when account.get() rejects', async () => {
      mockGet.mockRejectedValueOnce(new Error('User unauthorized'));

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it('loadDashboard fetches user profile', async () => {
      const mockUser = {
        $id: 'usr_456',
        name: 'Jane Citizen',
        email: 'jane@example.com',
      };
      mockGet.mockResolvedValueOnce(mockUser);

      const result = await loadDashboard();
      expect(result).toEqual(mockUser);
    });

    it('signOut terminates the current session', async () => {
      mockDeleteSession.mockResolvedValueOnce({ status: true });

      const result = await signOut();
      expect(mockDeleteSession).toHaveBeenCalledWith('current');
      expect(result).toEqual({ status: true });
    });
  });
});
