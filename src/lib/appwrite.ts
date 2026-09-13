import { Client, Account, OAuthProvider, Databases, Query, type RealtimeResponseEvent } from 'appwrite';
import { findStaffByEmail } from './admin/staffStore';

// Hardcoded / pre-approved unique admin email (Section ① & ⚙️)
export const PRE_APPROVED_ADMIN_EMAIL = 'admin@civicfix.gov.in';

// Appwrite Cloud configuration
export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6aa3a24400158be49594';
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '6aa3cd67003815f6851f';
export const APPWRITE_ISSUES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ISSUES_ID || 'issues';

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export { OAuthProvider };

/**
 * Initiates Google OAuth2 token creation flow.
 * Redirects browser to Google OAuth provider.
 */
export async function signInWithProvider(): Promise<void> {
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost:5180';
  const success = `${origin}/auth/success`;
  const failure = `${origin}/auth/failure`;

  // createOAuth2Token navigates the browser to the provider; do not redirect manually.
  await account.createOAuth2Token({
    provider: OAuthProvider.Google,
    success,
    failure,
  });
}

export const signInWithGoogle = signInWithProvider;

import { UserSession } from '../types';
import {
  findMockUserByEmail,
  registerMockUser,
  mockUserToUserSession,
} from './mockUsers';

export type { UserSession };

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const memorySessionStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (isBrowser) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fallback to memory
      }
    }
    return memorySessionStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (isBrowser) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Fallback to memory
      }
    }
    memorySessionStore[key] = value;
  },
  removeItem: (key: string): void => {
    if (isBrowser) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fallback to memory
      }
    }
    delete memorySessionStore[key];
  },
};

// In-flight and completed token secrets cache to prevent double-execution in React StrictMode
const processedOAuthTokens = new Map<string, Promise<void>>();

export function resetProcessedOAuthTokensForTesting(): void {
  processedOAuthTokens.clear();
}

/**
 * Handles the OAuth2 callback by reading credentials from URL and creating a session.
 * Features StrictMode concurrency protection, active session recovery, and safeStorage sync.
 */
export async function handleOAuthSuccess(callbackUrl?: string): Promise<void> {
  const href =
    callbackUrl ||
    (typeof window !== 'undefined' && window.location?.href
      ? window.location.href
      : 'http://localhost:5180');
  const url = new URL(href);
  const secret = url.searchParams.get('secret');
  const userId = url.searchParams.get('userId');
  if (!secret || !userId) {
    throw new Error('Missing OAuth credentials');
  }

  // StrictMode / duplicate invocation lock for this specific token secret
  const inFlight = processedOAuthTokens.get(secret);
  if (inFlight) {
    return inFlight;
  }

  const exchangeTask = (async (): Promise<void> => {
    let sessionEstablished = false;

    // 1. Check if an active session for this user is already established
    try {
      const activeUser = await account.get();
      if (activeUser && activeUser.$id === userId) {
        sessionEstablished = true;
      }
    } catch {
      // Not yet established, proceed to exchange
    }

    // 2. Exchange token if session not already verified
    if (!sessionEstablished) {
      try {
        await account.createSession({ userId, secret });
        sessionEstablished = true;
      } catch (err: unknown) {
        // If createSession failed (e.g. "Invalid token passed in the request" due to concurrent exchange)
        // verify if the user actually has an active session now
        try {
          const activeUser = await account.get();
          if (activeUser) {
            sessionEstablished = true;
          } else {
            throw err;
          }
        } catch {
          throw err;
        }
      }
    }

    // 3. Synchronize citizen session with safeStorage so all application components recognize login
    await syncAppwriteSession();

    // 4. Navigate to home page
    if (typeof window !== 'undefined' && window.location) {
      window.location.assign('/');
    }
  })();

  processedOAuthTokens.set(secret, exchangeTask);
  return exchangeTask;
}
 
/**
 * Synchronizes Appwrite account session with local safeStorage and returns the UserSession.
 */
export async function syncAppwriteSession(): Promise<UserSession | null> {
  try {
    const user = await account.get();
    let jwtToken = '';
    try {
      const jwtObj = await account.createJWT();
      jwtToken = jwtObj.jwt;
    } catch {
      // Optional JWT
    }

    const lowerEmail = user.email.toLowerCase().trim();
    const staffMember = findStaffByEmail(lowerEmail);

    // 3-Step Role Resolution Hierarchy: Admin -> Staff Table -> Citizen (Default)
    const role: 'citizen' | 'staff' | 'admin' =
      lowerEmail === PRE_APPROVED_ADMIN_EMAIL.toLowerCase()
        ? 'admin'
        : staffMember && staffMember.status === 'active'
        ? 'staff'
        : 'citizen';

    const department =
      role === 'staff'
        ? staffMember?.department || 'Roads & Infrastructure'
        : undefined;

    const userSession: UserSession = {
      id: user.$id,
      name: user.name || (staffMember ? staffMember.name : user.email.split('@')[0]),
      email: user.email,
      role,
      department,
      phone: user.phone || staffMember?.phone || undefined,
      locality: typeof user.prefs?.locality === 'string' ? user.prefs.locality : 'Gandhidham Central',
      ward: typeof user.prefs?.ward === 'string' ? user.prefs.ward : 'Ward 4 (Central)',
      jwt: jwtToken,
    };
    safeStorage.setItem('civicfix_session', JSON.stringify(userSession));
    return userSession;
  } catch {
    return null;
  }
}

/**
 * Loads current authenticated user details for dashboard.
 */
export async function loadDashboard(): Promise<{ name: string; email: string; id: string }> {
  const user = await account.get();
  return {
    id: user.$id,
    name: user.name || user.email,
    email: user.email,
  };
}

/**
 * Signs out current session and redirects to /auth.
 */
export async function signOut(): Promise<void> {
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch {
    // Session might already be expired or missing
  }
  safeStorage.removeItem('civicfix_session');
  if (typeof window !== 'undefined' && window.location) {
    window.location.assign('/auth');
  }
}



const isUserSession = (data: unknown): data is UserSession => {
  return (
    data !== null &&
    typeof data === 'object' &&
    'id' in data &&
    typeof data.id === 'string' &&
    'name' in data &&
    typeof data.name === 'string' &&
    'email' in data &&
    typeof data.email === 'string' &&
    'role' in data &&
    (data.role === 'citizen' || data.role === 'staff' || data.role === 'admin')
  );
};

export const authService = {
  /**
   * Universal Login for Citizen, Staff, and Admin
   */
  async login(email: string, password: string): Promise<UserSession> {
    try {
      // If configured with real Appwrite credentials
      if (import.meta.env.VITE_APPWRITE_PROJECT_ID) {
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        let jwtToken = '';
        try {
          const jwtObj = await account.createJWT();
          jwtToken = jwtObj.jwt;
        } catch {
          // JWT generation optional depending on Appwrite scope
        }

        const rawRole = user.prefs?.role;
        const role: 'citizen' | 'staff' | 'admin' =
          rawRole === 'admin' || rawRole === 'staff' || rawRole === 'citizen'
            ? rawRole
            : email.includes('admin')
            ? 'admin'
            : email.includes('staff') || email.includes('gov.in')
            ? 'staff'
            : 'citizen';

        const rawDept = user.prefs?.department;
        const department: string | undefined =
          typeof rawDept === 'string'
            ? rawDept
            : role === 'staff'
            ? 'Roads & Infrastructure'
            : undefined;

        const rawLocality = user.prefs?.locality;
        const locality = typeof rawLocality === 'string' ? rawLocality : 'Gandhidham Central';

        const rawWard = user.prefs?.ward;
        const ward = typeof rawWard === 'string' ? rawWard : 'Ward 4 (Central)';

        return {
          id: user.$id,
          name: user.name || email.split('@')[0],
          email: user.email,
          role,
          department,
          phone: user.phone || undefined,
          locality,
          ward,
          jwt: jwtToken,
        };
      }
    } catch {
      // Fallback to demo simulator if Appwrite project not connected yet
    }

    // Demo simulation fallback implementing exact 3-step routing hierarchy:
    // Login -> Email check (admin?) -> Email check (staff table?) -> Citizen (default)
    const lowerEmail = email.toLowerCase().trim();

    // 1. Unique Admin Email Match (Section ①)
    if (lowerEmail === PRE_APPROVED_ADMIN_EMAIL.toLowerCase()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const adminSession: UserSession = {
        id: 'usr_admin_001',
        name: 'Super Admin (Municipality)',
        email: lowerEmail,
        role: 'admin',
        department: undefined,
        phone: '+91 98250 00001',
        locality: 'Gandhidham Municipal Corporation Headquarters',
        ward: 'Central Admin',
        jwt: 'jwt_mock_admin_' + Math.random().toString(36).substring(2, 18),
      };
      safeStorage.setItem('civicfix_session', JSON.stringify(adminSession));
      return adminSession;
    }

    // 2. Email in Staff Table Match (Section ① & ④)
    const staffMember = findStaffByEmail(lowerEmail);
    if (staffMember && staffMember.status === 'active') {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const staffSession: UserSession = {
        id: staffMember.id,
        name: staffMember.name,
        email: lowerEmail,
        role: 'staff',
        department: staffMember.department,
        phone: staffMember.phone || '+91 98250 00002',
        locality: 'Gandhidham Zonal Office',
        ward: 'Ward 2 (East)',
        jwt: 'jwt_mock_staff_' + Math.random().toString(36).substring(2, 18),
      };
      safeStorage.setItem('civicfix_session', JSON.stringify(staffSession));
      return staffSession;
    }

    // 3. Citizen Match or Default (Section ①)
    const existingMock = findMockUserByEmail(lowerEmail);
    if (existingMock) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const session = mockUserToUserSession(existingMock);
      session.role = 'citizen';
      session.department = undefined;
      safeStorage.setItem('civicfix_session', JSON.stringify(session));
      return session;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    const defaultCitizenSession: UserSession = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0],
      email: lowerEmail,
      role: 'citizen',
      department: undefined,
      phone: '+91 98250 12345',
      locality: 'Sector 1A, Near Community Center',
      ward: 'Ward 1 (West)',
      jwt: 'jwt_mock_' + Math.random().toString(36).substring(2, 18),
    };

    safeStorage.setItem('civicfix_session', JSON.stringify(defaultCitizenSession));
    return defaultCitizenSession;
  },

  /**
   * Citizen-only Registration
   */
  async register(params: {
    fullName: string;
    email: string;
    password: string;
    mobileNumber?: string;
    phoneNumber?: string;
    locality?: string;
    ward?: string;
  }): Promise<UserSession> {
    const contactPhone = params.phoneNumber || params.mobileNumber || '';
    try {
      if (import.meta.env.VITE_APPWRITE_PROJECT_ID) {
        const userId = 'usr_' + Math.random().toString(36).substring(2, 11);
        await account.create(userId, params.email, params.password, params.fullName);
        await account.createEmailPasswordSession(params.email, params.password);
        
        // Save preferences
        await account.updatePrefs({
          role: 'citizen',
          phone: contactPhone,
          locality: params.locality || '',
          ward: params.ward || '',
        });

        let jwtToken = '';
        try {
          const jwtObj = await account.createJWT();
          jwtToken = jwtObj.jwt;
        } catch {
          // fallback
        }

        return {
          id: userId,
          name: params.fullName,
          email: params.email,
          role: 'citizen',
          phone: contactPhone,
          locality: params.locality,
          ward: params.ward,
          jwt: jwtToken,
        };
      }
    } catch {
      // Fallback
    }

    // Reconcile with shared cross-platform mock user store
    const newCitizen = await registerMockUser({
      fullName: params.fullName,
      email: params.email,
      phoneNumber: contactPhone,
      password: params.password,
    });

    const mockSession = mockUserToUserSession(newCitizen);
    if (params.locality) mockSession.locality = params.locality;
    if (params.ward) mockSession.ward = params.ward;

    safeStorage.setItem('civicfix_session', JSON.stringify(mockSession));
    return mockSession;
  },

  /**
   * Google OAuth / Social Authentication using OAuth2 Token flow
   */
  async loginWithGoogle(): Promise<void> {
    await signInWithGoogle();
  },

  getCurrentSession(): UserSession | null {
    const raw = safeStorage.getItem('civicfix_session');
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isUserSession(parsed)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  logout(): void {
    try {
      account.deleteSession('current').catch(() => {});
    } catch {
      // ignore
    }
    safeStorage.removeItem('civicfix_session');
  }
};

// ============================================================================
// Realtime & Database helpers (web SDK)
// These are used by MapPreview and ReportActivityPage instead of lib/appwrite.js
// so that Vite never tries to bundle react-native code.
// ============================================================================

/**
 * Fetch all issues reported by a given user (or current session user).
 */
export async function getMyIssues(userId?: string): Promise<Record<string, unknown>[]> {
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      try {
        const user = await account.get();
        targetUserId = user.$id;
      } catch {
        // unauthenticated — return empty
        return [];
      }
    }
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ISSUES_COLLECTION_ID,
      [
        Query.equal('reportedBy', targetUserId),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]
    );
    return response.documents as unknown as Record<string, unknown>[];
  } catch {
    return [];
  }
}

/**
 * Fetch all issues across the platform (for live map / admin).
 */
export async function getAllIssues(): Promise<Record<string, unknown>[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ISSUES_COLLECTION_ID,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents as unknown as Record<string, unknown>[];
  } catch {
    return [];
  }
}

/**
 * Create a new civic issue document in Appwrite Database
 */
export async function createIssueDocument(issueData: {
  title: string;
  category: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  ward: string;
  photoUrl?: string;
  severity?: string;
  reportedBy?: string;
}): Promise<Record<string, unknown>> {
  try {
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ISSUES_COLLECTION_ID,
      'unique()',
      {
        ...issueData,
        status: 'Reported',
        votes: 1,
        createdAt: new Date().toISOString(),
      }
    );
    return doc as unknown as Record<string, unknown>;
  } catch (err) {
    // Graceful offline/demo simulated document
    return {
      $id: `CF-2026-${Date.now().toString().slice(-4)}`,
      ...issueData,
      status: 'Reported',
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Subscribe to realtime issue document changes.
 * Returns an unsubscribe function.
 */
export function subscribeToIssues(
  onUpdate: (event: RealtimeResponseEvent<Record<string, unknown>>) => void
): () => void {
  try {
    const channel = `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_ISSUES_COLLECTION_ID}.documents`;
    return client.subscribe(channel, onUpdate);
  } catch {
    return () => {};
  }
}

