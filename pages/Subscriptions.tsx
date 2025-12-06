



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Community } from '../types';
import { fetchVideos } from '../services/gemini';
import { VideoCard } from '../components/VideoCard';
import { useAuth } from '../contexts/AuthContext';
import { PlaySquare, Users } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';

export const Subscriptions: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [feedVideos, setFeedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribedCommunities, setSubscribedCommunities] = useState<Community[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadSubscriptionFeed = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const subscriptions: string[] = JSON.parse(localStorage.getItem('starlight_subscriptions') || '[]');
    
    const communitiesJson = localStorage.getItem('starlight_communities');
    const allCommunities: Community[] = communitiesJson ? JSON.parse(communitiesJson) : [];
    const userCommunities = allCommunities.filter(c => subscriptions.includes(c.name));
    setSubscribedCommunities(userCommunities);

    if (subscriptions.length > 0) {
      const staticVideos = await fetchVideos();
      const uploadedVideosJson = localStorage.getItem('starlight_uploaded_videos');
      const uploadedVideos: Video[] = uploadedVideosJson ? JSON.parse(uploadedVideosJson) : [];
      const allVideos = [...uploadedVideos, ...staticVideos];

      const feed = allVideos.filter(video => subscriptions.includes(video.communityName));
      setFeedVideos(feed.sort(() => 0.5 - Math.random()));
    } else {
      setFeedVideos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      loadSubscriptionFeed();
    }

    const handleSubChange = () => loadSubscriptionFeed();
    window.addEventListener('subscriptionsChanged', handleSubChange);
    return () => window.removeEventListener('subscriptionsChanged', handleSubChange);
  }, [currentUser]);

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadSubscriptionFeed();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[var(--background-primary)]">
        <PlaySquare className="w-24 h-24 text-[hsl(var(--accent-color))] mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Don't miss new videos</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          Sign in to see updates from your favorite communities.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="px-8 py-3 bg-[hsl(var(--accent-color))] text-white font-semibold rounded-full filter hover:brightness-90 transition-colors shadow-lg flex items-center gap-2"
        >
           <span className="whitespace-nowrap">Sign In</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[var(--background-primary)] overflow-y-auto">
      {showUploadModal && (
        <UploadModal
          onClose={handleCloseModal}
          onUploadSuccess={handleUploadSuccess}
          videoToEdit={editingVideo}
        />
      )}
      <div className="sticky top-0 z-10 bg-[var(--background-primary)]/95 backdrop-blur-md border-b border-[var(--border-primary)] pt-4 pb-2 px-4 sm:px-6">
         <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subscriptions</h1>
         <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
            {subscribedCommunities.map(community => (
                <div key={community.id} className="flex flex-col items-center gap-2 flex-shrink-0 w-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center">
                       <Users className="w-8 h-8 text-[var(--text-secondary)]" />
                    </div>
                    <p className="text-xs font-medium truncate w-full">{community.name}</p>
                </div>
            ))}
            <button 
                onClick={() => navigate('/community')}
                className="flex flex-col items-center gap-2 flex-shrink-0 w-20 text-center"
            >
                <div className="w-16 h-16 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center hover:bg-[var(--background-secondary)] border-2 border-dashed border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-colors">
                    <span className="text-2xl font-bold text-[hsl(var(--accent-color))]">+</span>
                </div>
                <p className="text-xs font-medium text-[hsl(var(--accent-color))]">Manage</p>
            </button>
         </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-4">Latest Videos</h2>
        {loading ? (
            <div className="text-center p-10 text-[var(--text-secondary)]">Loading feed...</div>
        ) : subscribedCommunities.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-secondary)]">
                <p className="font-semibold text-xl">Your subscription feed is empty.</p>
                <p className="mt-2">Subscribe to communities to see their latest videos here.</p>
                <button 
                    onClick={() => navigate('/community')}
                    className="mt-6 px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold"
                >
                    Discover Communities
                </button>
            </div>
        ) : feedVideos.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-secondary)]">
                <p className="font-semibold text-xl">No new videos from your subscriptions.</p>
                <p className="mt-2">Check back later for new content!</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {feedVideos.map(video => <VideoCard key={video.id} video={video} onEdit={handleEdit} />)}
          </div>
        )}
      </div>
    </div>
  );
};