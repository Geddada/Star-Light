

import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchVideos, getAdForSlot } from '../services/gemini';
import { Video, AdCampaign, UnskippableAdCampaign, ShortsAdCampaign, isAd } from '../types';
import { Clock, Check, Edit2 } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';
import { InFeedAdCard } from '../components/InFeedAdCard'; // Import InFeedAdCard

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

const WatchLaterButton: React.FC<{ video: Video }> = ({ video }) => {
    const [isInWatchLater, setIsInWatchLater] = useState(false);

    useEffect(() => {
        const watchLaterJson = localStorage.getItem('watch_later_videos');
        if (watchLaterJson) {
            const watchLaterVideos: Video[] = JSON.parse(watchLaterJson);
            setIsInWatchLater(watchLaterVideos.some(v => v.id === video.id));
        } else {
            setIsInWatchLater(false);
        }
    }, [video.id]);

    const handleToggleWatchLater = (e: React.MouseEvent) => {
        e.stopPropagation();
        const watchLaterJson = localStorage.getItem('watch_later_videos');
        let watchLaterVideos: Video[] = watchLaterJson ? JSON.parse(watchLaterJson) : [];
        const isCurrentlyInList = watchLaterVideos.some(v => v.id === video.id);

        if (isCurrentlyInList) {
            watchLaterVideos = watchLaterVideos.filter(v => v.id !== video.id);
            setIsInWatchLater(false);
        } else {
            watchLaterVideos.unshift(video);
            setIsInWatchLater(true);
        }
        localStorage.setItem('watch_later_videos', JSON.stringify(watchLaterVideos));
    };

    return (
        <button
            onClick={handleToggleWatchLater}
            title={isInWatchLater ? "Added to Watch Later" : "Watch Later"}
            className="absolute top-2 left-2 z-10 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
        >
            {isInWatchLater ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </button>
    );
};

export const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('search_query') || '';
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [ad, setAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!query) return;
    
    const loadContent = async () => {
      setLoading(true);
      const [videoData, adData] = await Promise.all([
        searchVideos(query),
        getAdForSlot('SEARCH_SPONSORED_RESULT')
      ]);
      setVideos(videoData);
      setAd(adData);
      setLoading(false);
    };

    loadContent();
  }, [query]);

  const results = useMemo(() => {
    const combined: (Video | AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[] = [...videos];
    if (ad && combined.length > 2) {
      combined.splice(2, 0, ad);
    } else if (ad) {
      combined.push(ad);
    }
    return combined;
  }, [videos, ad]);

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

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
      {showUploadModal && (
        <UploadModal
          onClose={handleCloseModal}
          onUploadSuccess={handleUploadSuccess}
          videoToEdit={editingVideo}
        />
      )}
      <h1 className="text-xl font-bold">Results for: <span className="text-[var(--text-secondary)]">{query}</span></h1>
      {loading ? (
         Array.from({length: 5}).map((_, i) => (
           <div key={i} className="flex flex-col md:flex-row gap-4 animate-pulse">
             <div className="w-full md:w-[360px] aspect-video bg-[var(--background-secondary)] rounded-xl" />
             <div className="flex-1 flex flex-col gap-3 py-2">
                <div className="h-5 bg-[var(--background-secondary)] w-3/4 rounded-md" />
                <div className="h-4 bg-[var(--background-secondary)] w-1/2 rounded-md" />
                <div className="flex items-center gap-2 mt-2">
                   <div className="h-8 w-8 bg-[var(--background-secondary)] rounded-full" />
                   <div className="h-4 bg-[var(--background-secondary)] w-1/4 rounded-md" />
                </div>
             </div>
           </div>
         ))
      ) : (
        results.map((item) => {
            if (isAd(item)) {
              // Use InFeedAdCard component for ads
              return <InFeedAdCard key={item.id} campaign={item} />;
            } else {
                const video = item as Video;
                return (
                  <div 
                    key={video.id} 
                    className="flex flex-col md:flex-row gap-4 cursor-pointer group"
                    onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
                  >
                    <div className="relative w-full md:w-[360px] flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-[var(--background-secondary)]">
                      <div className="absolute top-2 right-14 z-30">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(video); }}
                            className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Edit video"
                            title="Edit video"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                      </div>
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                        <span className="font-bold text-white text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">StarLight</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 text-red-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                          aria-hidden="true"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <WatchLaterButton video={video} />
                      <div className="absolute bottom-1.5 right-1.5 bg-blue-600/90 px-1.5 py-0.5 text-xs font-medium rounded text-white">
                        {video.duration}
                      </div>
                    </div>
        
                    <div className="flex flex-col gap-1 py-1">
                      <h3 className="text-lg font-semibold line-clamp-2 leading-normal group-hover:text-[hsl(var(--accent-color))] transition-colors">{video.title}</h3>
                      <div className="text-[var(--text-secondary)] text-sm flex items-center gap-1.5 mt-1">
                        <span>{video.views}</span>
                        <span>•</span>
                        <span>{video.uploadDate || video.uploadTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 my-3">
                        {video.uploaderAvatar ? (
                            <img src={video.uploaderAvatar} className="w-7 h-7 rounded-full" alt={video.uploaderName} />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                                {getInitials(video.uploaderName || 'U')}
                            </div>
                        )}
                        <div>
                           <span className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] transition-colors font-semibold">{video.uploaderName}</span>
                           <p className="text-xs text-[var(--text-tertiary)]">{video.communityName}</p>
                        </div>
                      </div>
        
                      <p className="text-[var(--text-secondary)] text-sm line-clamp-2 md:block hidden">
                        {video.description}
                      </p>
                    </div>
                  </div>
                );
            }
        })
      )}
    </div>
  );
};