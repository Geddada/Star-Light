import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../types';
import { Heart, MessageCircle, Share2, Play, Volume2, VolumeX, PictureInPicture } from 'lucide-react';

interface ShortsPlayerProps {
  video: Video;
  isActive: boolean;
}

export const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ video, isActive }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50000) + 1000);

  // Handle auto-play when active
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.error("Autoplay blocked", e));
      }
    } else {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Failed to toggle PiP:", error);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };
  
  const formatCount = (num: number) => {
      return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div className="absolute top-5 right-5 z-40 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 text-red-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      {/* Video Layer */}
      <div className="absolute inset-0 bg-gray-900 group cursor-pointer" onClick={togglePlay}>
        {/* Placeholder image while loading or if video fails */}
        <img 
            src={video.thumbnailUrl} 
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
            alt="background"
        />
        {/* Simulating a short video */}
        <video
          ref={videoRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
          className="w-full h-full object-cover relative z-10"
          loop
          playsInline
          muted={isMuted}
        />
        
        {/* Play Icon Overlay (Only visible when paused) */}
        {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                <Play className="w-16 h-16 text-white opacity-80 fill-white" />
            </div>
        )}
      </div>

      {/* Top Overlay Controls */}
      <div className={`absolute top-4 right-4 z-30 flex flex-col gap-4 transition-opacity duration-300 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button onClick={toggleMute} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button onClick={togglePiP} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors" title="Picture in Picture">
              <PictureInPicture className="w-5 h-5" />
          </button>
      </div>

      {/* Right Side Action Buttons */}
      <div className={`absolute bottom-20 right-2 z-30 flex flex-col items-center gap-6 pr-2 transition-opacity duration-300 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         <div className="flex flex-col items-center gap-1">
             <button onClick={handleLike} className="p-3 bg-gray-800/60 hover:bg-gray-700/80 rounded-full backdrop-blur-md transition-all active:scale-90 group">
                 <Heart className={`w-7 h-7 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-red-500'}`} />
             </button>
             <span className="text-white text-xs font-bold shadow-black drop-shadow-md">{formatCount(likeCount)}</span>
         </div>
         
         <div className="flex flex-col items-center gap-1">
             <button className="p-3 bg-gray-800/60 hover:bg-gray-700/80 rounded-full backdrop-blur-md transition-all active:scale-90">
                 <MessageCircle className="w-7 h-7 text-white" />
             </button>
             <span className="text-white text-xs font-bold shadow-black drop-shadow-md">1.2K</span>
         </div>

         <div className="flex flex-col items-center gap-1">
             <button className="p-3 bg-gray-800/60 hover:bg-gray-700/80 rounded-full backdrop-blur-md transition-all active:scale-90">
                 <Share2 className="w-7 h-7 text-white" />
             </button>
             <span className="text-white text-xs font-bold shadow-black drop-shadow-md">Share</span>
         </div>
         
         <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white mt-2 cursor-pointer animate-spin-slow">
             <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt="Music cover" />
         </div>
      </div>

      {/* Bottom Info Area */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-3 pointer-events-auto">
              <img src={video.uploaderAvatar} className="w-10 h-10 rounded-full border border-white/20 cursor-pointer" alt={video.uploaderName} />
              <div>
                  <span className="text-white font-bold text-sm cursor-pointer hover:underline shadow-black drop-shadow-sm">@{video.uploaderName?.replace(/\s/g, '')}</span>
                  <p className="text-white/80 text-xs">in {video.communityName} • {video.uploadDate || video.uploadTime}</p>
              </div>
              <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors shadow-lg ml-auto">Subscribe</button>
          </div>
          <h3 className="text-white text-base font-medium line-clamp-2 mb-2 w-[85%] shadow-black drop-shadow-sm">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
             <Volume2 className="w-3 h-3" />
             <div className="overflow-hidden w-40">
                <p className="whitespace-nowrap animate-marquee">Original Sound - {video.communityName} • Trending on Starlight</p>
             </div>
          </div>
      </div>
      
      <style>{`
        .animate-marquee {
            animation: marquee 25s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .animate-spin-slow {
            animation: spin 6s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};