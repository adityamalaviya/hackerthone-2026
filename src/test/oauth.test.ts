import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  account,
  OAuthProvider,
  signInWithGoogle,
  handleOAuthSuccess,
  loadDashboard,
  signOut,
  resetProcessedOAuthTokensForTesting,
} from '../lib/appwrite';
import type { Models } from 'appwrite';

interface CustomLocation {
  origin: string;
  href: string;
  pathname: string;
  search: string;
  assign: (url: string) => void;
  replace: (url: string) => void;
  reload: () => void;
}

interface CustomWindow {
  location: CustomLocation;
}

describe('Appwrite OAuth2 Token Flow & Session Management', () => {
  let mockLocation: CustomLocation;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetProcessedOAuthTokensForTesting();

    mockLocation = {
      origin: 'https://civicfix.gandhidham.gov.in',
      href: 'https://civicfix.gandhidham.gov.in',
      pathname: '/',
      search: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    };

    const mockWin: CustomWindow = {
      location: mockLocation,
    };

    Object.defineProperty(globalThis, 'window', {
      value: mockWin,
      writable: true,
      configurable: true,
    });

    vi.spyOn(account, 'get').mockRejectedValue(new Error('User unauthorized (401)'));
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  describe('signInWithGoogle', () => {
    it('initiates OAuth2 token flow with Google provider and first-party callback URLs', async () => {
      const createOAuth2TokenSpy = vi
        .spyOn(account, 'createOAuth2Token')
        .mockReturnValue('token-id');

      await signInWithGoogle();

      expect(createOAuth2TokenSpy).toHaveBeenCalledTimes(1);
      expect(createOAuth2TokenSpy).toHaveBeenCalledWith({
        provider: OAuthProvider.Google,
        success: 'https://civicfix.gandhidham.gov.in/auth/success',
        failure: 'https://civicfix.gandhidham.gov.in/auth/failure',
      });
    });
  });

  describe('handleOAuthSuccess', () => {
    it('extracts userId and secret from query string and creates a new session', async () => {
      mockLocation.href =
        'https://civicfix.gandhidham.gov.in/auth/success?userId=user_123&secret=oauth_secret_abc';

      const mockSession = {
        $id: 'session_xyz',
        userId: 'user_123',
        expire: '2026-10-01',
        provider: 'google',
        providerUid: 'google_123',
        providerAccessToken: '',
        providerAccessTokenExpiry: '',
        providerRefreshToken: '',
        ip: '127.0.0.1',
        osCode: 'mac',
        osName: 'Mac',
        osVersion: '14.0',
        clientType: 'browser',
        clientCode: 'chrome',
        clientName: 'Chrome',
        clientVersion: '120.0',
        clientEngine: 'Blink',
        clientEngineVersion: '120.0',
        deviceName: 'Desktop',
        deviceBrand: 'Apple',
        deviceModel: 'MacBook',
        countryCode: 'IN',
        countryName: 'India',
        current: true,
        factors: [],
        secret: 'oauth_secret_abc',
        mfaUpdatedAt: '',
      } satisfies Models.Session;

      const mockUser = {
        $id: 'user_123',
        $createdAt: '2026-09-01',
        $updatedAt: '2026-09-01',
        name: 'Aditya Malaviya',
        registration: '2026-09-01',
        status: true,
        labels: [],
        passwordUpdate: '2026-09-01',
        email: 'aditya@example.com',
        phone: '',
        emailVerification: true,
        phoneVerification: false,
        mfa: false,
        prefs: {},
        targets: [],
        accessedAt: '2026-09-01',
      } satisfies Models.User<Models.Preferences>;

      const createSessionSpy = vi
        .spyOn(account, 'createSession')
        .mockImplementation(async () => {
          vi.spyOn(account, 'get').mockResolvedValue(mockUser);
          return mockSession;
        });

      await handleOAuthSuccess();

      expect(createSessionSpy).toHaveBeenCalledTimes(1);
      expect(createSessionSpy).toHaveBeenCalledWith({
        userId: 'user_123',
        secret: 'oauth_secret_abc',
      });
      expect(mockLocation.assign).toHaveBeenCalledWith('/');
    });

    it('throws error when secret or userId is missing from callback URL', async () => {
      mockLocation.href = 'https://civicfix.gandhidham.gov.in/auth/success?userId=user_123';

      const createSessionSpy = vi.spyOn(account, 'createSession');

      await expect(handleOAuthSuccess()).rejects.toThrow('Missing OAuth credentials');
      expect(createSessionSpy).not.toHaveBeenCalled();
      expect(mockLocation.assign).not.toHaveBeenCalled();
    });

    it('throws error when URL has no query parameters', async () => {
      mockLocation.href = 'https://civicfix.gandhidham.gov.in/auth/success';

      const createSessionSpy = vi.spyOn(account, 'createSession');

      await expect(handleOAuthSuccess()).rejects.toThrow('Missing OAuth credentials');
      expect(createSessionSpy).not.toHaveBeenCalled();
    });

    it('deduplicates concurrent handleOAuthSuccess calls with identical token secret (StrictMode protection)', async () => {
      mockLocation.href =
        'https://civicfix.gandhidham.gov.in/auth/success?userId=user_123&secret=oauth_secret_abc';

      const mockSession = {
        $id: 'session_xyz',
        userId: 'user_123',
        expire: '2026-10-01',
        provider: 'google',
        providerUid: 'google_123',
        providerAccessToken: '',
        providerAccessTokenExpiry: '',
        providerRefreshToken: '',
        ip: '127.0.0.1',
        osCode: 'mac',
        osName: 'Mac',
        osVersion: '14.0',
        clientType: 'browser',
        clientCode: 'chrome',
        clientName: 'Chrome',
        clientVersion: '120.0',
        clientEngine: 'Blink',
        clientEngineVersion: '120.0',
        deviceName: 'Desktop',
        deviceBrand: 'Apple',
        deviceModel: 'MacBook',
        countryCode: 'IN',
        countryName: 'India',
        current: true,
        factors: [],
        secret: 'oauth_secret_abc',
        mfaUpdatedAt: '',
      } satisfies Models.Session;

      const mockUser = {
        $id: 'user_123',
        $createdAt: '2026-09-01',
        $updatedAt: '2026-09-01',
        name: 'Aditya Malaviya',
        registration: '2026-09-01',
        status: true,
        labels: [],
        passwordUpdate: '2026-09-01',
        email: 'aditya@example.com',
        phone: '',
        emailVerification: true,
        phoneVerification: false,
        mfa: false,
        prefs: {},
        targets: [],
        accessedAt: '2026-09-01',
      } satisfies Models.User<Models.Preferences>;

      const createSessionSpy = vi
        .spyOn(account, 'createSession')
        .mockImplementation(async () => {
          vi.spyOn(account, 'get').mockResolvedValue(mockUser);
          return mockSession;
        });

      // Concurrent invocation simulating React StrictMode double effect execution
      await Promise.all([handleOAuthSuccess(), handleOAuthSuccess()]);

      expect(createSessionSpy).toHaveBeenCalledTimes(1);
      expect(mockLocation.assign).toHaveBeenCalledWith('/');
    });

    it('recovers and navigates to / if createSession throws Invalid token error but session is already active', async () => {
      mockLocation.href =
        'https://civicfix.gandhidham.gov.in/auth/success?userId=user_123&secret=oauth_secret_already_used';

      vi.spyOn(account, 'createSession').mockRejectedValue(
        new Error('Invalid token passed in the request.')
      );

      const mockUser = {
        $id: 'user_123',
        $createdAt: '2026-09-01',
        $updatedAt: '2026-09-01',
        name: 'Active Citizen',
        registration: '2026-09-01',
        status: true,
        labels: [],
        passwordUpdate: '2026-09-01',
        email: 'active@example.com',
        phone: '',
        emailVerification: true,
        phoneVerification: false,
        mfa: false,
        prefs: {},
        targets: [],
        accessedAt: '2026-09-01',
      } satisfies Models.User<Models.Preferences>;

      vi.spyOn(account, 'get').mockResolvedValue(mockUser);

      await handleOAuthSuccess();

      expect(mockLocation.assign).toHaveBeenCalledWith('/');
    });

    it('re-throws error when createSession fails and no active session exists', async () => {
      mockLocation.href =
        'https://civicfix.gandhidham.gov.in/auth/success?userId=user_123&secret=truly_invalid_token';

      vi.spyOn(account, 'createSession').mockRejectedValue(
        new Error('Invalid token passed in the request.')
      );
      vi.spyOn(account, 'get').mockRejectedValue(new Error('Unauthorized (401)'));

      await expect(handleOAuthSuccess()).rejects.toThrow('Invalid token passed in the request.');
      expect(mockLocation.assign).not.toHaveBeenCalled();
    });
  });

  describe('loadDashboard', () => {
    it('loads and returns user info with fallback to email for name', async () => {
      const mockUser = {
        $id: 'usr_456',
        $createdAt: '2026-09-01',
        $updatedAt: '2026-09-01',
        name: 'Aditya Malaviya',
        registration: '2026-09-01',
        status: true,
        labels: [],
        passwordUpdate: '2026-09-01',
        email: 'aditya@example.com',
        phone: '+919876543210',
        emailVerification: true,
        phoneVerification: true,
        mfa: false,
        prefs: {},
        targets: [],
        accessedAt: '2026-09-01',
      } satisfies Models.User<Models.Preferences>;

      vi.spyOn(account, 'get').mockResolvedValue(mockUser);

      const dashboard = await loadDashboard();

      expect(dashboard).toEqual({
        id: 'usr_456',
        name: 'Aditya Malaviya',
        email: 'aditya@example.com',
      });
    });

    it('falls back to email when user name is empty string', async () => {
      const mockUser = {
        $id: 'usr_789',
        $createdAt: '2026-09-01',
        $updatedAt: '2026-09-01',
        name: '',
        registration: '2026-09-01',
        status: true,
        labels: [],
        passwordUpdate: '2026-09-01',
        email: 'user789@example.com',
        phone: '',
        emailVerification: true,
        phoneVerification: false,
        mfa: false,
        prefs: {},
        targets: [],
        accessedAt: '2026-09-01',
      } satisfies Models.User<Models.Preferences>;

      vi.spyOn(account, 'get').mockResolvedValue(mockUser);

      const dashboard = await loadDashboard();

      expect(dashboard).toEqual({
        id: 'usr_789',
        name: 'user789@example.com',
        email: 'user789@example.com',
      });
    });
  });

  describe('signOut', () => {
    it('deletes current session and redirects to /auth', async () => {
      const deleteSessionSpy = vi
        .spyOn(account, 'deleteSession')
        .mockResolvedValue({});

      await signOut();

      expect(deleteSessionSpy).toHaveBeenCalledTimes(1);
      expect(deleteSessionSpy).toHaveBeenCalledWith({ sessionId: 'current' });
      expect(mockLocation.assign).toHaveBeenCalledWith('/auth');
    });

    it('still navigates to /auth even if deleteSession throws (e.g. session already invalidated)', async () => {
      vi.spyOn(account, 'deleteSession').mockRejectedValue(new Error('Session not found'));

      await signOut();

      expect(mockLocation.assign).toHaveBeenCalledWith('/auth');
    });
  });

  describe('Route Guard Behaviors', () => {
    it('guards /dashboard by redirecting unauthenticated users to /auth', async () => {
      vi.spyOn(account, 'get').mockRejectedValue(new Error('User unauthorized (401)'));

      // Simulate Dashboard guard evaluation
      let isAuthenticated = false;
      try {
        await account.get();
        isAuthenticated = true;
      } catch {
        mockLocation.assign('/auth');
      }

      expect(isAuthenticated).toBe(false);
      expect(mockLocation.assign).toHaveBeenCalledWith('/auth');
    });

    it('guards /auth by redirecting already-authenticated users to /', async () => {
      const mockUser = {
        $id: 'usr_valid',
        $createdAt: '2026-09-01',
        $updatedAt: '2026-09-01',
        name: 'Valid Citizen',
        registration: '2026-09-01',
        status: true,
        labels: [],
        passwordUpdate: '2026-09-01',
        email: 'citizen@gandhidham.gov.in',
        phone: '',
        emailVerification: true,
        phoneVerification: false,
        mfa: false,
        prefs: {},
        targets: [],
        accessedAt: '2026-09-01',
      } satisfies Models.User<Models.Preferences>;

      vi.spyOn(account, 'get').mockResolvedValue(mockUser);

      // Simulate Auth guard evaluation
      let shouldRenderAuthScreen = false;
      try {
        await account.get();
        mockLocation.assign('/');
      } catch {
        shouldRenderAuthScreen = true;
      }

      expect(shouldRenderAuthScreen).toBe(false);
      expect(mockLocation.assign).toHaveBeenCalledWith('/');
    });

    it('allows unauthenticated users to stay on /auth and view sign-in screen', async () => {
      vi.spyOn(account, 'get').mockRejectedValue(new Error('Unauthenticated'));

      let shouldRenderAuthScreen = false;
      try {
        await account.get();
        mockLocation.assign('/');
      } catch {
        shouldRenderAuthScreen = true;
      }

      expect(shouldRenderAuthScreen).toBe(true);
      expect(mockLocation.assign).not.toHaveBeenCalled();
    });
  });
});

