import React, { useState } from 'react';
import {
  Scroll,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { AuditLogEntry } from '../../types/admin';
import { EmptyState } from './EmptyState';

interface AuditLogViewProps {
  auditLog: AuditLogEntry[];
}

const ACTION_COLORS: Record<string, string> = {
  ASSIGN_ISSUE: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  REASSIGN_ISSUE: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  APPROVE_FLAG_CLOSED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  REJECT_FLAG_RETURNED: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  ADD_STAFF: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  TOGGLE_STAFF_STATUS: 'bg-civic-100 text-civic-700 border-civic-200 dark:bg-civic-800 dark:text-civic-300 dark:border-civic-700',
  UPDATE_STAFF_DEPARTMENT: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  SLA_BREACH_DETECTED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 font-bold',
};

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLog }) => {
  const [search, setSearch] = useState('');

  const filteredLog = auditLog.filter((entry) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      entry.actorName.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q) ||
      entry.details.toLowerCase().includes(q) ||
      (entry.issueId && entry.issueId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scroll size={20} weight="duotone" className="text-civic-700 dark:text-civic-300" />
            <h2 className="text-base font-bold text-civic-950 dark:text-civic-50 tracking-tight">
              System Audit & Compliance Log
            </h2>
          </div>
          <p className="text-xs text-civic-500 dark:text-civic-400 mt-1">
            Immutable chronological record of administrative interventions, issue assignments, flag resolutions, and staff updates.
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-400"
          />
          <input
            type="text"
            placeholder="Filter by actor, action, issue ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-civic-50 dark:bg-civic-800/80 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-900 dark:text-civic-100 placeholder-civic-400 focus:outline-none focus:ring-1 focus:ring-civic-400"
          />
        </div>
      </div>

      {/* Audit Table */}
      {filteredLog.length === 0 ? (
        <EmptyState
          title="No audit entries found"
          description="No log records matched your search query."
          icon={<Scroll size={24} weight="duotone" />}
        />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-civic-50/75 dark:bg-civic-800/60 border-b border-civic-200 dark:border-civic-800 text-civic-600 dark:text-civic-400 font-semibold select-none">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Issue ID Affected</th>
                  <th className="py-3 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-civic-100 dark:divide-civic-800/60">
                {filteredLog.map((entry) => {
                  const actionBadge =
                    ACTION_COLORS[entry.action] ||
                    'bg-civic-100 text-civic-700 border-civic-200 dark:bg-civic-800 dark:text-civic-300 dark:border-civic-700';

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-civic-50/50 dark:hover:bg-civic-800/30 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-civic-500 font-mono text-[11px]">
                        {entry.timestamp}
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-civic-900 dark:text-civic-100">
                          {entry.actorName}
                        </div>
                        <div className="text-[10px] text-civic-400 font-mono">
                          {entry.actorId}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${actionBadge}`}
                        >
                          {entry.action}
                        </span>
                      </td>

                      {/* Issue ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {entry.issueId ? (
                          <span className="font-mono font-bold text-civic-900 dark:text-civic-100 bg-civic-100 dark:bg-civic-800 px-2 py-0.5 rounded text-[11px]">
                            {entry.issueId}
                          </span>
                        ) : (
                          <span className="text-civic-400 italic">—</span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-civic-700 dark:text-civic-300 leading-relaxed max-w-md">
                        {entry.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
