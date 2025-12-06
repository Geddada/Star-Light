

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Trash2, History as HistoryIcon, ArrowLeft } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';

export const History: React.FC = () => {
  const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
  const navigate = useNavigate();
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadHistory = () => {
    const historyJson = localStorage.getItem('watch_history');
    if (historyJson) {
      try {
        setHistoryVideos(JSON.parse(historyJson));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your watch history?")) {
      localStorage.removeItem('watch_history');
      setHistoryVideos([]);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadHistory();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[var(--background-secondary)] rounded-full md:hidden"
              >
                <ArrowLeft className="w-6 h-6" />
             </button>
             <HistoryIcon className="w-8 h-8 text-[hsl(var(--accent-color))]" />
             <h1 className="text-3xl font-bold">Watch History</h1>
          </div>
          
          {historyVideos.length > 0 && (
            <button 
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-semibold border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          )}
        </div>

        {historyVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
            <HistoryIcon className="w-24 h-24 mb-6 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">No history yet</h2>
            <p className="max-w-md text-center mb-8">Videos you watch will appear here.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-colors"
            >
              Start Watching
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {historyVideos.map((video, index) => (
              <VideoCard key={`${video.id}-${index}`} video={video} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};