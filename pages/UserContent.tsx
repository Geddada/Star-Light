
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { UploadModal } from '../components/UploadModal';
import { Search, Filter, Eye, MessageSquare, ThumbsUp, Edit2, Trash2, Video as VideoIcon, Globe, Lock } from 'lucide-react';

export const UserContent: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadUserVideos = () => {
    if (!currentUser) return;
    setLoading(true);
    const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
    if (uploadedVideosJSON) {
      const allVideos: Video[] = JSON.parse(uploadedVideosJSON);
      // Filter for videos owned by the current user
      const userVideos = allVideos.filter(v => v.uploaderName === currentUser.name);
      setVideos(userVideos);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserVideos();
    window.addEventListener('videosUpdated', loadUserVideos);
    return () => window.removeEventListener('videosUpdated', loadUserVideos);
  }, [currentUser]);

  const handleDelete = (videoId: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
      if (uploadedVideosJSON) {
        let allVideos: Video[] = JSON.parse(uploadedVideosJSON);
        allVideos = allVideos.filter(v => v.id !== videoId);
        localStorage.setItem('starlight_uploaded_videos', JSON.stringify(allVideos));
        window.dispatchEvent(new Event('videosUpdated'));
      }
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadUserVideos();
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => v.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [videos, searchTerm]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to manage your content</h2>
        <button onClick={() => navigate('/signup')} className="px-6 py-2 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {showUploadModal && (
        <UploadModal
          onClose={() => { setShowUploadModal(false); setEditingVideo(undefined); }}
          onUploadSuccess={handleUploadSuccess}
          videoToEdit={editingVideo}
        />
      )}

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Channel Content</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your videos and shorts</p>
        </div>

        <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden flex flex-col h-full">
          {/* Toolbar */}
          <div className="p-4 border-b border-[var(--border-primary)] flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input 
                type="text" 
                placeholder="Filter" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
              />
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Content Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-[var(--background-tertiary)]/50 text-xs text-[var(--text-secondary)] uppercase">
                <tr>
                  <th className="px-6 py-3 w-[40%]">Video</th>
                  <th className="px-4 py-3">Visibility</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right">Comments</th>
                  <th className="px-4 py-3 text-right">Likes</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center">Loading content...</td></tr>
                ) : filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[var(--text-secondary)]">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-[var(--background-tertiary)] rounded-full">
                          <VideoIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <p>No videos found. Upload a video to get started!</p>
                        <button onClick={() => setShowUploadModal(true)} className="text-[hsl(var(--accent-color))] font-bold hover:underline">Upload Video</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-[var(--background-tertiary)]/30 group transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div 
                            className="relative w-28 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
                          >
                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">{video.duration}</span>
                          </div>
                          <div className="min-w-0">
                            <p 
                              className="font-semibold text-[var(--text-primary)] truncate cursor-pointer hover:underline"
                              onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
                            >
                              {video.title}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-1">{video.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Globe className="w-4 h-4 text-green-500" />
                          <span>Public</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {video.uploadDate || 'Just now'}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                        {video.views.replace(' views', '')}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                        <div className="flex items-center justify-end gap-1">
                          <MessageSquare className="w-3 h-3" /> --
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                        <div className="flex items-center justify-end gap-1">
                          <ThumbsUp className="w-3 h-3" /> --%
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(video)} className="p-2 hover:text-[hsl(var(--accent-color))] hover:bg-[hsl(var(--accent-color))]/10 rounded-lg transition-colors" title="Edit details">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/watch/${video.id}`, { state: { video } })} className="p-2 hover:text-[hsl(var(--accent-color))] hover:bg-[hsl(var(--accent-color))]/10 rounded-lg transition-colors" title="View on YouTube">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(video.id, video.title)} className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete forever">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
