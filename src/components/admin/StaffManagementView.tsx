import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  PencilSimple,
  ToggleLeft,
  ToggleRight,
  X,
  Plus,
} from '@phosphor-icons/react';
import { StaffMember, DepartmentName, AddStaffPayload } from '../../types/admin';

interface StaffManagementViewProps {
  staffList: StaffMember[];
  departments: DepartmentName[];
  onAddStaff: (payload: AddStaffPayload) => Promise<boolean>;
  onToggleStatus: (staffId: string) => Promise<void>;
  onUpdateDepartment: (staffId: string, department: DepartmentName) => Promise<void>;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staffList,
  departments,
  onAddStaff,
  onToggleStatus,
  onUpdateDepartment,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedDeptEdit, setSelectedDeptEdit] = useState<DepartmentName>(departments[0]);

  // Form state for adding staff
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<DepartmentName>(departments[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: backend handles real account creation
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    await onAddStaff({
      name,
      email,
      department,
    });
    setIsSubmitting(false);
    setName('');
    setEmail('');
    setIsAddModalOpen(false);
  };

  const handleEditDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    await onUpdateDepartment(editingStaff.id, selectedDeptEdit);
    setEditingStaff(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users size={20} weight="duotone" className="text-civic-700 dark:text-civic-300" />
            <h2 className="text-base font-bold text-civic-950 dark:text-civic-50 tracking-tight">
              Staff & Municipal Officer Directory
            </h2>
          </div>
          <p className="text-xs text-civic-500 dark:text-civic-400 mt-1">
            Manage municipal field technicians, department assignments, and account operational status across Gandhidham.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <UserPlus size={15} weight="bold" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Directory Table */}
      <div className="rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-civic-50/75 dark:bg-civic-800/60 border-b border-civic-200 dark:border-civic-800 text-civic-600 dark:text-civic-400 font-semibold select-none">
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Workload</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-civic-100 dark:divide-civic-800/60">
              {staffList.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-civic-50/50 dark:hover:bg-civic-800/30 transition-colors"
                >
                  {/* Name & Email */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-civic-900 dark:text-civic-100">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-civic-500 font-mono">
                      {member.email}
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 text-civic-700 dark:text-civic-300 font-medium">
                    {member.department}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        member.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-civic-100 text-civic-600 border-civic-200 dark:bg-civic-800 dark:text-civic-400 dark:border-civic-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'active' ? 'bg-emerald-500' : 'bg-civic-400'
                        }`}
                      />
                      <span className="capitalize">{member.status}</span>
                    </span>
                  </td>

                  {/* Active Workload */}
                  <td className="py-3 px-4 text-civic-600 dark:text-civic-400">
                    <span className="font-semibold text-civic-900 dark:text-civic-100">
                      {member.activeAssignedCount}
                    </span>{' '}
                    active tasks
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    {/* Edit Department */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStaff(member);
                        setSelectedDeptEdit(member.department);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-civic-700 dark:text-civic-300 hover:text-civic-950 dark:hover:text-white bg-civic-100 hover:bg-civic-200 dark:bg-civic-800 dark:hover:bg-civic-700 rounded-md transition-colors cursor-pointer"
                    >
                      <PencilSimple size={12} />
                      <span>Edit Dept</span>
                    </button>

                    {/* Enable / Disable Status */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(member.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        member.status === 'active'
                          ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                          : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {member.status === 'active' ? (
                        <>
                          <ToggleRight size={14} weight="fill" className="text-red-500" />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={14} weight="fill" className="text-emerald-500" />
                          <span>Enable</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-civic-900 rounded-3xl border border-civic-200 dark:border-civic-800 shadow-2xl p-6 sm:p-7">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-civic-400 hover:text-civic-700 dark:hover:text-civic-200 hover:bg-civic-100 dark:hover:bg-civic-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <h3 className="text-base font-bold text-civic-950 dark:text-civic-50 tracking-tight">
                Add New Staff Member
              </h3>
              <p className="text-xs text-civic-500 dark:text-civic-400 mt-1">
                Register a field officer into Gandhidham Municipal Corporation dispatch.
              </p>
            </div>

            {/* Note regarding mock account creation */}
            <div className="mb-4 p-3 rounded-xl bg-civic-50 dark:bg-civic-800/60 border border-civic-200 dark:border-civic-700 text-[11px] text-civic-600 dark:text-civic-400">
              {/* TODO: backend handles real account creation */}
              <em>Mock Demo Mode:</em> Generates operational record for instant dispatch assignment. Real account credentials & password links will be emailed by server.
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-civic-700 dark:text-civic-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-civic-50 dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-civic-700 dark:text-civic-300">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.patel@civicfix.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-civic-50 dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-civic-700 dark:text-civic-300">
                  Department Assignment
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                  className="w-full px-3 py-2 text-xs bg-civic-50 dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-civic-600 dark:text-civic-400 hover:bg-civic-100 dark:hover:bg-civic-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>Create Staff Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm bg-white dark:bg-civic-900 rounded-3xl border border-civic-200 dark:border-civic-800 shadow-2xl p-6">
            <button
              type="button"
              onClick={() => setEditingStaff(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-civic-400 hover:text-civic-700 dark:hover:text-civic-200 hover:bg-civic-100 dark:hover:bg-civic-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-civic-950 dark:text-civic-50 tracking-tight mb-1">
              Edit Department Assignment
            </h3>
            <p className="text-xs text-civic-500 mb-4">
              Transfer <strong className="text-civic-900 dark:text-civic-100">{editingStaff.name}</strong> to a different municipal unit.
            </p>

            <form onSubmit={handleEditDeptSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-civic-700 dark:text-civic-300">
                  New Department
                </label>
                <select
                  value={selectedDeptEdit}
                  onChange={(e) => setSelectedDeptEdit(e.target.value as DepartmentName)}
                  className="w-full px-3 py-2 text-xs bg-civic-50 dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-civic-600 dark:text-civic-400 hover:bg-civic-100 dark:hover:bg-civic-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
