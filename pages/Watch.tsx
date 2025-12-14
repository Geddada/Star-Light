
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Flag, Loader2, Play, Pause, Maximize, Minimize, Settings, Volume2, VolumeX } from 'lucide-react';
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
import { Logo } from '../components/Logo';

export const Watch: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isPremium } = useAuth();
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
  const [isMuted, setIsMuted] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Intro/Outro State
  const [showIntro, setShowIntro] = useState(false);
  const [showOutro, setShowOutro] = useState(false);
  
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

      // Load Ad if not premium
      if (!isPremium) {
          const ad = await getAdForSlot('WATCH_SIDEBAR');
          setSidebarAd(ad);
      } else {
          setSidebarAd(null);
      }
    };
    
    loadData();
  }, [videoId, video, isPremium]);

  // Save to History
  useEffect(() => {
    if (video) {
      const historyJson = localStorage.getItem('watch_history');
      let history: Video[] = historyJson ? JSON.parse(historyJson) : [];
      // Remove duplicate if exists to push to top
      history = history.filter(v => v.id !== video.id);
      history.unshift(video);
      // Limit history size to 50
      if (history.length > 50) history = history.slice(0, 50);
      localStorage.setItem('watch_history', JSON.stringify(history));
    }
  }, [video]);
  
  // Effect for fullscreen changes
  useEffect(() => {
      const handleFullscreenChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Intro and Autoplay effect
  useEffect(() => {
    // Check if intro has been shown in this session
    const introShown = sessionStorage.getItem('starlight_intro_shown');
    const shouldShowIntro = !introShown;

    setShowIntro(shouldShowIntro);
    setShowOutro(false);
    setIsPlaying(false);

    if (shouldShowIntro) {
        // Intro Timer (4.5s for the sun rise animation)
        const introTimer = setTimeout(() => {
            setShowIntro(false);
            sessionStorage.setItem('starlight_intro_shown', 'true');
            // Attempt autoplay after intro
            if (videoRef.current && autoplayEnabled) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(e => {
                    console.error("Autoplay prevented:", e);
                    setIsPlaying(false);
                });
            }
        }, 4500);
        return () => clearTimeout(introTimer);
    } else {
        // Immediate autoplay if intro skipped
        if (autoplayEnabled) {
            // Small delay to ensure video element is ready
            const timer = setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.play().then(() => setIsPlaying(true)).catch(e => {
                        // Autoplay might be blocked without user interaction first
                        setIsPlaying(false);
                    });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }
  }, [videoId, autoplayEnabled]);

  // Keyboard Shortcuts Handler for Watch Page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (showIntro || showOutro) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case 'l':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case 'arrowleft':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          break;
        case 'arrowright':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration, showIntro, showOutro]);


  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
      if (videoRef.current) {
          videoRef.current.muted = !isMuted;
          setIsMuted(!isMuted);
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
      setShowOutro(true);
      
      // Wait 4 seconds for outro before potentially autoplaying next video
      setTimeout(() => {
          if (autoplayEnabled && relatedVideos.length > 0) {
              // Only navigate if user hasn't started playing again or navigated away
              const nextVideo = relatedVideos[0];
              navigate(`/watch/${nextVideo.id}`, { state: { video: nextVideo } });
          }
      }, 4000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Deterministic video source selection based on ID
  const videoSrc = video ? PREVIEW_VIDEOS[video.id.charCodeAt(video.id.length - 1) % PREVIEW_VIDEOS.length] : '';

  const showOverlay = currentTime < 5 || (duration > 0 && duration - currentTime <= 5);

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
            className="group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-4 border border-[var(--border-primary)]"
        >
            {/* 
              CINEMATIC INTRO: RED & BLUE SUNRISE
            */}
            {showIntro && (
                <div className="absolute inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards overflow-hidden pointer-events-none" style={{ animationDelay: '4s' }}>
                    <style>{`
                        @keyframes sunRiseVideo {
                            0% { bottom: -100px; transform: scale(0.8); }
                            100% { bottom: 50%; transform: translateY(50%) scale(1); }
                        }
                        @keyframes reflectionRiseVideo {
                            0% { bottom: -150px; }
                            100% { bottom: 10%; }
                        }
                        @keyframes gridMoveVideo {
                            0% { background-position: 0 0; }
                            100% { background-position: 0 500px; }
                        }
                        @keyframes textRevealVideo {
                            0% { opacity: 0; transform: translateY(20px); letter-spacing: 20px; filter: blur(10px); }
                            100% { opacity: 1; transform: translateY(0); letter-spacing: 8px; filter: blur(0); }
                        }
                    `}</style>

                    <div className="relative w-full h-full flex justify-center items-center bg-[radial-gradient(circle_at_center_bottom,#1e3a8a_0%,#0F172A_70%)]">
                        {/* Blue Animated Grid */}
                        <div 
                            className="absolute bottom-[-50%] w-[200%] h-full bg-[linear-gradient(transparent_0%,#1e3a8a_2%,transparent_3%),linear-gradient(90deg,transparent_0%,#1e3a8a_2%,transparent_3%)] bg-[length:50px_50px] opacity-30"
                            style={{
                                transform: 'perspective(500px) rotateX(60deg)',
                                animation: 'gridMoveVideo 10s linear infinite'
                            }}
                        ></div>

                        {/* Red Sun */}
                        <div 
                            className="absolute w-[100px] h-[100px] rounded-full bg-[linear-gradient(180deg,#FF4D4D,#ff2a2a)] shadow-[0_0_40px_#FF4D4D,0_0_80px_#FF4D4D] z-10"
                            style={{
                                bottom: '-100px',
                                animation: 'sunRiseVideo 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
                            }}
                        ></div>

                        {/* Reflection */}
                        <div 
                            className="absolute w-[100px] h-[100px] rounded-full bg-[linear-gradient(180deg,#FF4D4D,transparent)] z-0 blur-xl opacity-60"
                            style={{
                                bottom: '-150px',
                                transform: 'scaleY(-0.5)',
                                animation: 'reflectionRiseVideo 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
                            }}
                        ></div>

                        {/* Text Content */}
                        <div 
                            className="absolute z-20 text-center opacity-0"
                            style={{
                                animation: 'textRevealVideo 1.5s ease-out 2s forwards'
                            }}
                        >
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tighter m-0 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] font-sans">
                                Star Light
                            </h1>
                            <p className="text-[#7dd3fc] tracking-widest mt-4 text-xl md:text-3xl font-bold uppercase drop-shadow-[0_2px_10px_rgba(37,99,235,0.8)] font-sans">
                                Create, Watch, Discover
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 
              CINEMATIC OUTRO: SMOOTH RED & BLUE 
            */}
            {showOutro && (
                <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-700 overflow-hidden">
                     {/* Deep Background */}
                    <div className="absolute inset-0 bg-[#050505]"></div>

                    {/* Smooth Moving Auroras */}
                    <div className="absolute inset-0 opacity-50 mix-blend-screen">
                        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-800/30 rounded-full blur-[100px] animate-[pulse_5s_ease-in-out_infinite]" />
                        <div className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-red-800/30 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite]" />
                    </div>
                    
                    <div className="absolute inset-0 opacity-[0.1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                    <div className="text-center space-y-6 relative z-10 p-10 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 shadow-2xl">
                        <div className="relative">
                             <h1 className="text-4xl md:text-6xl font-bold tracking-wider text-center text-white mb-2 drop-shadow-lg">
                                Thanks for<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">Watching</span>
                            </h1>
                        </div>
                        
                        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-red-500 mx-auto rounded-full"></div>
                        
                        <div className="flex justify-center gap-6 mt-8">
                             <div className="flex flex-col items-center gap-2 text-blue-300 text-xs tracking-widest font-mono">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                NEXT VIDEO
                             </div>
                        </div>
                    </div>
                </div>
            )}

            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain bg-black"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleMetadataLoaded}
                onEnded={handleVideoEnded}
            />
            
            {/* Branding Overlays Removed */}

            {video.communityName && (
                <div className={`absolute top-4 right-4 z-20 transition-opacity duration-500 pointer-events-none ${showOverlay && !showIntro && !showOutro ? 'opacity-100' : 'opacity-0'}`}>
                     <span className="text-white text-sm sm:text-xl font-bold tracking-tight drop-shadow-md bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-md border border-white/10 font-sans">
                        {video.communityName}
                     </span>
                </div>
            )}

            {/* Custom Controls */}
            {!showIntro && !showOutro && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar