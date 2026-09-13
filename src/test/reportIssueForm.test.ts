import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveReportedIssue,
  getStoredUserReports,
  getAllCivicIssues,
  getDepartmentForCategory,
  calculateSla,
  getWardForLocality,
  subscribeToNewIssues,
  resetStoredUserReports,
} from '../lib/issueStore';
import { createIssueDocument } from '../lib/appwrite';

describe('Civic Problem Reporting Form & Issue Store', () => {
  beforeEach(() => {
    resetStoredUserReports();
    vi.restoreAllMocks();
  });

  describe('Department Routing & SLA Calculations', () => {
    it('correctly routes categories to Gandhidham municipal departments', () => {
      expect(getDepartmentForCategory('Pothole')).toBe('Roads & Infrastructure');
      expect(getDepartmentForCategory('Streetlight')).toBe('Public Works & Electricity');
      expect(getDepartmentForCategory('Water Leakage')).toBe('Water & Sewage');
      expect(getDepartmentForCategory('Garbage')).toBe('Sanitation & Solid Waste');
      expect(getDepartmentForCategory('Drainage')).toBe('Drainage & Flood Control');
      expect(getDepartmentForCategory('Other')).toBe('Roads & Infrastructure');
    });

    it('calculates accurate SLA response times based on severity', () => {
      expect(calculateSla('Critical').hours).toBe(12);
      expect(calculateSla('High').hours).toBe(24);
      expect(calculateSla('Medium').hours).toBe(48);
      expect(calculateSla('Low').hours).toBe(72);
    });

    it('derives Gandhidham municipal ward from locality sector', () => {
      expect(getWardForLocality('sector-1a')).toBe('Ward 1 (West)');
      expect(getWardForLocality('tagore-road')).toBe('Ward 2 (North)');
      expect(getWardForLocality('rotary-circle')).toBe('Ward 4 (Central)');
      expect(getWardForLocality('sector-8')).toBe('Ward 3 (East)');
      expect(getWardForLocality('nu-10')).toBe('Ward 6 (South)');
      expect(getWardForLocality('adipur-link')).toBe('Ward 7 (Suburban)');
      expect(getWardForLocality('kandla-bypass')).toBe('Ward 8 (Industrial)');
    });
  });

  describe('saveReportedIssue workflow', () => {
    it('successfully persists a new problem report with photo evidence and ticket ID', () => {
      const report = saveReportedIssue({
        title: 'Dangerous road crater near Rotary Circle',
        category: 'Pothole',
        description: 'Large crater causing vehicles to brake abruptly during peak traffic hours.',
        severity: 'High',
        localityValue: 'rotary-circle',
        locationName: 'Rotary Circle, Main Highway Junction',
        landmark: 'Opp. Indian Oil Petrol Pump',
        latitude: 23.0792,
        longitude: 70.1345,
        photoDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
        reportedByName: 'Aarav Sharma',
        reportedByPhone: '+91 98250 11223',
        reportedByEmail: 'aarav@example.com',
      });

      expect(report.id).toMatch(/^CF-2026-\d{3}$/);
      expect(report.title).toBe('Dangerous road crater near Rotary Circle');
      expect(report.category).toBe('Pothole');
      expect(report.department).toBe('Roads & Infrastructure');
      expect(report.ward).toBe('Ward 4 (Central)');
      expect(report.severity).toBe('High');
      expect(report.status).toBe('Reported');
      expect(report.photoDataUrl).toBeDefined();
      expect(report.landmark).toBe('Opp. Indian Oil Petrol Pump');

      // Verify persistence in local storage
      const stored = getStoredUserReports();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(report.id);
    });

    it('supports anonymous grievance submissions', () => {
      const anonReport = saveReportedIssue({
        title: 'Overflowing dumpster behind vegetable market',
        category: 'Garbage',
        description: 'Commercial waste container full and spilling over sidewalk for 2 days.',
        severity: 'Medium',
        localityValue: 'sector-4',
        locationName: 'Sector 4, Main Market & Plaza',
        isAnonymous: true,
      });

      expect(anonReport.isAnonymous).toBe(true);
      expect(anonReport.reportedByName).toBe('Anonymous Citizen');
      expect(anonReport.department).toBe('Sanitation & Solid Waste');
    });

    it('merges stored user reports into getAllCivicIssues for the Live Map', () => {
      const initialCount = getAllCivicIssues().length;

      saveReportedIssue({
        title: 'Dark streetlight fixture',
        category: 'Streetlight',
        description: 'Pole #18 bulb dead, total darkness at pedestrian intersection.',
        severity: 'Low',
        localityValue: 'tagore-road',
        locationName: 'Tagore Road, Opp. Town Hall',
      });

      const updated = getAllCivicIssues();
      expect(updated.length).toBe(initialCount + 1);
      expect(updated[0].title).toBe('Dark streetlight fixture');
    });

    it('notifies subscribers via event listener when a new issue is filed', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToNewIssues(listener);

      const created = saveReportedIssue({
        title: 'Broken water pipeline valve',
        category: 'Water Leakage',
        description: 'Potable water leaking into stormwater gutter continuously.',
        severity: 'Critical',
        localityValue: 'sector-1a',
        locationName: 'Sector 1A, Near Community Center',
      });

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        id: created.id,
        title: 'Broken water pipeline valve',
      }));

      unsubscribe();
    });
  });

  describe('createIssueDocument Appwrite helper', () => {
    it('returns a simulated document when Appwrite is in offline/demo mode', async () => {
      const doc = await createIssueDocument({
        title: 'Fallen tree branch blocking roadway',
        category: 'Other',
        description: 'Large bough cracked after storm winds.',
        locationName: 'Sector 2, Commercial Zone',
        latitude: 23.0825,
        longitude: 70.1310,
        ward: 'Ward 2 (North)',
      });

      expect(doc).toBeDefined();
      expect(doc.title).toBe('Fallen tree branch blocking roadway');
      expect(doc.status).toBe('Reported');
      expect(doc.$id).toBeDefined();
    });
  });
});
