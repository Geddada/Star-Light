
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
    <div className="relative w-full h-full bg-black flex justify-center items-center">
        {showShareModal && <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} videoUrl={window.location.href} videoTitle={video.title} />}
        
        {/* Video Container */}
        <div className="relative w-full h-full max-w-[500px]" onClick={togglePlay}>
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
                    <Play className="w-16 h-16 text-white opacity-80 fill-white" />
                </div>
            )}

            {/* Top Overlay Controls */}
            <div className={`absolute top-4 right-4 z-30 flex flex-col gap-4 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                <button onClick={toggleMute} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button onClick={togglePiP} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors hidden sm:block" title="Picture in Picture">
                    <PictureInPicture className="w-5 h-5" />
                </button>
            </div>

            {/* Right Side Action Buttons */}
            <div className="absolute bottom-20 right-2 z-30 flex flex-col items-center gap-6 pr-2">
                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-gray-800/60 rounded-full backdrop-blur-sm group-hover:bg-gray-700/80 transition-colors">
                        <Heart className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); navigate(`/watch/${video.id}`) }} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-gray-800/60 rounded-full backdrop-blur-sm group-hover:bg-gray-700/80 transition-colors">
                        <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">Comment</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-gray-800/60 rounded-full backdrop-blur-sm group-hover:bg-gray-700/80 transition-colors">
                        <Share2 className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-gray-800/60 rounded-full backdrop-blur-sm group-hover:bg-gray-700/80 transition-colors">
                        <MoreVertical className="w-7 h-7 text-white" />
                    </div>
                </button>
                
                <div className="mt-2 w-10 h-10 rounded-md border-2 border-white overflow-hidden bg-black/50">
                     <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-80" alt="Sound cover" />
                </div>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-4 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
                        <img src={video.communityAvatar || video.uploaderAvatar} alt={video.uploaderName} className="w-9 h-9 rounded-full border border-white/50" />
                        <span className="text-white font-bold text-sm drop-shadow-md hover:underline">@{video.uploaderName?.replace(/\s/g, '')}</span>
                    </div>
                    <button className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors pointer-events-auto">
                        Subscribe
                    </button>
                </div>
                <div className="pointer-events-auto">
                    <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-2 hidden md:block">{video.description} <span className="font-bold text-white/80">#shorts #starlight</span></p>
                    <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                        <Music className="w-3 h-3" />
                        <span className="animate-pulse">Original Sound - {video.uploaderName}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
