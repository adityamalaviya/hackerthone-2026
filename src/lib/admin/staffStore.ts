/**
 * Unified Shared Staff Store (Email is Identity Key)
 *
 * Implements Section ④ (Admin — Staff Management) & Section ① (Login Routing)
 * of doc/role-and-email-base-login-flow.md:
 * - Admin has full CRUD control over staff accounts. Email is the identity key.
 * - Adding an email grants Staff panel access on next login.
 * - Department can be updated, but name and email are immutable.
 * - Deleting a staff member removes their email from the staff table immediately.
 *   On next login, they are auto-routed to the citizen panel.
 */

import { StaffMember, DepartmentName, AddStaffPayload } from '../../types/admin';
import { INITIAL_MOCK_STAFF } from './mockAdminData';

const STAFF_STORAGE_KEY = 'civicfix_staff_roster';

export const SEED_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'stf-000',
    name: 'Ward Officer (Gandhidham MC)',
    email: 'staff@civicfix.gov.in',
    department: 'Roads & Infrastructure',
    status: 'active',
    activeAssignedCount: 2,
    phone: '+91 98250 00002',
  },
  ...INITIAL_MOCK_STAFF,
];

let memoryStaffRoster: StaffMember[] = [...SEED_STAFF_MEMBERS];

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

const isStaffMemberArray = (data: unknown): data is StaffMember[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item: unknown): boolean =>
        item !== null &&
        typeof item === 'object' &&
        'id' in item &&
        'email' in item &&
        'department' in item &&
        'status' in item
    )
  );
};

export const loadStaffRoster = (): StaffMember[] => {
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(STAFF_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isStaffMemberArray(parsed) && parsed.length > 0) {
          memoryStaffRoster = parsed;
          return memoryStaffRoster;
        }
      }
    } catch {
      // Fall through to memory roster
    }
  }
  return memoryStaffRoster;
};

const saveStaffRoster = (roster: StaffMember[]): void => {
  memoryStaffRoster = [...roster];
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(memoryStaffRoster));
    } catch {
      // Ignore quota errors
    }
  }
};

// Initial load
loadStaffRoster();

/**
 * Get all current staff members
 */
export const getStaffRoster = (): StaffMember[] => {
  return [...loadStaffRoster()];
};

/**
 * Find staff member by email address (case-insensitive)
 * Used by authService to determine if an email belongs to the staff table
 */
export const findStaffByEmail = (email: string): StaffMember | undefined => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;
  const roster = loadStaffRoster();
  return roster.find((member) => member.email.toLowerCase() === normalized);
};

/**
 * Add a new staff member to the staff table
 * Grants staff panel access on their next login
 */
export const addStaffToStore = async (payload: AddStaffPayload): Promise<StaffMember> => {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Staff email address is required');
  }

  const existing = findStaffByEmail(normalizedEmail);
  if (existing) {
    throw new Error(`A staff member with email "${payload.email}" already exists`);
  }

  const newStaffId = 'stf-' + Math.random().toString(36).substring(2, 7);
  const newMember: StaffMember = {
    id: newStaffId,
    name: payload.name.trim(),
    email: normalizedEmail,
    department: payload.department,
    status: 'active',
    activeAssignedCount: 0,
    phone: payload.phone || '+91 98251 ' + Math.floor(10000 + Math.random() * 90000),
  };

  const currentRoster = loadStaffRoster();
  const updatedRoster = [newMember, ...currentRoster];
  saveStaffRoster(updatedRoster);

  return newMember;
};

/**
 * Update staff department only (name & email cannot change per Section ④)
 */
export const updateStaffDeptInStore = async (
  staffId: string,
  department: DepartmentName
): Promise<StaffMember> => {
  const currentRoster = loadStaffRoster();
  const targetIndex = currentRoster.findIndex((m) => m.id === staffId);
  if (targetIndex === -1) {
    throw new Error('Staff member not found');
  }

  const updatedMember: StaffMember = {
    ...currentRoster[targetIndex],
    department,
  };

  const updatedRoster = [...currentRoster];
  updatedRoster[targetIndex] = updatedMember;
  saveStaffRoster(updatedRoster);

  return updatedMember;
};

/**
 * Toggle staff active/disabled status
 */
export const toggleStaffStatusInStore = async (staffId: string): Promise<StaffMember> => {
  const currentRoster = loadStaffRoster();
  const targetIndex = currentRoster.findIndex((m) => m.id === staffId);
  if (targetIndex === -1) {
    throw new Error('Staff member not found');
  }

  const currentStatus = currentRoster[targetIndex].status;
  const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
  const updatedMember: StaffMember = {
    ...currentRoster[targetIndex],
    status: nextStatus,
  };

  const updatedRoster = [...currentRoster];
  updatedRoster[targetIndex] = updatedMember;
  saveStaffRoster(updatedRoster);

  return updatedMember;
};

/**
 * Delete a staff member immediately from the staff table (Section ④)
 * Revokes staff access immediately; on next login, they auto-revert to citizen.
 */
export const deleteStaffFromStore = async (staffId: string): Promise<boolean> => {
  const currentRoster = loadStaffRoster();
  const target = currentRoster.find((m) => m.id === staffId);
  if (!target) {
    return false;
  }

  const updatedRoster = currentRoster.filter((m) => m.id !== staffId);
  saveStaffRoster(updatedRoster);
  return true;
};

/**
 * Reset staff roster back to seed data (useful for test isolation)
 */
export const resetStaffRoster = (): void => {
  memoryStaffRoster = [...SEED_STAFF_MEMBERS];
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(STAFF_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
};
