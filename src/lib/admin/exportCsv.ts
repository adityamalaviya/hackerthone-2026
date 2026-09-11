/**
 * Client-Side CSV Export Utility for CivicFix Admin Panel
 * Formats filtered issues into a downloadable RFC-4180 compliant CSV file.
 */

import { AdminIssue } from '../../types/admin';

/**
 * Escapes a cell value for CSV format.
 * If the value contains commas, double quotes, or newlines, wraps in quotes and escapes internal quotes.
 */
function escapeCsvValue(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports the provided issues to a CSV file and triggers browser download.
 * @param issues The list of issues to export (typically currently filtered list)
 * @param filename Optional filename without extension (defaults to civicfix-issues-export)
 */
export function exportIssuesToCsv(
  issues: AdminIssue[],
  filenamePrefix = 'civicfix-issues-export'
): void {
  const headers: string[] = [
    'Issue ID',
    'Title',
    'Category',
    'Severity',
    'Department',
    'Assigned Staff',
    'Status',
    'Created Date',
    'SLA Deadline',
    'SLA Breached',
    'Escalated',
    'Ward',
    'Location',
    'Citizen Votes',
  ];

  const rows: string[][] = issues.map((issue) => [
    issue.id,
    issue.title,
    issue.category,
    issue.severity,
    issue.department,
    issue.assignedStaffName || 'Unassigned',
    issue.status,
    issue.createdDate,
    issue.slaDeadline,
    issue.isSlaBreached ? 'Yes' : 'No',
    issue.isEscalated ? 'Yes' : 'No',
    issue.ward,
    issue.locationName,
    String(issue.votes),
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\r\n');

  // Prepend UTF-8 BOM so Excel correctly parses characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
