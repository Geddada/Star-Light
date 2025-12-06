import React, { useState } from 'react';
import { X, Flag, Send, CheckCircle2 } from 'lucide-react';
import { Video, Report } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
}

const REPORT_REASONS = [
  "Sexual content",
  "Violent or repulsive content",
  "Hateful or abusive content",
  "Harassment or bullying",
  "Harmful or dangerous acts",
  "Misinformation",
  "Child abuse",
  "Promotes terrorism",
  "Spam or misleading",
  "Infringes my rights",
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, video }) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [step, setStep] = useState<'selecting' | 'submitted'>('selecting');
  const { currentUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      alert("Please select a reason for reporting.");
      return;
    }
    // Simulate submission
    setStep('submitted');

    // For this demo, we save it to localStorage.
    const newReport: Report = {
        id: `report-${Date.now()}`,
        video: video,
        reason: selectedReason,
        reportDate: new Date().toISOString(),
        reporterEmail: currentUser?.email || 'anonymous',
        status: 'In Review',
    };

    const reportsJson = localStorage.getItem('starlight_reports');
    const reports: Report[] = reportsJson ? JSON.parse(reportsJson) : [];
    reports.unshift(newReport); // Add to the top
    localStorage.setItem('starlight_reports', JSON.stringify(reports));

    console.log(`Reporting video "${video.title}" for: ${selectedReason}`);
  };

  const handleClose = () => {
    onClose();
    // Reset state for next time modal is opened
    setTimeout(() => {
        setStep('selecting');
        setSelectedReason(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Flag className="w-5 h-5" /> Report Video
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
             <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
        
        {step === 'selecting' ? (
          <form onSubmit={handleSubmit}>
            <div className="p-6">
                <p className="text-sm text-[var(--text-secondary)] mb-4">What is the issue with this video? Your report is anonymous to other users.</p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {REPORT_REASONS.map((reason) => (
                        <label key={reason} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedReason === reason ? 'border-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/10' : 'border-transparent bg-[var(--background-primary)] hover:border-[var(--border-primary)]'}`}>
                            <input
                                type="radio"
                                name="report-reason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={() => setSelectedReason(reason)}
                                className="w-4 h-4 text-[hsl(var(--accent-color))] bg-gray-100 border-gray-300 focus:ring-[hsl(var(--accent-color))]"
                            />
                            <span className="font-medium text-sm text-[var(--text-primary)]">{reason}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-[var(--background-primary)] border-t border-[var(--border-primary)] flex justify-end">
                <button 
                    type="submit"
                    disabled={!selectedReason}
                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" /> Submit Report
                </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Report Submitted</h3>
            <p className="text-[var(--text-secondary)] mt-2">Thank you for your feedback. Our team will review the video for violations of our community guidelines.</p>
            <button
                onClick={handleClose}
                className="mt-6 px-6 py-2.5 bg-[var(--background-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--background-tertiary)] font-semibold text-sm transition-colors"
            >
                Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
