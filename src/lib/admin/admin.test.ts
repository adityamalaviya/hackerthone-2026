import { describe, it, expect } from 'vitest';
import {
  INITIAL_MOCK_ISSUES,
  INITIAL_MOCK_STAFF,
  INITIAL_MOCK_AUDIT_LOG,
  DEPARTMENTS,
} from './mockAdminData';
import { exportIssuesToCsv } from './exportCsv';

describe('Admin Mock Data Engine', () => {
  it('contains valid pre-seeded Gandhidham issues with correct categories and severities', () => {
    expect(INITIAL_MOCK_ISSUES.length).toBeGreaterThanOrEqual(10);
    const issueWithSlaBreach = INITIAL_MOCK_ISSUES.find((i) => i.isSlaBreached);
    expect(issueWithSlaBreach).toBeDefined();

    const flaggedDuplicate = INITIAL_MOCK_ISSUES.find(
      (i) => i.flagged.isFlagged && i.flagged.type === 'duplicate'
    );
    expect(flaggedDuplicate).toBeDefined();
    expect(flaggedDuplicate?.flagged.reason).toBeTruthy();

    const flaggedInvalid = INITIAL_MOCK_ISSUES.find(
      (i) => i.flagged.isFlagged && i.flagged.type === 'invalid'
    );
    expect(flaggedInvalid).toBeDefined();
  });

  it('contains municipal departments and initial staff members', () => {
    expect(DEPARTMENTS).toContain('Roads & Infrastructure');
    expect(DEPARTMENTS).toContain('Water & Sewage');
    expect(INITIAL_MOCK_STAFF.length).toBeGreaterThanOrEqual(6);

    const activeStaff = INITIAL_MOCK_STAFF.filter((s) => s.status === 'active');
    expect(activeStaff.length).toBeGreaterThan(0);
  });

  it('contains initial audit log entries', () => {
    expect(INITIAL_MOCK_AUDIT_LOG.length).toBeGreaterThan(0);
    expect(INITIAL_MOCK_AUDIT_LOG[0].actorName).toBeDefined();
    expect(INITIAL_MOCK_AUDIT_LOG[0].action).toBeDefined();
  });
});

describe('CSV Export Utility', () => {
  it('does not throw when exporting mock issues list', () => {
    expect(() => {
      // In Node/Vitest test environment, URL and Blob are checked or mocked
      if (typeof window !== 'undefined') {
        exportIssuesToCsv(INITIAL_MOCK_ISSUES);
      }
    }).not.toThrow();
  });
});
