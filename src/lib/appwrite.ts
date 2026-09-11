import { Client, Account, OAuthProvider } from 'appwrite';

// Configurable via Vite env vars: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'civicfix-gandhidham';

export const client = new Client();

if (APPWRITE_PROJECT_ID && APPWRITE_PROJECT_ID !== 'civicfix-gandhidham') {
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
} else {
  // Graceful initialization for development
  client.setEndpoint(APPWRITE_ENDPOINT).setProject('civicfix-dev');
}

export const account = new Account(client);

import { UserSession } from '../types';
import {
  findMockUserByEmail,
  registerMockUser,
  mockUserToUserSession,
} from './mockUsers';

export type { UserSession };

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const memorySessionStore: Record<string, string> = {};

const safeStorage = {
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

const DEMO_USERS: Record<string, { role: 'citizen' | 'staff' | 'admin'; name: string; department?: string }> = {
  'admin@civicfix.gov.in': { role: 'admin', name: 'Super Admin (Municipality)' },
  'staff@civicfix.gov.in': { role: 'staff', name: 'Ward Officer (Gandhidham MC)', department: 'Roads & Infrastructure' },
  'citizen@gmail.com': { role: 'citizen', name: 'Ramesh Patel' },
};

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

    // Demo simulation fallback with realistic delay
    const lowerEmail = email.toLowerCase().trim();
    const existingMock = findMockUserByEmail(lowerEmail);
    if (existingMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const session = mockUserToUserSession(existingMock);
      safeStorage.setItem('civicfix_session', JSON.stringify(session));
      return session;
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const demoUser = DEMO_USERS[lowerEmail];
    const role = demoUser ? demoUser.role : (lowerEmail.includes('admin') ? 'admin' : lowerEmail.includes('staff') ? 'staff' : 'citizen');
    const name = demoUser ? demoUser.name : email.split('@')[0];
    const department = demoUser?.department || (role === 'staff' ? 'Roads & Infrastructure' : undefined);

    const mockSession: UserSession = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email: lowerEmail,
      role,
      department,
      phone: '+91 98250 12345',
      locality: 'Sector 1A, Near Community Center',
      ward: 'Ward 1 (West)',
      jwt: 'jwt_mock_' + Math.random().toString(36).substring(2, 18),
    };

    safeStorage.setItem('civicfix_session', JSON.stringify(mockSession));
    return mockSession;
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
   * Google OAuth / Social Authentication
   */
  async loginWithGoogle(): Promise<void> {
    if (import.meta.env.VITE_APPWRITE_PROJECT_ID) {
      try {
        account.createOAuth2Session(
          OAuthProvider.Google,
          window.location.origin + '/?auth=success',
          window.location.origin + '/?auth=failed'
        );
        return;
      } catch {
        // Fallback
      }
    }

    // Demo social auth simulation
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockSession: UserSession = {
      id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
      name: 'Google Citizen User',
      email: 'citizen.google@gmail.com',
      role: 'citizen',
      locality: 'Sector 4, Main Market & Plaza',
      ward: 'Ward 4 (Central)',
      jwt: 'jwt_mock_oauth_' + Math.random().toString(36).substring(2, 18),
    };
    safeStorage.setItem('civicfix_session', JSON.stringify(mockSession));
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
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
