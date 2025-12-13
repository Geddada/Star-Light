import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { Play } from 'lucide-react';
import { Logo } from './Logo';

interface ShortsCardProps {
  video: Video;
}

export const ShortsCard: React.FC<ShortsCardProps> = ({ video }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="w-48 flex-shrink-0 cursor-pointer group"
      onClick={() => navigate('/shorts')}
      aria-label={`Watch short: ${video.title}`}
    >
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-[var(--background-secondary)] shadow-md">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
          <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight drop-shadow-md">{video.title}</h3>
          <p className="text-white/80 text-xs mt-1 drop-shadow-md">{video.views} • {video.uploadDate || video.uploadTime}</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
            <Play className="w-10 h-10 text-white fill-current" />
        </div>
      </div>
    </div>
  );
};