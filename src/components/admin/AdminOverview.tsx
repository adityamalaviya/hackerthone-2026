import React from 'react';
import {
  Files,
  CheckCircle,
  ClockCountdown,
  WarningOctagon,
  ArrowUpRight,
  ChartBar,
  TrendUp,
  Buildings,
  ArrowRight,
} from '@phosphor-icons/react';
import { AdminMetrics, AdminTab, CivicCategory } from '../../types/admin';

interface AdminOverviewProps {
  metrics: AdminMetrics;
  onNavigateTab: (tab: AdminTab) => void;
}

const CATEGORY_COLORS: Record<CivicCategory, { bar: string; text: string; bg: string }> = {
  Pothole: { bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  Streetlight: { bar: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  Garbage: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  'Water Leakage': { bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  Drainage: { bar: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  Other: { bar: 'bg-civic-500', text: 'text-civic-700 dark:text-civic-400', bg: 'bg-civic-50 dark:bg-civic-900/30' },
};

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  metrics,
  onNavigateTab,
}) => {
  const resolutionPercentage = metrics.totalIssues > 0
    ? Math.round((metrics.resolvedCount / metrics.totalIssues) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Issues */}
        <div
          onClick={() => onNavigateTab('all-issues')}
          className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm hover:shadow-md hover:border-civic-300 dark:hover:border-civic-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-civic-500 dark:text-civic-400">
              Total Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-civic-100 dark:bg-civic-800 text-civic-700 dark:text-civic-300 flex items-center justify-center group-hover:bg-civic-200 dark:group-hover:bg-civic-700 transition-colors">
              <Files size={18} weight="duotone" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-civic-950 dark:text-civic-50">
              {metrics.totalIssues}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-civic-500 group-hover:text-civic-900 dark:group-hover:text-civic-200 transition-colors">
              <span>View all</span>
              <ArrowUpRight size={12} weight="bold" />
            </span>
          </div>
          <p className="text-xs text-civic-400 dark:text-civic-500 mt-2">
            System-wide logged reports across all wards
          </p>
        </div>

        {/* Resolved Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Resolved Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle size={18} weight="duotone" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {metrics.resolvedCount}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {resolutionPercentage}% resolved
            </span>
          </div>
          <p className="text-xs text-civic-400 dark:text-civic-500 mt-2">
            Issues verified, fixed or formally closed
          </p>
        </div>

        {/* Unresolved / Active Count */}
        <div
          onClick={() => onNavigateTab('all-issues')}
          className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Active Backlog
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ClockCountdown size={18} weight="duotone" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {metrics.unresolvedCount}
            </span>
            <span className="text-xs text-civic-500 group-hover:text-amber-600 transition-colors">
              Needs attention
            </span>
          </div>
          <p className="text-xs text-civic-400 dark:text-civic-500 mt-2">
            Reported, acknowledged, or in-progress
          </p>
        </div>

        {/* Escalated / SLA Breached */}
        <div
          onClick={() => onNavigateTab('escalations')}
          className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-red-200 dark:border-red-900/50 shadow-sm hover:shadow-md hover:border-red-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Escalated / Breached
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center animate-pulse">
              <WarningOctagon size={18} weight="fill" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {metrics.escalatedCount}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800">
              Action Required
            </span>
          </div>
          <p className="text-xs text-civic-400 dark:text-civic-500 mt-2">
            SLA deadlines missed or priority escalated
          </p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Issues by Category */}
        <div className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-civic-100 dark:bg-civic-800 flex items-center justify-center text-civic-700 dark:text-civic-300">
                <ChartBar size={16} weight="duotone" />
              </div>
              <h3 className="text-sm font-bold text-civic-950 dark:text-civic-50">
                Issues by Category
              </h3>
            </div>
            <span className="text-xs text-civic-500">Distribution %</span>
          </div>

          <div className="space-y-3 pt-1">
            {metrics.categoryDistribution.map((item) => {
              const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-civic-700 dark:text-civic-300">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-civic-500">{item.count} issues</span>
                      <span className="font-semibold text-civic-900 dark:text-civic-100 w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Lightweight CSS Bar Chart */}
                  <div className="w-full h-2 rounded-full bg-civic-100 dark:bg-civic-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.bar} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Issues by Department */}
        <div className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-civic-100 dark:bg-civic-800 flex items-center justify-center text-civic-700 dark:text-civic-300">
                <Buildings size={16} weight="duotone" />
              </div>
              <h3 className="text-sm font-bold text-civic-950 dark:text-civic-50">
                Workload by Department
              </h3>
            </div>
            <span className="text-xs text-civic-500">Active vs Total</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {metrics.departmentDistribution.map((dept) => {
              const maxCount = Math.max(...metrics.departmentDistribution.map((d) => d.count), 1);
              const totalWidth = Math.round((dept.count / maxCount) * 100);
              const pendingWidth = dept.count > 0 ? Math.round((dept.pendingCount / dept.count) * 100) : 0;

              return (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-civic-700 dark:text-civic-300 truncate max-w-[200px]">
                      {dept.department}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {dept.pendingCount} active
                      </span>
                      <span className="text-civic-400">/</span>
                      <span className="text-civic-500">{dept.count} total</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-civic-100 dark:bg-civic-800 overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${(totalWidth * pendingWidth) / 100}%` }}
                      title="Pending issues"
                    />
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(totalWidth * (100 - pendingWidth)) / 100}%` }}
                      title="Resolved issues"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-civic-100 dark:border-civic-800 flex items-center justify-between text-[11px] text-civic-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Active Backlog
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Resolved
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('staff')}
              className="text-civic-700 dark:text-civic-300 hover:text-accent font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Staff</span>
              <ArrowRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart 3: Resolution Time Trend */}
      <div className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendUp size={16} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-civic-950 dark:text-civic-50">
                Resolution Turnaround Trend (Last 7 Days)
              </h3>
              <p className="text-xs text-civic-400 dark:text-civic-500">
                Average hours to resolution vs resolved issues count
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span>Turnaround: ~15.7h avg</span>
          </div>
        </div>

        {/* Lightweight SVG/CSS Trend Bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end h-40">
          {metrics.resolutionTrend.map((t) => {
            const maxResolved = 30;
            const barHeightPct = Math.round((t.resolved / maxResolved) * 100);
            return (
              <div key={t.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-semibold text-civic-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.avgHours}h
                </span>
                <div className="w-full max-w-[36px] bg-civic-100 dark:bg-civic-800 rounded-t-lg relative flex items-end justify-center overflow-hidden h-28">
                  <div
                    className="w-full bg-civic-900 dark:bg-civic-100 rounded-t-lg transition-all duration-500 group-hover:bg-accent"
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-civic-800 dark:text-civic-200 block">
                    {t.day}
                  </span>
                  <span className="text-[10px] text-civic-400 block">
                    {t.resolved}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
