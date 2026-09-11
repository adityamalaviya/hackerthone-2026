import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import {
  canTransitionStatus,
  getValidNextStatuses,
  getSlaInfo,
} from './stateMachine.ts';
import {
  INITIAL_MOCK_STAFF_ISSUES,
  getMockIssuesForDepartment,
} from './mockStaffIssues.ts';
import { IssueStatus } from './types.ts';

describe('Staff Features Test Suite', () => {
  // Test 1: Legal Status Transitions
  it('allows legal status transitions adhering to state machine', () => {
    assert.equal(canTransitionStatus('Reported', 'Acknowledged'), true, 'Reported -> Acknowledged should be valid');
    assert.equal(canTransitionStatus('Acknowledged', 'In Progress'), true, 'Acknowledged -> In Progress should be valid');
    assert.equal(canTransitionStatus('In Progress', 'Resolved'), true, 'In Progress -> Resolved should be valid');
  });

  // Test 2: Illegal Transitions Prevention
  it('strictly forbids illegal transitions and jumps', () => {
    assert.equal(canTransitionStatus('Reported', 'Resolved'), false, 'Reported -> Resolved jump must be forbidden');
    assert.equal(canTransitionStatus('Reported', 'In Progress'), false, 'Reported -> In Progress jump must be forbidden');
    assert.equal(canTransitionStatus('Acknowledged', 'Resolved'), false, 'Acknowledged -> Resolved jump must be forbidden');
    assert.equal(canTransitionStatus('Resolved', 'Closed'), false, 'Staff cannot unilaterally close resolved issues');
  });

  // Test 3: getValidNextStatuses returns exact next steps
  it('returns exact next steps via getValidNextStatuses', () => {
    assert.deepEqual(getValidNextStatuses('Reported'), ['Acknowledged']);
    assert.deepEqual(getValidNextStatuses('Acknowledged'), ['In Progress']);
    assert.deepEqual(getValidNextStatuses('In Progress'), ['Resolved']);
    assert.deepEqual(getValidNextStatuses('Resolved'), []);
    assert.deepEqual(getValidNextStatuses('Closed'), []);
  });

  // Test 4: Department Scoping Isolation
  it('guarantees department scoping isolation', () => {
    const roadsIssues = getMockIssuesForDepartment(INITIAL_MOCK_STAFF_ISSUES, 'Roads & Infrastructure');
    const electricalIssues = getMockIssuesForDepartment(INITIAL_MOCK_STAFF_ISSUES, 'Electrical & Lighting');

    assert.ok(roadsIssues.length > 0, 'Roads issues must exist');
    assert.ok(electricalIssues.length > 0, 'Electrical issues must exist');

    // Verify cross-department isolation
    roadsIssues.forEach((issue) => {
      assert.equal(issue.department, 'Roads & Infrastructure', `Issue ${issue.id} must belong to Roads`);
      assert.notEqual(issue.category, 'Streetlight', `Roads staff must never see Streetlight issue ${issue.id}`);
    });

    electricalIssues.forEach((issue) => {
      assert.equal(issue.department, 'Electrical & Lighting', `Issue ${issue.id} must belong to Electrical`);
      assert.notEqual(issue.category, 'Pothole', `Electrical staff must never see Pothole issue ${issue.id}`);
    });
  });

  // Test 5: SLA Calculation
  it('calculates SLA deadlines and overdue urgency accurately', () => {
    const pastDeadline = new Date(Date.now() - 3600 * 1000).toISOString();
    const futureDeadline = new Date(Date.now() + 5 * 3600 * 1000).toISOString();

    const overdueSla = getSlaInfo(pastDeadline);
    assert.equal(overdueSla.isOverdue, true, 'Past deadline should be flagged as overdue');
    assert.equal(overdueSla.urgency, 'critical', 'Overdue SLA must have critical urgency');

    const onTrackSla = getSlaInfo(futureDeadline);
    assert.equal(onTrackSla.isOverdue, false, 'Future deadline should not be overdue');
  });
});
