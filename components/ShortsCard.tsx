import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { Play } from 'lucide-react';

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
        <div className="absolute top-3 right-3 z-10 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-red-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
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