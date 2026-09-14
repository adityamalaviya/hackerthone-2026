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
  CheckCircle,
  WarningCircle,
  Sparkle,
  Microphone,
  MicrophoneSlash,
  FileText,
  NavigationArrow,
} from '@phosphor-icons/react';
import { GANDHIDHAM_LOCALITIES, findNearestLocality } from '../../data/localities';
import {
  saveReportedIssue,
  SAMPLE_CIVIC_PHOTOS,
  getDepartmentForCategory,
  calculateSla,
  StoredCivicReport,
} from '../../lib/issueStore';
import { createIssueDocument, UserSession } from '../../lib/appwrite';
import { CivicCategory, SeverityLevel } from '../../types/admin';
import { extractExifGps } from '../../lib/exifReader';

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
  hindiName: string;
  description: string;
  icon: React.ElementType;
  defaultTitle: string;
}[] = [
  {
    id: 'Pothole',
    name: 'Road & Potholes',
    hindiName: 'सड़क / गड्ढा',
    description: 'Crater, road cave-in, uneven asphalt',
    icon: RoadHorizon,
    defaultTitle: 'सड़क पर गड्ढा / Road Pothole',
  },
  {
    id: 'Garbage',
    name: 'Garbage Overflow',
    hindiName: 'कचरा ढेर',
    description: 'Open waste, full dumpster, litter',
    icon: Trash,
    defaultTitle: 'खुला कचरा ढेर / Garbage Overflow',
  },
  {
    id: 'Streetlight',
    name: 'Streetlight Outage',
    hindiName: 'स्ट्रीटलाइट बंद',
    description: 'Dark pole, blinking or fallen lamp',
    icon: Lightbulb,
    defaultTitle: 'स्ट्रीटलाइट बंद / Streetlight Outage',
  },
  {
    id: 'Water Leakage',
    name: 'Water Supply Leak',
    hindiName: 'पानी लीकेज',
    description: 'Broken main pipe, flooded street',
    icon: Drop,
    defaultTitle: 'पानी की पाइप लीकेज / Water Supply Leak',
  },
  {
    id: 'Drainage',
    name: 'Drainage & Sewage',
    hindiName: 'नाली / गटर जाम',
    description: 'Blocked drain, sewer overflow, smell',
    icon: Waves,
    defaultTitle: 'गटर / नाली ओवरफ्लो / Drainage Overflow',
  },
  {
    id: 'Other',
    name: 'Other Public Utility',
    hindiName: 'अन्य समस्या',
    description: 'Fallen branch, missing manhole, sign',
    icon: DotsThreeCircle,
    defaultTitle: 'सार्वजनिक समस्या / Public Utility Issue',
  },
];

const SEVERITY_CONFIG: {
  id: SeverityLevel;
  label: string;
  sla: string;
  dotColor: string;
}[] = [
  { id: 'Low', label: 'Low', sla: '72h SLA', dotColor: 'bg-blue-500' },
  { id: 'Medium', label: 'Medium', sla: '48h SLA', dotColor: 'bg-amber-500' },
  { id: 'High', label: 'High Priority', sla: '24h SLA', dotColor: 'bg-orange-500' },
  { id: 'Critical', label: 'Critical / Emergency', sla: '12h SLA', dotColor: 'bg-red-500 animate-pulse' },
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
  // Mode: 'quick' (1-click photo report, no typing needed) vs 'detailed' (4-step form)
  const [reportMode, setReportMode] = useState<'quick' | 'detailed'>('quick');

  // Step navigation for detailed mode (1: Problem Details, 2: Photo Evidence, 3: Location & Ward, 4: Review / Submit)
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
  const [locationSource, setLocationSource] = useState<'image-exif' | 'device-gps' | 'manual' | null>(null);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceNoteText, setVoiceNoteText] = useState<string>('');
  const speechRecognitionRef = useRef<any>(null);

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

  // Auto-detect GPS when modal opens so location is already ready!
  useEffect(() => {
    if (isOpen) {
      setCreatedReport(null);
      setIsSubmitting(false);
      setErrors({});
      if (!gpsCoordinates) {
        handleDetectGPS(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected Locality details
  const selectedLocality = GANDHIDHAM_LOCALITIES.find((l) => l.value === localityValue) || GANDHIDHAM_LOCALITIES[0];
  const assignedWard = selectedLocality.ward;
  const assignedDepartment = getDepartmentForCategory(category);
  const slaDetails = calculateSla(severity);

  // Apply location from coordinates
  const applyGpsCoordinates = (lat: number, lng: number, source: 'image-exif' | 'device-gps') => {
    setGpsCoordinates({ lat, lng });
    setLocationSource(source);

    const nearest = findNearestLocality(lat, lng);
    if (nearest) {
      setLocalityValue(nearest.value);
      if (!landmark) {
        setLandmark(`Near ${nearest.label}`);
      }
    }

    // Attempt reverse geocoding via OpenStreetMap Nominatim for higher accuracy
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        const placeName = data.display_name || data.address?.suburb || data.address?.road || data.address?.neighbourhood;
        if (placeName && !landmark) {
          const shortAddress = [data.address?.road, data.address?.suburb, data.address?.city || 'Gandhidham']
            .filter(Boolean)
            .join(', ');
          if (shortAddress) setLandmark(shortAddress);
        }
      })
      .catch(() => {
        // Fallback already handled via findNearestLocality
      });
  };

  // Image upload handling with auto-location extraction
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'कृपया सही फोटो चुनें (JPG, PNG, WEBP).' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'फोटो 10MB से छोटी होनी चाहिए।' }));
      return;
    }

    // Read file for preview
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

    // 1. Try to extract GPS from Image EXIF
    let exifFound = false;
    try {
      const exifResult = await extractExifGps(file);
      if (exifResult) {
        exifFound = true;
        applyGpsCoordinates(exifResult.latitude, exifResult.longitude, 'image-exif');
      }
    } catch (err) {
      console.debug('EXIF extraction skipped:', err);
    }

    // 2. If EXIF did not contain GPS or device GPS not yet fetched, fetch live device GPS
    if (!exifFound && !gpsCoordinates) {
      handleDetectGPS(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
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

    // If no GPS yet, set Gandhidham Central coordinates
    if (!gpsCoordinates) {
      applyGpsCoordinates(23.0792, 70.1345, 'device-gps');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoFileName('');
    setPhotoFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // GPS Location Auto-Detection
  const handleDetectGPS = (notifySuccess = false) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('आपके ब्राउज़र में लोकेशन (GPS) उपलब्ध नहीं है।');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        applyGpsCoordinates(lat, lng, 'device-gps');
      },
      () => {
        // Fallback to Gandhidham default center coordinates
        setIsLocating(false);
        applyGpsCoordinates(23.0792, 70.1345, 'device-gps');
        if (notifySuccess) {
          setGpsError('गांधीधाम सेंट्रल लोकेशन (वार्ड 4) सेट की गई है।');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Speech Recognition (Voice Note) for unlettered citizens
  const handleToggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('आपके ब्राउज़र में माइक वॉयस टाइपिंग सपोर्ट नहीं है। आप सीधे फोटो भेज सकते हैं!');
      return;
    }

    if (isRecordingVoice) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi recognition default
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setVoiceNoteText(spoken);
        setDescription((prev) => (prev ? `${prev} - ${spoken}` : spoken));
        setIsRecordingVoice(false);
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition failed', e);
      setIsRecordingVoice(false);
    }
  };

  // Step Validation for Detailed Mode
  const validateStep1 = (): boolean => {
    const stepErrors: Record<string, string> = {};
    if (!title.trim()) {
      stepErrors.title = 'कृपया समस्या का संक्षिप्त नाम लिखें।';
    }

    if (!description.trim()) {
      stepErrors.description = 'कृपया समस्या के बारे में लिखें।';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const stepErrors: Record<string, string> = {};
    if (!localityValue) {
      stepErrors.locality = 'कृपया इलाका या वार्ड चुनें।';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
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

  // Submission handler (works for both Quick Photo Mode and Detailed Mode)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // In Quick Mode, photo is required
    if (reportMode === 'quick' && !photoDataUrl) {
      setErrors((prev) => ({
        ...prev,
        photo: 'कृपया पहले समस्या की फोटो खींचें या अपलोड करें (Please add photo).',
      }));
      return;
    }

    // In Detailed Mode, validate steps
    if (reportMode === 'detailed') {
      if (!validateStep1() || !validateStep3()) {
        return;
      }
    }

    setIsSubmitting(true);

    const activeCategoryConfig = CATEGORY_CONFIG.find((c) => c.id === category);

    // Auto-fill title and description if empty (essential for unlettered citizens)
    const finalTitle =
      title.trim() ||
      `${activeCategoryConfig?.defaultTitle || category} - ${selectedLocality.label.split(',')[0]}`;

    const finalDescription =
      description.trim() ||
      (voiceNoteText
        ? `आवाज संदेश: "${voiceNoteText}" - फोटो रिपोर्ट`
        : `नागरिक द्वारा फोटो से तुरंत दर्ज की गई शिकायत। स्थान: ${selectedLocality.label}, गांधीधाम (${assignedWard})`);

    const fullLocationName = landmark.trim()
      ? `${landmark.trim()}, ${selectedLocality.label}`
      : selectedLocality.label;

    const lat = gpsCoordinates ? gpsCoordinates.lat : selectedLocality.lat || 23.0792;
    const lng = gpsCoordinates ? gpsCoordinates.lng : selectedLocality.lng || 70.1345;

    // Simulate realistic feedback delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Save locally in issueStore
    const newReport = saveReportedIssue({
      title: finalTitle,
      category,
      description: finalDescription,
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
      title: finalTitle,
      category,
      description: finalDescription,
      locationName: fullLocationName,
      latitude: lat,
      longitude: lng,
      ward: assignedWard,
      photoUrl: photoDataUrl || undefined,
      severity,
      reportedBy: currentUser?.id || 'citizen-quick',
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
    setVoiceNoteText('');
    setCategory(initialCategory);
    setSeverity('Medium');
    setPhotoDataUrl(null);
    setPhotoFileName('');
    setPhotoFileSize('');
    setLandmark('');
    setGpsCoordinates(null);
    setGpsError(null);
    setLocationSource(null);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto bg-civic-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative my-auto w-full max-w-2xl bg-white dark:bg-civic-900 rounded-2xl shadow-2xl border border-civic-200 dark:border-civic-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Hidden inputs for camera & gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              void handleFile(e.target.files[0]);
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
              void handleFile(e.target.files[0]);
            }
          }}
        />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-civic-100 dark:border-civic-800 flex items-center justify-between bg-civic-50/80 dark:bg-civic-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm">
              <Camera size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-civic-950 dark:text-civic-50 tracking-tight">
                  शिकायत दर्ज करें / Report Issue
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-3xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  गांधीधाम
                </span>
              </div>
              <p className="text-xs text-civic-600 dark:text-civic-400">
                गांधीधाम नगर निगम (GMC) सीधा समाधान
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report form"
            className="p-1.5 rounded-lg text-civic-400 hover:text-civic-900 dark:text-civic-500 dark:hover:text-civic-100 hover:bg-civic-100 dark:hover:bg-civic-800 transition-colors cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Mode Selector Tabs (Quick Photo Mode vs Detailed Mode) */}
        {!createdReport && (
          <div className="px-5 pt-3 pb-2 border-b border-civic-100 dark:border-civic-800 bg-civic-50/50 dark:bg-civic-950/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setReportMode('quick')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  reportMode === 'quick'
                    ? 'bg-accent text-white shadow-sm ring-2 ring-accent/30'
                    : 'bg-white dark:bg-civic-800 text-civic-700 dark:text-civic-300 border border-civic-200 dark:border-civic-700 hover:bg-civic-100'
                }`}
              >
                <Camera size={16} weight="fill" />
                <span>📸 आसान फोटो रिपोर्ट (बिना लिखे)</span>
              </button>

              <button
                type="button"
                onClick={() => setReportMode('detailed')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  reportMode === 'detailed'
                    ? 'bg-accent text-white shadow-sm ring-2 ring-accent/30'
                    : 'bg-white dark:bg-civic-800 text-civic-700 dark:text-civic-300 border border-civic-200 dark:border-civic-700 hover:bg-civic-100'
                }`}
              >
                <FileText size={16} weight="bold" />
                <span className="hidden sm:inline">विस्तृत फॉर्म (Detailed)</span>
                <span className="sm:hidden">फॉर्म</span>
              </button>
            </div>

            {reportMode === 'detailed' && (
              <span className="text-2xs font-mono text-civic-500 hidden sm:inline-block">
                Step {currentStep} of 4
              </span>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1">
          
          {/* ============================================================== */}
          {/* SUCCESS SCREEN                                                 */}
          {/* ============================================================== */}
          {createdReport ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-in zoom-in-95 duration-200">
                <CheckCircle size={38} weight="fill" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
                  <Sparkle size={14} weight="fill" className="text-emerald-600" />
                  शिकायत सफलतापूर्वक दर्ज हुई (Registered)
                </span>
                <h3 className="text-2xl font-bold text-civic-950 dark:text-civic-50">
                  Grievance Registered
                </h3>
                <p className="text-xs text-civic-600 dark:text-civic-400 mt-1 max-w-md mx-auto leading-relaxed">
                  आपकी शिकायत गांधीधाम नगर निगम के संबंधित वार्ड अधिकारी को भेज दी गई है।
                </p>
              </div>

              {/* Ticket Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-civic-50 dark:bg-civic-950/80 border border-civic-200 dark:border-civic-800 text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-civic-200/80 dark:border-civic-800 pb-2.5">
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">ट्रेकिंग नंबर (Tracking ID)</span>
                    <p className="font-mono text-base font-bold text-accent">{createdReport.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xs uppercase font-mono text-civic-400">स्थिति (Status)</span>
                    <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 justify-end">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      दर्ज / इन-प्रोसेस
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">समस्या (Issue)</span>
                    <p className="font-medium text-civic-900 dark:text-civic-100 truncate">{createdReport.title}</p>
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">वार्ड / स्थान (Location)</span>
                    <p className="font-medium text-civic-900 dark:text-civic-100">{createdReport.locationName}</p>
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">विभाग (Department)</span>
                    <p className="font-medium text-civic-900 dark:text-civic-100">{createdReport.department}</p>
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-mono text-civic-400">निवारण समय (SLA)</span>
                    <p className="font-medium text-emerald-600">{createdReport.slaDeadline}</p>
                  </div>
                </div>

                {/* Uploaded Photo Preview in Success Card */}
                {createdReport.photoDataUrl && (
                  <div className="pt-2 border-t border-civic-200/80 dark:border-civic-800">
                    <span className="text-3xs uppercase font-mono text-civic-400 block mb-1.5">
                      संलग्न फोटो (Photo Evidence)
                    </span>
                    <div className="w-28 h-20 rounded-xl overflow-hidden border border-civic-300 dark:border-civic-700 shadow-sm">
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
                    <span>मेरी शिकायतें देखें (My Reports)</span>
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
                    लाइव मैप पर देखें (Live Map)
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-xl transition-colors cursor-pointer"
                >
                  दूसरी समस्या दर्ज करें (Report Another)
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* ============================================================== */}
              {/* MODE 1: QUICK PHOTO REPORT (FOR ILLITERATE / UNLETTERED USERS)  */}
              {/* ============================================================== */}
              {reportMode === 'quick' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Visual Guide Banner */}
                  <div className="p-3.5 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkle size={18} weight="fill" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-civic-900 dark:text-civic-100">
                        बस फोटो खींचिए, बाकी सब अपने आप हो जाएगा!
                      </p>
                      <p className="text-2xs text-civic-600 dark:text-civic-400 mt-0.5 leading-relaxed">
                        आपको कुछ भी लिखने की ज़रूरत नहीं है। फोटो जोड़ते ही आपकी लोकेशन अपने आप दर्ज हो जाएगी।
                      </p>
                    </div>
                  </div>

                  {/* Section 1: BIG PHOTO CAPTURE / UPLOAD BUTTONS */}
                  <div>
                    <label className="block text-xs font-bold text-civic-950 dark:text-civic-50 mb-2">
                      1. समस्या की फोटो खींचें या चुनें <span className="text-red-500">*</span>
                    </label>

                    {photoDataUrl ? (
                      <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-civic-200 dark:border-civic-700 shadow-sm flex-shrink-0 bg-black">
                          <img
                            src={photoDataUrl}
                            alt="Uploaded evidence"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={18} weight="fill" />
                            <span>फोटो जुड़ गई है (Photo Ready)</span>
                          </div>
                          <p className="text-2xs text-civic-600 dark:text-civic-400 mt-1 truncate max-w-xs">
                            {photoFileName} ({photoFileSize})
                          </p>

                          {/* Location Capture Badge */}
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-semibold bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 shadow-xs text-civic-800 dark:text-civic-200">
                            <MapPin size={13} weight="fill" className="text-accent" />
                            <span>
                              {locationSource === 'image-exif'
                                ? 'फोटो के GPS से लोकेशन ली गई'
                                : 'डिवाइस GPS से लोकेशन ली गई'}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="px-3 py-1.5 text-2xs font-semibold text-civic-800 dark:text-civic-200 bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-lg hover:bg-civic-100 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Camera size={13} />
                              <span>दोबारा फोटो लें</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="px-3 py-1.5 text-2xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash size={13} />
                              <span>हटाएं</span>
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
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Live Camera Button */}
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="p-5 rounded-2xl border-2 border-dashed border-accent bg-accent/5 hover:bg-accent/10 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-xs group"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                              <Camera size={30} weight="fill" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-civic-950 dark:text-civic-50">
                                📷 कैमरा से फोटो लें
                              </p>
                              <p className="text-2xs text-civic-500 dark:text-civic-400">
                                टेक लाइव फोटो (Take Camera Photo)
                              </p>
                            </div>
                          </button>

                          {/* Gallery / File Upload Button */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-xs group ${
                              isDragOver
                                ? 'border-accent bg-accent/10'
                                : 'border-civic-300 dark:border-civic-700 bg-civic-50/60 dark:bg-civic-950/40 hover:bg-civic-100'
                            }`}
                          >
                            <div className="w-14 h-14 rounded-2xl bg-civic-200 dark:bg-civic-800 text-civic-800 dark:text-civic-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <UploadSimple size={28} weight="bold" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-civic-950 dark:text-civic-50">
                                📁 गैलरी से फोटो चुनें
                              </p>
                              <p className="text-2xs text-civic-500 dark:text-civic-400">
                                मोबाइल गैलरी या फाइल से अपलोड करें
                              </p>
                            </div>
                          </button>
                        </div>

                        {/* Quick Presets for Demo / Instant Testing */}
                        <div className="pt-1">
                          <span className="text-3xs font-semibold text-civic-400 uppercase tracking-wider block mb-1.5">
                            या टेस्ट के लिए इनमें से कोई फोटो चुनें (Demo Samples):
                          </span>
                          <div className="grid grid-cols-4 gap-2">
                            {SAMPLE_CIVIC_PHOTOS.slice(0, 4).map((sample) => (
                              <button
                                key={sample.id}
                                type="button"
                                onClick={() => handleSelectSamplePhoto(sample)}
                                className="group rounded-xl overflow-hidden border border-civic-200 dark:border-civic-800 p-1 bg-white dark:bg-civic-900 text-left hover:border-accent transition-all cursor-pointer shadow-2xs"
                              >
                                <div className="w-full h-12 rounded-lg overflow-hidden bg-civic-100 dark:bg-civic-800 mb-1">
                                  <img
                                    src={sample.url}
                                    alt={sample.label}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <span className="block text-3xs font-medium text-civic-900 dark:text-civic-100 truncate text-center">
                                  {sample.category}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {errors.photo && (
                      <p className="mt-2 text-2xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                        <WarningCircle size={14} weight="fill" />
                        {errors.photo}
                      </p>
                    )}
                  </div>

                  {/* Section 2: BIG PICTORIAL CATEGORY BUTTONS */}
                  <div>
                    <label className="block text-xs font-bold text-civic-950 dark:text-civic-50 mb-2">
                      2. समस्या किस तरह की है? (टच करें)
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
                            className={`p-3 rounded-2xl border text-left transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-accent text-white shadow-md ring-2 ring-accent scale-[1.02]'
                                : 'bg-white dark:bg-civic-900/80 border-civic-200 dark:border-civic-800 hover:border-civic-400 text-civic-900 dark:text-civic-100'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-civic-100 dark:bg-civic-800 text-accent'
                              }`}
                            >
                              <Icon size={22} weight={isSelected ? 'fill' : 'bold'} />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-civic-950 dark:text-civic-50'}`}>
                                {cat.hindiName}
                              </p>
                              <p className={`text-3xs truncate ${isSelected ? 'text-white/80' : 'text-civic-500 dark:text-civic-400'}`}>
                                {cat.name}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: AUTOMATIC LOCATION DETECTION DISPLAY */}
                  <div className="p-3.5 rounded-2xl border border-civic-200 dark:border-civic-800 bg-civic-50/80 dark:bg-civic-950/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                          <MapPin size={18} weight="fill" />
                        </div>
                        <div>
                          <span className="text-2xs font-bold text-civic-900 dark:text-civic-100 block">
                            3. आपकी लोकेशन (गांधीधाम GPS)
                          </span>
                          <p className="text-3xs text-civic-500 dark:text-civic-400">
                            {isLocating
                              ? '🔄 लोकेशन ढूंढी जा रही है...'
                              : gpsCoordinates
                              ? `✅ GPS दर्ज: ${gpsCoordinates.lat.toFixed(4)}° N, ${gpsCoordinates.lng.toFixed(4)}° E`
                              : 'गांधीधाम लोकेशन'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDetectGPS(true)}
                        disabled={isLocating}
                        className="px-2.5 py-1.5 text-3xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Crosshair size={12} className={isLocating ? 'animate-spin' : ''} />
                        <span>फिर से जांचें</span>
                      </button>
                    </div>

                    {gpsError && (
                      <p className="text-3xs text-amber-600 dark:text-amber-400">{gpsError}</p>
                    )}

                    <div className="p-2.5 rounded-xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 flex items-center justify-between">
                      <div>
                        <span className="text-3xs uppercase font-mono text-civic-400">तय किया गया वार्ड / इलाका</span>
                        <p className="text-xs font-bold text-civic-900 dark:text-civic-100">
                          {selectedLocality.label}
                        </p>
                        <span className="text-3xs font-medium text-accent">
                          {assignedWard} • {assignedDepartment}
                        </span>
                      </div>
                      <span className="text-3xs px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-semibold border border-emerald-200 dark:border-emerald-800">
                        ऑटो-डिटेक्टेड
                      </span>
                    </div>
                  </div>

                  {/* Section 4: VOICE RECORDING / बोलकर बताएं (OPTIONAL) */}
                  <div className="p-3 rounded-2xl border border-civic-200 dark:border-civic-800 bg-white dark:bg-civic-900/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleToggleVoiceRecording}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                          isRecordingVoice
                            ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300'
                            : 'bg-accent/10 text-accent hover:bg-accent/20'
                        }`}
                        title="बोलकर बताएं"
                      >
                        {isRecordingVoice ? <MicrophoneSlash size={22} weight="fill" /> : <Microphone size={22} weight="fill" />}
                      </button>
                      <div>
                        <p className="text-xs font-bold text-civic-950 dark:text-civic-50">
                          {isRecordingVoice ? '🎙️ सुन रहे हैं... बोलिए!' : '🎤 बोलकर बताएं (वैकल्पिक)'}
                        </p>
                        <p className="text-3xs text-civic-500 dark:text-civic-400">
                          {voiceNoteText ? `सुना गया: "${voiceNoteText}"` : 'यदि कुछ बोलना चाहें तो माइक दबाएं'}
                        </p>
                      </div>
                    </div>
                    {voiceNoteText && (
                      <button
                        type="button"
                        onClick={() => setVoiceNoteText('')}
                        className="text-3xs text-red-500 hover:underline cursor-pointer"
                      >
                        हटाएं
                      </button>
                    )}
                  </div>

                  {/* ONE-CLICK SUBMIT BUTTON FOR ILLITERATE / UNLETTERED USERS */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !photoDataUrl}
                      className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-accent hover:bg-accent-hover shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>शिकायत भेजी जा रही है...</span>
                        </>
                      ) : !photoDataUrl ? (
                        <>
                          <Camera size={20} weight="bold" />
                          <span>पहले ऊपर फोटो खींचें या चुनें (Add Photo)</span>
                        </>
                      ) : (
                        <>
                          <NavigationArrow size={20} weight="bold" />
                          <span>🚀 तुरंत शिकायत दर्ज करें (Submit Report Now)</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-3xs text-civic-500 dark:text-civic-400 mt-2">
                      कोई फॉर्म भरने या लिखने की ज़रूरत नहीं है। आपकी फोटो और लोकेशन सीधे म्युनिसिपल टीम को पहुंचेगी।
                    </p>
                  </div>

                </div>
              )}

              {/* ============================================================== */}
              {/* MODE 2: DETAILED FORM (4 STEPS FOR ADVANCED CITIZENS)         */}
              {/* ============================================================== */}
              {reportMode === 'detailed' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Step Progress */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
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
                              ? 'bg-emerald-500 cursor-pointer'
                              : isCurrent
                              ? 'bg-accent'
                              : 'bg-civic-200 dark:bg-civic-800'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Step 1: Problem Details */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-2">
                          Select Issue Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CATEGORY_CONFIG.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = category === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-accent/10 border-accent text-accent ring-1 ring-accent'
                                    : 'bg-white dark:bg-civic-900 border-civic-200 dark:border-civic-800'
                                }`}
                              >
                                <Icon size={18} weight={isSelected ? 'bold' : 'regular'} />
                                <span className="font-semibold text-xs mt-1">{cat.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Severity Selection */}
                      <div>
                        <label className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1.5">
                          Severity Level
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {SEVERITY_CONFIG.map((sev) => (
                            <button
                              key={sev.id}
                              type="button"
                              onClick={() => setSeverity(sev.id)}
                              className={`p-2 rounded-xl border text-left text-xs ${
                                severity === sev.id
                                  ? 'border-accent bg-accent/5 ring-1 ring-accent font-bold'
                                  : 'border-civic-200 dark:border-civic-800'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${sev.dotColor}`} />
                                <span>{sev.label}</span>
                              </div>
                              <span className="text-3xs text-civic-400 block">{sev.sla}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1">
                          Problem Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Deep pothole near Sector 4 circle"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100"
                        />
                        {errors.title && <p className="text-2xs text-red-500 mt-1">{errors.title}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1">
                          Detailed Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the issue and how it affects commuters..."
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100"
                        />
                        {errors.description && <p className="text-2xs text-red-500 mt-1">{errors.description}</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Photo Evidence */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-civic-900 dark:text-civic-100">Attach Photo</h4>
                        <span className="text-2xs text-emerald-600 font-medium">GPS Auto-captures on upload</span>
                      </div>

                      {photoDataUrl ? (
                        <div className="rounded-xl border border-civic-200 p-3 flex items-center gap-3">
                          <img src={photoDataUrl} alt="Preview" className="w-20 h-16 rounded-lg object-cover" />
                          <div className="flex-1 text-xs">
                            <p className="font-semibold">{photoFileName}</p>
                            <p className="text-3xs text-civic-500">{photoFileSize}</p>
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="text-red-500 text-2xs mt-1 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex-1 py-4 border-2 border-dashed border-accent rounded-xl text-xs font-bold text-accent flex flex-col items-center gap-1 cursor-pointer"
                          >
                            <Camera size={24} />
                            <span>Take Camera Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 py-4 border-2 border-dashed border-civic-300 rounded-xl text-xs font-bold text-civic-700 dark:text-civic-300 flex flex-col items-center gap-1 cursor-pointer"
                          >
                            <UploadSimple size={24} />
                            <span>Upload Image</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Location */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1">
                          Gandhidham Locality <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={localityValue}
                          onChange={(e) => setLocalityValue(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100"
                        >
                          {GANDHIDHAM_LOCALITIES.map((loc) => (
                            <option key={loc.value} value={loc.value}>
                              {loc.label} — {loc.ward}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-civic-950 dark:text-civic-50 mb-1">
                          Landmark
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Rotary Circle"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-civic-950 border border-civic-200 dark:border-civic-800 text-civic-900 dark:text-civic-100"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="p-4 rounded-xl bg-civic-50 dark:bg-civic-950 space-y-3 text-xs">
                      <div>
                        <p className="font-bold">{title}</p>
                        <p className="text-civic-600 mt-0.5">{description}</p>
                      </div>
                      <div className="flex items-center justify-between text-3xs text-civic-500 border-t border-civic-200 dark:border-civic-800 pt-2">
                        <span>{selectedLocality.label} ({assignedWard})</span>
                        <span className="font-mono text-emerald-600">{slaDetails.deadlineLabel}</span>
                      </div>

                      <div className="pt-2 border-t border-civic-200 dark:border-civic-800 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded text-accent"
                          />
                          <span className="text-2xs text-civic-600">File as anonymous report</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Detailed Navigation */}
                  <div className="pt-3 border-t border-civic-100 dark:border-civic-800 flex items-center justify-between">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 text-xs font-medium text-civic-700 dark:text-civic-300 hover:bg-civic-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-civic-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-accent rounded-xl cursor-pointer"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-xs font-semibold text-white bg-accent rounded-xl cursor-pointer"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
                      </button>
                    )}
                  </div>

                </div>
              )}

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
