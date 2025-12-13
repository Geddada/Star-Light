import React, { useState, useEffect, useRef } from 'react';
import { fetchShorts } from '../services/gemini';
import { Video } from '../types';
import { ArrowUp, ArrowDown, Loader2, Home, Camera } from 'lucide-react';
import { ShortsPlayer } from '../components/ShortsPlayer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UploadModal } from '../components/UploadModal';
import { Logo } from '../components/Logo';

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
    <div className="w-full h-screen bg-black flex justify-center items-center relative overflow-hidden">
      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} isShortsDefault={true} />}

        <button
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hidden md:block"
          aria-label="Back to Home"
        >
          <Home className="w-6 h-6" />
        </button>

        {currentUser && (
            <button
            onClick={() => setShowUploadModal(true)}
            className="absolute top-8 right-8 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hidden md:block"
            aria-label="Upload a Short"
            >
            <Camera className="w-6 h-6" />
            </button>
        )}
        
        {/* Modern Phone Frame Container */}
        {/* Aspect ratio 9/19.5 mimics modern smartphones like iPhone 14/15/16 Pro */}
        <div className="relative h-[92vh] aspect-[9/19.5] max-h-screen bg-black rounded-[3rem] border-[6px] border-[#1a1a1a] shadow-[0_0_60px_rgba(255,255,255,0.05)] overflow-hidden ring-1 ring-white/10 z-10">
            
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-8 w-[120px] bg-black rounded-full z-50 pointer-events-none flex items-center justify-center">
                <div className="w-full h-full flex justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Activity Indicators simulation */}
                    <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                    <div className="w-1 h-1 rounded-full bg-green-500"></div>
                </div>
            </div>

            {/* Main Scroll Container */}
            <div 
                ref={containerRef}
                className="w-full h-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth bg-black"
                onScroll={handleScroll}
            >
                {shorts.map((video, index) => (
                    <div key={video.id} className="w-full h-full snap-center relative">
                        <ShortsPlayer video={video} isActive={index === activeIndex} />
                    </div>
                ))}
            </div>
            
            {/* Home Indicator Bar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-white/40 rounded-full z-50 pointer-events-none backdrop-blur-md"></div>
        </div>

        {/* Desktop Navigation Arrows (Floating) */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-20">
            <button 
                onClick={() => scrollToVideo('up')}
                disabled={activeIndex === 0}
                className="p-4 bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-[hsl(var(--accent-color))] disabled:opacity-20 disabled:cursor-not-allowed transition-all transform hover:scale-110 border border-white/10"
            >
                <ArrowUp className="w-6 h-6" />
            </button>
            <button 
                onClick={() => scrollToVideo('down')}
                disabled={activeIndex === shorts.length - 1}
                className="p-4 bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-[hsl(var(--accent-color))] disabled:opacity-20 disabled:cursor-not-allowed transition-all transform hover:scale-110 border border-white/10"
            >
                <ArrowDown className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
};