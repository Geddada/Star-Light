
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, Share2, Download, Scissors, ListPlus, MoreHorizontal, 
  User, CheckCircle2, Send, Sparkles, Loader2, Play, Pause, Volume2, VolumeX, 
  Maximize, Minimize, Settings, PictureInPicture, RotateCcw
} from 'lucide-react';
import { Video, Comment, AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';
import { fetchComments, fetchVideos, getAdForSlot, generateBetterTitle } from '../services/gemini';
import { VideoCard } from '../components/VideoCard';
import { SidebarAd } from '../components/SidebarAd';
import { useAuth } from '../contexts/AuthContext';
import { ShareModal } from '../components/ShareModal';
import { SaveToPlaylistModal } from '../components/SaveToPlaylistModal';
import { ReportModal } from '../components/ReportModal';
import { PREVIEW_VIDEOS } from '../constants';

export const Watch: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [video, setVideo] = useState<Video | null>(location.state?.video || null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [ad, setAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);

  const [loading, setLoading] = useState(!video);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const videoSrc = video ? PREVIEW_VIDEOS[video.id.charCodeAt(video.id.length - 1) % PREVIEW_VIDEOS.length] : '';

  useEffect(() => {
    // If we don't have video state (direct link), try to fetch it or fallback
    if (!video && videoId) {
      // Simulation of fetching video by ID
      const loadVideo = async () => {
        setLoading(true);
        // Fallback: fetch general videos and find one or pick random
        const videos = await fetchVideos();
        const found = videos.find(v => v.id === videoId) || videos[0];
        setVideo(found);
        setLoading(false);
      };
      loadVideo();
    }
  }, [videoId, video]);

  useEffect(() => {
    if (video) {
      // Load related data
      fetchComments(video.title).then(setComments);
      fetchVideos(video.category).then(recs => setRecommendations(recs.filter(v => v.id !== video.id)));
      getAdForSlot('WATCH_SIDEBAR').then(setAd);
      
      // Check subscription (mock)
      const subs = JSON.parse(localStorage.getItem('starlight_subscriptions') || '[]');
      setIsSubscribed(subs.includes(video.communityName));
    }
    
    // Reset player state
    setIsPlaying(true);
    setCurrentTime(0);
    window.scrollTo(0, 0);
  }, [video]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoRef.current) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleSubscribe = () => {
    if (!currentUser) {
        navigate('/signup');
        return;
    }
    const subs = JSON.parse(localStorage.getItem('starlight_subscriptions') || '[]');
    let newSubs;
    if (isSubscribed) {
        newSubs = subs.filter((s: string) => s !== video?.communityName);
    } else {
        newSubs = [...subs, video?.communityName];
    }
    localStorage.setItem('starlight_subscriptions', JSON.stringify(newSubs));
    setIsSubscribed(!isSubscribed);
    window.dispatchEvent(new Event('subscriptionsChanged'));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!commentInput.trim()) return;
      if(!currentUser) {
          navigate('/signup');
          return;
      }
      
      const newComment: Comment = {
          id: `comment-${Date.now()}`,
          author: currentUser.name,
          avatar: currentUser.avatar,
          text: commentInput,
          likes: '0',
          time: 'Just now'
      };
      setComments([newComment, ...comments]);
      setCommentInput('');
  };

  const handleGenerateTitle = async () => {
      if (!video) return;
      setGeneratingTitle(true);
      const newTitle = await generateBetterTitle(video.title, video.description);
      if (newTitle) {
          setVideo({ ...video, title: newTitle });
      }
      setGeneratingTitle(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading || !video) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--background-primary)]">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--accent-color))]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 p-0 lg:p-6 max-w-[1800px] mx-auto w-full">
        {showShareModal && <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} videoUrl={window.location.href} videoTitle={video.title} currentTime={currentTime} />}
        {showSaveModal && <SaveToPlaylistModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} video={video} />}
        {showReportModal && <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} video={video} />}

      <div className="flex-1 min-w-0">
        {/* Video Player */}
        <div 
            ref={playerContainerRef}
            className="relative aspect-video bg-black lg:rounded-xl overflow-hidden group w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={() => setShowControls(true)}
        >
            <video 
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                autoPlay={isAutoplayEnabled}
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            />
            
            {/* Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
                {/* Progress Bar */}
                <div className={`group/progress relative h-1.5 md:h-1 bg-white/30 rounded-full mb-4 cursor-pointer hover:h-2 transition-all ${showControls ? 'pointer-events-auto' : ''}`}>
                    <div 
                        className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <input 
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>

                <div className={`flex items-center justify-between ${showControls ? 'pointer-events-auto' : ''}`}>
                    <div className="flex items-center gap-4 md:gap-3">
                        <button onClick={togglePlay} className="p-2 md:p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 transition-all text-white shadow-sm group-hover:scale-105">
                            {isPlaying ? <Pause className="w-5 h-5 md:w-3.5 md:h-3.5 fill-current" /> : <Play className="w-5 h-5 md:w-3.5 md:h-3.5 fill-current ml-0.5" />}
                        </button>
                        
                        <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="p-2 md:p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 transition-all text-white shadow-sm w-9 h-9 md:w-7 md:h-7 flex items-center justify-center group-hover:scale-105">
                            <span className="text-[10px] md:text-[9px] font-bold rotate-12">+10</span>
                        </button>

                        <div className="flex items-center gap-2 group/volume hidden sm:flex">
                            <button onClick={toggleMute} className="p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 transition-all text-white shadow-sm group-hover:scale-105">
                                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={isMuted ? 0 : volume} 
                                onChange={handleVolumeChange}
                                className="w-0 overflow-hidden group-hover/volume:w-20 transition-all h-1 bg-white/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>

                        <span className="text-white text-xs font-medium ml-1 bg-black/40 px-2 py-0.5 rounded">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-2">
                        <div className="relative">
                            <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="p-2 md:p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 transition-all text-white shadow-sm group-hover:scale-105" title="Playback speed">
                                <Settings className={`w-5 h-5 md:w-3.5 md:h-3.5 ${showSpeedMenu ? 'rotate-90' : ''} transition-transform`}/>
                                {playbackRate !== 1 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full">{playbackRate}x</span>}
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-1 flex flex-col gap-1 backdrop-blur-md border border-white/10 w-48 shadow-xl z-50">
                                    <div className="flex justify-between items-center px-3 py-2 text-sm text-white border-b border-white/10">
                                        <label htmlFor="autoplay-toggle" className="font-semibold">Autoplay</label>
                                        <button 
                                            onClick={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
                                            className={`w-8 h-4 rounded-full relative transition-colors ${isAutoplayEnabled ? 'bg-red-500' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isAutoplayEnabled ? 'left-4.5 translate-x-4' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>
                                    <p className="text-xs font-semibold px-3 py-1 text-white/50 uppercase tracking-wider">Speed</p>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                        <button key={rate} onClick={() => handlePlaybackRateChange(rate)} className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 text-white flex justify-between ${playbackRate === rate ? 'bg-white/10 font-bold' : ''}`}>
                                            {rate === 1 ? 'Normal' : `${rate}x`}
                                            {playbackRate === rate && <CheckCircle2 className="w-3 h-3 text-red-500"/>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={togglePiP} className="p-2 md:p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 transition-all text-white shadow-sm hidden sm:block group-hover:scale-105" title="Picture in picture">
                            <PictureInPicture className="w-5 h-5 md:w-3.5 md:h-3.5"/>
                        </button>
                        <button onClick={toggleFullscreen} className="p-2 md:p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 transition-all text-white shadow-sm group-hover:scale-105" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                            {isFullscreen ? <Minimize className="w-5 h-5 md:w-3.5 md:h-3.5"/> : <Maximize className="w-5 h-5 md:w-3.5 md:h-3.5"/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Video Info */}
        <div className="p-4 lg:p-0 lg:mt-4">
            <div className="flex items-start gap-2">
                <h1 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] line-clamp-2 flex-1">{video.title}</h1>
                <button 
                    onClick={handleGenerateTitle}
                    disabled={generatingTitle}
                    className="p-2 text-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/10 rounded-full hover:bg-[hsl(var(--accent-color))]/20 transition-colors"
                    title="Generate AI Title"
                >
                    {generatingTitle ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3 pb-4 border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-4">
                    <img src={video.communityAvatar || video.uploaderAvatar} alt={video.communityName} className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)] text-sm md:text-base">{video.communityName}</h3>
                        <p className="text-xs text-[var(--text-secondary)]">1.2M subscribers</p>
                    </div>
                    <button 
                        onClick={handleSubscribe}
                        className={`ml-auto md:ml-4 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            isSubscribed 
                                ? 'bg-[var(--background-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)]' 
                                : 'bg-[var(--text-primary)] text-[var(--background-primary)] hover:opacity-90'
                        }`}
                    >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <div className="flex items-center bg-[var(--background-secondary)] rounded-full h-8 md:h-9 flex-shrink-0 border border-[var(--border-primary)]">
                        <button className="flex items-center gap-2 px-3 md:px-4 h-full hover:bg-[var(--background-tertiary)] rounded-l-full border-r border-[var(--border-primary)] transition-colors">
                            <ThumbsUp className="w-4 h-4 md:w-4 md:h-4" />
                            <span className="text-xs md:text-sm font-semibold">45K</span>
                        </button>
                        <button className="px-3 md:px-4 h-full hover:bg-[var(--background-tertiary)] rounded-r-full transition-colors">
                            <ThumbsDown className="w-4 h-4 md:w-4 md:h-4" />
                        </button>
                    </div>
                    <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[var(--background-secondary)] rounded-full hover:bg-[var(--background-tertiary)] transition-colors text-xs md:text-sm font-semibold flex-shrink-0 border border-[var(--border-primary)]">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[var(--background-secondary)] rounded-full hover:bg-[var(--background-tertiary)] transition-colors text-xs md:text-sm font-semibold flex-shrink-0 hidden sm:flex border border-[var(--border-primary)]">
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[var(--background-secondary)] rounded-full hover:bg-[var(--background-tertiary)] transition-colors text-xs md:text-sm font-semibold flex-shrink-0 border border-[var(--border-primary)]">
                        <ListPlus className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setShowReportModal(true)} className="p-2 md:p-2.5 bg-[var(--background-secondary)] rounded-full hover:bg-[var(--background-tertiary)] transition-colors flex-shrink-0 border border-[var(--border-primary)]">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4 bg-[var(--background-secondary)] p-3 rounded-xl text-sm">
                <div className="flex gap-2 font-bold mb-2">
                    <span>{video.views}</span>
                    <span>{video.uploadDate || video.uploadTime}</span>
                </div>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap text-xs md:text-sm">{video.description}</p>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">{comments.length} Comments</h3>
                
                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-8">
                    <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`} className="w-10 h-10 rounded-full bg-gray-700" alt="You" />
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Add a comment..." 
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="w-full bg-transparent border-b border-[var(--border-primary)] focus:border-[var(--text-primary)] outline-none py-2 text-sm transition-colors"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setCommentInput('')} className="px-3 py-1.5 text-sm font-semibold hover:bg-[var(--background-tertiary)] rounded-full">Cancel</button>
                            <button type="submit" disabled={!commentInput.trim()} className="px-3 py-1.5 text-sm font-semibold bg-[hsl(var(--accent-color))] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-90">Comment</button>
                        </div>
                    </div>
                </form>

                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm">{comment.author}</span>
                                    <span className="text-xs text-[var(--text-tertiary)]">{comment.time}</span>
                                </div>
                                <p className="text-sm text-[var(--text-primary)]">{comment.text}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <button className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                        <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes}
                                    </button>
                                    <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="text-xs font-semibold hover:bg-[var(--background-tertiary)] px-2 py-1 rounded-full">Reply</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Sidebar Recommendations */}
      <div className="lg:w-[400px] flex-shrink-0 p-4 lg:p-0">
        <div className="space-y-4">
            <h2 className="font-bold text-lg px-1">Sponsored</h2>
            <SidebarAd ad={ad} />
            
            <h2 className="font-bold text-lg px-1 mt-6">Up Next</h2>
            {recommendations.map(video => (
                <VideoCard key={video.id} video={video} compact />
            ))}
        </div>
      </div>
    </div>
  );
};