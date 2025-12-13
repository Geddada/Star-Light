

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
  const { autoplayEnabled } = useAutoplay(); // Use autoplay context

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

  // Autoplay effect
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
  }, [autoplayEnabled, videoRef.current]);


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
              alert(`Error attempting to enable full-screen mode: ${err}