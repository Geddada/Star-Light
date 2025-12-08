
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Smartphone, Send, Loader2, CheckCircle2, AlertTriangle, Settings, QrCode, Copy, Check, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileDetails } from '../types';

interface SendToMobileModalProps {
  onClose: () => void;
}

export const SendToMobileModal: React.FC<SendToMobileModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'qr' | 'sms'>('qr');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [verifiedNumber, setVerifiedNumber] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
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
        // Reset status after a delay
        setStatus('idle');
      }, 3000);
    }, 1500);
  };
  
  const handleGoToSettings = () => {
      onClose();
      navigate('/settings');
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadApk = () => {
    const link = document.createElement('a');
    link.href = '/StarLight.apk';
    link.setAttribute('download', 'StarLight.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSMSContent = () => {
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
            <p className="text-[var(--text-secondary)] mt-2 mb-6">To use SMS features, please add and verify a mobile number in your account settings.</p>
            <button
                onClick={handleGoToSettings}
                className="px-6 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
                <Settings className="w-4 h-4" /> Go to Settings
            </button>
        </div>
    );
  };

  const renderQRContent = () => (
      <div className="p-6 flex flex-col items-center text-center animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-[var(--border-primary)] shadow-sm mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff`} 
                alt="Scan to open on mobile" 
                className="w-48 h-48"
              />
          </div>
          <h3 className="text-xl font-bold mb-2">Scan to open Website</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs">
              Point your camera at the QR code to open StarLight directly in your mobile browser.
          </p>
          
          <div className="w-full flex items-center gap-2 bg-[var(--background-primary)] p-2 rounded-lg border border-[var(--border-primary)]">
              <input 
                type="text" 
                readOnly 
                value={currentUrl} 
                className="bg-transparent flex-1 text-xs text-[var(--text-secondary)] outline-none px-2 truncate"
              />
              <button 
                onClick={handleCopyLink}
                className="p-2 hover:bg-[var(--background-tertiary)] rounded-md transition-colors text-[hsl(var(--accent-color))]"
                title="Copy Link"
              >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
          </div>

          <div className="flex items-center gap-4 w-full mt-6 mb-2">
            <div className="h-px bg-[var(--border-primary)] flex-1"></div>
            <span className="text-xs text-[var(--text-tertiary)] font-bold">OR</span>
            <div className="h-px bg-[var(--border-primary)] flex-1"></div>
          </div>

          <button 
            onClick={handleDownloadApk}
            className="w-full mt-4 flex items-center justify-center gap-3 py-3 bg-[hsl(var(--accent-color))]/10 hover:bg-[hsl(var(--accent-color))]/20 border border-[hsl(var(--accent-color))]/20 rounded-xl transition-all text-sm font-bold text-[hsl(var(--accent-color))]"
          >
            <Download className="w-5 h-5" />
            <span>Download Android App (APK)</span>
          </button>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Direct install file. No Play Store required.
          </p>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[hsl(var(--accent-color))]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Open on Mobile</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </header>
        
        {/* Tabs */}
        <div className="flex border-b border-[var(--border-primary)]">
            <button 
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'qr' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                <QrCode className="w-4 h-4" /> Scan QR Code
            </button>
            <button 
                onClick={() => setActiveTab('sms')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'sms' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                <Send className="w-4 h-4" /> Send via SMS
            </button>
        </div>
        
        {activeTab === 'qr' ? renderQRContent() : renderSMSContent()}

      </div>
    </div>
  );
};
