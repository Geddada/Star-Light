
import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TrendingWidget: React.FC = () => {
  const navigate = useNavigate();

  const trends = [
    { tag: 'AIRevolution', volume: '1.2M posts', isHot: true },
    { tag: 'StarlightCreators', volume: '850K posts', isHot: true },
    { tag: 'Cyberpunk2077', volume: '400K posts', isHot: false },
    { tag: 'SpaceX', volume: '230K posts', isHot: false },
    { tag: 'SustainableLiving', volume: '120K posts', isHot: false },
  ];

  return (
    <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[hsl(var(--accent-color))]" />
          Trending Now
        </h3>
      </div>
      <div className="divide-y divide-[var(--border-primary)]">
        {trends.map((item, index) => (
          <div 
            key={index}
            onClick={() => navigate(`/results?search_query=${encodeURIComponent(item.tag)}`)}
            className="p-4 hover:bg-[var(--background-tertiary)] cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-bold text-sm flex items-center gap-1 ${item.isHot ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                <Hash className="w-3 h-3 opacity-50" /> {item.tag}
              </span>
              {item.isHot && (
                <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Hot
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] group-hover:text-[hsl(var(--accent-color))] transition-colors">
              {item.volume}
            </p>
          </div>
        ))}
      </div>
      <div className="p-3 text-center">
        <button 
            onClick={() => navigate('/explore')}
            className="text-xs font-bold text-[hsl(var(--accent-color))] hover:underline"
        >
            Show more
        </button>
      </div>
    </div>
  );
};
