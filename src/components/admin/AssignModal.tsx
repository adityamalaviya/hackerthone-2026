import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  ArrowsClockwise,
  ShieldWarning,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react';
import { AdminIssue, StaffMember, DepartmentName, AssignIssuePayload } from '../../types/admin';

interface AssignModalProps {
  isOpen: boolean;
  issue: AdminIssue | null;
  staffList: StaffMember[];
  departments: DepartmentName[];
  onClose: () => void;
  onConfirmAssign: (payload: AssignIssuePayload) => Promise<boolean>;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  issue,
  staffList,
  departments,
  onClose,
  onConfirmAssign,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentName>(
    issue ? issue.department : departments[0]
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (issue) {
      setSelectedDepartment(issue.department);
      // Filter staff for this department
      const deptStaff = staffList.filter(
        (s) => s.department === issue.department && s.status === 'active'
      );
      if (deptStaff.length > 0) {
        setSelectedStaffId(deptStaff[0].id);
      } else {
        setSelectedStaffId('');
      }
      setStep('select');
    }
  }, [issue, staffList]);

  // Handle department change to update staff dropdown
  const handleDepartmentChange = (dept: DepartmentName) => {
    setSelectedDepartment(dept);
    const deptStaff = staffList.filter((s) => s.department === dept && s.status === 'active');
    if (deptStaff.length > 0) {
      setSelectedStaffId(deptStaff[0].id);
    } else {
      setSelectedStaffId('');
    }
  };

  if (!isOpen || !issue) return null;

  const availableStaff = staffList.filter(
    (s) => s.department === selectedDepartment && s.status === 'active'
  );
  const targetStaffMember = staffList.find((s) => s.id === selectedStaffId);
  const isReassign = Boolean(issue.assignedStaffName);

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setStep('confirm');
  };

  const handleFinalSubmit = async () => {
    if (!targetStaffMember) return;
    setIsSubmitting(true);
    await onConfirmAssign({
      issueId: issue.id,
      targetDepartment: selectedDepartment,
      targetStaffId: targetStaffMember.id,
      targetStaffName: targetStaffMember.name,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-modal-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-civic-900 rounded-3xl border border-civic-200 dark:border-civic-800 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 rounded-full text-civic-400 hover:text-civic-700 dark:hover:text-civic-200 hover:bg-civic-100 dark:hover:bg-civic-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1 text-accent dark:text-accent font-semibold text-xs tracking-wider uppercase">
            {isReassign ? (
              <ArrowsClockwise size={14} weight="bold" />
            ) : (
              <UserPlus size={14} weight="bold" />
            )}
            <span>{isReassign ? 'Reassign Issue' : 'Assign Issue'}</span>
          </div>
          <h2
            id="assign-modal-title"
            className="text-lg font-bold text-civic-950 dark:text-civic-50 tracking-tight"
          >
            {isReassign ? 'Change Case Assignment' : 'Assign to Municipal Staff'}
          </h2>
          <p className="text-xs text-civic-500 dark:text-civic-400 mt-1">
            Issue <strong className="font-mono text-civic-900 dark:text-civic-100">{issue.id}</strong> — {issue.title}
          </p>
        </div>

        {/* Current Issue Overview Card */}
        <div className="p-3.5 mb-5 rounded-xl bg-civic-50 dark:bg-civic-800/60 border border-civic-200 dark:border-civic-700/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-civic-500">Current Assignee:</span>
            <span className="font-semibold text-civic-900 dark:text-civic-100">
              {issue.assignedStaffName || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-civic-500">Current Department:</span>
            <span className="text-civic-700 dark:text-civic-300">{issue.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-civic-500">Severity & SLA:</span>
            <span className="font-medium text-civic-700 dark:text-civic-300">
              {issue.severity} • {issue.slaDeadline.slice(0, 10)}
            </span>
          </div>
        </div>

        {/* STEP 1: Select Department & Staff */}
        {step === 'select' && (
          <form onSubmit={handleProceedToConfirm} className="space-y-4">
            {/* Department Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-civic-700 dark:text-civic-300">
                Department
              </label>
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value as DepartmentName)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Staff Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-civic-700 dark:text-civic-300">
                Staff Member
              </label>
              <div className="relative">
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  disabled={availableStaff.length === 0}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer disabled:opacity-50"
                >
                  {availableStaff.length === 0 ? (
                    <option value="">No active staff in this department</option>
                  ) : (
                    availableStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.activeAssignedCount} active tasks)
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-civic-600 dark:text-civic-400 hover:bg-civic-100 dark:hover:bg-civic-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedStaffId}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue to Confirmation</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Explicit Confirmation Step (Requirement 3: "Confirmation step before reassigning") */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                <ShieldWarning size={18} weight="fill" />
                <span>Confirm Assignment Change</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed">
                You are about to {isReassign ? 'reassign' : 'assign'} this issue. This action will immediately notify the staff member and update the system audit log.
              </p>

              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 dark:text-amber-200">From:</span>
                  <span className="font-medium text-amber-950 dark:text-amber-100">
                    {issue.assignedStaffName || 'Unassigned'} ({issue.department})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 dark:text-amber-200">To:</span>
                  <span className="font-bold text-amber-950 dark:text-amber-100">
                    {targetStaffMember?.name} ({selectedDepartment})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setStep('select')}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium text-civic-600 dark:text-civic-400 hover:bg-civic-100 dark:hover:bg-civic-800 rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <span>Committing...</span>
                ) : (
                  <>
                    <CheckCircle size={14} weight="bold" />
                    <span>Confirm & Commit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
