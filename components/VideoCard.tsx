import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { Edit2, Play, Star, Volume2, VolumeX, Trash2, Megaphone, Clock, Check } from 'lucide-react';
import { PREVIEW_VIDEOS } from '../constants';

interface VideoCardProps {
  video?: Video;
  isLoading?: boolean;
  onEdit?: (video: Video) => void;
  onPromote?: (video: Video) => void;
  compact?: boolean; // For lists
  onDelete?: () => void;
  deleteLabel?: string;
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isLoading, onEdit, onPromote, compact, onDelete, deleteLabel }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  
  const hoverTimeout = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video) {
        const watchLaterJson = localStorage.getItem('watch_later_videos');
        if (watchLaterJson) {
            const watchLaterVideos: Video[] = JSON.parse(watchLaterJson);
            setIsInWatchLater(watchLaterVideos.some(v => v.id === video.id));
        } else {
            setIsInWatchLater(false);
        }
    }
  }, [video]);

  useEffect(() => {
      if (video && isHovered && !compact) {
          // Deterministic selection based on ID string char code sum
          const index = video.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % PREVIEW_VIDEOS.length;
          setVideoSrc(PREVIEW_VIDEOS[index]);
          setIsPlaying(true);
      } else {
          setIsPlaying(false);
      }
  }, [isHovered, video, compact]);
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video) {
        navigate(`/edit/${video.id}`, { state: { video } });
    }
  };

  if (isLoading) {
    return (
      <div className={`flex ${compact ? 'flex-row h-24' : 'flex-col'} gap-3 animate-pulse`}>
        <div className={`${compact ? 'w-40' : 'w-full aspect-video'} bg-[var(--background-secondary)] rounded-xl`} />
        <div className="flex gap-3 flex-1">
          {!compact && <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)]" />}
          <div className="flex flex-col gap-2 flex-1 pt-1">
            <div className="h-4 bg-[var(--background-secondary)] rounded w-[85%]" />
            <div className="h-3 bg-[var(--background-secondary)] rounded w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) return null;

  const handleMouseEnter = () => {
    hoverTimeout.current = window.setTimeout(() => setIsHovered(true), 800); // Delay before playing
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  };

  const handleToggleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video) return;

    const watchLaterJson = localStorage.getItem('watch_later_videos');
    let watchLaterVideos: Video[] = watchLaterJson ? JSON.parse(watchLaterJson) : [];

    const isCurrentlyInList = watchLaterVideos.some(v => v.id === video.id);

    if (isCurrentlyInList) {
        watchLaterVideos = watchLaterVideos.filter(v => v.id !== video.id);
        setIsInWatchLater(false);
    } else {
        watchLaterVideos.unshift(video); // Add to the beginning
        setIsInWatchLater(true);
    }
    localStorage.setItem('watch_later_videos', JSON.stringify(watchLaterVideos));
  };

  return (
    <>
      <div 
        className={`group relative flex ${compact ? 'flex-row gap-4' : 'flex-col gap-3'} cursor-pointer`}
        onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail Container */}
        <div className={`relative ${compact ? 'w-44 aspect-video' : 'w-full aspect-video'} rounded-xl overflow-hidden bg-[var(--background-secondary)] shadow-md transition-all duration-500 ${!compact && 'group-hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] group-hover:ring-1 group-hover:ring-[hsl(var(--accent-color))]/50'}`}>
          
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Edit video"
                title="Edit video"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onPromote && (
              <button
                onClick={(e) => { e.stopPropagation(); onPromote(video); }}
                className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-green-500/80 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Promote video"
                title="Promote video"
              >
                <Megaphone className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
                <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80 transition-all"
                aria-label={deleteLabel || "Delete video"}
                title={deleteLabel || "Delete video"}
                >
                <Trash2 className="w-4 h-4" />
                </button>
            )}
             <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">StarLight</span>
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
          </div>
          
          {/* Watch Later Button */}
          <button
            onClick={handleToggleWatchLater}
            title={isInWatchLater ? "Added to Watch Later" : "Watch Later"}
            className="absolute top-2 left-2 z-30 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
          >
            {isInWatchLater ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </button>


          {/* Image */}
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
          />
          
          {/* Video Preview */}
          {isPlaying && (
              <video
                  ref={videoRef}
                  src={videoSrc}
                  className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
                  autoPlay
                  muted
                  loop
                  playsInline
              />
          )}
          
          {/* Duration Badge */}
          <div className={`absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 text-xs font-bold rounded text-white z-20 transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            {video.duration}
          </div>

          {/* Hover Overlay (Cinematic) */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
               {!compact && (
                 <div className="absolute bottom-0 left-0 w-full p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                           <Play className={`w-3 h-3 fill-current ${isPlaying ? 'hidden' : 'block'}`} />
                           <span>{isPlaying ? 'Previewing' : 'Click to watch'}</span>
                        </div>
                        <div className="p-1.5 rounded-full bg-[hsl(var(--accent-color))] text-white shadow-lg transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                           {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </div>
                    </div>
                 </div>
               )}
          </div>
          
          {/* Progress Bar (Simulated) */}
          {isHovered && !compact && !isPlaying && (
               <div className="absolute bottom-0 left-0 h-1 bg-red-600 z-30 animate-[width_2s_ease-out_forwards]" style={{ width: '0%' }}></div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex gap-3 items-start">
          {!compact && (
            <div className="flex-shrink-0 mt-0.5 relative">
                {video.uploaderAvatar ? (
                    <img 
                      src={video.uploaderAvatar} 
                      alt={video.uploaderName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[hsl(var(--accent-color))] transition-all" 
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm ring-2 ring-transparent group-hover:ring-[hsl(var(--accent-color))] transition-all">
                        {getInitials(video.uploaderName || 'U')}
                    </div>
                )}
            </div>
          )}
          
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className={`text-[var(--text-primary)] font-bold leading-snug group-hover:text-[hsl(var(--accent-color))] transition-colors ${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-2'}`}>
              {video.title}
            </h3>
            
            <div className="text-sm mt-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors truncate font-medium">{video.uploaderName}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors truncate">{video.communityName}</p>
            </div>
            
            <div className="text-[var(--text-tertiary)] text-xs font-medium mt-0.5">
              {video.views} • {video.uploadDate || video.uploadTime}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
