import React from 'react';
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';
import { Megaphone } from 'lucide-react';
import { Logo } from './Logo';

interface InFeedAdCardProps {
  campaign: AdCampaign | UnskippableAdCampaign | ShortsAdCampaign;
}

export const InFeedAdCard: React.FC<InFeedAdCardProps> = ({ campaign }) => {
  const isSkippable = 'ctr' in campaign;

  return (
    <a 
        href="#"
        onClick={(e) => e.preventDefault()}
        className="group relative flex flex-col gap-3 cursor-pointer border-2 border-amber-500/40 p-2 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--background-secondary)] shadow-md">
        <img 
          src={campaign.thumbnailUrl} 
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-amber-400 text-black px-2 py-0.5 text-xs font-bold rounded">
          Ad
        </div>
        <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-sm backdrop-blur-sm border border-white/10">
                <Logo className="w-5 h-5 text-white drop-shadow-md" />
                <span className="font-bold text-white text-sm tracking-tighter drop-shadow-md hidden sm:block">StarLight</span>
            </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
            </div>
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-[var(--text-primary)] font-bold leading-snug group-hover:text-[hsl(var(--accent-color))] transition-colors text-base line-clamp-2">
            {campaign.title}
          </h3>
          
          <div className="text-[var(--text-tertiary)] text-xs font-medium mt-1">
            Sponsored • Learn More
          </div>
        </div>
      </div>
    </a>
  );
};