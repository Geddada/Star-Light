
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Flag, Loader2, Play, Pause, Maximize, Minimize, Settings } from 'lucide-react';
import { Video, Comment, AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';
import { fetchVideos, fetchComments, fetchAiComments, getAdForSlot } from '../services/gemini';
import { VideoCard } from '../components/VideoCard';
import { ShareModal } from '../components/ShareModal';
import { SidebarAd } from '../components/SidebarAd';
import { useAuth } from '../contexts/AuthContext';
import { PREVIEW_VIDEOS } from '../constants';
import { ReportModal } from '../components/ReportModal';
import { SaveToPlaylistModal } from '../components/SaveToPlaylistModal';
import { useAutoplay } from '../contexts/AutoplayContext'; // Import useAutoplay

export const Watch: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { autoplayEnabled, setAutoplayEnabled } = useAutoplay(); // Use autoplay context

  const [video, setVideo] = useState<Video | null>(location.state?.video || null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(!video);
  const [sidebarAd, setSidebarAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Load video data if not passed in state
  useEffect(() => {
    const loadData = async () => {
      if (!video && videoId) {
        setLoading(true);
        // Simulate fetching video details (using fetchVideos as a search)
        const videos = await fetchVideos(); 
        const found = videos.find(v => v.id === videoId) || videos[0]; // Fallback
        setVideo(found);
        setLoading(false);
      }
      
      // Load related content
      const related = await fetchVideos();
      setRelatedVideos(related.filter(v => v.id !== videoId));
      
      // Load comments
      if (video) {
          const [realComments, aiComments] = await Promise.all([
              fetchComments(video.title),
              fetchAiComments(video.title)
          ]);
          setComments([...aiComments, ...realComments].sort(() => Math.random() - 0.5));
      }

      // Load Ad
      const ad = await getAdForSlot('WATCH_SIDEBAR');
      setSidebarAd(ad);
    };
    
    loadData();
  }, [videoId, video]);
  
  // Effect for fullscreen changes
  useEffect(() => {
      const handleFullscreenChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Autoplay effect for initial load
  useEffect(() => {
    if (videoRef.current && autoplayEnabled) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => {
        console.error("Autoplay prevented:", e);
        setIsPlaying(false);
      });
    } else if (videoRef.current && !autoplayEnabled) {
        videoRef.current.pause();
        setIsPlaying(false);
    }
  }, [autoplayEnabled, videoRef.current, videoId]); // Added videoId dependency to retry play on new video load


  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
        const progressContainer = e.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const newTime = (clickPosition / rect.width) * duration;
        videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
      if (!playerContainerRef.current) return;

      if (!document.fullscreenElement) {
          playerContainerRef.current.requestFullscreen().catch(err => {
              alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      } else {
          document.exitFullscreen();
      }
  };

  const handleVideoEnded = () => {
      setIsPlaying(false);
      if (autoplayEnabled && relatedVideos.length > 0) {
          const nextVideo = relatedVideos[0];
          navigate(`/watch/${nextVideo.id}`, { state: { video: nextVideo } });
      }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Deterministic video source selection based on ID
  const videoSrc = video ? PREVIEW_VIDEOS[video.id.charCodeAt(video.id.length - 1) % PREVIEW_VIDEOS.length] : '';

  if (loading || !video) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--accent-color))]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Video Player */}
        <div 
            ref={playerContainerRef}
            className="group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-4"
        >
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleMetadataLoaded}
                onEnded={handleVideoEnded}
            />
            
            {/* Custom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <div 
                    className="w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer hover:h-2.5 transition-all relative"
                    onClick={handleSeek}
                >
                    <div 
                        className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>
                
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-red-500 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        <span className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="hover:rotate-90 transition-transform">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
                            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Video Info */}
        <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <img 
                        src={video.communityAvatar || video.uploaderAvatar} 
                        alt={video.communityName} 
                        className="w-10 h-10 rounded-full cursor-pointer"
                        onClick={() => navigate(`/channel/${encodeURIComponent(video.uploaderName || '')}`)}
                    />
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)] cursor-pointer hover:text-[hsl(var(--accent-color))]" onClick={() => navigate(`/channel/${encodeURIComponent(video.uploaderName || '')}`)}>
                            {video.uploaderName}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">1.2M subscribers</p>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-[var(--text-primary)] text-[var(--background-primary)] rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                        Subscribe
                    </button>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--border-primary)] transition-colors border-r border-[var(--border-primary)]">
                            <ThumbsUp className="w-5 h-5" /> <span>12K</span>
                        </button>
                        <button className="px-4 py-2 hover:bg-[var(--border-primary)] transition-colors">
                            <ThumbsDown className="w-5 h-5" />
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--background-tertiary)] rounded-full hover:bg-[var(--border-primary)] transition-colors"
                    >
                        <Share2 className="w-5 h-5" /> <span>Share</span>
                    </button>
                    <button 
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--background-tertiary)] rounded-full hover:bg-[var(--border-primary)] transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setShowReportModal(true)}
                        className="p-2 bg-[var(--background-tertiary)] rounded-full hover:bg-[var(--border-primary)] transition-colors"
                        title="Report"
                    >
                        <Flag className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {/* Description */}
        <div className="bg-[var(--background-secondary)] p-4 rounded-xl mb-8">
            <div className="flex gap-2 text-sm font-bold text-[var(--text-primary)] mb-2">
                <span>{video.views}</span>
                <span>•</span>
                <span>{video.uploadDate || video.uploadTime}</span>
            </div>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                {video.description}
            </p>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl">
            <h3 className="text-xl font-bold mb-6">{comments.length} Comments</h3>
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <img 
                            src={comment.avatar} 
                            alt={comment.author} 
                            className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold text-sm ${comment.isAI ? 'text-[hsl(var(--accent-color))] flex items-center gap-1' : 'text-[var(--text-primary)]'}`}>
                                    {comment.author}
                                    {comment.isAI && <span className="text-[10px] bg-[hsl(var(--accent-color))]/10 px-1.5 py-0.5 rounded border border-[hsl(var(--accent-color))]/20">AI</span>}
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)]">{comment.time}</span>
                            </div>
                            <p className="text-sm text-[var(--text-primary)] mb-2">{comment.text}</p>
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                    <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes}
                                </button>
                                <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Sidebar (Recommendations) */}
      <div className="w-full lg:w-[400px] overflow-y-auto p-4 border-l border-[var(--border-primary)] bg-[var(--background-primary)]">
         <div className="flex items-center justify-between mb-4">
             <h2 className="font-bold text-lg">Up Next</h2>
             <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-secondary)] font-medium">Autoplay</span>
                <button 
                    onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer ${autoplayEnabled ? 'bg-[hsl(var(--accent-color))]' : 'bg-[var(--border-secondary)]'}`}
                    aria-label={`Turn autoplay ${autoplayEnabled ? 'off' : 'on'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${autoplayEnabled ? 'translate-x-5' : 'translate-x-0'} flex items-center justify-center`}>
                        {autoplayEnabled ? <Play className="w-3 h-3 text-[hsl(var(--accent-color))] fill-current"/> : <Pause className="w-3 h-3 text-[var(--text-tertiary)] fill-current"/>}
                    </div>
                </button>
             </div>
         </div>
         <div className="flex flex-col gap-3">
            {sidebarAd && (
                <div className="mb-2">
                    <SidebarAd ad={sidebarAd} />
                </div>
            )}
            {relatedVideos.map((related) => (
                <VideoCard key={related.id} video={related} compact />
            ))}
         </div>
      </div>

      {/* Modals */}
      {showShareModal && <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} videoId={video.id} videoTitle={video.title} currentTime={currentTime} />}
      {showReportModal && <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} video={video} />}
      {showSaveModal && <SaveToPlaylistModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} video={video} />}
    </div>
  );
};
