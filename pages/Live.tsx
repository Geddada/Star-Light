
import React, { useState, useEffect } from 'react';
import { Radio, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAdForSlot } from '../services/gemini';
import { SidebarAd } from '../components/SidebarAd';
// FIX: Added ShortsAdCampaign to the import list to resolve type errors.
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';
import { Logo } from '../components/Logo';


export const Live: React.FC = () => {
  const { currentUser } = useAuth();
  // FIX: Updated ad state type to include ShortsAdCampaign.
  const [sidebarAd, setSidebarAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);
  const [viewers, setViewers] = useState(1240);

  useEffect(() => {
      const loadAd = async () => {
          const ad = await getAdForSlot('LIVE_PAGE_SIDEBAR');
          setSidebarAd(ad);
      };
      loadAd();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        // Random fluctuation between -15 and +25
        const change = Math.floor(Math.random() * 41) - 15;
        setViewers(prev => Math.max(0, prev + change));
    }, 2000);
    return () => clearInterval(interval);
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
        
        <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center text-white/50 border border-[var(--border-primary)] shadow-2xl shadow-red-500/10 overflow-hidden group">
          {/* Simulated Video Content Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/livestream/1280/720')] bg-cover opacity-20 mix-blend-overlay"></div>
          
          <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Radio className="w-10 h-10 text-red-500" />
              </div>
              <p className="font-bold text-xl text-white">Live Stream in Progress</p>
              <p className="text-sm text-gray-400 mt-2">Exclusive content for premium members</p>
          </div>

          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-md uppercase tracking-wider flex items-center gap-2 z-20 shadow-lg animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              LIVE
          </div>
          <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 text-sm font-bold rounded-md uppercase tracking-wider z-20 shadow-lg">Premium</div>
          
          {/* Logo Top Left */}
          <div className="absolute top-4 left-24 z-20 flex items-center gap-2 pointer-events-none opacity-80">
             <Logo className="w-6 h-6 text-white drop-shadow-lg" />
             <span className="font-bold text-white text-lg tracking-tighter drop-shadow-lg hidden sm:inline">StarLight</span>
          </div>
          
          {/* Viewer Count Badge */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 z-20 border border-white/10 shadow-lg">
              <Users className="w-4 h-4 text-red-400" />
              <span className="font-mono font-bold tabular-nums text-lg">{viewers.toLocaleString()}</span>
              <span className="text-sm text-gray-300 font-medium">watching now</span>
          </div>
        </div>

        <div className="mt-6 bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
                <h2 className="text-2xl font-bold">{currentUser?.name}'s Premium Live Stream</h2>
                <p className="text-[var(--text-secondary)] mt-2">This is an exclusive live stream for our premium members. Thank you for your support!</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">
                    High Bitrate
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                    4K Ultra HD
                </span>
            </div>
          </div>
        </div>
      </div>
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Sponsored</h2>
            <SidebarAd ad={sidebarAd} />
          </div>
          
          {/* Live Chat Simulation */}
          <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] h-[450px] flex flex-col">
              <div className="p-3 border-b border-[var(--border-primary)] font-bold text-sm flex justify-between items-center">
                  <span>Top Chat</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-3 text-sm text-[var(--text-secondary)] flex flex-col-reverse">
                  <div className="flex gap-2 animate-in slide-in-from-left-2 fade-in duration-300"><span className="font-bold text-[var(--text-primary)]">Alex:</span> <span className="text-[var(--text-primary)]">Amazing quality! 🔥</span></div>
                  <div className="flex gap-2 animate-in slide-in-from-left-2 fade-in duration-300 delay-100"><span className="font-bold text-[var(--text-primary)]">Sarah:</span> Can't wait for the reveal.</div>
                  <div className="flex gap-2 animate-in slide-in-from-left-2 fade-in duration-300 delay-200"><span className="font-bold text-[var(--text-primary)]">TechFan99:</span> Is this real time?</div>
                  <div className="flex gap-2 animate-in slide-in-from-left-2 fade-in duration-300 delay-300"><span className="font-bold text-[var(--text-primary)]">GamingPro:</span> Let's goooo!</div>
                  <div className="flex gap-2"><span className="font-bold text-[hsl(var(--accent-color))]">Mod:</span> Welcome everyone! Please be respectful in chat.</div>
              </div>
              <div className="p-3 border-t border-[var(--border-primary)] bg-[var(--background-primary)] rounded-b-xl">
                  <div className="bg-[var(--background-secondary)] h-9 rounded-full border border-[var(--border-primary)] px-4 flex items-center text-sm text-[var(--text-tertiary)] cursor-text hover:border-[hsl(var(--accent-color))] transition-colors">
                      Say something...
                  </div>
              </div>
          </div>
      </aside>
    </div>
  );
};
