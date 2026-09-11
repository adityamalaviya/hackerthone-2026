/**
 * Core Authentication & User Session Type Definitions
 * Shared across Web and Mobile (React Native / Expo) runtimes.
 */

export type UserRole = 'citizen' | 'staff' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  locality?: string;
  ward?: string;
  jwt?: string;
}

export interface MockUser {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  /**
   * SECURITY NOTICE:
   * In production, passwords must be securely hashed on the server (e.g. Argon2id / bcrypt)
   * and NEVER stored in plaintext.
   */
  password: string;
  role: UserRole;
  department: string | null;
  status: UserStatus;
  created_at: string;
}

export interface CitizenMockUser extends MockUser {
  role: 'citizen';
  department: null;
  status: 'active';
}

export interface RegisterCitizenInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}
