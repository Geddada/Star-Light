import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Clock, ArrowLeft, Play, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UploadModal } from '../components/UploadModal';

export const WatchLater: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadVideos = () => {
    const savedJson = localStorage.getItem('watch_later_videos');
    if (savedJson) {
      try {
        // Show most recently added first
        setVideos(JSON.parse(savedJson).reverse());
      } catch (e) {
        console.error("Failed to parse watch later videos", e);
      }
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleClearAll = () => {
      if (window.confirm("Clear all videos from Watch Later?")) {
          localStorage.removeItem('watch_later_videos');
          setVideos([]);
      }
  };

  const handleRemoveVideo = (videoToRemove: Video) => {
    const updatedVideos = videos.filter(v => v.id !== videoToRemove.id);
    setVideos(updatedVideos);

    const savedJson = localStorage.getItem('watch_later_videos');
    if (savedJson) {
      let savedVideos: Video[] = JSON.parse(savedJson);
      // We must reverse the logic from display, remove, then save back.
      // Display is reversed, so we are removing from a reversed array.
      // Let's reload from storage, filter, then save.
      savedVideos = savedVideos.filter(v => v.id !== videoToRemove.id);
      localStorage.setItem('watch_later_videos', JSON.stringify(savedVideos));
      // The state update is correct because it's based on the already reversed list.
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadVideos();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  if (!currentUser) {
     return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--background-primary)] text-[var(--text-primary)] p-6">
        <Clock className="w-20 h-20 text-[hsl(var(--accent-color))] mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Sign in to access Watch Later</h2>
        <p className="text-[var(--text-secondary)] mb-6">Save videos to watch later. Your list will show up here.</p>
        <button 
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-colors"
        >
            Sign In
        </button>
      </div>
     );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
      {showUploadModal && (
        <UploadModal
          onClose={handleCloseModal}
          onUploadSuccess={handleUploadSuccess}
          videoToEdit={editingVideo}
        />
      )}
      <div className="p-6 md:p-8 max-w-[1800px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
            {/* Left Side Info Card */}
            <div className="md:w-80 w-full flex-shrink-0">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(var(--accent-color))]/20 to-blue-900/20 border border-[var(--border-primary)] p-6 sticky top-6 backdrop-blur-sm">
                     {videos.length > 0 ? (
                        <div className="aspect-video rounded-xl overflow-hidden mb-4 shadow-lg relative group cursor-pointer" onClick={() => navigate(`/watch/${videos[0].id}`, { state: { video: videos[0] } })}>
                            <img 
                                src={videos[0].thumbnailUrl} 
                                alt="Most recently added" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-semibold text-sm uppercase tracking-widest">Play All</p>
                            </div>
                        </div>
                     ) : (
                        <div className="aspect-video rounded-xl bg-[var(--background-tertiary)] mb-4 flex items-center justify-center">
                            <Clock className="w-12 h-12 text-[var(--text-secondary)] opacity-50" />
                        </div>
                     )}
                     
                     <h1 className="text-2xl font-bold mb-2">Watch Later</h1>
                     <div className="text-[var(--text-secondary)] text-sm font-medium mb-1">
                        {currentUser?.name}
                     </div>
                     <div className="text-[var(--text-tertiary)] text-xs mb-4">
                        {videos.length} videos
                     </div>

                     <div className="flex gap-2">
                        <button className="flex-1 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <Play className="w-4 h-4 fill-current" /> Play all
                        </button>
                        {videos.length > 0 && (
                             <button 
                                onClick={handleClearAll}
                                className="p-2.5 bg-[var(--background-secondary)] hover:bg-red-500/20 hover:text-red-500 text-[var(--text-primary)] rounded-full transition-colors border border-transparent hover:border-red-500/30"
                                title="Clear list"
                             >
                                 <Trash2 className="w-5 h-5" />
                             </button>
                        )}
                     </div>
                </div>
            </div>

            {/* Right Side List */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 md:hidden">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-[var(--background-secondary)] rounded-full"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold">Watch Later</h2>
                </div>

                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)] border border-dashed border-[var(--border-primary)] rounded-2xl">
                        <Clock className="w-16 h-16 mb-4 opacity-30" />
                        <h2 className="text-xl font-bold mb-2">Your list is empty</h2>
                        <p className="max-w-md text-center mb-6">Save videos to watch them later.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-[var(--background-secondary)] text-[var(--text-primary)] rounded-full font-semibold hover:bg-[var(--background-tertiary)] transition-colors border border-[var(--border-primary)]"
                        >
                            Browse Videos
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                        {videos.map((video, index) => (
                            <VideoCard 
                                key={`${video.id}-${index}`} 
                                video={video} 
                                onEdit={handleEdit}
                                onDelete={() => handleRemoveVideo(video)}
                                deleteLabel="Remove from Watch Later"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};