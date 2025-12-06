import React, { useState, useEffect, useRef } from 'react';
import { fetchShorts } from '../services/gemini';
import { Video } from '../types';
import { ArrowUp, ArrowDown, Loader2, Home, Camera } from 'lucide-react';
import { ShortsPlayer } from '../components/ShortsPlayer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UploadModal } from '../components/UploadModal';

export const Shorts: React.FC = () => {
  const [shorts, setShorts] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadShorts = async () => {
      setLoading(true);
      const data = await fetchShorts();
      setShorts(data);
      setLoading(false);
    };
    loadShorts();
  }, []);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // After uploading a short, go to profile where it will appear
    navigate('/profile'); 
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollPosition = container.scrollTop;
      const elementHeight = container.clientHeight;
      const newIndex = Math.round(scrollPosition / elementHeight);
      
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToVideo = (direction: 'up' | 'down') => {
      if (containerRef.current) {
          const container = containerRef.current;
          const newIndex = direction === 'up' ? Math.max(0, activeIndex - 1) : Math.min(shorts.length - 1, activeIndex + 1);
          const newScrollTop = newIndex * container.clientHeight;
          
          container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
      }
  };

  if (loading) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-[#121212]">
             <Loader2 className="w-10 h-10 text-[hsl(var(--accent-color))] animate-spin" />
          </div>
      );
  }

  return (
    <div className="w-full h-full bg-[#121212] flex justify-center items-center overflow-hidden relative">
      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} isShortsDefault={true} />}

        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 z-50 p-3 bg-black/40 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          aria-label="Back to Home"
        >
          <Home className="w-6 h-6" />
        </button>

        {currentUser && (
            <button
            onClick={() => setShowUploadModal(true)}
            className="absolute top-6 right-6 z-50 p-3 bg-black/40 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            aria-label="Upload a Short"
            >
            <Camera className="w-6 h-6" />
            </button>
        )}

        {/* Main Scroll Container with mobile aspect ratio */}
        <div 
            ref={containerRef}
            className="h-full w-auto aspect-[9/16] max-w-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth rounded-2xl shadow-2xl border border-white/10"
            onScroll={handleScroll}
        >
            {shorts.map((video, index) => (
                <div key={video.id} className="w-full h-full snap-center relative">
                    <ShortsPlayer video={video} isActive={index === activeIndex} />
                </div>
            ))}
        </div>

        {/* Desktop Navigation Arrows (Floating) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-50">
            <button 
                onClick={() => scrollToVideo('up')}
                disabled={activeIndex === 0}
                className="p-4 bg-gray-800/50 rounded-full text-white hover:bg-[hsl(var(--accent-color))] disabled:opacity-30 transition-all transform hover:scale-110"
            >
                <ArrowUp className="w-6 h-6" />
            </button>
            <button 
                onClick={() => scrollToVideo('down')}
                disabled={activeIndex === shorts.length - 1}
                className="p-4 bg-gray-800/50 rounded-full text-white hover:bg-[hsl(var(--accent-color))] disabled:opacity-30 transition-all transform hover:scale-110"
            >
                <ArrowDown className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
};