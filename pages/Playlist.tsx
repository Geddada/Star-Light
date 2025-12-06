import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, Playlist as PlaylistType } from '../types';
import { VideoCard } from '../components/VideoCard';
import { ListVideo, ArrowLeft, Play, Trash2, Lock, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UploadModal } from '../components/UploadModal';

export const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadPlaylist = () => {
    setLoading(true);
    const playlistsJson = localStorage.getItem('starlight_playlists');
    if (playlistsJson) {
      const playlists: PlaylistType[] = JSON.parse(playlistsJson);
      const found = playlists.find(p => p.id === id);
      setPlaylist(found || null);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const handleDeletePlaylist = () => {
    if (window.confirm(`Delete playlist "${playlist?.name}"?`)) {
      const playlistsJson = localStorage.getItem('starlight_playlists');
      if (playlistsJson) {
        let playlists: PlaylistType[] = JSON.parse(playlistsJson);
        playlists = playlists.filter(p => p.id !== id);
        localStorage.setItem('starlight_playlists', JSON.stringify(playlists));
        // Dispatch event so Sidebar updates
        window.dispatchEvent(new Event('playlistsUpdated'));
        navigate('/');
      }
    }
  };

  const handleRemoveVideo = (videoToRemove: Video) => {
      if(!playlist) return;
      const updatedVideos = playlist.videos.filter(v => v.id !== videoToRemove.id);
      const updatedPlaylist = { ...playlist, videos: updatedVideos };
      setPlaylist(updatedPlaylist);

      // Update storage
      const playlistsJson = localStorage.getItem('starlight_playlists');
      if (playlistsJson) {
          let playlists: PlaylistType[] = JSON.parse(playlistsJson);
          playlists = playlists.map(p => p.id === id ? updatedPlaylist : p);
          localStorage.setItem('starlight_playlists', JSON.stringify(playlists));
      }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadPlaylist();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  if (loading) {
      return <div className="p-10 text-center">Loading...</div>;
  }

  if (!playlist) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6">
              <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
              <button onClick={() => navigate('/')} className="text-[hsl(var(--accent-color))] hover:underline">Go Home</button>
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
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-[var(--border-primary)] p-6 sticky top-6 backdrop-blur-sm shadow-xl">
                     {playlist.videos.length > 0 ? (
                        <div className="aspect-video rounded-xl overflow-hidden mb-4 shadow-lg relative group cursor-pointer" onClick={() => navigate(`/watch/${playlist.videos[0].id}`, { state: { video: playlist.videos[0] } })}>
                            <img 
                                src={playlist.videos[0].thumbnailUrl} 
                                alt="Playlist thumbnail" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-semibold text-sm uppercase tracking-widest">Play All</p>
                            </div>
                        </div>
                     ) : (
                        <div className="aspect-video rounded-xl bg-[var(--background-tertiary)] mb-4 flex items-center justify-center">
                            <ListVideo className="w-12 h-12 text-[var(--text-secondary)] opacity-50" />
                        </div>
                     )}
                     
                     <h1 className="text-2xl font-bold mb-2 break-words">{playlist.name}</h1>
                     
                     <div className="flex flex-col gap-1 text-[var(--text-secondary)] text-sm font-medium mb-4">
                        <span className="text-[var(--text-primary)] font-bold">{currentUser?.name}</span>
                        <div className="flex items-center gap-2">
                            <span>{playlist.videos.length} videos</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">No views</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">Updated today</span>
                        </div>
                         <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-black/20 rounded w-fit">
                             <Lock className="w-3 h-3" /> <span className="text-xs">Private</span>
                         </div>
                     </div>

                     <div className="flex gap-2 mb-4">
                        <button className="flex-1 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <Play className="w-4 h-4 fill-current" /> Play all
                        </button>
                        <button 
                            onClick={handleDeletePlaylist}
                            className="p-2.5 bg-[var(--background-secondary)] hover:bg-red-500/20 hover:text-red-500 text-[var(--text-primary)] rounded-full transition-colors border border-transparent hover:border-red-500/30"
                            title="Delete playlist"
                        >
                             <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                     
                     {playlist.description && (
                         <p className="text-sm text-[var(--text-secondary)] border-t border-white/10 pt-3">
                             {playlist.description}
                         </p>
                     )}
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
                    <h2 className="text-xl font-bold truncate">{playlist.name}</h2>
                </div>

                {playlist.videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)] border border-dashed border-[var(--border-primary)] rounded-2xl">
                        <ListVideo className="w-16 h-16 mb-4 opacity-30" />
                        <h2 className="text-xl font-bold mb-2">Playlist is empty</h2>
                        <p className="max-w-md text-center mb-6">Add videos to this playlist from the watch page.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-[var(--background-secondary)] text-[var(--text-primary)] rounded-full font-semibold hover:bg-[var(--background-tertiary)] transition-colors border border-[var(--border-primary)]"
                        >
                            Browse Videos
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                        {playlist.videos.map((video, index) => (
                            <VideoCard 
                                key={`${video.id}-${index}`} 
                                video={video}
                                onEdit={handleEdit}
                                onDelete={() => handleRemoveVideo(video)}
                                deleteLabel="Remove from playlist"
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