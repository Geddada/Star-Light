
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { Edit2, Play, Star, Volume2, VolumeX, Trash2, Megaphone, Clock, Check, Sparkles, Loader2, Copy } from 'lucide-react';
import { PREVIEW_VIDEOS } from '../constants';
import { generateTitleVariations } from '../services/gemini';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useAutoplay } from '../contexts/AutoplayContext'; // Import useAutoplay

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
  
  // AI Title State
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [aiTitles, setAiTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  
  const hoverTimeout = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleDropdownRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useAuth(); // Get current user
  const { autoplayEnabled } = useAutoplay(); // Get autoplay setting

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
      if (video && isHovered && !compact && autoplayEnabled) {
          // Deterministic selection based on ID string char code sum
          const index = video.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % PREVIEW_VIDEOS.length;
          setVideoSrc(PREVIEW_VIDEOS[index]);
          setIsPlaying(true);
      } else {
          setIsPlaying(false);
      }
  }, [isHovered, video, compact, autoplayEnabled]);
  
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target as Node)) {
              setShowTitleDropdown(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video) {
        navigate(`/edit/${video.id}`, { state: { video } });
    }
  };

  const handleAiClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!video) return;
      
      setShowTitleDropdown(prev => !prev);
      
      if (aiTitles.length === 0 && !isGeneratingTitles) {
          setIsGeneratingTitles(true);
          const variations = await generateTitleVariations(video.title);
          setAiTitles(variations);
          setIsGeneratingTitles(false);
      }
  };

  const handleCopyTitle = (e: React.MouseEvent, title: string, index: number) => {
      e.stopPropagation();
      navigator.clipboard.writeText(title);
      setCopiedTitleIndex(index);
      setTimeout(() => setCopiedTitleIndex(2000), 2000); // 2 seconds
  };
  
  const handleChannelClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (video?.uploaderName) {
          navigate(`/channel/${encodeURIComponent(video.uploaderName)}`);
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
    // Only play preview on non-touch devices or if logic allows
    if (window.matchMedia('(hover: hover)').matches) {
        hoverTimeout.current = window.setTimeout(() => setIsHovered(true), 800);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  };

  const handleToggleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video) return;
    if (!currentUser) {
        navigate('/signup');
        return;
    }

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
        className={`group relative flex ${compact ? 'flex-row gap-3 sm:gap-4' : 'flex-col gap-3'} cursor-pointer`}
        onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail Container */}
        <div className={`relative flex-shrink-0 ${compact ? 'w-36 sm:w-44 aspect-video' : 'w-full aspect-video'} rounded-xl overflow-hidden bg-[var(--background-secondary)] shadow-md transition-all duration-500 ${!compact && 'group-hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] group-hover:ring-1 group-hover:ring-[hsl(var(--accent-color))]/50'}`}>
          
          {/* Overlay Buttons - Desktop: Absolute Top Right | Mobile: Hidden here, shown below */}
          <div className="absolute top-2 right-2 z-30 hidden sm:flex items-center gap-1 sm:gap-2">
            {!compact && currentUser && (
                <div className="relative">
                    <button
                        onClick={handleAiClick}
                        className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-full text-purple-400 hover:bg-purple-900/50 hover:text-purple-300 transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
                        aria-label="Generate AI Titles"
                        title="Generate AI Title Ideas"
                    >
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {showTitleDropdown && (
                        <div ref={titleDropdownRef} className="absolute top-10 right-0 w-64 bg-[var(--background-secondary)]/95 backdrop-blur-md border border-[var(--border-primary)] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 cursor-default" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                                <Sparkles className="w-3 h-3"/> AI Title Ideas
                            </div>
                            {isGeneratingTitles ? (
                                <div className="flex flex-col items-center justify-center py-4 text-[var(--text-secondary)]">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500"/>
                                    <span className="text-xs">Generating...</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {aiTitles.length > 0 ? aiTitles.map((title, idx) => (
                                        <div key={idx} className="group/item relative p-2 rounded-lg bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border border-transparent hover:border-purple-500/30 transition-all">
                                            <p className="text-xs text-[var(--text-primary)] pr-6 leading-snug">{title}</p>
                                            <button 
                                                onClick={(e) => handleCopyTitle(e, title, idx)}
                                                className="absolute top-2 right-2 text-[var(--text-tertiary)] hover:text-purple-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                title="Copy"
                                            >
                                                {copiedTitleIndex === idx ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-[var(--text-secondary)] text-center py-2">Click to generate ideas.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {onEdit && (
              <button
                onClick={handleEditClick}
                className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Edit video"
                title="Edit video"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onPromote && (
              <button
                onClick={(e) => { e.stopPropagation(); onPromote(video); }}
                className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-green-500/80 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Promote video"
                title="Promote video"
              >
                <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onDelete && (
                <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 sm:p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80 transition-all"
                aria-label={deleteLabel || "Delete video"}
                title={deleteLabel || "Delete video"}
                >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            )}
          </div>
          
          {/* Watch Later Button */}
          {!compact && (
              <button
                onClick={handleToggleWatchLater}
                title={isInWatchLater ? "Added to Watch Later" : "Watch Later"}
                className="absolute top-2 left-2 z-30 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
              >
                {isInWatchLater ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </button>
          )}


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
          
          {/* Duration Badge - Highlighted Blue */}
          <div className={`absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-blue-600/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded text-white z-20 transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            {video.duration}
          </div>

          {/* Hover Overlay (Cinematic) */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
               {!compact && (
                 <div className="absolute bottom-0 left-0 w-full p-3 hidden sm:block">
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
        <div className="flex flex-col flex-1 min-w-0 gap-1">
          {/* Mobile Only: Action Buttons Row */}
          {(onEdit || onPromote || onDelete || (!compact && currentUser)) && (
            <div className="flex sm:hidden items-center justify-between gap-3 pb-1 -mt-1">
                <div className="flex items-center gap-3">
                    {onEdit && (
                        <button onClick={handleEditClick} className="p-2 bg-[var(--background-tertiary)] rounded-full text-[var(--text-secondary)] border border-[var(--border-primary)]" aria-label="Edit">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {onPromote && (
                        <button onClick={(e) => { e.stopPropagation(); onPromote(video); }} className="p-2 bg-[var(--background-tertiary)] rounded-full text-[var(--text-secondary)] hover:text-green-500 border border-[var(--border-primary)]" aria-label="Promote">
                            <Megaphone className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-[var(--background-tertiary)] rounded-full text-[var(--text-secondary)] hover:text-red-500 border border-[var(--border-primary)]" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {!compact && currentUser && (
                    <button onClick={handleToggleWatchLater} className={`p-2 bg-[var(--background-tertiary)] rounded-full border border-[var(--border-primary)] transition-colors ${isInWatchLater ? 'text-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)]'}`}>
                       {isInWatchLater ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>
                )}
            </div>
          )}

          <div className="flex gap-3 items-start min-w-0">
            {!compact && (
                <div className="flex-shrink-0 mt-0.5 relative hidden sm:block" onClick={handleChannelClick}>
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
                <h3 className={`text-[var(--text-primary)] font-bold leading-snug group-hover:text-[hsl(var(--accent-color))] transition-colors ${compact ? 'text-sm line-clamp-2' : 'text-sm sm:text-base line-clamp-2'}`}>
                {video.title}
                </h3>
                
                <div className="text-sm mt-1">
                <div className="flex items-center gap-1.5 truncate" onClick={handleChannelClick}>
                    <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors truncate font-medium text-xs sm:text-sm">{video.uploaderName}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                </div>
                {!compact && <p className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors truncate">{video.communityName}</p>}
                </div>
                
                <div className="text-[var(--text-tertiary)] text-xs font-medium mt-0.5">
                {video.views} • {video.uploadDate || video.uploadTime}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};