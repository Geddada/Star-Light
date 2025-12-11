
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem('starlight_cookie_consent');
    if (!consent) {
      // Show after a short delay to not block initial view immediately
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('starlight_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('starlight_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-[var(--background-secondary)]/95 backdrop-blur-md border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 max-w-3xl w-full flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-10 duration-500">
        <div className="p-3 bg-[hsl(var(--accent-color))]/10 rounded-full flex-shrink-0 hidden sm:flex">
            <Cookie className="w-8 h-8 text-[hsl(var(--accent-color))]" />
        </div>
        <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Cookie className="w-5 h-5 text-[hsl(var(--accent-color))] sm:hidden" />
                <h3 className="font-bold text-lg text-[var(--text-primary)]">We value your privacy</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                We use cookies to enhance your browsing experience, personalize content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                <button onClick={() => navigate('/privacy')} className="text-[hsl(var(--accent-color))] hover:underline ml-1 font-medium focus:outline-none">Read our Privacy Policy</button>.
            </p>
        </div>
        <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
            <button 
                onClick={handleDecline}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-semibold text-sm border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
            >
                Decline
            </button>
            <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-semibold text-sm bg-[hsl(var(--accent-color))] text-white hover:brightness-90 transition-colors shadow-md"
            >
                Accept All
            </button>
        </div>
      </div>
    </div>
  );
};
