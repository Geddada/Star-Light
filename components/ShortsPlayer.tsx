
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { 
  Play, Volume2, VolumeX, Heart, MessageCircle, Share2, 
  Music
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShareModal } from './ShareModal';
import { PREVIEW_VIDEOS } from '../constants';
import { Logo } from './Logo';

interface ShortsPlayerProps {
  video: Video;
  isActive: boolean;
}

export const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ video, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Default unmuted for better UX if possible, but browsers block auto-audio
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Controls visibility state
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Deterministic video source
  const videoSrc = PREVIEW_VIDEOS[video.id.charCodeAt(video.id.length - 1) % PREVIEW_VIDEOS.length];

  const startHideTimer = () => {
      if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = window.setTimeout(() => {
          setShowControls(false);
      }, 3000);
  };

  const handleInteraction = () => {
      setShowControls(true);
      if (isPlaying) {
          startHideTimer();
      } else {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      }
  };

  useEffect(() => {
    if (isActive) {
        setShowControls(true);
        // Attempt to play
        const playPromise = videoRef.current?.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                    startHideTimer();
                })
                .catch(() => {
                    setIsPlaying(false);
                    // Often fails due to browser autoplay policies if not muted
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        setIsMuted(true);
                        videoRef.current.play().then(() => {
                            setIsPlaying(true);
                            startHideTimer();
                        }).catch(e => console.error("Auto-play failed", e));
                    }
                });
        }
    } else {
        videoRef.current?.pause();
        setIsPlaying(false);
        if (videoRef.current) videoRef.current.currentTime = 0;
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setShowControls(true);
    }
    
    return () => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setShowControls(true);
        startHideTimer();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInteraction();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleInteraction();
      if (!currentUser) {
          navigate('/signup');
          return;
      }
      setIsLiked(!isLiked);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleMetadataLoaded = () => {
    if (videoRef.current) {
        setDuration(videoRef.current.duration);
    }
  };

  const showOverlay = currentTime < 5 || (duration > 0 && duration - currentTime <= 5);

  return (
    <div className="relative w-full h-full bg-black flex justify-center items-center select-none">
        {showShareModal && <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} videoId={video.id} videoTitle={video.title} />}
        
        {/* Video Container - Full width/height */}
        <div className="relative w-full h-full" onClick={togglePlay}>
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleMetadataLoaded}
            />
            
            {/* Branding Overlays */}
            <div className={`absolute top-4 left-4 z-20 transition-opacity duration-500 pointer-events-none ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                    <Logo className="w-5 h-5 text-white drop-shadow-md" />
                    <span className="text-white font-bold text-sm tracking-tight drop-shadow-md shadow-black font-sans">StarLight</span>
                </div>
            </div>

            {video.communityName && (
                <div className={`absolute top-4 right-4 z-20 transition-opacity duration-500 pointer-events-none ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
                     <span className="text-white text-sm font-bold tracking-tight drop-shadow-md bg-black/40 px-2.5 py-1 rounded-sm backdrop-blur-md border border-white/10 font-sans">
                        {video.communityName}
                     </span>
                </div>
            )}
            
            {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none">
                    <Play className="w-8 h-8 sm:w-20 sm:h-20 text-white opacity-80 fill-white drop-shadow-lg" />
                </div>
            )}

            {/* Top Overlay Controls - Transparent buttons */}
            <div className={`absolute top-14 right-2 sm:right-6 z-30 hidden sm:flex flex-col gap-4 sm:gap-6 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                <button onClick={toggleMute} className="p-1 sm:p-2.5 bg-transparent rounded-full text-white hover:bg-black/10 transition-colors drop-shadow-lg">
                    {isMuted ? <VolumeX className="w-3 h-3 sm:w-8 sm:h-8 drop-shadow-md" /> : <Volume2 className="w-3 h-3 sm:w-8 sm:h-8 drop-shadow-md" />}
                </button>
            </div>

            {/* Right Side Action Buttons - Auto-hide on mobile when playing */}
            <div className={`absolute bottom-16 sm:bottom-28 right-1 sm:right-4 z-30 flex flex-col items-center gap-1.5 sm:gap-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 sm:opacity-100 pointer-events-none sm:pointer-events-auto'}`}>
                <button onClick={handleLike} className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                    <div className="p-1 sm:p-3 bg-transparent rounded-full transition-all group-active:scale-90 duration-200">
                        <Heart className={`w-3.5 h-3.5 sm:w-9 sm:h-9 drop-shadow-xl ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-[7px] sm:text-xs font-bold drop-shadow-xl">{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); handleInteraction(); navigate(`/watch/${video.id}`) }} className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                    <div className="p-1 sm:p-3 bg-transparent rounded-full transition-all group-active:scale-90 duration-200">
                        <MessageCircle className="w-3.5 h-3.5 sm:w-9 sm:h-9 text-white drop-shadow-xl" />
                    </div>
                    <span className="text-white text-[7px] sm:text-xs font-bold drop-shadow-xl">Comment</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); handleInteraction(); setShowShareModal(true); }} className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                    <div className="p-1 sm:p-3 bg-transparent rounded-full transition-all group-active:scale-90 duration-200">
                        <Share2 className="w-3.5 h-3.5 sm:w-9 sm:h-9 text-white drop-shadow-xl" />
                    </div>
                    <span className="text-white text-[7px] sm:text-xs font-bold drop-shadow-xl">Share</span>
                </button>
            </div>

            {/* Bottom Info Overlay */}
            <div className={`absolute bottom-0 left-0 w-full p-3 pb-12 sm:p-6 sm:pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-4 pointer-events-auto w-[85%]">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
                        <img src={video.communityAvatar || video.uploaderAvatar} alt={video.uploaderName} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-white/50" />
                        <span className="text-white font-bold text-xs sm:text-base drop-shadow-md hover:underline truncate">@{video.uploaderName?.replace(/\s/g, '')}</span>
                    </div>
                    <button className="bg-white text-black px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-bold hover:bg-gray-200 transition-colors pointer-events-auto">
                        Subscribe
                    </button>
                </div>
                <div className="pointer-events-auto w-[85%]">
                    <p className="text-white text-[10px] sm:text-sm line-clamp-2 drop-shadow-md mb-2 sm:mb-3 font-medium">{video.description} <span className="font-bold text-white/80">#shorts #starlight</span></p>
                    <div className="flex items-center gap-2 text-white/90 text-[9px] sm:text-xs font-bold">
                        <div className="flex items-end gap-0.5 h-3 mb-0.5">
                             {[...Array(4)].map((_, i) => (
                                 <div 
                                    key={i} 
                                    className="w-0.5 bg-white rounded-full animate-bounce" 
                                    style={{ 
                                        height: isPlaying ? '100%' : '20%', 
                                        animationDuration: `${0.5 + i * 0.1}s`,
                                        animationPlayState: isPlaying ? 'running' : 'paused'
                                    }}
                                 ></div>
                             ))}
                        </div>
                        <Music className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="animate-pulse">Original Sound - {video.uploaderName}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
