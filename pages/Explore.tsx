
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Music, Gamepad2, Newspaper, Trophy, Lightbulb, Compass } from 'lucide-react';
import { Video } from '../types';
import { fetchVideos } from '../services/gemini';
import { VideoCard } from '../components/VideoCard';
import { UploadModal } from '../components/UploadModal';

const DESTINATIONS = [
  { id: 'trending', label: 'Trending', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'music', label: 'Music', icon: Music, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'news', label: 'News', icon: Newspaper, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'sports', label: 'Sports', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'learning', label: 'Learning', icon: Lightbulb, color: 'text-green-500', bg: 'bg-green-500/10' },
];

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDestination, setActiveDestination] = useState('trending');
  
  // Reuse existing modal logic
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      // Map destination IDs to the categories your Gemini service likely understands
      const categoryMap: Record<string, string> = {
        'trending': 'Viral Trends',
        'music': 'Music',
        'gaming': 'Gaming',
        'news': 'News',
        'sports': 'Sports',
        'learning': 'Education'
      };
      
      const category = categoryMap[activeDestination] || 'All';
      const data = await fetchVideos(category);
      
      // Simulate "Trending" by sorting by views (parsing "1.2M views" to numbers roughly)
      if (activeDestination === 'trending') {
         data.sort((a, b) => {
             const parseViews = (str: string) => {
                 const num = parseFloat(str);
                 if (str.includes('M')) return num * 1000000;
                 if (str.includes('K')) return num * 1000;
                 return num;
             };
             return parseViews(b.views) - parseViews(a.views);
         });
      }
      
      setTrendingVideos(data);
      setLoading(false);
    };
    
    loadContent();
  }, [activeDestination]);

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    // Reload logic if needed
  };

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
          videoToEdit={editingVideo}
        />
      )}
      
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
        {/* Destinations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.id}
              onClick={() => setActiveDestination(dest.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border border-transparent ${
                activeDestination === dest.id 
                  ? 'bg-[var(--background-secondary)] shadow-md border-[var(--border-primary)] scale-105' 
                  : 'bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)]'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${dest.bg} ${dest.color}`}>
                <dest.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-sm">{dest.label}</span>
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
             {activeDestination === 'trending' ? <Flame className="w-6 h-6 text-red-500" /> : <Compass className="w-6 h-6" />}
             {DESTINATIONS.find(d => d.id === activeDestination)?.label} Videos
          </h2>

          <div className="flex flex-col gap-4">
            {loading ? (
               Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-40 sm:w-60 aspect-video bg-[var(--background-secondary)] rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-2">
                       <div className="h-5 bg-[var(--background-secondary)] w-3/4 rounded" />
                       <div className="h-4 bg-[var(--background-secondary)] w-1/2 rounded" />
                       <div className="h-8 bg-[var(--background-secondary)] w-10 rounded-full mt-2" />
                    </div>
                 </div>
               ))
            ) : (
              trendingVideos.map((video, index) => (
                <div key={video.id} className="flex gap-4">
                   {/* Only show rank numbers for the Trending tab */}
                   {activeDestination === 'trending' && (
                       <span className="hidden sm:flex text-sm text-[var(--text-tertiary)] font-bold w-6 pt-1 justify-center shrink-0">
                          {index + 1}
                       </span>
                   )}
                   <div className="flex-1 min-w-0">
                      <VideoCard video={video} compact onEdit={handleEdit} />
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
