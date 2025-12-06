
import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAdForSlot } from '../services/gemini';
import { SidebarAd } from '../components/SidebarAd';
// FIX: Added ShortsAdCampaign to the import list to resolve type errors.
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';


export const Live: React.FC = () => {
  const { currentUser } = useAuth();
  // FIX: Updated ad state type to include ShortsAdCampaign.
  const [sidebarAd, setSidebarAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);

  useEffect(() => {
      const loadAd = async () => {
          const ad = await getAdForSlot('LIVE_PAGE_SIDEBAR');
          setSidebarAd(ad);
      };
      loadAd();
  }, []);
  
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex items-center justify-center">
            <Radio className="w-8 h-8 text-red-500" />
            <div className="absolute w-8 h-8 bg-red-500 rounded-full animate-ping opacity-75 -z-10"></div>
          </div>
          <h1 className="text-3xl font-bold">Live Now</h1>
        </div>
        
        <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center text-white/50 border border-[var(--border-primary)] shadow-2xl shadow-red-500/10">
          <div className="text-center">
              <Radio className="w-16 h-16 mb-4" />
              <p className="font-semibold">Live Stream Offline</p>
              <p className="text-sm">Stay tuned for the next premium-exclusive live event!</p>
          </div>
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-md uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              LIVE
          </div>
          <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 text-sm font-bold rounded-md uppercase tracking-wider">Premium</div>
        </div>

        <div className="mt-6 bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
          <h2 className="text-2xl font-bold">{currentUser?.name}'s Premium Live Stream</h2>
          <p className="text-[var(--text-secondary)] mt-2">This is an exclusive live stream for our premium members. Thank you for your support!</p>
        </div>
      </div>
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Sponsored</h2>
          <SidebarAd ad={sidebarAd} />
      </aside>
    </div>
  );
};
