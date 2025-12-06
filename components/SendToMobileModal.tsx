import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Smartphone, Send, Loader2, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileDetails } from '../types';

interface SendToMobileModalProps {
  onClose: () => void;
}

export const SendToMobileModal: React.FC<SendToMobileModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [verifiedNumber, setVerifiedNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setVerifiedNumber(null); // Reset on open
    if (currentUser?.email) {
      const allProfileDetailsJSON = localStorage.getItem('starlight_profile_details');
      if (allProfileDetailsJSON) {
        const allDetails = JSON.parse(allProfileDetailsJSON);
        const userDetails: ProfileDetails = allDetails[currentUser.email];
        
        if (userDetails && userDetails.isMobileVerified && userDetails.mobileNumber) {
          setVerifiedNumber(userDetails.mobileNumber);
        }
      }
    }
    setIsLoading(false);
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedNumber) {
      setStatus('error');
      return;
    }
    
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setTimeout(() => {
        onClose();
        // Reset status for next open
        setTimeout(() => setStatus('idle'), 500);
      }, 2500);
    }, 1500);
  };
  
  const handleGoToSettings = () => {
      onClose();
      navigate('/settings');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-48">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-color))] animate-spin mb-4"/>
          <p className="text-lg font-semibold text-[var(--text-secondary)]">Checking for verified number...</p>
        </div>
      );
    }

    if (status === 'sent') {
      return (
        <div className="p-8 text-center animate-in fade-in">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold">Link Sent!</h3>
          <p className="text-[var(--text-secondary)] mt-2">A magic link to open Starlight has been sent to <br/><strong>{verifiedNumber}</strong>.</p>
        </div>
      );
    }
    
    if (verifiedNumber) {
      return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">A link to open Starlight will be sent via SMS to your verified mobile number.</p>
              
              <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--text-secondary)]">Verified Number</label>
                  <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      <input
                          type="tel"
                          value={verifiedNumber}
                          disabled
                          className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] cursor-not-allowed"
                      />
                  </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--background-primary)] border-t border-[var(--border-primary)] flex justify-end">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="px-6 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Link
                  </>
                )}
              </button>
            </div>
          </form>
      );
    }

    // No verified number found
    return (
        <div className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">No Verified Number</h3>
            <p className="text-[var(--text-secondary)] mt-2">To use this feature, please add and verify a mobile number in your account settings.</p>
            <button
                onClick={handleGoToSettings}
                className="mt-6 px-6 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-colors flex items-center justify-center gap-2"
            >
                <Settings className="w-4 h-4" /> Go to Settings
            </button>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[hsl(var(--accent-color))]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Send to Mobile</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </header>
        
        {renderContent()}

      </div>
    </div>
  );
};
