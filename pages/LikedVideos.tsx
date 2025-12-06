

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { ThumbsUp, ArrowLeft, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UploadModal } from '../components/UploadModal';

export const LikedVideos: React.FC = () => {
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadLikedVideos = () => {
    const likedJson = localStorage.getItem('liked_videos');
    if (likedJson) {
      try {
        // Reverse to show most recently liked first
        setLikedVideos(JSON.parse(likedJson).reverse());
      } catch (e) {
        console.error("Failed to parse liked videos", e);
      }
    }
  };

  useEffect(() => {
    loadLikedVideos();
  }, []);

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadLikedVideos();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  if (!currentUser) {
     return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--background-primary)] text-[var(--text-primary)] p-6">
        <ThumbsUp className="w-20 h-20 text-[hsl(var(--accent-color))] mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Sign in to see your liked videos</h2>
        <p className="text-[var(--text-secondary)] mb-6">Save videos to watch later. Your likes will show up here.</p>
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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
            {/* Left Side Playlist-style Info Card */}
            <div className="md:w-80 w-full flex-shrink-0">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(var(--accent-color))]/20 to-blue-900/20 border border-[var(--border-primary)] p-6 sticky top-6 backdrop-blur-sm">
                     {likedVideos.length > 0 ? (
                        <div className="aspect-video rounded-xl overflow-hidden mb-4 shadow-lg relative group cursor-pointer" onClick={() => navigate(`/watch/${likedVideos[0].id}`, { state: { video: likedVideos[0] } })}>
                            <img 
                                src={likedVideos[0].thumbnailUrl} 
                                alt="Most recently liked" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-semibold text-sm uppercase tracking-widest">Play All</p>
                            </div>
                        </div>
                     ) : (
                        <div className="aspect-video rounded-xl bg-[var(--background-tertiary)] mb-4 flex items-center justify-center">
                            <ThumbsUp className="w-12 h-12 text-[var(--text-secondary)] opacity-50" />
                        </div>
                     )}
                     
                     <h1 className="text-2xl font-bold mb-2">Liked Videos</h1>
                     <div className="text-[var(--text-secondary)] text-sm font-medium mb-1">
                        {currentUser?.name}
                     </div>
                     <div className="text-[var(--text-tertiary)] text-xs mb-4">
                        {likedVideos.length} videos
                     </div>

                     <div className="flex gap-2">
                        <button className="flex-1 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <Play className="w-4 h-4 fill-current" /> Play all
                        </button>
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
                    <h2 className="text-xl font-bold">Liked Videos</h2>
                </div>

                {likedVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)] border border-dashed border-[var(--border-primary)] rounded-2xl">
                        <ThumbsUp className="w-16 h-16 mb-4 opacity-30" />
                        <h2 className="text-xl font-bold mb-2">No liked videos yet</h2>
                        <p className="max-w-md text-center mb-6">Like videos to save them here.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-[var(--background-secondary)] text-[var(--text-primary)] rounded-full font-semibold hover:bg-[var(--background-tertiary)] transition-colors border border-[var(--border-primary)]"
                        >
                            Browse Videos
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                        {likedVideos.map((video, index) => (
                            <VideoCard key={`${video.id}-${index}`} video={video} onEdit={handleEdit} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};