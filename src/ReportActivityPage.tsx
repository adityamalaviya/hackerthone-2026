import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  Clock,
  Check,
  MapPin,
  Calendar,
  X,
  MagnifyingGlassPlus,
  CaretRight,
  Camera,
  FileText,
  ShieldCheck,
  ArrowLeft
} from '@phosphor-icons/react';
import { getMyIssues } from '../lib/appwrite';

export interface ReportItem {
  id: string;
  issueType: string;
  description: string;
  date: string;
  time: string;
  location: string;
  issueImage: string;
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Closed';
  resolvedImage: string | null;
}

export interface ReportActivityPageProps {
  reports?: ReportItem[];
  onBack?: () => void;
  onReportIssue?: () => void;
}

/**
 * 5 Canonical Civic Issue Statuses
 */
export const STATUS_STEPS: ReportItem['status'][] = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
  'Closed'
];

/**
 * High quality civic fallback image URLs for resilient rendering
 */
const FALLBACK_IMAGES = {
  streetlightIssue:
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
  streetlightResolved:
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  potholeIssue:
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  garbageIssue:
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  waterIssue:
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
  treeIssue:
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  treeResolved:
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
};

/**
 * Mock Reports Data Shape per specifications
 */
export const mockReports: ReportItem[] = [
  {
    id: 'RPT-001',
    issueType: 'Broken Streetlight',
    description: 'The streetlight near the bus stop has been off for 3 days.',
    date: '2025-09-10',
    time: '14:32',
    location: 'Near Bus Stop 14, MG Road, Ahmedabad',
    issueImage: '/mock/issue1.jpg',
    status: 'Resolved',
    resolvedImage: '/mock/resolved1.jpg'
  },
  {
    id: 'RPT-002',
    issueType: 'Deep Pothole & Road Caving',
    description: 'Hazardous deep pothole causing two-wheelers to swerve into oncoming traffic during peak rush hour.',
    date: '2025-09-11',
    time: '09:15',
    location: 'Opp. Shivalik Arcade, Sector 4, Gandhidham',
    issueImage: '/mock/issue2.jpg',
    status: 'In Progress',
    resolvedImage: null
  },
  {
    id: 'RPT-003',
    issueType: 'Garbage Dump Overflow',
    description: 'Municipal waste container overflowing on the sidewalk. Waste spilling into pedestrian footpath.',
    date: '2025-09-12',
    time: '08:40',
    location: 'Plot 42, Ward 3B, Adipur Highway Junction',
    issueImage: '/mock/issue3.jpg',
    status: 'Under Review',
    resolvedImage: null
  },
  {
    id: 'RPT-004',
    issueType: 'Contaminated Water Supply',
    description: 'Muddy tap water with foul odor reported by residents after morning pipeline maintenance.',
    date: '2025-09-12',
    time: '11:05',
    location: 'Street 7, Gayatri Mandir Road, Gandhidham',
    issueImage: '/mock/issue4.jpg',
    status: 'Submitted',
    resolvedImage: null
  },
  {
    id: 'RPT-005',
    issueType: 'Fallen Tree Branch',
    description: 'Large tree limb obstructing the northbound lane following yesterday storm.',
    date: '2025-09-06',
    time: '16:20',
    location: 'Near Rotary Circle, Tagore Road, Gandhidham',
    issueImage: '/mock/issue5.jpg',
    status: 'Closed',
    resolvedImage: '/mock/resolved5.jpg'
  }
];

/**
 * Format ISO date string (YYYY-MM-DD) to "12 Sep 2025"
 */
export function formatReportDate(dateString?: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[monthIndex] || ''} ${year}`;
  }
  return dateString;
}

/**
 * Get fallback image url based on report id or type
 */
function getFallbackImage(report: ReportItem, isResolved = false): string {
  if (isResolved) {
    if (report.id === 'RPT-001') return FALLBACK_IMAGES.streetlightResolved;
    if (report.id === 'RPT-005') return FALLBACK_IMAGES.treeResolved;
    return FALLBACK_IMAGES.streetlightResolved;
  }
  if (report.id === 'RPT-001') return FALLBACK_IMAGES.streetlightIssue;
  if (report.id === 'RPT-002') return FALLBACK_IMAGES.potholeIssue;
  if (report.id === 'RPT-003') return FALLBACK_IMAGES.garbageIssue;
  if (report.id === 'RPT-004') return FALLBACK_IMAGES.waterIssue;
  if (report.id === 'RPT-005') return FALLBACK_IMAGES.treeIssue;
  return FALLBACK_IMAGES.potholeIssue;
}

/**
 * Status Badge Component with unified civic design token styling
 */
export const StatusBadge: React.FC<{ status: ReportItem['status'] | string }> = ({ status }) => {
  const getBadgeStyle = (s: string): string => {
    switch (s) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'In Progress':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Closed':
        return 'bg-civic-100 text-civic-700 border-civic-200 dark:bg-civic-800 dark:text-civic-300 dark:border-civic-700';
      default:
        return 'bg-civic-100 text-civic-600 border-civic-200 dark:bg-civic-800 dark:text-civic-400 dark:border-civic-700';
    }
  };

  const getDotStyle = (s: string): string => {
    switch (s) {
      case 'Submitted':
        return 'bg-blue-500';
      case 'Under Review':
        return 'bg-amber-500';
      case 'In Progress':
        return 'bg-orange-500';
      case 'Resolved':
        return 'bg-emerald-500';
      case 'Closed':
        return 'bg-civic-400';
      default:
        return 'bg-civic-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-medium border ${getBadgeStyle(
        status
      )} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle(status)}`} />
      <span>{status}</span>
    </span>
  );
};

/**
 * 5-Step Civic Status Tracker
 */
export const StatusStepperVisual: React.FC<{ currentStatus: ReportItem['status'] | string }> = ({ currentStatus }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus as ReportItem['status']);

  const getProgressWidthClass = (status: string): string => {
    switch (status) {
      case 'Under Review':
        return 'w-1/4';
      case 'In Progress':
        return 'w-2/4';
      case 'Resolved':
        return 'w-3/4';
      case 'Closed':
        return 'w-full';
      case 'Submitted':
      default:
        return 'w-0';
    }
  };

  return (
    <div className="w-full py-3">
      <div className="relative flex items-center justify-between">
        {/* Continuous baseline track */}
        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-civic-200 dark:bg-civic-800">
          {/* Completed progress line */}
          <div
            className={`h-full bg-status-resolved transition-all duration-300 ease-out ${getProgressWidthClass(
              currentStatus
            )}`}
          />
        </div>

        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center relative z-10 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-status-resolved text-white shadow-xs ring-2 ring-emerald-100 dark:ring-emerald-950'
                    : isCurrent
                    ? 'bg-civic-950 text-white ring-4 ring-civic-200 dark:bg-civic-100 dark:text-civic-950 dark:ring-civic-800'
                    : 'bg-white text-civic-400 border border-civic-300 dark:bg-civic-900 dark:border-civic-700 dark:text-civic-500'
                }`}
              >
                {isCompleted ? (
                  <Check size={12} weight="bold" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white dark:bg-civic-900" />
                ) : (
                  <span className="text-2xs">{idx + 1}</span>
                )}
              </div>

              <span
                className={`mt-2 text-center text-2xs leading-tight px-1 transition-colors ${
                  isCurrent
                    ? 'font-semibold text-civic-950 dark:text-civic-100'
                    : isCompleted
                    ? 'text-civic-700 font-medium dark:text-civic-300'
                    : 'text-civic-400 dark:text-civic-500'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface EnlargedImageState {
  url: string;
  fallbackUrl?: string;
  caption: string;
}

/**
 * Main ReportActivityPage Component
 */
export const ReportActivityPage: React.FC<ReportActivityPageProps> = ({
  reports: initialReports,
  onBack,
  onReportIssue
}) => {
  const [reports, setReports] = useState<ReportItem[]>(() => (initialReports !== undefined ? initialReports : mockReports));
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [enlargedImage, setEnlargedImage] = useState<EnlargedImageState | null>(null);

  useEffect(() => {
    if (initialReports !== undefined) return;
    let mounted = true;

    getMyIssues()
      .then((docs) => {
        if (mounted && Array.isArray(docs) && docs.length > 0) {
          const liveReports: ReportItem[] = docs.map((doc: any) => ({
            id: doc.$id || doc.id,
            issueType: doc.title || doc.category || 'Civic Issue',
            description: doc.description || '',
            date: doc.createdAt ? doc.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            time: doc.createdAt
              ? new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '12:00',
            location: doc.locationName || 'Gandhidham',
            issueImage: doc.photoUrl || '/mock/issue1.jpg',
            status: (doc.status === 'Reported' ? 'Submitted' : doc.status) as ReportItem['status'],
            resolvedImage: doc.resolvedPhotoUrl || null,
          }));
          setReports(liveReports);
        }
      })
      .catch(() => {
        // Graceful fallback to mockReports
      });

    return () => {
      mounted = false;
    };
  }, [initialReports]);

  // Close detail panel or modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (enlargedImage) {
          setEnlargedImage(null);
        } else if (selectedReport) {
          setSelectedReport(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [enlargedImage, selectedReport]);

  const filteredReports = useMemo(() => {
    if (selectedFilter === 'All') return reports;
    return reports.filter((r) => r.status === selectedFilter);
  }, [reports, selectedFilter]);

  const stats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const inProgress = reports.filter((r) => r.status === 'In Progress' || r.status === 'Under Review').length;
    return { total, resolved, inProgress };
  }, [reports]);

  return (
    <div className="min-h-screen bg-civic-50 text-civic-900 dark:bg-civic-950 dark:text-civic-100 font-sans transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Header Section */}
        <header className="mb-8 border-b border-civic-200 dark:border-civic-800 pb-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-civic-500 hover:text-civic-900 dark:text-civic-400 dark:hover:text-civic-100 mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Portal Home</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-2xs font-mono tracking-wide text-civic-500 dark:text-civic-400 uppercase mb-1">
                <ShieldCheck size={14} className="text-status-resolved" />
                <span>Verified Citizen Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-civic-950 dark:text-civic-50">
                My Reports & Activity
              </h1>
              <p className="mt-1 text-sm text-civic-600 dark:text-civic-400">
                Track real-time municipal workflow, dispatch timelines, and resolution audits for your filed issues.
              </p>
            </div>

            {/* Metrics Pills */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3.5 py-1.5 rounded-xl bg-white border border-civic-200 shadow-xs dark:bg-civic-900 dark:border-civic-800 text-center">
                <span className="block text-3xs text-civic-400 dark:text-civic-500 uppercase font-mono">Total</span>
                <span className="text-base font-semibold text-civic-950 dark:text-civic-100">{stats.total}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white border border-civic-200 shadow-xs dark:bg-civic-900 dark:border-civic-800 text-center">
                <span className="block text-3xs text-status-progress uppercase font-mono">Active</span>
                <span className="text-base font-semibold text-civic-950 dark:text-civic-100">{stats.inProgress}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white border border-civic-200 shadow-xs dark:bg-civic-900 dark:border-civic-800 text-center">
                <span className="block text-3xs text-status-resolved uppercase font-mono">Resolved</span>
                <span className="text-base font-semibold text-status-resolved">{stats.resolved}</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          {reports.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 items-center">
              {['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'].map((statusOption) => {
                const isSelected = selectedFilter === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => setSelectedFilter(statusOption)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-civic-950 text-white shadow-xs dark:bg-civic-100 dark:text-civic-950'
                        : 'bg-white text-civic-600 border border-civic-200 hover:bg-civic-50 hover:text-civic-950 dark:bg-civic-900 dark:border-civic-800 dark:text-civic-400 dark:hover:bg-civic-800 dark:hover:text-civic-100'
                    }`}
                  >
                    {statusOption}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* 1. Report History List or Empty State */}
        <main>
          {reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-civic-300 dark:border-civic-800 p-12 text-center bg-white dark:bg-civic-900 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-civic-100 dark:bg-civic-800 flex items-center justify-center mx-auto mb-3 text-civic-400 dark:text-civic-500">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-semibold text-civic-950 dark:text-civic-100">No reports submitted yet</h3>
              <p className="text-xs text-civic-500 dark:text-civic-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                You haven&rsquo;t submitted any civic issue reports. When you report a broken streetlight, pothole, or garbage dump, you can track verification and repair progress in real time here.
              </p>
              {onReportIssue && (
                <button
                  type="button"
                  onClick={onReportIssue}
                  className="mt-5 inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Report a Civic Issue
                </button>
              )}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-civic-300 dark:border-civic-800 p-12 text-center bg-white dark:bg-civic-900">
              <FileText size={32} className="mx-auto text-civic-400 mb-3" />
              <h3 className="text-sm font-semibold text-civic-950 dark:text-civic-100">No matching reports</h3>
              <p className="text-xs text-civic-500 dark:text-civic-400 mt-1">
                There are no reports matching the selected &ldquo;{selectedFilter}&rdquo; status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const isResolved = report.status === 'Resolved';

                return (
                  <article
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white rounded-xl border border-civic-200 cursor-pointer shadow-xs hover:border-civic-300 dark:bg-civic-900 dark:border-civic-800 dark:hover:border-civic-700 transition-all duration-200 ease-out ${
                      isResolved ? 'border-l-4 border-l-status-resolved' : ''
                    }`}
                  >
                    {/* Left Column: Title / Issue Type & Date */}
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xs font-mono text-civic-500 dark:text-civic-400">
                          {report.id}
                        </span>
                        <span className="text-civic-300 dark:text-civic-700">•</span>
                        <time className="text-2xs text-civic-500 dark:text-civic-400 flex items-center gap-1 font-mono">
                          <Calendar size={12} />
                          {formatReportDate(report.date)}
                        </time>
                      </div>

                      <h2 className="text-base font-semibold text-civic-950 dark:text-civic-100 group-hover:text-accent transition-colors">
                        {report.issueType}
                      </h2>

                      <p className="mt-1 text-xs text-civic-600 dark:text-civic-400 line-clamp-1">
                        {report.description}
                      </p>
                    </div>

                    {/* Right Column: Current Status Badge & Action Indicator */}
                    <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-civic-100 dark:border-civic-800">
                      <StatusBadge status={report.status} />
                      <div className="text-civic-400 group-hover:text-civic-700 dark:text-civic-600 dark:group-hover:text-civic-300 transition-transform duration-200 group-hover:translate-x-0.5">
                        <CaretRight size={16} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 2. Detail Panel (Slide-in Drawer / Modal) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out"
            onClick={() => setSelectedReport(null)}
          />

          <div className="fixed inset-y-0 right-0 w-full sm:max-w-xl bg-white dark:bg-civic-900 border-l border-civic-200 dark:border-civic-800 shadow-2xl flex flex-col transform transition-transform duration-200 ease-out z-10">
            
            {/* Panel Top Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-950">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono uppercase tracking-wider text-civic-500 dark:text-civic-400">
                  {selectedReport.id}
                </span>
                <StatusBadge status={selectedReport.status} />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close detail panel"
                className="p-1.5 rounded-lg text-civic-400 hover:text-civic-700 hover:bg-civic-200 dark:text-civic-500 dark:hover:text-civic-200 dark:hover:bg-civic-800 transition-colors cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Panel Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Report Info: Issue Type & Description */}
              <div>
                <h3 className="text-xl font-semibold text-civic-950 dark:text-civic-50">
                  {selectedReport.issueType}
                </h3>
                <p className="mt-2 text-sm text-civic-600 dark:text-civic-300 leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              {/* Report Info: Date Submitted + Exact Time & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 px-4 bg-civic-50 dark:bg-civic-800/60 rounded-xl border border-civic-200 dark:border-civic-800">
                <div>
                  <span className="block text-3xs font-mono uppercase text-civic-500 dark:text-civic-400 mb-0.5">
                    Date & Exact Time
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-civic-800 dark:text-civic-200">
                    <Clock size={14} className="text-civic-500" />
                    <span>{formatReportDate(selectedReport.date)}, {selectedReport.time}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-3xs font-mono uppercase text-civic-500 dark:text-civic-400 mb-0.5">
                    Location
                  </span>
                  <div className="flex items-start gap-1.5 text-xs font-medium text-civic-800 dark:text-civic-200">
                    <MapPin size={14} className="text-civic-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{selectedReport.location}</span>
                  </div>
                </div>
              </div>

              {/* Status Tracker: Visual 5-Stage Step Tracker */}
              <div className="rounded-xl border border-civic-200 dark:border-civic-800 p-4 bg-white dark:bg-civic-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xs font-mono uppercase tracking-wider text-civic-500 dark:text-civic-400">
                    Status Tracker
                  </span>
                  <span className="text-2xs text-civic-500 dark:text-civic-400 font-mono">
                    Stage {STATUS_STEPS.indexOf(selectedReport.status) + 1} of 5
                  </span>
                </div>

                <StatusStepperVisual currentStatus={selectedReport.status} />
              </div>

              {/* Green Resolved Banner & Resolution Image Section */}
              {(selectedReport.status === 'Resolved' || selectedReport.status === 'Closed') && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                    <CheckCircle size={18} weight="fill" className="text-status-resolved" />
                    <span>Resolved</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    Municipal department crews have completed on-site repairs and verified the ticket closure.
                  </p>

                  {/* Resolution Image Section with resolved-state photo */}
                  {selectedReport.resolvedImage && (
                    <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-900/60">
                      <span className="block text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
                        Resolution Image
                      </span>
                      <div
                        onClick={() =>
                          setEnlargedImage({
                            url: selectedReport.resolvedImage as string,
                            fallbackUrl: getFallbackImage(selectedReport, true),
                            caption: `Resolution Audit Proof — ${selectedReport.issueType}`
                          })
                        }
                        className="group relative w-36 h-28 rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-800 cursor-pointer shadow-xs"
                      >
                        <img
                          src={selectedReport.resolvedImage}
                          alt="Resolved issue repair"
                          onError={(e) => {
                            e.currentTarget.src = getFallbackImage(selectedReport, true);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                          <MagnifyingGlassPlus size={20} />
                        </div>
                      </div>
                      <span className="block mt-1 text-2xs text-emerald-700 dark:text-emerald-400">
                        Click thumbnail to enlarge resolution proof
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* User-submitted Image of the issue */}
              <div>
                <span className="block text-2xs font-mono uppercase tracking-wider text-civic-500 dark:text-civic-400 mb-2">
                  User Submitted Image
                </span>
                {selectedReport.issueImage ? (
                  <div
                    onClick={() =>
                      setEnlargedImage({
                        url: selectedReport.issueImage,
                        fallbackUrl: getFallbackImage(selectedReport, false),
                        caption: `Citizen Issue Photo — ${selectedReport.issueType}`
                      })
                    }
                    className="group relative w-40 h-32 rounded-xl overflow-hidden border border-civic-200 dark:border-civic-800 cursor-pointer shadow-xs"
                  >
                    <img
                      src={selectedReport.issueImage}
                      alt={selectedReport.issueType}
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(selectedReport, false);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                      <MagnifyingGlassPlus size={20} />
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-32 rounded-xl border border-dashed border-civic-300 dark:border-civic-700 flex flex-col items-center justify-center text-civic-400 text-xs">
                    <Camera size={24} className="mb-1" />
                    <span>No image attached</span>
                  </div>
                )}
                <span className="block mt-1 text-2xs text-civic-500 dark:text-civic-400">
                  Thumbnail preview • Click to enlarge
                </span>
              </div>

            </div>

            {/* Panel Bottom Footer Bar with Close Button */}
            <div className="p-4 border-t border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-950 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-semibold text-civic-700 dark:text-civic-300 bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-lg hover:bg-civic-100 dark:hover:bg-civic-700 cursor-pointer transition-colors shadow-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. Lightbox Image Enlarge Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ease-out"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-civic-900 rounded-2xl overflow-hidden shadow-2xl border border-civic-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-civic-800 bg-civic-950">
              <span className="text-xs text-civic-200 font-medium truncate pr-4">
                {enlargedImage.caption}
              </span>
              <button
                type="button"
                onClick={() => setEnlargedImage(null)}
                aria-label="Close enlarged preview"
                className="p-1 rounded-md text-civic-400 hover:text-white hover:bg-civic-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Full Image */}
            <div className="relative h-96 flex items-center justify-center bg-black">
              <img
                src={enlargedImage.url}
                alt="Enlarged preview"
                onError={(e) => {
                  if (enlargedImage.fallbackUrl && e.currentTarget.src !== enlargedImage.fallbackUrl) {
                    e.currentTarget.src = enlargedImage.fallbackUrl;
                  }
                }}
                className="max-h-full w-auto max-w-full object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 bg-civic-950 text-right">
              <button
                type="button"
                onClick={() => setEnlargedImage(null)}
                className="text-xs text-civic-400 hover:text-white transition-colors cursor-pointer"
              >
                Dismiss (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportActivityPage;
