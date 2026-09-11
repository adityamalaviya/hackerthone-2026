import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateConfirmPassword,
  validateRegistrationForm,
  isRegistrationFormValid,
} from '../../lib/authValidation';
import {
  INITIAL_MOCK_USERS,
  getMockUsers,
  findMockUserByEmail,
  isEmailRegistered,
  registerMockUser,
  mockUserToUserSession,
  resetMockUsers,
} from '../../lib/mockUsers';
import { authService } from '../../lib/appwrite';

describe('Registration Client-Side Field Validation (R2)', () => {
  beforeEach(() => {
    resetMockUsers();
  });

  describe('Full Name Validation', () => {
    it('rejects empty and whitespace-only names with inline feedback', () => {
      expect(validateFullName('')).toBe('Full name is required');
      expect(validateFullName('   ')).toBe('Full name is required');
    });

    it('rejects names shorter than 2 characters', () => {
      expect(validateFullName('A')).toBe('Full name must be at least 2 characters');
    });

    it('accepts valid citizen names', () => {
      expect(validateFullName('Ramesh Patel')).toBeNull();
      expect(validateFullName('Pooja Mehta')).toBeNull();
      expect(validateFullName('Dr. K. Sharma')).toBeNull();
    });
  });

  describe('Email Validation & Duplicate Prevention', () => {
    it('rejects empty email with inline feedback', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail('   ')).toBe('Email is required');
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('not-an-email')).toBe('Please enter a valid email address');
      expect(validateEmail('missing@domain')).toBe('Please enter a valid email address');
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address');
      expect(validateEmail('user@.com')).toBe('Please enter a valid email address');
    });

    it('prevents duplicate registration against mock user store with exact error message', () => {
      // Pre-seeded citizen email
      expect(validateEmail('citizen@gmail.com')).toBe('Email already registered');
      // Case-insensitive check
      expect(validateEmail('CITIZEN@GMAIL.COM')).toBe('Email already registered');
      // Pre-seeded admin email
      expect(validateEmail('admin@civicfix.gov.in')).toBe('Email already registered');
      // Pre-seeded staff email
      expect(validateEmail('staff@civicfix.gov.in')).toBe('Email already registered');
    });

    it('accepts new, unregistered email addresses', () => {
      expect(validateEmail('newcitizen.gandhidham@gmail.com')).toBeNull();
      expect(validateEmail('pooja.resident@outlook.com')).toBeNull();
    });
  });

  describe('Phone Number Format Validation', () => {
    it('rejects empty phone number with inline feedback', () => {
      expect(validatePhoneNumber('')).toBe('Phone number is required');
      expect(validatePhoneNumber('   ')).toBe('Phone number is required');
    });

    it('rejects invalid or too short phone numbers', () => {
      expect(validatePhoneNumber('12345')).toBe('Please enter a valid 10-digit phone number');
      expect(validatePhoneNumber('98250abcde')).toBe('Please enter a valid 10-digit phone number');
      expect(validatePhoneNumber('123456789012345')).toBe('Please enter a valid 10-digit phone number');
    });

    it('accepts valid 10-digit mobile numbers with or without formatting', () => {
      expect(validatePhoneNumber('9876543210')).toBeNull();
      expect(validatePhoneNumber('+91 98765 43210')).toBeNull();
      expect(validatePhoneNumber('+91-9876543210')).toBeNull();
      expect(validatePhoneNumber('919876543210')).toBeNull();
      expect(validatePhoneNumber('09876543210')).toBeNull();
    });
  });

  describe('Password Strength & Length Validation', () => {
    it('rejects empty password with inline feedback', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('enforces minimum 8 characters rule', () => {
      expect(validatePassword('Pass1')).toBe('Password must be at least 8 characters long');
      expect(validatePassword('1234567')).toBe('Password must be at least 8 characters long');
    });

    it('enforces basic strength rule (must contain letters and numbers)', () => {
      expect(validatePassword('abcdefghijk')).toBe('Password must contain both letters and numbers');
      expect(validatePassword('1234567890')).toBe('Password must contain both letters and numbers');
    });

    it('accepts valid passwords meeting length and strength rules', () => {
      expect(validatePassword('Password123')).toBeNull();
      expect(validatePassword('Gandhidham@2026')).toBeNull();
      expect(validatePassword('civicfix99')).toBeNull();
    });
  });

  describe('Confirm Password Matching Validation', () => {
    it('rejects empty confirm password with inline feedback', () => {
      expect(validateConfirmPassword('', 'Password123')).toBe('Please confirm your password');
    });

    it('detects mismatched passwords with exact inline error message', () => {
      expect(validateConfirmPassword('Password456', 'Password123')).toBe('Passwords do not match');
      expect(validateConfirmPassword('password123', 'Password123')).toBe('Passwords do not match');
    });

    it('accepts identical matching passwords', () => {
      expect(validateConfirmPassword('Password123', 'Password123')).toBeNull();
    });
  });

  describe('Comprehensive Form Validity Helper', () => {
    it('marks empty or partially filled form as invalid', () => {
      const invalidFields = {
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
      };
      expect(isRegistrationFormValid(invalidFields)).toBe(false);
      const errors = validateRegistrationForm(invalidFields);
      expect(errors.fullName).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.phoneNumber).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
    });

    it('marks form as valid when all required inputs satisfy criteria', () => {
      const validFields = {
        fullName: 'Vikram Singh',
        email: 'vikram.singh@gmail.com',
        phoneNumber: '+91 98250 99887',
        password: 'SecurePassword1',
        confirmPassword: 'SecurePassword1',
      };
      expect(isRegistrationFormValid(validFields)).toBe(true);
      expect(Object.keys(validateRegistrationForm(validFields)).length).toBe(0);
    });

    it('marks form as invalid when duplicate email is present', () => {
      const duplicateFields = {
        fullName: 'Vikram Singh',
        email: 'citizen@gmail.com', // pre-seeded
        phoneNumber: '+91 98250 99887',
        password: 'SecurePassword1',
        confirmPassword: 'SecurePassword1',
      };
      expect(isRegistrationFormValid(duplicateFields)).toBe(false);
      const errors = validateRegistrationForm(duplicateFields);
      expect(errors.email).toBe('Email already registered');
    });
  });
});

describe('Mock User Data Management & Submission Workflow (R3)', () => {
  beforeEach(() => {
    resetMockUsers();
  });

  it('contains pre-seeded municipal users across roles', () => {
    const users = getMockUsers();
    expect(users.length).toBeGreaterThanOrEqual(3);

    const admin = users.find((u) => u.role === 'admin');
    expect(admin).toBeDefined();
    expect(admin?.email).toBe('admin@civicfix.gov.in');

    const staff = users.find((u) => u.role === 'staff');
    expect(staff).toBeDefined();
    expect(staff?.email).toBe('staff@civicfix.gov.in');

    const citizen = users.find((u) => u.role === 'citizen');
    expect(citizen).toBeDefined();
    expect(citizen?.email).toBe('citizen@gmail.com');
  });

  it('successfully appends a new citizen mock user with required schema and auto-assigned role', async () => {
    const input = {
      fullName: 'Anita Sharma',
      email: 'anita.sharma@gmail.com',
      phoneNumber: '+91 98250 55443',
      password: 'CitizenPassword2026',
    };

    const newCitizen = await registerMockUser(input);

    // Verify all required properties
    expect(newCitizen.user_id).toMatch(/^usr_/);
    expect(newCitizen.full_name).toBe('Anita Sharma');
    expect(newCitizen.email).toBe('anita.sharma@gmail.com');
    expect(newCitizen.phone_number).toBe('+91 98250 55443');
    expect(newCitizen.password).toBe('CitizenPassword2026');
    // Role strictly non-selectable and auto-assigned as 'citizen'
    expect(newCitizen.role).toBe('citizen');
    expect(newCitizen.department).toBeNull();
    expect(newCitizen.status).toBe('active');
    expect(typeof newCitizen.created_at).toBe('string');
    expect(new Date(newCitizen.created_at).getTime()).not.toBeNaN();

    // Verify persistence in store
    const found = findMockUserByEmail('anita.sharma@gmail.com');
    expect(found).toBeDefined();
    expect(found?.full_name).toBe('Anita Sharma');
    expect(isEmailRegistered('anita.sharma@gmail.com')).toBe(true);
  });

  it('rejects duplicate email submission on registerMockUser', async () => {
    await expect(
      registerMockUser({
        fullName: 'Duplicate Tester',
        email: 'citizen@gmail.com', // already pre-seeded
        phoneNumber: '+91 98250 12345',
        password: 'Password123',
      })
    ).rejects.toThrow('Email already registered');
  });

  it('reconciles mock user record with UserSession interface', () => {
    const mockCitizen = INITIAL_MOCK_USERS.find((u) => u.role === 'citizen')!;
    const session = mockUserToUserSession(mockCitizen);

    expect(session.id).toBe(mockCitizen.user_id);
    expect(session.name).toBe(mockCitizen.full_name);
    expect(session.email).toBe(mockCitizen.email);
    expect(session.role).toBe('citizen');
    expect(session.phone).toBe(mockCitizen.phone_number);
    expect(session.jwt).toMatch(/^jwt_mock_/);
  });

  it('allows newly registered citizen to sign in via authService.login', async () => {
    const uniqueEmail = 'fresh.citizen@gandhidham.in';

    await registerMockUser({
      fullName: 'Fresh Citizen',
      email: uniqueEmail,
      phoneNumber: '+91 98765 00112',
      password: 'FreshPassword1',
    });

    // Attempt login with newly registered citizen
    const session = await authService.login(uniqueEmail, 'FreshPassword1');
    expect(session).toBeDefined();
    expect(session.name).toBe('Fresh Citizen');
    expect(session.email).toBe(uniqueEmail);
    expect(session.role).toBe('citizen');
  });

  it('guarantees that registered users always have role "citizen" and department null', async () => {
    const user = await registerMockUser({
      fullName: 'Citizen Validator',
      email: 'citizen.validator@gmail.com',
      phoneNumber: '9825098250',
      password: 'StrongPassword99',
    });

    // Strict constraint: Role is strictly non-selectable and always defaults to "citizen"
    expect(user.role).toBe('citizen');
    expect(user.department).toBeNull();
    expect(user.status).toBe('active');
  });

  it('preserves registered password with security comment note', async () => {
    const user = await registerMockUser({
      fullName: 'Password Security Test',
      email: 'security.check@example.com',
      phoneNumber: '9825011223',
      password: 'MyPlainTextPass123',
    });

    expect(user.password).toBe('MyPlainTextPass123');
    expect(user.user_id).toBeDefined();
    expect(user.created_at).toBeDefined();
  });

  it('rejects registration with invalid parameters directly in registerMockUser', async () => {
    // Short full name
    await expect(
      registerMockUser({
        fullName: 'A',
        email: 'valid.email@example.com',
        phoneNumber: '9825012345',
        password: 'Password123',
      })
    ).rejects.toThrow('Full name must be at least 2 characters');

    // Invalid email
    await expect(
      registerMockUser({
        fullName: 'Valid Name',
        email: 'invalid-email-format',
        phoneNumber: '9825012345',
        password: 'Password123',
      })
    ).rejects.toThrow('Please enter a valid email address');

    // Invalid phone number
    await expect(
      registerMockUser({
        fullName: 'Valid Name',
        email: 'valid.email@example.com',
        phoneNumber: '123',
        password: 'Password123',
      })
    ).rejects.toThrow('Please enter a valid 10-digit phone number');

    // Short password
    await expect(
      registerMockUser({
        fullName: 'Valid Name',
        email: 'valid.email@example.com',
        phoneNumber: '9825012345',
        password: 'Pass1',
      })
    ).rejects.toThrow('Password must be at least 8 characters long');

    // Password without numbers
    await expect(
      registerMockUser({
        fullName: 'Valid Name',
        email: 'valid.email@example.com',
        phoneNumber: '9825012345',
        password: 'NoNumbersInThisPassword',
      })
    ).rejects.toThrow('Password must contain both letters and numbers');
  });

  it('simulates network delay between ~500ms and 1000ms upon registration', async () => {
    const startTime = Date.now();
    await registerMockUser({
      fullName: 'Latency Tester',
      email: 'latency.test@example.com',
      phoneNumber: '9876543210',
      password: 'SecurePassword123',
    });
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(500);
    expect(elapsed).toBeLessThan(1200);
  });

  it('safely handles session lifecycle (login, getCurrentSession, logout) in non-browser environments', async () => {
    const email = 'session.test@example.com';
    await registerMockUser({
      fullName: 'Session User',
      email,
      phoneNumber: '9825011111',
      password: 'SessionPassword1',
    });

    const session = await authService.login(email, 'SessionPassword1');
    expect(session.email).toBe(email);

    const retrieved = authService.getCurrentSession();
    expect(retrieved).toBeDefined();
    expect(retrieved?.email).toBe(email);

    authService.logout();
    const afterLogout = authService.getCurrentSession();
    expect(afterLogout).toBeNull();
  });

  it('accepts 11-digit phone number with leading 0 trunk prefix in registerMockUser', async () => {
    const user = await registerMockUser({
      fullName: 'Trunk Dial User',
      email: 'trunk.dialer@gandhidham.in',
      phoneNumber: '09825099887',
      password: 'TrunkPassword2026',
    });
    expect(user.phone_number).toBe('09825099887');
    expect(user.role).toBe('citizen');
  });

  it('rejects empty input or missing password with explicit error in registerMockUser', async () => {
    await expect(
      registerMockUser(null)
    ).rejects.toThrow('Registration details are required');

    await expect(
      registerMockUser({
        fullName: 'Empty Pass User',
        email: 'empty.pass@example.com',
        phoneNumber: '9825012345',
        password: '',
      })
    ).rejects.toThrow('Password is required');
  });

  it('strictly enforces citizen role and prevents role tampering via input spoofing', async () => {
    const spoofedInput = {
      fullName: 'Spoof Attacker',
      email: 'attacker@example.com',
      phoneNumber: '9825000099',
      password: 'AttackerPassword1',
      role: 'admin',
      department: 'Finance & Taxation',
      status: 'suspended',
    };

    const registered = await registerMockUser(spoofedInput);
    // Role MUST remain citizen and department MUST remain null
    expect(registered.role).toBe('citizen');
    expect(registered.department).toBeNull();
    expect(registered.status).toBe('active');
  });

  it('prevents duplicate accounts during concurrent registration attempts', async () => {
    const targetEmail = 'concurrent.race@gandhidham.in';
    const payload1 = {
      fullName: 'First Applicant',
      email: targetEmail,
      phoneNumber: '9825011122',
      password: 'PasswordOne1',
    };
    const payload2 = {
      fullName: 'Second Applicant',
      email: targetEmail,
      phoneNumber: '9825033344',
      password: 'PasswordTwo2',
    };

    const results = await Promise.allSettled([
      registerMockUser(payload1),
      registerMockUser(payload2),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one must succeed and one must be rejected due to duplicate email
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    if (rejected[0].status === 'rejected') {
      expect(rejected[0].reason.message).toBe('Email already registered');
    }
  });

  it('supports authService.register with either phoneNumber or mobileNumber', async () => {
    const session = await authService.register({
      fullName: 'Flexible Phone User',
      email: 'flex.phone@example.com',
      phoneNumber: '9825077889',
      password: 'FlexPassword1',
    });

    expect(session.name).toBe('Flexible Phone User');
    expect(session.role).toBe('citizen');
    expect(session.phone).toBe('9825077889');
  });
});

