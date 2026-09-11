/**
 * Shared Cross-Platform Mock User Store & Registration Service
 *
 * Compatible with:
 * - Web (React / Vite)
 * - Mobile (React Native / Expo)
 * - Node / Vitest test runners
 *
 * Provides thread-safe, memory-safe user management with optional browser localStorage
 * caching and clean integration with UserSession models.
 */

import {
  UserSession,
  UserRole,
  UserStatus,
  MockUser,
  CitizenMockUser,
  RegisterCitizenInput,
} from '../types';

export type {
  UserSession,
  UserRole,
  UserStatus,
  MockUser,
  CitizenMockUser,
  RegisterCitizenInput,
};

/**
 * Pre-seeded initial mock users matching municipal platform roles
 */
export const INITIAL_MOCK_USERS: MockUser[] = [
  {
    user_id: 'usr_admin_001',
    full_name: 'Super Admin (Municipality)',
    email: 'admin@civicfix.gov.in',
    phone_number: '+91 98250 00001',
    // REAL BACKEND INTEGRATION: Production backend must securely hash this password
    password: 'password123',
    role: 'admin',
    department: null,
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    user_id: 'usr_staff_001',
    full_name: 'Ward Officer (Gandhidham MC)',
    email: 'staff@civicfix.gov.in',
    phone_number: '+91 98250 00002',
    // REAL BACKEND INTEGRATION: Production backend must securely hash this password
    password: 'password123',
    role: 'staff',
    department: 'Roads & Infrastructure',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    user_id: 'usr_citizen_001',
    full_name: 'Ramesh Patel',
    email: 'citizen@gmail.com',
    phone_number: '+91 98250 12345',
    // REAL BACKEND INTEGRATION: Production backend must securely hash this password
    password: 'password123',
    role: 'citizen',
    department: null,
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

const STORAGE_KEY = 'civicfix_mock_users';

/**
 * Cross-platform detection of localStorage availability.
 * Safely returns false in React Native / Expo, Node, and SSR environments.
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage !== null
    );
  } catch {
    return false;
  }
};

/**
 * In-memory fallback and caching store
 */
let memoryUsersStore: MockUser[] = [...INITIAL_MOCK_USERS];

/**
 * Type guard verifying array of MockUser objects without type assertion
 */
const isMockUserArray = (data: unknown): data is MockUser[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item: unknown): boolean =>
        item !== null &&
        typeof item === 'object' &&
        'user_id' in item &&
        'email' in item &&
        'role' in item
    )
  );
};

/**
 * Load users from localStorage (browser) or memory (mobile/test)
 */
const loadUsers = (): MockUser[] => {
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isMockUserArray(parsed) && parsed.length > 0) {
          memoryUsersStore = parsed;
          return memoryUsersStore;
        }
      }
    } catch {
      // Fall through to memory store if parsing fails
    }
  }
  return memoryUsersStore;
};

/**
 * Save users to localStorage if available and always update memory store
 */
const saveUsers = (users: MockUser[]): void => {
  memoryUsersStore = [...users];
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryUsersStore));
    } catch {
      // Ignore quota or permission errors
    }
  }
};

// Initialize store on load
loadUsers();

/**
 * Retrieve all mock users from store
 */
export const getMockUsers = (): MockUser[] => {
  return [...loadUsers()];
};

/**
 * Check if an email address is already registered in the mock store (case-insensitive)
 */
export const isEmailRegistered = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const users = loadUsers();
  return users.some((user) => user.email.toLowerCase() === normalized);
};

/**
 * Find a mock user by email address
 */
export const findMockUserByEmail = (email: string): MockUser | undefined => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;
  const users = loadUsers();
  return users.find((user) => user.email.toLowerCase() === normalized);
};

/**
 * Append a newly registered citizen to the mock user store.
 *
 * Simulates network latency (~600ms), generates a unique user_id,
 * and enforces the non-selectable "citizen" role assignment.
 */
export const registerMockUser = async (
  input?: RegisterCitizenInput | null
): Promise<CitizenMockUser> => {
  if (!input) {
    throw new Error('Registration details are required');
  }

  const normalizedEmail = input.email ? input.email.trim().toLowerCase() : '';

  if (!input.fullName || input.fullName.trim().length < 2) {
    throw new Error('Full name must be at least 2 characters');
  }

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error('Please enter a valid email address');
  }

  // Validate duplicate prevention against mock store
  if (isEmailRegistered(normalizedEmail)) {
    throw new Error('Email already registered');
  }

  const rawPhone = (input.phoneNumber || '').trim();
  if (!rawPhone || !/^\+?[0-9\s\-()]+$/.test(rawPhone)) {
    throw new Error('Please enter a valid 10-digit phone number');
  }

  const digits = rawPhone.replace(/\D/g, '');
  const isTen = digits.length === 10 && /^[6-9]/.test(digits);
  const isTwelve = digits.length === 12 && /^91[6-9]/.test(digits);
  const isEleven = digits.length === 11 && /^0[6-9]/.test(digits);

  if (!isTen && !isTwelve && !isEleven) {
    throw new Error('Please enter a valid 10-digit phone number');
  }

  if (!input.password) {
    throw new Error('Password is required');
  }

  if (input.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (!/[a-zA-Z]/.test(input.password) || !/[0-9]/.test(input.password)) {
    throw new Error('Password must contain both letters and numbers');
  }

  // =============================================================================
  // REAL BACKEND INTEGRATION POINT
  // In production, this mock delay & memory append will be replaced with an HTTP POST:
  //
  // const res = await fetch('/api/v1/auth/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     fullName: input.fullName.trim(),
  //     email: normalizedEmail,
  //     phoneNumber: input.phoneNumber.trim(),
  //     password: input.password, // Backend hashes with Argon2id
  //     role: 'citizen',
  //   }),
  // });
  // const data = await res.json();
  // =============================================================================

  // Simulate network delay (~600ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Double-check duplicate after simulated network delay
  if (isEmailRegistered(normalizedEmail)) {
    throw new Error('Email already registered');
  }

  const newCitizen: CitizenMockUser = {
    user_id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9),
    full_name: input.fullName.trim(),
    email: normalizedEmail,
    phone_number: input.phoneNumber.trim(),
    // REAL BACKEND INTEGRATION: In production, passwords must be securely hashed on the server (e.g., argon2 / bcrypt) and NEVER stored in plaintext.
    password: input.password,
    role: 'citizen',
    department: null,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const currentUsers = loadUsers();
  const updatedUsers = [...currentUsers, newCitizen];
  saveUsers(updatedUsers);

  return newCitizen;
};

/**
 * Reconcile MockUser record with the platform's UserSession interface
 */
export const mockUserToUserSession = (user: MockUser): UserSession => {
  return {
    id: user.user_id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    department: user.department ?? undefined,
    phone: user.phone_number,
    locality: 'Gandhidham Central',
    ward: 'Ward 1 (West)',
    jwt: `jwt_mock_${user.user_id}_${Math.random().toString(36).substring(2, 10)}`,
  };
};

/**
 * Reset mock user store back to initial seed data (useful for test isolation)
 */
export const resetMockUsers = (): void => {
  memoryUsersStore = [...INITIAL_MOCK_USERS];
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
};
