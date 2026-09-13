import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  UploadSimple,
  MapPin,
  Crosshair,
  RoadHorizon,
  Lightbulb,
  Trash,
  Drop,
  Waves,
  DotsThreeCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  WarningCircle,
  Sparkle,
} from '@phosphor-icons/react';
import { GANDHIDHAM_LOCALITIES } from '../../data/localities';
import {
  saveReportedIssue,
  SAMPLE_CIVIC_PHOTOS,
  getDepartmentForCategory,
  calculateSla,
  StoredCivicReport,
} from '../../lib/issueStore';
import { createIssueDocument, UserSession } from '../../lib/appwrite';
import { CivicCategory, SeverityLevel } from '../../types/admin';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserSession | null;
  initialCategory?: CivicCategory;
  onSuccess?: (report: StoredCivicReport) => void;
  onViewReports?: () => void;
  onViewMap?: () => void;
}

const CATEGORY_CONFIG: {
  id: CivicCategory;
  name: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'Pothole',
    name: 'Road & Potholes',
    description: 'Crater, road cave-in, uneven asphalt',
    icon: RoadHorizon,
  },
  {
    id: 'Streetlight',
    name: 'Streetlight Outage',
    description: 'Dark pole, blinking or fallen lamp',
    icon: Lightbulb,
  },
  {
    id: 'Garbage',
    name: 'Garbage Overflow',
    description: 'Open waste, full dumpster, litter',
    icon: Trash,
  },
  {
    id: 'Water Leakage',
    name: 'Water Supply Leak',
    description: 'Broken main pipe, flooded street',
    icon: Drop,
  },
  {
    id: 'Drainage',
    name: 'Drainage & Sewage',
    description: 'Blocked drain, sewer overflow, smell',
    icon: Waves,
  },
  {
    id: 'Other',
    name: 'Other Public Utility',
    description: 'Fallen branch, missing manhole, sign',
    icon: DotsThreeCircle,
  },
];

const SEVERITY_CONFIG: {
  id: SeverityLevel;
  label: string;
  sla: string;
  dotColor: string;
  badgeStyle: string;
}[] = [
  {
    id: 'Low',
    label: 'Low',
    sla: '72h SLA',
    dotColor: 'bg-blue-500',
    badgeStyle: 'border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-300',
  },
  {
    id: 'Medium',
    label: 'Medium',
    sla: '48h SLA',
    dotColor: 'bg-amber-500',
    badgeStyle: 'border-amber-200 text-amber-800 dark:border-amber-800 dark:text-amber-300',
  },
  {
    id: 'High',
    label: 'High Priority',
    sla: '24h SLA',
    dotColor: 'bg-orange-500',
    badgeStyle: 'border-orange-200 text-orange-800 dark:border-orange-800 dark:text-orange-300',
  },
  {
    id: 'Critical',
    label: 'Critical / Emergency',
    sla: '12h SLA',
    dotColor: 'bg-red-500 animate-pulse',
    badgeStyle: 'border-red-200 text-red-800 dark:border-red-800 dark:text-red-300',
  },
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialCategory = 'Pothole',
  onSuccess,
  onViewReports,
  onViewMap,
}) => {
  // Step navigation (1: Problem Details, 2: Photo Evidence, 3: Location & Ward, 4: Review / Submit)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [category, setCategory] = useState<CivicCategory>(initialCategory);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<SeverityLevel>('Medium');

  // Photo state
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoFileSize, setPhotoFileSize] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Location state
  const [localityValue, setLocalityValue] = useState<string>(GANDHIDHAM_LOCALITIES[0].value);
  const [landmark, setLandmark] = useState<string>('');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Citizen Identity state
  const [citizenName, setCitizenName] = useState<string>(currentUser?.name || '');
  const [citizenPhone, setCitizenPhone] = useState<string>(currentUser?.phone || '');
  const [citizenEmail, setCitizenEmail] = useState<string>(currentUser?.email || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdReport, setCreatedReport] = useState<StoredCivicReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync initial category if changed
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Sync logged in user details
  useEffect(() => {
    if (currentUser) {
      setCitizenName(currentUser.name);
      setCitizenPhone(currentUser.phone || '');
      setCitizenEmail(currentUser.email);
    }
  }, [currentUser]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCreatedReport(null);
      setIsSubmitting(false);
      setErrors({});
      if (!createdReport) {
        setCurrentStep(1);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected Locality details
  const selectedLocality = GANDHIDHAM_LOCALITIES.find((l) => l.value === localityValue) || GANDHIDHAM_LOCALITIES[0];
  const assignedWard = selectedLocality.ward;
  const assignedDepartment = getDepartmentForCategory(category);
  const slaDetails = calculateSla(severity);

  // Image upload handling
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please select a valid image file (JPG, PNG, WEBP).' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Image must be smaller than 10MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoDataUrl(result);
      setPhotoFileName(file.name);
      setPhotoFileSize((file.size / 1024).toFixed(1) + ' KB');
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.photo;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSamplePhoto = (sample: typeof SAMPLE_CIVIC_PHOTOS[0]) => {
    setPhotoDataUrl(sample.url);
    setPhotoFileName(`${sample.id}-sample.jpg`);
    setPhotoFileSize('Preset Demo Image');
    setCategory(sample.category);
    if (!title) {
      setTitle(sample.title);
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.photo;
      return copy;
    });
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoFileName('');
    setPhotoFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // GPS Location Auto-Detection
  const handleDetectGPS = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setGpsCoordinates({
          lat: Number(position.coords.latitude.toFixed(5)),
          lng: Number(position.coords.longitude.toFixed(5)),
        });
      },
      () => {
        // Fallback to Gandhidham default center coordinates
        setIsLocating(false);
        setGpsCoordinates({ lat: 23.0792, lng: 70.1345 });
        setGpsError('Using default Gandhidham Central coordinates (Ward 4).');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Step Validation
  const validateStep1 = (): boolean => {
    const stepErrors: Record<string, string> = {};
    if (!title.trim()) {
      stepErrors.title = 'Please enter a short headline for this problem.';
    } else if (title.trim().length < 5) {
      stepErrors.title = 'Title should be at least 5 characters.';
    }

    if (!description.trim()) {
      stepErrors.description = 'Please provide problem details so municipal staff can take action.';
    } else if (description.trim().length < 15) {
      stepErrors.description = 'Please write at least 15 characters to describe the issue.';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const stepErrors: Record<string, string> = {};
    if (!localityValue) {
      stepErrors.locality = 'Please select a locality or sector.';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Photo is encouraged, proceed to location
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep3()) {
      return;
    }

    setIsSubmitting(true);

    const fullLocationName = landmark.trim()
      ? `${landmark.trim()}, ${selectedLocality.label}`
      : selectedLocality.label;

    const lat = gpsCoordinates ? gpsCoordinates.lat : 23.0792;
    const lng = gpsCoordinates ? gpsCoordinates.lng : 70.1345;

    // Simulate network delay for realistic feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Save locally
    const newReport = saveReportedIssue({
      title,
      category,
      description,
      severity,
      localityValue,
      locationName: fullLocationName,
      landmark: landmark.trim() || undefined,
      ward: assignedWard,
      latitude: lat,
      longitude: lng,
      photoDataUrl: photoDataUrl || undefined,
      reportedByName: citizenName.trim() || undefined,
      reportedByPhone: citizenPhone.trim() || undefined,
      reportedByEmail: citizenEmail.trim() || undefined,
      reportedByUserId: currentUser?.id,
      isAnonymous,
    });

    // Also attempt Appwrite document sync in background
    void createIssueDocument({
      title,
      category,
      description,
      locationName: fullLocationName,
      latitude: lat,
      longitude: lng,
      ward: assignedWard,
      photoUrl: photoDataUrl || undefined,
      severity,
      reportedBy: currentUser?.id || 'citizen',
    });

    setIsSubmitting(false);
    setCreatedReport(newReport);
    onSuccess?.(newReport);
  };

  const handleResetForm = () => {
    setCreatedReport(null);
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setCategory(initialCategory);
    setSeverity('Medium');
    setPhotoDataUrl(null);
    setPhotoFileName('');
    setPhotoFileSize('');
    setLandmark('');
    setGpsCoordinates(null);
    setGpsError(null);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-civic-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative my-auto w-full max-w-2xl bg-white dark:bg-civic-900 rounded-2xl shadow-2xl border border-civic-200 dark:border-civic-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-civic-100 dark:border-civic-800 flex items-center justify-between bg-civic-50/70 dark:bg-civic-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Camera size={20} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-civic-950 dark:text-civic-50 tracking-tight">
                  Report a Civic Problem
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-3xs font-medium rounded-full bg-status-resolved/10 text-status-resolved border border-status-resolved/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-resolved animate-pulse" />
                  Gandhidham Active
                </span>
              </div>
              <p className="text-xs text-civic-500 dark:text-civic-400">
                Direct dispatch to Gandhidham Municipal Corporation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report form"
            className="p-1.5 rounded-lg text-civic-400 hover:text-civic-900 dark:text-civic-500 dark:hover:text-civic-100 hover:bg-civic-100 dark:hover:bg-civic-800 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Step Progress Bar (Only visible when not in success view) */}
        {!createdReport && (
          <div className="px-6 pt-3 pb-2 border-b border-civic-100 dark:border-civic-800/60 bg-white dark:bg-civic-900">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-civic-900 dark:text-civic-100">
                {currentStep === 1 && 'Step 1: Problem Details & Category'}
                {currentStep === 2 && 'Step 2: Photo Evidence (Upload)'}
                {currentStep === 3 && 'Step 3: Location & Ward'}
                {currentStep === 4 && 'Step 4: Review & Citizen Identity'}
              </span>
              <span className="text-2xs font-mono text-civic-500 dark:text-civic-400">
                Step {currentStep} of 4
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((step) => {
                const isPassed = step < currentStep;
                const isCurrent = step === currentStep;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      if (step < currentStep) setCurrentStep(step);
                    }}
                    disabled={step > currentStep}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      isPassed
                        ? 'bg-status-resolved cursor-pointer'
                        : isCurrent
                        ? 'bg-accent'
                        : 'bg-civic-200 dark:bg-civic-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* ============================================================== */}
          {/* SUCCESS SCREEN                                                 */}
          {/* ============================================================== */}
          {createdReport ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-status-resolved shadow-sm animate-in zoom-in-95 duration-200">
                <CheckCircle size={36} weight="fill" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
                  <Sparkle size={14} weight="fill" className="text-emerald-600" />
                  Ticket Filed Successfully
                </span>
                <h3 className="text-2xl font-bold text-civic-950 dark:text-civic-50">
                  Grievance Registered
                </h3>
                <p className="text-xs text-civic-600 dark:text-civic-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Your report has been routed to the Gandhidham municipal dispatch queue and logged into the public audit ledger.
                </p>
              </div>

              {/* Ticket Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-civic-50 dark:bg-civic-950/80 border border-civic-200 dark:border-civic-800 text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-civic-200/80 dark:border-civic-800 pb-2.5">
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">Tracking ID</span>
                    <p className="font-mono text-base font-bold text-accent">{createdReport.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xs uppercase font-mono text-civic-400">Status</span>
                    <p className="text-xs font-semibold text-status-reported flex items-center gap-1 justify-end">
                      <span className="w-2 h-2 rounded-full bg-status-reported" />
                      Reported (In Queue)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">Issue Title</span>
                    <p className="font-medium text-civic-900 dark:text-civic-100 truncate">{createdReport.title}</p>
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">Jurisdiction Ward</span>
                    <p className="font-medium text-civic-900 dark:text-civic-100">{createdReport.ward}</p>
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">Department</span>
                    <p className="font-medium text-civic-900 dark:text-civic-100">{createdReport.department}</p>
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">Estimated SLA</span>
                    <p className="font-medium text-status-resolved">{createdReport.slaDeadline}</p>
                  </div>
                </div>

                {/* Uploaded Photo Preview in Success Card */}
                {createdReport.photoDataUrl && (
                  <div className="pt-2 border-t border-civic-200/80 dark:border-civic-800">
                    <span className="text-3xs uppercase font-mono text-civic-400 block mb-1.5">
                      Attached Image Evidence
                    </span>
                    <div className="w-24 h-18 rounded-lg overflow-hidden border border-civic-300 dark:border-civic-700">
                      <img
                        src={createdReport.photoDataUrl}
                        alt="Submitted evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onViewReports && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewReports();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-950 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>View in My Reports</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                )}

                {onViewMap && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewMap();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-civic-800 bg-white hover:bg-civic-50 border border-civic-200 dark:text-civic-200 dark:bg-civic-900 dark:hover:bg-civic-800 dark:border-civic-700 rounded-xl transition-all cursor-pointer"
                  >
                    View Pin on Live Map
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-xl transition-colors cursor-pointer"
                >
                  Report Another Issue
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ============================================================== */}
              {/* STEP 1: Problem Details & Category                             */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Category Selector Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-2">
                      Select Issue Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CATEGORY_CONFIG.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-accent/5 border-accent text-accent ring-1 ring-accent shadow-xs'
                                : 'bg-white dark:bg-civic-900/60 border-civic-200 dark:border-civic-800 hover:border-civic-300 dark:hover:border-civic-700 text-civic-700 dark:text-civic-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-accent text-white'
                                    : 'bg-civic-100 dark:bg-civic-800 text-civic-600 dark:text-civic-400'
                                }`}
                              >
                                <Icon size={16} weight={isSelected ? 'bold' : 'regular'} />
                              </div>
                              {isSelected && <CheckCircle size={15} weight="fill" className="text-accent" />}
                            </div>
                            <span className="font-semibold text-xs text-civic-950 dark:text-civic-100">
                              {cat.name}
                            </span>
                            <span className="text-3xs text-civic-500 dark:text-civic-400 line-clamp-1 mt-0.5">
                              {cat.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="issue-title" className="text-xs font-semibold text-civic-950 dark:text-civic-50">
                        Problem Title / Summary <span className="text-red-500">*</span>
                      </label>
                      <span className="text-3xs font-mono text-civic-400">
                        {title.length}/80
                      </span>
                    </div>
                    <input
                      id="issue-title"
                      type="text"
                      maxLength={80}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                      }}
                      placeholder="e.g. Hazardous deep pothole near Rotary Circle junction"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border text-civic-900 dark:text-civic-100 placeholder-civic-400 dark:placeholder-civic-600 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                        errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-civic-200 dark:border-civic-800'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-2xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <WarningCircle size={13} weight="fill" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Severity Level Radio Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-civic-950 dark:text-civic-50">
                        Severity / Urgency Level
                      </label>
                      <span className="text-3xs text-civic-500 dark:text-civic-400">
                        Affects municipal response priority
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SEVERITY_CONFIG.map((sev) => {
                        const isSelected = severity === sev.id;
                        return (
                          <button
                            key={sev.id}
                            type="button"
                            onClick={() => setSeverity(sev.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-civic-100/90 dark:bg-civic-800 border-civic-400 dark:border-civic-600 ring-1 ring-civic-400'
                                : 'bg-white dark:bg-civic-900/40 border-civic-200 dark:border-civic-800 hover:border-civic-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-2 h-2 rounded-full ${sev.dotColor}`} />
                              <span className="font-semibold text-xs text-civic-900 dark:text-civic-100">
                                {sev.label}
                              </span>
                            </div>
                            <span className="text-3xs font-mono text-civic-500 dark:text-civic-400 block">
                              {sev.sla}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="issue-description" className="text-xs font-semibold text-civic-950 dark:text-civic-50">
                        Detailed Description <span className="text-red-500">*</span>
                      </label>
                      <span className="text-3xs font-mono text-civic-400">
                        {description.length} chars (min 15)
                      </span>
                    </div>
                    <textarea
                      id="issue-description"
                      rows={3}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                      }}
                      placeholder="Describe the problem, hazard to commuters or residents, and when you first noticed it..."
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border text-civic-900 dark:text-civic-100 placeholder-civic-400 dark:placeholder-civic-600 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                        errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-civic-200 dark:border-civic-800'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-2xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <WarningCircle size={13} weight="fill" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 2: Photo Evidence (Image Upload)                         */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1">
                      Attach Image Evidence (Photo)
                    </h3>
                    <p className="text-2xs text-civic-500 dark:text-civic-400">
                      Reports with photos are verified 3x faster by municipal engineers.
                    </p>
                  </div>

                  {/* Hidden inputs for file and mobile camera */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />

                  {/* Upload Drop Zone or Image Preview */}
                  {photoDataUrl ? (
                    <div className="relative rounded-2xl border border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-950 p-4 flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-36 h-28 rounded-xl overflow-hidden border border-civic-200 dark:border-civic-700 shadow-sm flex-shrink-0 bg-black">
                        <img
                          src={photoDataUrl}
                          alt="Uploaded evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs font-semibold text-civic-900 dark:text-civic-100">
                          <CheckCircle size={16} weight="fill" className="text-status-resolved" />
                          <span>Photo Attached Ready</span>
                        </div>
                        <p className="text-2xs text-civic-500 dark:text-civic-400 mt-0.5 truncate max-w-xs">
                          {photoFileName}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-3xs font-mono rounded bg-civic-200 dark:bg-civic-800 text-civic-700 dark:text-civic-300">
                          {photoFileSize}
                        </span>

                        <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 text-2xs font-medium text-civic-700 dark:text-civic-300 bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-lg hover:bg-civic-100 dark:hover:bg-civic-700 transition-colors cursor-pointer"
                          >
                            Replace Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-3 py-1.5 text-2xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
                        isDragOver
                          ? 'border-accent bg-accent/5'
                          : 'border-civic-300 dark:border-civic-800 bg-civic-50/50 dark:bg-civic-950/40 hover:bg-civic-50 dark:hover:bg-civic-900/80 hover:border-civic-400'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-civic-800 shadow-xs border border-civic-200 dark:border-civic-700 flex items-center justify-center mx-auto mb-3 text-accent">
                        <UploadSimple size={24} weight="bold" />
                      </div>
                      <p className="text-xs font-semibold text-civic-900 dark:text-civic-100">
                        Click to browse or drag & drop photo here
                      </p>
                      <p className="text-2xs text-civic-500 dark:text-civic-400 mt-1">
                        Supports JPG, PNG, WEBP (Max 10MB)
                      </p>

                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cameraInputRef.current?.click();
                          }}
                          className="px-3.5 py-1.5 text-2xs font-semibold text-civic-800 dark:text-civic-200 bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-lg shadow-2xs hover:bg-civic-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera size={14} weight="bold" className="text-accent" />
                          <span>Take Live Photo (Camera)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.photo && (
                    <p className="text-2xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <WarningCircle size={13} weight="fill" />
                      {errors.photo}
                    </p>
                  )}

                  {/* Demo/Sample Photos Quick Picker for Instant Testing */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-2xs font-mono text-civic-500 dark:text-civic-400 uppercase tracking-wider mb-2">
                      <Sparkle size={13} className="text-accent" />
                      <span>Quick Test: Pick sample civic photo</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SAMPLE_CIVIC_PHOTOS.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleSelectSamplePhoto(sample)}
                          className="group relative rounded-xl overflow-hidden border border-civic-200 dark:border-civic-800 p-1.5 bg-white dark:bg-civic-900 text-left hover:border-accent transition-all cursor-pointer shadow-2xs"
                        >
                          <div className="w-full h-16 rounded-lg overflow-hidden bg-civic-100 dark:bg-civic-800 mb-1.5">
                            <img
                              src={sample.url}
                              alt={sample.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <span className="block text-2xs font-medium text-civic-900 dark:text-civic-100 truncate">
                            {sample.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 3: Location & Gandhidham Ward                              */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1">
                      Locality & Municipal Ward Routing
                    </h3>
                    <p className="text-2xs text-civic-500 dark:text-civic-400">
                      Coordinates ensure municipal road and sanitation crews reach the exact spot.
                    </p>
                  </div>

                  {/* Locality Dropdown */}
                  <div>
                    <label htmlFor="locality-select" className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1.5">
                      Gandhidham Locality / Sector <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="locality-select"
                      value={localityValue}
                      onChange={(e) => setLocalityValue(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    >
                      {GANDHIDHAM_LOCALITIES.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label} — {loc.ward} ({loc.pincode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Landmark Input */}
                  <div>
                    <label htmlFor="landmark-input" className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1.5">
                      Specific Landmark or Street Address
                    </label>
                    <input
                      id="landmark-input"
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite State Bank branch, next to transformer pole #14"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100 placeholder-civic-400 dark:placeholder-civic-600 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>

                  {/* GPS Coordinates & Auto-Detector */}
                  <div className="p-4 rounded-2xl border border-civic-200 dark:border-civic-800 bg-civic-50/70 dark:bg-civic-950/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-civic-900 dark:text-civic-100">
                          <MapPin size={16} weight="fill" className="text-accent" />
                          <span>GPS Coordinates Auto-Detection</span>
                        </div>
                        <p className="text-2xs text-civic-500 dark:text-civic-400 mt-0.5">
                          {gpsCoordinates
                            ? `Lat: ${gpsCoordinates.lat}° N, Lng: ${gpsCoordinates.lng}° E`
                            : 'Click detect to tag your precise device location'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        disabled={isLocating}
                        className="px-3.5 py-2 text-2xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Crosshair size={14} weight="bold" className={isLocating ? 'animate-spin' : ''} />
                        <span>{isLocating ? 'Locating...' : 'Detect GPS'}</span>
                      </button>
                    </div>

                    {gpsError && (
                      <p className="mt-2 text-3xs text-amber-700 dark:text-amber-400">
                        {gpsError}
                      </p>
                    )}
                  </div>

                  {/* Auto-routed Ward & Department Indicator */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-civic-100/70 dark:bg-civic-800/60 border border-civic-200 dark:border-civic-700">
                      <span className="text-3xs uppercase font-mono text-civic-500 dark:text-civic-400 block mb-0.5">
                        Jurisdiction Ward
                      </span>
                      <span className="font-semibold text-civic-900 dark:text-civic-100">
                        {assignedWard}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-civic-100/70 dark:bg-civic-800/60 border border-civic-200 dark:border-civic-700">
                      <span className="text-3xs uppercase font-mono text-civic-500 dark:text-civic-400 block mb-0.5">
                        Target Department
                      </span>
                      <span className="font-semibold text-civic-900 dark:text-civic-100 truncate block">
                        {assignedDepartment}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 4: Review & Citizen Identity                              */}
              {/* ============================================================== */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl border border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-950/80 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-civic-200 dark:border-civic-800 pb-2">
                      <span className="text-xs font-semibold text-civic-950 dark:text-civic-50">
                        Review Problem Submission
                      </span>
                      <span className="text-3xs font-mono px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold">
                        {category} • {severity} Priority
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-civic-900 dark:text-civic-100">{title}</p>
                      <p className="text-2xs text-civic-600 dark:text-civic-400 line-clamp-2">{description}</p>
                    </div>

                    <div className="pt-2 border-t border-civic-200 dark:border-civic-800 flex items-center justify-between text-2xs text-civic-600 dark:text-civic-400">
                      <span>{selectedLocality.label} ({assignedWard})</span>
                      <span className="font-mono text-status-resolved">{slaDetails.deadlineLabel}</span>
                    </div>

                    {photoDataUrl && (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="w-10 h-8 rounded overflow-hidden border border-civic-300 dark:border-civic-700">
                          <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-3xs text-civic-500 dark:text-civic-400">Photo attached</span>
                      </div>
                    )}
                  </div>

                  {/* Citizen Contact Info */}
                  <div>
                    <h3 className="text-xs font-semibold text-civic-950 dark:text-civic-50 mb-2">
                      Citizen Contact & Accountability
                    </h3>

                    {currentUser ? (
                      <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-status-resolved flex items-center justify-center flex-shrink-0">
                          <ShieldCheck size={18} weight="fill" />
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                            Filing as Verified Citizen: {currentUser.name}
                          </p>
                          <p className="text-2xs text-emerald-700 dark:text-emerald-400">
                            {currentUser.email} • {currentUser.phone || 'Phone on file'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-2xs font-semibold text-civic-700 dark:text-civic-300 mb-1">
                              Your Name
                            </label>
                            <input
                              type="text"
                              disabled={isAnonymous}
                              value={citizenName}
                              onChange={(e) => setCitizenName(e.target.value)}
                              placeholder="e.g. Ramesh Patel"
                              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100 disabled:opacity-50"
                            />
                          </div>

                          <div>
                            <label className="block text-2xs font-semibold text-civic-700 dark:text-civic-300 mb-1">
                              Mobile Number (for SMS updates)
                            </label>
                            <input
                              type="tel"
                              disabled={isAnonymous}
                              value={citizenPhone}
                              onChange={(e) => setCitizenPhone(e.target.value)}
                              placeholder="e.g. +91 98250 12345"
                              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded border-civic-300 text-accent focus:ring-accent"
                          />
                          <span className="text-2xs text-civic-600 dark:text-civic-400">
                            File this report anonymously (name will not be shown in public audit trail)
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* Form Navigation Controls (Back / Next / Submit)                */}
              {/* ============================================================== */}
              <div className="pt-4 border-t border-civic-100 dark:border-civic-800 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-xs font-medium text-civic-700 dark:text-civic-300 hover:bg-civic-100 dark:hover:bg-civic-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-civic-500 hover:text-civic-900 dark:hover:text-civic-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: {currentStep === 1 ? 'Add Photo' : currentStep === 2 ? 'Select Location' : 'Review'}</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} weight="bold" />
                        <span>Submit Grievance</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
