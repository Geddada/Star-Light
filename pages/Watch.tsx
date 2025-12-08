

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// FIX: Added ShortsAdCampaign to the import list to resolve type errors.
import { Video, Comment, AdCampaign, UnskippableAdCampaign, ShortsAdCampaign, Community } from '../types';
import { fetchComments, fetchVideos, generateBetterTitle, fetchAiComments, fetchTickerText, getAdForSlot, generateVideoSummary } from '../services/gemini';
import { ThumbsUp, ThumbsDown, Share2, Sparkles, Maximize, Minimize, Loader2, X, PictureInPicture, Play, Pause, SkipForward, Rewind, FastForward, Volume1, Volume2, VolumeX, Settings, ExternalLink, Star, Flag, Captions, Users, MoreVertical, Tv, Save, List } from 'lucide-react';
import { ShareModal } from '../components/ShareModal';
import { ReportModal } from '../components/ReportModal';
import { VideoCard } from '../components/VideoCard';
import { PREVIEW_VIDEOS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { SidebarAd } from '../components/SidebarAd';
import { UploadModal } from '../components/UploadModal';
import { SaveToPlaylistModal } from '../components/SaveToPlaylistModal';

interface AdPlayerOverlayProps {
  ad: AdCampaign;
  onAdFinish: () => void;
}

const AdPlayerOverlay: React.FC<AdPlayerOverlayProps> = ({ ad, onAdFinish }) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const [adVideoSrc, setAdVideoSrc] = useState('');

  useEffect(() => {
    // Deterministically select a random video for the ad visual
    const adVideoIndex = ad.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % PREVIEW_VIDEOS.length;
    setAdVideoSrc(PREVIEW_VIDEOS[adVideoIndex]);
  }, [ad.id]);

  useEffect(() => {
    if (!adVideoSrc) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adVideoSrc]);

  const handleSkip = () => {
    if (adVideoRef.current) {
      adVideoRef.current.pause();
    }
    onAdFinish();
  };

  return (
    <div className="absolute inset-0 z-40 bg-black flex items-center justify-center animate-in fade-in">
      <video
        ref={adVideoRef}
        src={adVideoSrc}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleSkip}
      />
      <div className="absolute bottom-4 right-4 flex items-center gap-4">
        {!canSkip ? (
          <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-md backdrop-blur-sm">
            You can skip in {countdown}
          </span>
        ) : (
          <button onClick={handleSkip} className="bg-black/60 hover:bg-black/80 text-white text-sm px-4 py-2 rounded-md transition-colors backdrop-blur-sm">
            Skip Ad
          </button>
        )}
      </div>
      <div className="absolute bottom-4 left-4 bg-black/60 text-white p-2 rounded-lg text-xs max-w-[calc(100%-200px)] backdrop-blur-sm">
          <p className="font-bold truncate">{ad.title}</p>
          <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-300 hover:underline flex items-center gap-1">
            Visit advertiser <ExternalLink className="w-3 h-3" />
          </a>
      </div>
      <div className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
        ADVERTISEMENT
      </div>
    </div>
  );
};

export const Watch: React.FC = () => {
  const { videoId } = useParams<{videoId: string}>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isPremium, isAdmin, currentUser } = useAuth();
  
  const [video, setVideo] = useState<Video | undefined>(state?.video);
  const [comments, setComments] = useState<Comment[]>([]);
  const [aiComments, setAiComments] = useState<Comment[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  const [likeStatus, setLikeStatus] = useState<'none' | 'liked' | 'disliked'>('none');
  const [likeCount, setLikeCount] = useState(12450);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [suggestedTitle, setSuggestedTitle] = useState<string>('');
  const [generatingTitle, setGeneratingTitle] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tickerText, setTickerText] = useState('');

  const [ad, setAd] = useState<AdCampaign | null>(null);
  // FIX: Updated ad state type to include ShortsAdCampaign.
  const [sidebarAd, setSidebarAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);
  const [mainVideoAutoPlay, setMainVideoAutoPlay] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Block User State
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [openCommentMenu, setOpenCommentMenu] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [showReporterOverlay, setShowReporterOverlay] = useState(false);

  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const setupTicker = async () => {
        const baseText = await fetchTickerText();
        setTickerText(` ${baseText.toUpperCase()}  +++  `.repeat(10));
    };
    if(video) setupTicker();
  }, [video]);

  useEffect(() => {
    const blocked = localStorage.getItem('starlight_blocked_users');
    if (blocked) {
        setBlockedUsers(JSON.parse(blocked));
    }
  }, []);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const loadData = async () => {
        if (isMounted) {
            setAd(null);
            setMainVideoAutoPlay(false);
            if(videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            setComments([]);
            setAiComments([]);
            setRelatedVideos([]);
            setSuggestedTitle('');
            setAiSummary(null);
        }

        let currentVideo = state?.video;
        if (!currentVideo) {
            const allVideos = await fetchVideos("All");
            currentVideo = allVideos.find(v => v.id === videoId) || allVideos[0];
        }
        if (!isMounted || !currentVideo) return;
        setVideo(currentVideo);
        
        if (currentUser && currentVideo) {
            const subscriptions: string[] = JSON.parse(localStorage.getItem('starlight_subscriptions') || '[]');
            setIsSubscribed(subscriptions.includes(currentVideo.communityName));
        } else {
            setIsSubscribed(false);
        }

        const related = await fetchVideos(currentVideo.category || "Recommendations");
        if (!isMounted) return;
        setRelatedVideos(related.filter(v => v.id !== currentVideo?.id));

        const regularData = await fetchComments(currentVideo.title);
        if (!isMounted) return;
        setComments(regularData);

        const aiData = await fetchAiComments(currentVideo.title);
        if (!isMounted) return;
        setAiComments(aiData);
        
        const historyJson = localStorage.getItem('watch_history');
        let history = historyJson ? JSON.parse(historyJson) : [];
        history = history.filter((v: Video) => v.id !== currentVideo?.id);
        history.unshift(currentVideo);
        localStorage.setItem('watch_history', JSON.stringify(history.slice(0, 50)));

        // Start playback sequence (ad or video)
        const shouldShowAd = !isPremium && !state?.video;
        if (shouldShowAd) {
          const adData = await getAdForSlot('WATCH_PRE_ROLL');
          if (isMounted && adData && 'ctr' in adData) {
            setAd(adData as AdCampaign);
          } else if (isMounted) {
            setMainVideoAutoPlay(true);
          }
        } else if (isMounted) {
          setMainVideoAutoPlay(true);
        }
    };
    
    const loadSidebarAd = async () => {
        const adData = await getAdForSlot('WATCH_SIDEBAR');
        setSidebarAd(adData);
    };

    loadData();
    loadSidebarAd();

    return () => { isMounted = false; };
  }, [videoId, state?.video, isPremium, currentUser]);

  const handleLike = () => {
    setLikeStatus('liked');
    setLikeCount(prev => likeStatus === 'disliked' ? prev + 2 : (likeStatus === 'none' ? prev + 1 : prev));
  };
  
  const handleDislike = () => {
    setLikeStatus('disliked');
    setLikeCount(prev => likeStatus === 'liked' ? prev - 1 : prev);
  };
  
  const handleSubscription = () => {
    if(!currentUser || !video) {
        navigate('/signup');
        return;
    }
    
    let subscriptions: string[] = JSON.parse(localStorage.getItem('starlight_subscriptions') || '[]');
    if(isSubscribed) {
        subscriptions = subscriptions.filter(name => name !== video.communityName);
    } else {
        subscriptions.push(video.communityName);
    }
    localStorage.setItem('starlight_subscriptions', JSON.stringify(subscriptions));
    setIsSubscribed(!isSubscribed);
    window.dispatchEvent(new Event('subscriptionsChanged'));
  };

  const handleAdFinish = () => {
    setAd(null);
    setMainVideoAutoPlay(true);
  };
  
  const handleGenerateTitle = async () => {
    if (!video) return;
    setGeneratingTitle(true);
    const newTitle = await generateBetterTitle(video.title, video.description);
    setSuggestedTitle(newTitle);
    setGeneratingTitle(false);
  };

  const handleGenerateSummary = async () => {
      if(!video) return;
      setIsGeneratingSummary(true);
      const summary = await generateVideoSummary(video.title, video.description);
      setAiSummary(summary);
      setIsGeneratingSummary(false);
  };
  
  const handleBlockUser = (username: string) => {
    if (window.confirm(`Are you sure you want to block ${username}? You won't see their comments anymore.`)) {
        const updatedBlockedUsers = [...blockedUsers, username];
        setBlockedUsers(updatedBlockedUsers);
        localStorage.setItem('starlight_blocked_users', JSON.stringify(updatedBlockedUsers));
        setOpenCommentMenu(null);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    window.location.reload();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  const videoSrc = videoId ? PREVIEW_VIDEOS[videoId.charCodeAt(videoId.length - 1) % PREVIEW_VIDEOS.length] : PREVIEW_VIDEOS[0];

  // Player Controls Logic
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
        if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const skipTime = useCallback((amount: number) => {
      if (videoRef.current) {
          videoRef.current.currentTime += amount;
      }
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const updateTime = () => {
        if (!videoEl) return;
        const currentTime = videoEl.currentTime;
        const duration = videoEl.duration;
        setCurrentTime(currentTime);

        if (!isNaN(duration) && duration > 6) {
            const shouldShow = (currentTime >= 0 && currentTime <= 3) || (currentTime >= duration - 3);
            setShowReporterOverlay(shouldShow);
        } else if (!isNaN(duration)) { // For videos 6s or shorter, show always
            setShowReporterOverlay(true);
        } else {
            setShowReporterOverlay(false);
        }
    };
    const updateDuration = () => setDuration(videoEl.duration);
    const onPlay = () => {
        setIsPlaying(true);
        handleMouseMove();
    };
    const onPause = () => {
        setIsPlaying(false);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setShowControls(true);
    };

    videoEl.addEventListener('timeupdate', updateTime);
    videoEl.addEventListener('loadedmetadata', updateDuration);
    videoEl.addEventListener('play', onPlay);
    videoEl.addEventListener('pause', onPause);
    videoEl.addEventListener('ended', onPause);

    return () => {
      videoEl.removeEventListener('timeupdate', updateTime);
      videoEl.removeEventListener('loadedmetadata', updateDuration);
      videoEl.removeEventListener('play', onPlay);
      videoEl.removeEventListener('pause', onPause);
      videoEl.removeEventListener('ended', onPause);
    };
  }, [videoSrc, handleMouseMove]);
  
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
    }
  }, [isPlaying]);

  const toggleSubtitles = useCallback(() => {
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      const track = videoRef.current.textTracks[0];
      const isShowing = track.mode === 'showing';
      track.mode = isShowing ? 'hidden' : 'showing';
      setSubtitlesEnabled(!isShowing);
    }
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (videoRef.current) {
          videoRef.current.currentTime = Number(e.target.value);
          setCurrentTime(Number(e.target.value));
      }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      if (videoRef.current) {
          videoRef.current.volume = newVolume;
          videoRef.current.muted = newVolume === 0;
          setVolume(newVolume);
          setIsMuted(newVolume === 0);
      }
  };
  
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        if(videoRef.current.volume === 0) setVolume(1);
      }
    }
  }, [isMuted]);
  
  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
    }
    setShowSpeedMenu(false);
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
  }, []);
  
  const togglePiP = useCallback(() => {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (videoRef.current) {
        videoRef.current.requestPictureInPicture();
    }
  }, []);

  const handleMouseLeave = () => {
      if (isPlaying) setShowControls(false);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

        switch(e.key.toLowerCase()) {
            case 'k':
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'm':
                e.preventDefault();
                toggleMute();
                break;
            case 'f':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'p':
                e.preventDefault();
                togglePiP();
                break;
            case 'c':
                e.preventDefault();
                toggleSubtitles();
                break;
            case 'arrowleft':
                e.preventDefault();
                skipTime(-10);
                break;
            case 'arrowright':
                e.preventDefault();
                skipTime(10);
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, togglePiP, toggleSubtitles, skipTime]);

  const handleLoadedMetadata = () => {
      if (videoRef.current) {
          setDuration(videoRef.current.duration);
          if (videoRef.current.textTracks.length > 0) {
              videoRef.current.textTracks[0].mode = 'hidden';
              setSubtitlesEnabled(false);
          }
      }
  };

  const handleVideoEnd = useCallback(() => {
    if (isAutoplayEnabled && relatedVideos.length > 0) {
      navigate(`/watch/${relatedVideos[0].id}`, { state: { video: relatedVideos[0] } });
    } else {
      navigate('/thanks');
    }
  }, [isAutoplayEnabled, relatedVideos, navigate]);

  if (!video) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--accent-color))]" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[var(--background-primary)] text-[var(--text-primary)]">
      {showShareModal && <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} videoUrl={window.location.href} videoTitle={video.title} currentTime={currentTime} />}
      {showReportModal && <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} video={video} />}
      {showSaveModal && <SaveToPlaylistModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} video={video} />}
      {showUploadModal && (
        <UploadModal
          onClose={handleCloseModal}
          onUploadSuccess={handleUploadSuccess}
          videoToEdit={editingVideo}
        />
      )}
      
      {/* Main Content: Video + Comments */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div 
          ref={playerContainerRef}
          className="w-full aspect-video bg-black relative z-20 group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
            {ad && <AdPlayerOverlay ad={ad} onAdFinish={handleAdFinish} />}
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover cursor-pointer"
                autoPlay={mainVideoAutoPlay && !ad}
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleVideoEnd}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onClick={togglePlay}
                crossOrigin="anonymous"
            >
              <track
                  label="English"
                  kind="subtitles"
                  srcLang="en"
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.vtt"
              />
            </video>
            
            {/* StarLight Logo */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-none">
                <span className="font-bold text-white text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">StarLight</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </div>
            
            {showReporterOverlay && video.uploaderName && (
                <div 
                    className="absolute bottom-24 right-4 w-48 md:w-64 aspect-video bg-black rounded-lg shadow-2xl border-2 border-white/50 animate-in fade-in slide-in-from-right-4 duration-500 pointer-events-none"
                    style={{ zIndex: 35 }}
                >
                    <video
                        src={PREVIEW_VIDEOS[2]} // A video that might look like a person talking.
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                         <p className="font-bold text-sm text-white uppercase tracking-wider drop-shadow-md truncate">{video.uploaderName}</p>
                        {(video.city || video.country) && (
                            <p className="text-xs text-white/90 opacity-90 drop-shadow-md truncate">{[video.city, video.country].filter(Boolean).join(', ')}</p>
                        )}
                    </div>
                </div>
            )}

            {showReporterOverlay && video.communityName && (
                <div 
                    className="absolute bottom-24 left-4 w-48 md:w-64 aspect-video bg-black rounded-lg shadow-2xl border-2 border-white/50 animate-in fade-in slide-in-from-left-4 duration-500 pointer-events-none"
                    style={{ zIndex: 35 }}
                >
                    <video
                        src={PREVIEW_VIDEOS[3]} // A different video for the second reporter
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                         <p className="font-bold text-sm text-white uppercase tracking-wider drop-shadow-md truncate">{video.communityName}</p>
                         <p className="text-xs text-white/90 opacity-90 drop-shadow-md truncate">Live Report</p>
                    </div>
                </div>
            )}

            {isBuffering && !ad && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                    <Loader2 className="w-10 h-10 animate-spin text-white/80" />
                </div>
            )}

            {/* Player Controls */}
            <div className={`absolute bottom-0 left-0 right-0 p-3 pt-1 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Seek Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 accent-sky-500 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                
                {/* Main Controls Row */}
                <div className="flex items-center justify-between mt-1">
                    {/* Left Controls */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => skipTime(-10)} className="text-white p-2" title="Rewind 10s (←)"><Rewind className="w-5 h-5"/></button>
                        <button onClick={togglePlay} className="text-white p-2" title="Play/Pause (k or space)">{isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}</button>
                        <button onClick={() => skipTime(10)} className="text-white p-2" title="Forward 10s (→)"><FastForward className="w-5 h-5"/></button>
                        <button onClick={() => isAutoplayEnabled && relatedVideos.length > 0 && navigate(`/watch/${relatedVideos[0].id}`, { state: { video: relatedVideos[0] } })} className="text-white p-2 disabled:opacity-50" disabled={!isAutoplayEnabled} title="Next video"><SkipForward className="w-5 h-5"/></button>
                        <div className="flex items-center gap-2 ml-2" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => { if(isPlaying) setShowControls(false)}}>
                            <button onClick={toggleMute} className="text-white p-2" title="Mute (m)">
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5"/> : volume < 0.5 ? <Volume1 className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                            </button>
                            <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1 accent-white bg-white/30 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div className="text-xs font-mono text-white/90 ml-2">{formatTime(currentTime)} / {formatTime(duration)}</div>
                    </div>
                    
                    {/* Right Controls */}
                    <div className="flex items-center gap-1">
                        <button onClick={toggleSubtitles} className="text-white p-2" title={subtitlesEnabled ? "Disable captions (c)" : "Enable captions (c)"}>
                            <Captions className={`w-5 h-5 transition-colors ${subtitlesEnabled ? 'text-sky-400' : ''}`} />
                        </button>
                        <div className="relative">
                            <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="text-white p-2" title="Playback speed">
                                <Settings className="w-5 h-5"/>
                                {playbackRate !== 1 && <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold px-1 rounded-full">{playbackRate}x</span>}
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 flex flex-col gap-1 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 w-48">
                                    <div className="flex justify-between items-center px-3 py-1.5 text-sm text-white">
                                        <label htmlFor="autoplay-toggle" className="font-semibold">Autoplay</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id="autoplay-toggle" checked={isAutoplayEnabled} onChange={() => setIsAutoplayEnabled(!isAutoplayEnabled)} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                                        </label>
                                    </div>
                                    <div className="h-px bg-white/20 my-1"></div>
                                    <p className="text-xs font-semibold px-3 py-1 text-white/70">Speed</p>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                        <button key={rate} onClick={() => handlePlaybackRateChange(rate)} className={`w-full text-left px-3 py-1.5 text-sm rounded ${playbackRate === rate ? 'bg-sky-500' : 'hover:bg-white/20'}`}>
                                            {rate === 1 ? 'Normal' : `${rate}x`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={togglePiP} className="text-white p-2" title="Picture in picture (p)"><PictureInPicture className="w-5 h-5"/></button>
                        <button onClick={toggleFullscreen} className="text-white p-2" title={isFullscreen ? "Exit fullscreen (f)" : "Enter fullscreen (f)"}>
                            {isFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* ... Rest of the component (video info, comments) ... */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-xl font-bold">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                  {video.uploaderAvatar && <img src={video.uploaderAvatar} alt={video.uploaderName} className="w-10 h-10 rounded-full" />}
                  <div className="flex-1">
                      <p className="font-semibold flex items-center gap-1">{video.uploaderName} <Star className="w-4 h-4 text-amber-400 fill-amber-400" /></p>
                      <p className="text-xs text-[var(--text-secondary)]">
                          in <span className="font-medium text-[var(--text-primary)]">{video.communityName}</span> • 1.2M subscribers
                      </p>
                  </div>
                  <button onClick={handleSubscription} className={`ml-4 px-4 py-2 rounded-full text-sm font-bold transition-colors ${isSubscribed ? 'bg-[var(--background-tertiary)] text-[var(--text-primary)]' : 'bg-[var(--text-primary)] text-[var(--background-primary)]'}`}>
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center rounded-full bg-[var(--background-secondary)]">
                      <button onClick={handleLike} className={`px-4 py-2 flex items-center gap-2 rounded-l-full hover:bg-[var(--background-tertiary)] ${likeStatus === 'liked' ? 'text-[hsl(var(--accent-color))]' : ''}`}>
                          <ThumbsUp className="w-5 h-5" />
                          <span className="text-sm font-semibold">{likeStatus === 'liked' ? (likeCount).toLocaleString() : (likeCount).toLocaleString()}</span>
                      </button>
                      <div className="w-px h-6 bg-[var(--border-primary)]"></div>
                      <button onClick={handleDislike} className={`px-4 py-2 flex items-center rounded-r-full hover:bg-[var(--background-tertiary)] ${likeStatus === 'disliked' ? 'text-[hsl(var(--accent-color))]' : ''}`}>
                          <ThumbsDown className="w-5 h-5" />
                      </button>
                  </div>
                  <button onClick={() => setShowShareModal(true)} className="px-4 py-2 flex items-center gap-2 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)]">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-semibold">Share</span>
                  </button>
                   <button onClick={() => setShowSaveModal(true)} className="px-4 py-2 flex items-center gap-2 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)]">
                      <Save className="w-5 h-5" />
                      <span className="text-sm font-semibold">Save</span>
                  </button>
                   <button onClick={() => setShowReportModal(true)} className="p-2.5 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)]">
                      <Flag className="w-5 h-5" />
                  </button>
              </div>
          </div>
          
          <div className="bg-[var(--background-secondary)] p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold">{video.views} • {video.uploadDate || video.uploadTime}</p>
                  {!aiSummary && (
                      <button 
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 text-purple-400 rounded-full text-xs font-bold hover:bg-purple-600/20 transition-colors disabled:opacity-50"
                      >
                          {isGeneratingSummary ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                          {isGeneratingSummary ? 'Summarizing...' : 'Summarize with AI'}
                      </button>
                  )}
              </div>

              {aiSummary && (
                  <div className="mb-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3"/> AI Summary
                      </div>
                      <ul className="space-y-1">
                          {aiSummary.map((point, i) => (
                              <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                  <span className="text-purple-400 mt-1.5">•</span> {point}
                              </li>
                          ))}
                      </ul>
                  </div>
              )}

              <p className={`text-sm whitespace-pre-wrap ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                {video.description}
              </p>
              <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-sm font-semibold mt-2">
                {isDescriptionExpanded ? 'Show less' : '...more'}
              </button>
              
              {(isAdmin || isPremium) && (
                <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
                  <button onClick={handleGenerateTitle} disabled={generatingTitle} className="flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 disabled:opacity-60">
                    {generatingTitle ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
                    {generatingTitle ? 'Generating...' : 'Suggest a better title with AI'}
                  </button>
                  {suggestedTitle && (
                    <div className="mt-2 p-3 bg-purple-500/10 rounded-lg text-sm">
                      <strong>Suggestion:</strong> {suggestedTitle}
                    </div>
                  )}
                </div>
              )}
          </div>
          
          <div>
              <h2 className="text-lg font-bold mb-4">{[...comments, ...aiComments].length} Comments</h2>
              {aiComments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 via-transparent to-transparent border-l-4 border-blue-400">
                    <img src={comment.avatar} className="w-10 h-10 rounded-full" alt={comment.author}/>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm flex items-center gap-1">{comment.author} <Sparkles className="w-3 h-3 text-blue-400"/></p>
                            <p className="text-xs text-[var(--text-secondary)]">{comment.time}</p>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                           <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3"/> {comment.likes}</span>
                           <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3"/></span>
                        </div>
                    </div>
                </div>
              ))}
              {comments.map(comment => {
                  if (blockedUsers.includes(comment.author)) return null;
                  return (
                      <div key={comment.id} className="flex items-start gap-3 mb-4 group relative">
                          <img src={comment.avatar} className="w-10 h-10 rounded-full" alt={comment.author}/>
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">{comment.author}</p>
                                  <p className="text-xs text-[var(--text-secondary)]">{comment.time}</p>
                              </div>
                              <p className="text-sm mt-1">{comment.text}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                 <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3"/> {comment.likes}</span>
                                 <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3"/></span>
                              </div>
                          </div>
                          {currentUser && currentUser.name !== comment.author && (
                            <div className="relative">
                                <button onClick={() => setOpenCommentMenu(openCommentMenu === comment.id ? null : comment.id)} className="absolute top-0 right-0 p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {openCommentMenu === comment.id && (
                                    <div className="absolute top-6 right-0 z-10 w-32 bg-[var(--background-secondary)] rounded-lg shadow-lg border border-[var(--border-primary)] p-1">
                                        <button onClick={() => handleBlockUser(comment.author)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--background-tertiary)] rounded">
                                            Block User
                                        </button>
                                    </div>
                                )}
                            </div>
                          )}
                      </div>
                  );
              })}
          </div>
        </div>
      </div>
      
      {/* Sidebar: Related Videos */}
      <aside className="w-full lg:w-[420px] lg:flex-shrink-0 p-6 space-y-4 overflow-y-auto border-t lg:border-t-0 lg:border-l border-[var(--border-primary)]">
          {!isPremium && sidebarAd && (
            <>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Sponsored</h2>
              <SidebarAd ad={sidebarAd} />
              <div className="border-t border-[var(--border-primary)] my-4"></div>
            </>
          )}
        {relatedVideos.map(related => <VideoCard key={related.id} video={related} compact onEdit={handleEdit} />)}
      </aside>
    </div>
  );
};