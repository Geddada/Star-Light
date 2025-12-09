
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Megaphone, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const announcement = "Welcome to 'Star Light' News, an AI Revolution in Digital Social Media, Create, Watch and Discover Everywhere, offering fast monetization to creators.";

  useEffect(() => {
    // Check session storage first to avoid re-showing a dismissed bar
    const isDismissed = sessionStorage.getItem('starlight_announcement_dismissed');
    if (isDismissed) {
      return;
    }

    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Persist dismissal for the current session
    sessionStorage.setItem('starlight_announcement_dismissed', 'true');
  };

  if (!isVisible || !isHomePage) {
    return null;
  }

  return (
    <div 
      className="relative z-40 bg-[hsl(var(--accent-color))] border-b border-black/20 shadow-md h-14 hidden md:flex items-center overflow-hidden group select-none"
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="absolute left-0 z-20 h-full flex items-center pl-6 pr-6 bg-gradient-to-r from-[hsl(var(--accent-color))] via-[hsl(var(--accent-color))] to-transparent">
        <Megaphone className="w-6 h-6 text-white animate-pulse" />
      </div>

      {/* Scrolling Area */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
         <div className="flex whitespace-nowrap animate-marquee will-change-transform">
            {/* Repeating the text enough times to ensure seamless scrolling on large screens */}
            {[...Array(20)].map((_, i) => (
               <div key={i} className="flex items-center mx-32">
                  <span className="text-white font-sans font-extrabold tracking-tight text-xl drop-shadow-md">
                    {announcement}
                  </span>
                  <span className="ml-32 text-white font-bold text-2xl">•</span>
               </div>
            ))}
         </div>
      </div>

      {/* Dismiss Button */}
      <div className="absolute right-0 z-20 h-full flex items-center pr-6 pl-6 bg-gradient-to-l from-[hsl(var(--accent-color))] via-[hsl(var(--accent-color))] to-transparent">
        <button 
          onClick={handleDismiss} 
          className="p-2 transition-colors rounded-full hover:bg-white/20 text-white"
          aria-label="Dismiss announcement"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 1600s linear infinite;
            width: max-content;
        }
        /* Animation now runs continuously without pausing on hover */
      `}</style>
    </div>
  );
};
