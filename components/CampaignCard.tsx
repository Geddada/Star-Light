import React from 'react';
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';
import { PlayCircle, PauseCircle, CheckCircle, Clock, Eye, Trash2 } from 'lucide-react';

type Campaign = AdCampaign | UnskippableAdCampaign | ShortsAdCampaign;

export const StatusBadge: React.FC<{ status: Campaign['status'] }> = ({ status }) => {
  const statusMap = {
    'Active': {
      icon: PlayCircle,
      color: 'text-green-500 bg-green-500/10 border-green-500/20',
      label: 'Active'
    },
    'Paused': {
      icon: PauseCircle,
      color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      label: 'Paused'
    },
    'Ended': {
      icon: CheckCircle,
      color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
      label: 'Ended'
    },
    'In Review': {
      icon: Clock,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      label: 'In Review'
    }
  };

  const { icon: Icon, color, label } = statusMap[status] || statusMap['Ended'];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};

interface CampaignCardProps {
    campaign: Campaign;
    onDelete?: (id: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDelete }) => {
    const isSkippable = 'ctr' in campaign;
    const isUnskippableWithDuration = 'impressions' in campaign && 'duration' in campaign;
    const isShortsAd = 'impressions' in campaign && !('duration' in campaign);


    return (
        <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden transition-all hover:shadow-lg hover:border-[hsl(var(--accent-color))]/50 relative group flex flex-col">
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(campaign.id); }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                    title="Delete Ad"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <div className={`relative ${isShortsAd ? 'aspect-[9/16]' : 'aspect-video'} bg-gray-700`}>
                <img src={campaign.thumbnailUrl} alt={campaign.title} className="w-full h-full object-cover" />
                {isUnskippableWithDuration && (campaign as UnskippableAdCampaign).duration && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {(campaign as UnskippableAdCampaign).duration}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-base text-[var(--text-primary)] line-clamp-2 flex-grow">{campaign.title}</h3>
                <div className="mt-3">
                    <StatusBadge status={campaign.status} />
                </div>
                <div className={`mt-4 grid ${isSkippable ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-center border-t border-[var(--border-primary)] pt-4`}>
                    {isSkippable ? (
                        <>
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{(campaign as AdCampaign).views}</p>
                                <p className="text-xs text-[var(--text-secondary)]">Views</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{(campaign as AdCampaign).ctr}</p>
                                <p className="text-xs text-[var(--text-secondary)]">CTR</p>
                            </div>
                        </>
                    ) : (
                         <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{(campaign as UnskippableAdCampaign).impressions}</p>
                            <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Impressions</p>
                        </div>
                    )}
                     <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{campaign.spend}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Spend</p>
                    </div>
                </div>
            </div>
        </div>
    );
};