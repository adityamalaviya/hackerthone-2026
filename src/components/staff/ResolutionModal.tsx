import React, { useState } from 'react';
import { X, UploadSimple, CheckCircle, WarningCircle, Camera } from '@phosphor-icons/react';
import { IssueResolution } from '../../features/staff/types';

interface ResolutionModalProps {
  isOpen: boolean;
  issueId: string;
  staffId: string;
  onClose: () => void;
  onSubmit: (resolution: IssueResolution) => void;
}

const SAMPLE_PROOF_PHOTOS = [
  {
    label: 'Road Pothole Cold-Mix Patch Repaired',
    url: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Streetlight Luminaire & Timer Replaced',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Municipal Bin Emptied & Area Sanitized',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
  },
];

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  issueId,
  staffId,
  onClose,
  onSubmit,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Create local object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setPhotoUrl(previewUrl);
      setValidationError(null);
    }
  };

  const handleSelectSamplePhoto = (url: string, name: string) => {
    setPhotoUrl(url);
    setFileName(name);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      setValidationError('Resolution proof photo is mandatory before marking as Resolved.');
      return;
    }
    if (!notes.trim()) {
      setValidationError('Please provide resolution notes detailing the work completed.');
      return;
    }

    const resolution: IssueResolution = {
      proofPhotoUrl: photoUrl,
      notes: notes.trim(),
      resolvedAt: new Date().toISOString(),
      resolvedByStaffId: staffId,
    };

    onSubmit(resolution);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-civic-900 rounded-2xl shadow-2xl border border-civic-200 dark:border-civic-800 overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-civic-200 dark:border-civic-800 flex items-center justify-between bg-civic-50 dark:bg-civic-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Resolution Proof Verification
              </span>
            </div>
            <h3 className="text-base font-bold text-civic-900 dark:text-civic-100 mt-0.5">
              Mark Issue {issueId} as Resolved
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-civic-400 hover:text-civic-700 dark:hover:text-civic-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <WarningCircle size={16} weight="fill" className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Proof Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-civic-800 dark:text-civic-200 uppercase tracking-wider mb-2">
              Proof-of-Resolution Photo <span className="text-red-500">*</span>
            </label>

            {photoUrl ? (
              <div className="relative rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 flex flex-col items-center">
                <img
                  src={photoUrl}
                  alt="Resolution proof"
                  className="w-full h-44 object-cover rounded-lg shadow-sm"
                />
                <div className="mt-2 flex items-center justify-between w-full px-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium truncate">
                    <CheckCircle size={15} weight="fill" className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{fileName || 'Proof image attached'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('');
                      setFileName('');
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium underline ml-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-civic-300 dark:border-civic-700 rounded-xl p-6 text-center hover:border-accent transition-colors bg-civic-50/60 dark:bg-civic-800/40">
                <div className="mx-auto w-10 h-10 rounded-full bg-civic-100 dark:bg-civic-800 flex items-center justify-center text-civic-500 dark:text-civic-400 mb-2">
                  <Camera size={22} />
                </div>
                <p className="text-xs font-semibold text-civic-900 dark:text-civic-100">
                  Upload on-site rectification photo
                </p>
                <p className="text-2xs text-civic-500 dark:text-civic-400 mt-1">
                  Supports JPG, PNG from device camera or filesystem
                </p>

                <label className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-civic-900 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                  <UploadSimple size={14} weight="bold" />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Quick Sample Selector for Demo */}
            <div className="mt-3">
              <span className="text-2xs font-medium text-civic-500 dark:text-civic-400 block mb-1.5">
                Or pick mock demo proof photo:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_PROOF_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample.url, sample.label)}
                    className="text-left text-2xs p-2 bg-civic-100 hover:bg-civic-200 dark:bg-civic-800 dark:hover:bg-civic-700 rounded-lg text-civic-700 dark:text-civic-300 font-medium line-clamp-2 transition-colors cursor-pointer border border-civic-200 dark:border-civic-700"
                  >
                    📷 {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-xs font-bold text-civic-800 dark:text-civic-200 uppercase tracking-wider mb-2">
              Resolution Action Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setValidationError(null);
              }}
              placeholder="E.g., Patch filled with 200kg hot bitumen mix, compacted with 8-ton roller. Carriageway reopened to traffic."
              className="w-full text-xs text-civic-900 dark:text-civic-100 bg-white dark:bg-civic-800 border border-civic-300 dark:border-civic-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent placeholder:text-civic-400 dark:placeholder:text-civic-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-civic-200 dark:border-civic-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-civic-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!photoUrl || !notes.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={15} weight="bold" />
              <span>Confirm & Mark Resolved</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
