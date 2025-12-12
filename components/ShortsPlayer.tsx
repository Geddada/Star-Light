
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { 
  Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, 
  MoreVertical, UserPlus, Music, PictureInPicture, PlaySquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShareModal } from './ShareModal';
import { PREVIEW_VIDEOS } from '../constants';

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Deterministic video source
  const videoSrc = PREVIEW_VIDEOS[video.id.charCodeAt(video.id.length - 1) % PREVIEW_VIDEOS.length];

  useEffect(() => {
    if (isActive) {
        // Attempt to play
        const playPromise = videoRef.current?.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch(() => {
                    setIsPlaying(false);
                    // Often fails due to browser autoplay policies if not muted
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        setIsMuted(true);
                        videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Auto-play failed", e));
                    }
                });
        }
    } else {
        videoRef.current?.pause();
        setIsPlaying(false);
        if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePiP = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
      } else if (videoRef.current) {
          await videoRef.current.requestPictureInPicture();
      }
  };

  const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentUser) {
          navigate('/signup');
          return;
      }
      setIsLiked(!isLiked);
  };

  return (
    <div className="relative w-full h-full bg-black flex justify-center items-center select-none">
        {showShareModal && <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} videoUrl={window.location.href} videoTitle={video.title} />}
        
        {/* Video Container - Full width/height */}
        <div className="relative w-full h-full" onClick={togglePlay}>
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
            />
            
            {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none">
                    <Play className="w-20 h-20 text-white opacity-80 fill-white drop-shadow-lg" />
                </div>
            )}

            {/* Top Overlay Controls - Transparent buttons */}
            <div className={`absolute top-14 right-4 sm:right-6 z-30 flex flex-col gap-4 sm:gap-6 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                <button onClick={toggleMute} className="p-1.5 sm:p-2.5 bg-transparent rounded-full text-white hover:bg-black/10 transition-colors drop-shadow-lg">
                    {isMuted ? <VolumeX className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-md" /> : <Volume2 className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-md" />}
                </button>
                <button onClick={togglePiP} className="p-1.5 sm:p-2.5 bg-transparent rounded-full text-white hover:bg-black/10 transition-colors hidden sm:block drop-shadow-lg" title="Picture in Picture">
                    <PictureInPicture className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-md" />
                </button>
            </div>

            {/* Right Side Action Buttons - Transparent buttons, scaled down on mobile */}
            <div className="absolute bottom-20 sm:bottom-28 right-2 sm:right-4 z-30 flex flex-col items-center gap-3 sm:gap-6">
                <button onClick={handleLike} className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                    <div className="p-1.5 sm:p-3 bg-transparent rounded-full transition-all group-active:scale-90 duration-200">
                        <Heart className={`w-6 h-6 sm:w-9 sm:h-9 drop-shadow-xl ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-[10px] sm:text-xs font-bold drop-shadow-xl">{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); navigate(`/watch/${video.id}`) }} className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                    <div className="p-1.5 sm:p-3 bg-transparent rounded-full transition-all group-active:scale-90 duration-200">
                        <MessageCircle className="w-6 h-6 sm:w-9 sm:h-9 text-white drop-shadow-xl" />
                    </div>
                    <span className="text-white text-[10px] sm:text-xs font-bold drop-shadow-xl">Comment</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }} className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                    <div className="p-1.5 sm:p-3 bg-transparent rounded-full transition-all group-active:scale-90 duration-200">
                        <Share2 className="w-6 h-6 sm:w-9 sm:h-9 text-white drop-shadow-xl" />
                    </div>
                    <span className="text-white text-[10px] sm:text-xs font-bold drop-shadow-xl">Share</span>
                </button>

                <button className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                    <div className="p-1.5 sm:p-3 bg-transparent rounded-full transition-all group-active:scale-90 duration-200">
                        <MoreVertical className="w-6 h-6 sm:w-9 sm:h-9 text-white drop-shadow-xl" />
                    </div>
                </button>
                
                <div className="mt-1 sm:mt-2 w-8 h-8 sm:w-12 sm:h-12 rounded-lg border-2 border-white/80 overflow-hidden bg-black/50 shadow-lg animate-spin-slow">
                     <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-90" alt="Sound cover" />
                </div>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 mb-4 pointer-events-auto w-[85%]">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
                        <img src={video.communityAvatar || video.uploaderAvatar} alt={video.uploaderName} className="w-10 h-10 rounded-full border border-white/50" />
                        <span className="text-white font-bold text-base drop-shadow-md hover:underline truncate">@{video.uploaderName?.replace(/\s/g, '')}</span>
                    </div>
                    <button className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors pointer-events-auto">
                        Subscribe
                    </button>
                </div>
                <div className="pointer-events-auto w-[85%]">
                    <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-3 font-medium">{video.description} <span className="font-bold text-white/80">#shorts #starlight</span></p>
                    <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                        <Music className="w-4 h-4" />
                        <span className="animate-pulse">Original Sound - {video.uploaderName}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
