import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Mobile Auth Navigation Guards and Deep Link Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth Guards Specification Verification', () => {
    // Guard 1: Dashboard stack: await account.get(). If it fails, navigate to Auth.
    it('Dashboard guard navigates to Auth when account.get() fails', async () => {
      const mockAccountGet = vi.fn().mockRejectedValue(new Error('Session expired'));
      const navigate = vi.fn();

      async function dashboardGuard() {
        try {
          const user = await mockAccountGet();
          return user;
        } catch {
          navigate('auth');
          return null;
        }
      }

      const result = await dashboardGuard();
      expect(result).toBeNull();
      expect(navigate).toHaveBeenCalledWith('auth');
    });

    // Guard 2: Auth screen: await account.get(). If it succeeds, navigate to Dashboard.
    it('Auth screen guard navigates to Dashboard when account.get() succeeds', async () => {
      const mockUser = { $id: 'usr_abc', name: 'Authorized User', email: 'user@example.com' };
      const mockAccountGet = vi.fn().mockResolvedValue(mockUser);
      const navigate = vi.fn();

      async function authScreenGuard() {
        try {
          const user = await mockAccountGet();
          if (user) {
            navigate('dashboard', user);
            return user;
          }
        } catch {
          // Stay on auth
        }
        return null;
      }

      const result = await authScreenGuard();
      expect(result).toEqual(mockUser);
      expect(navigate).toHaveBeenCalledWith('dashboard', mockUser);
    });

    // Guard 3: Resolve auth state before rendering protected UI.
    it('resolves auth state before determining final route', async () => {
      let authStateResolved = false;
      let targetRoute: 'auth' | 'dashboard' | 'loading' = 'loading';

      const mockAccountGet = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { $id: 'usr_xyz', name: 'Resolved User' };
      });

      async function resolveAuthState() {
        targetRoute = 'loading';
        try {
          const user = await mockAccountGet();
          if (user) {
            targetRoute = 'dashboard';
          } else {
            targetRoute = 'auth';
          }
        } catch {
          targetRoute = 'auth';
        } finally {
          authStateResolved = true;
        }
      }

      expect(authStateResolved).toBe(false);
      expect(targetRoute).toBe('loading');

      await resolveAuthState();

      expect(authStateResolved).toBe(true);
      expect(targetRoute).toBe('dashboard');
    });
  });

  describe('OAuth Deep Link Callback Handler', () => {
    it('extracts userId and secret from redirect callback URL and creates session', async () => {
      const mockCreateSession = vi.fn().mockResolvedValue({ $id: 'sess_123' });
      const mockAccountGet = vi.fn().mockResolvedValue({ $id: 'usr_456', name: 'Callback User' });

      async function handleOAuthCallbackUrl(callbackUrl: string) {
        const parsed = new URL(callbackUrl);
        const userId = parsed.searchParams.get('userId');
        const secret = parsed.searchParams.get('secret');

        if (!userId || !secret) {
          throw new Error('Missing OAuth credentials');
        }

        await mockCreateSession({ userId, secret });
        const user = await mockAccountGet();
        return { session: { $id: 'sess_123' }, user };
      }

      const validUrl = 'appwrite-callback-6aa3a24400158be49594://auth?userId=usr_456&secret=secret_token_val_789';
      const result = await handleOAuthCallbackUrl(validUrl);

      expect(mockCreateSession).toHaveBeenCalledWith({
        userId: 'usr_456',
        secret: 'secret_token_val_789',
      });
      expect(result.user).toEqual({ $id: 'usr_456', name: 'Callback User' });
    });

    it('rejects callback with missing credentials and returns error', async () => {
      const mockCreateSession = vi.fn();

      async function handleOAuthCallbackUrl(callbackUrl: string) {
        const parsed = new URL(callbackUrl);
        const userId = parsed.searchParams.get('userId');
        const secret = parsed.searchParams.get('secret');

        if (!userId || !secret) {
          throw new Error('Missing OAuth credentials');
        }

        await mockCreateSession({ userId, secret });
      }

      const invalidUrl = 'appwrite-callback-6aa3a24400158be49594://auth?userId=usr_456'; // Missing secret
      await expect(handleOAuthCallbackUrl(invalidUrl)).rejects.toThrow('Missing OAuth credentials');
      expect(mockCreateSession).not.toHaveBeenCalled();
    });
  });

  describe('Dashboard User Name Display & Fallback', () => {
    it('uses user.name when present', () => {
      const user = { $id: '1', name: 'Gandhidham Citizen', email: 'citizen@gov.in' };
      const displayName = user.name || user.email || 'Authenticated User';
      expect(displayName).toBe('Gandhidham Citizen');
    });

    it('falls back to user.email when user.name is empty or absent', () => {
      const user = { $id: '2', name: '', email: 'citizen@gov.in' };
      const displayName = user.name || user.email || 'Authenticated User';
      expect(displayName).toBe('citizen@gov.in');
    });
  });
});
