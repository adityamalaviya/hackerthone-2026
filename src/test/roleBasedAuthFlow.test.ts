import { describe, it, expect, beforeEach } from 'vitest';
import {
  authService,
  PRE_APPROVED_ADMIN_EMAIL,
} from '../lib/appwrite';
import {
  resetStaffRoster,
  addStaffToStore,
  updateStaffDeptInStore,
  deleteStaffFromStore,
  findStaffByEmail,
  getStaffRoster,
} from '../lib/admin/staffStore';

describe('Role & Email-Based Login Flow (doc/role-and-email-base-login-flow.md)', () => {
  beforeEach(() => {
    resetStaffRoster();
    authService.logout();
  });

  describe('① Login Routing & Email Identity', () => {
    it('routes hardcoded unique admin email to Admin panel with role "admin"', async () => {
      const session = await authService.login(PRE_APPROVED_ADMIN_EMAIL, 'anypassword');
      expect(session.role).toBe('admin');
      expect(session.email).toBe(PRE_APPROVED_ADMIN_EMAIL.toLowerCase());
      expect(session.name).toContain('Super Admin');
    });

    it('routes case-insensitive admin email (ADMIN@CIVICFIX.GOV.IN) to role "admin"', async () => {
      const session = await authService.login('ADMIN@CIVICFIX.GOV.IN', 'anypassword');
      expect(session.role).toBe('admin');
    });

    it('routes seed staff email to Staff panel with department-scoped access', async () => {
      const session = await authService.login('staff@civicfix.gov.in', 'password123');
      expect(session.role).toBe('staff');
      expect(session.department).toBe('Roads & Infrastructure');
      expect(session.name).toBe('Ward Officer (Gandhidham MC)');
    });

    it('routes existing staff roster members from INITIAL_MOCK_STAFF to their respective departments', async () => {
      const priyaSession = await authService.login('priya.patel@civicfix.gov.in', 'password123');
      expect(priyaSession.role).toBe('staff');
      expect(priyaSession.department).toBe('Roads & Infrastructure');

      const vikramSession = await authService.login('vikram.joshi@civicfix.gov.in', 'password123');
      expect(vikramSession.role).toBe('staff');
      expect(vikramSession.department).toBe('Public Works & Electricity');
    });

    it('routes any unrecognized or citizen email to citizen role as safe default', async () => {
      const citizenSession = await authService.login('random.citizen@example.com', 'password123');
      expect(citizenSession.role).toBe('citizen');
      expect(citizenSession.department).toBeUndefined();
    });
  });

  describe('④ Admin — Staff Management Dynamic CRUD & Access Control', () => {
    it('grants staff workstation access immediately when admin adds email to staff table', async () => {
      const newEmail = 'water.officer@civicfix.gov.in';

      // Before adding: defaults to citizen
      const beforeSession = await authService.login(newEmail, 'password123');
      expect(beforeSession.role).toBe('citizen');

      // Admin adds staff member through staff management
      const added = await addStaffToStore({
        name: 'Haresh Joshi',
        email: newEmail,
        department: 'Water & Sewage',
        phone: '+91 98251 99999',
      });
      expect(added.email).toBe(newEmail);
      expect(added.department).toBe('Water & Sewage');

      // After adding: next login immediately lands on Staff workstation scoped to Water & Sewage
      const afterSession = await authService.login(newEmail, 'password123');
      expect(afterSession.role).toBe('staff');
      expect(afterSession.department).toBe('Water & Sewage');
      expect(afterSession.name).toBe('Haresh Joshi');
    });

    it('retains staff panel access with reassigned department when admin edits department', async () => {
      const staffMember = findStaffByEmail('staff@civicfix.gov.in');
      expect(staffMember).toBeDefined();

      // Update department to Sanitation & Solid Waste
      await updateStaffDeptInStore(staffMember!.id, 'Sanitation & Solid Waste');

      // Next login immediately reflects the updated department scope
      const session = await authService.login('staff@civicfix.gov.in', 'password123');
      expect(session.role).toBe('staff');
      expect(session.department).toBe('Sanitation & Solid Waste');
    });

    it('immediately revokes staff access and reverts login to citizen when staff record is deleted', async () => {
      const staffMember = findStaffByEmail('staff@civicfix.gov.in');
      expect(staffMember).toBeDefined();

      // Admin deletes staff member
      const deleted = await deleteStaffFromStore(staffMember!.id);
      expect(deleted).toBe(true);

      // Verify email is removed from staff table
      expect(findStaffByEmail('staff@civicfix.gov.in')).toBeUndefined();

      // Per Section ④: "On next login -> email no longer in staff table -> auto-routed to citizen panel"
      const session = await authService.login('staff@civicfix.gov.in', 'password123');
      expect(session.role).toBe('citizen');
      expect(session.department).toBeUndefined();
    });

    it('rejects duplicate email when adding staff to prevent conflicting assignments', async () => {
      await expect(
        addStaffToStore({
          name: 'Duplicate Officer',
          email: 'staff@civicfix.gov.in',
          department: 'Roads & Infrastructure',
        })
      ).rejects.toThrow(/already exists/i);
    });
  });
});
