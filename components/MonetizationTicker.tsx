import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

export const MonetizationTicker: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    navigate('/monetization');
  };

  const announcement = "Fast-track your earnings! Starlight's monetization tools help you grow faster. Upgrade to Premium today! 💰";

  return (
    <div 
      className="relative z-40 bg-amber-400 dark:bg-amber-500 border-b border-black/20 shadow-md h-8 flex items-center overflow-hidden group select-none cursor-pointer"
      role="alert"
      aria-live="polite"
      onClick={handleCTAClick}
    >
      <div className="absolute left-0 z-20 h-full flex items-center pl-4 pr-4 bg-gradient-to-r from-amber-400 dark:from-amber-500 via-amber-400 dark:via-amber-500 to-transparent">
        <DollarSign className="w-4 h-4 text-black" />
      </div>

      <div className="flex-1 overflow-hidden relative h-full flex items-center">
         <div className="flex whitespace-nowrap animate-marquee will-change-transform">
            {[...Array(20)].map((_, i) => (
               <div key={i} className="flex items-center mx-6">
                  <span className="text-black font-sans font-bold tracking-tight text-sm drop-shadow-sm">
                    {announcement}
                  </span>
                  <span className="ml-6 text-black font-bold text-lg">•</span>
               </div>
            ))}
         </div>
      </div>

      <div className="absolute right-0 z-20 h-full flex items-center pr-4 pl-4 bg-gradient-to-l from-amber-400 dark:from-amber-500 via-amber-400 dark:via-amber-500 to-transparent">
        <span className="text-black font-bold text-xs uppercase hover:underline">Learn More</span>
      </div>

      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 80s linear infinite;
        }
      `}</style>
    </div>
  );
};
