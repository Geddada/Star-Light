
import React from 'react';
// FIX: Added ShortsAdCampaign to the import list to resolve type errors.
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';

// FIX: Updated the 'ad' prop type to include ShortsAdCampaign.
export const SidebarAd: React.FC<{ ad: AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null }> = ({ ad }) => {
  if (!ad) {
    return (
      <div className="w-full aspect-video rounded-lg border border-dashed border-[var(--border-primary)] bg-[var(--background-secondary)] flex items-center justify-center">
        <p className="text-sm text-[var(--text-secondary)]">Ad Space</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--background-secondary)] overflow-hidden group cursor-pointer">
      <div className="relative aspect-video">
        <img src={ad.thumbnailUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute top-1 left-1 bg-black/60 text-white px-2 py-0.5 text-xs font-bold rounded">AD</div>
      </div>
      <div className="p-3">
        <p className="font-bold text-sm line-clamp-1">{ad.title}</p>
        <p className="text-xs text-[var(--text-secondary)]">Sponsored</p>
      </div>
    </div>
  );
};
