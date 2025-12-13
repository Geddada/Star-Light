
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Video } from '../types';
import { fetchVideos } from '../services/gemini';
import { VideoCard } from '../components/VideoCard';
import { ShortsCard } from '../components/ShortsCard';
import { Loader2, Bell, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SUBSCRIPTION_KEY = 'starlight_subscriptions';

export const Channel: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'shorts' | 'about'>('home');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { currentUser } = useAuth();
  const channelName = decodeURIComponent(channelId || '');

  const loadChannelContent = useCallback(async () => {
    setLoading(true);
    
    // Check subscription status
    if (currentUser) {
        const subscriptions: string[] = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || '[]');
        setIsSubscribed(subscriptions.includes(channelName));
    }

    // Load videos (both uploaded and generated for demo)
    const allVideos = await fetchVideos(); // Start with generic pool
    const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
    const uploadedVideos: Video[] = uploadedVideosJSON ? JSON.parse(uploadedVideosJSON) : [];
    
    // Combine and filter
    // Note: In a real app, we'd query by ID. Here we filter by name for the demo.
    const channelVideos = [...uploadedVideos, ...allVideos].filter(v => 
        v.uploaderName === channelName || v.communityName === channelName
    );
    
    // If not enough videos found for this "user", let's deterministically assign some from the pool
    // so every channel looks populated for the demo
    if (channelVideos.length < 5) {
       const seed = channelName.length;
       for (let i = 0; i < 10; i++) {
           channelVideos.push(allVideos[(seed + i) % allVideos.length]);
       }
    }

    setVideos(channelVideos);
    setLoading(false);
  }, [channelName, currentUser]);

  useEffect(() => {
    loadChannelContent();
  }, [loadChannelContent]);

  const handleSubscribe = () => {
      if (!currentUser) return; // Should prompt login
      
      const subscriptions: string[] = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || '[]');
      let newSubscriptions;
      
      if (isSubscribed) {
          newSubscriptions = subscriptions.filter(s => s !== channelName);
      } else {
          newSubscriptions = [...subscriptions, channelName];
      }
      
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSubscriptions));
      setIsSubscribed(!isSubscribed);
      window.dispatchEvent(new Event('subscriptionsChanged'));
  };

  const regularVideos = videos.filter(v => !v.isShort);
  const shortsVideos = videos.filter(v => v.isShort);

  // Mock stats
  const subscriberCount = (channelName.length * 12345).toLocaleString();
  const totalViews = (channelName.length * 98765).toLocaleString();

  if (loading) {
      return (
          <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--accent-color))]" />
          </div>
      );
  }

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
      {/* Banner */}
      <div className="w-full h-40 md:h-64 bg-gray-800 relative overflow-hidden">
          <img 
            src={`https://picsum.photos/seed/${channelName}banner/1200/300`} 
            alt="Channel Banner" 
            className="w-full h-full object-cover"
          />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channelName}`} 
                alt={channelName} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[var(--background-primary)] -mt-12 md:-mt-16 bg-[var(--background-secondary)]"
              />
              <div className="flex-1 pt-2">
                  <h1 className="text-3xl font-bold">{channelName}</h1>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mt-1">
                      <span>@{channelName.replace(/\s/g, '')}</span>
                      <span>•</span>
                      <span>{subscriberCount} subscribers</span>
                      <span>•</span>
                      <span>{videos.length} videos</span>
                  </div>
                  <p className="text-[var(--text-tertiary)] text-sm mt-3 max-w-2xl line-clamp-2">
                      Welcome to the official channel of {channelName}. Join us for amazing content about technology, lifestyle, and everything in between. New videos every week!
                  </p>
                  
                  <div className="mt-4">
                      <button 
                        onClick={handleSubscribe}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${isSubscribed ? 'bg-[var(--background-tertiary)] text-[var(--text-primary)]' : 'bg-[hsl(var(--accent-color))] text-white hover:brightness-90'}`}
                      >
                          {isSubscribed ? (
                              <><Check className="w-4 h-4" /> Subscribed <Bell className="w-4 h-4 ml-1" /></>
                          ) : (
                              'Subscribe'
                          )}
                      </button>
                  </div>
              </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-primary)] mb-6 sticky top-0 bg-[var(--background-primary)] z-10">
              <div className="flex gap-8 overflow-x-auto no-scrollbar">
                  {['Home', 'Videos', 'Shorts', 'About'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                        className={`py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'border-[hsl(var(--accent-color))] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
              {activeTab === 'home' && (
                  <div className="space-y-8">
                      {regularVideos.length > 0 && (
                          <div className="flex flex-col md:flex-row gap-6 mb-8 animate-in fade-in">
                              <div className="md:w-1/3 aspect-video">
                                  <VideoCard video={regularVideos[0]} />
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                  <h2 className="text-xl font-bold mb-2">{regularVideos[0].title}</h2>
                                  <div className="text-sm text-[var(--text-secondary)] mb-4">
                                      {regularVideos[0].views} • {regularVideos[0].uploadDate || regularVideos[0].uploadTime}
                                  </div>
                                  <p className="text-[var(--text-secondary)] line-clamp-4">{regularVideos[0].description}</p>
                              </div>
                          </div>
                      )}
                      
                      {shortsVideos.length > 0 && (
                          <div>
                              <h3 className="text-lg font-bold mb-4">Shorts</h3>
                              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                                  {shortsVideos.slice(0, 6).map(video => (
                                      <ShortsCard key={video.id} video={video} />
                                  ))}
                              </div>
                          </div>
                      )}

                      <div>
                          <h3 className="text-lg font-bold mb-4">Recent Videos</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {regularVideos.slice(1, 9).map(video => (
                                  <VideoCard key={video.id} video={video} />
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'videos' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in">
                      {regularVideos.map(video => (
                          <VideoCard key={video.id} video={video} />
                      ))}
                  </div>
              )}

              {activeTab === 'shorts' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in">
                      {shortsVideos.map(video => (
                          <ShortsCard key={video.id} video={video} />
                      ))}
                  </div>
              )}

              {activeTab === 'about' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
                      <div className="md:col-span-2 space-y-6">
                          <h3 className="text-lg font-bold">Description</h3>
                          <p className="text-[var(--text-secondary)] leading-relaxed">
                              Welcome to the official channel of {channelName}! Here we create content that inspires and entertains. 
                              Make sure to subscribe and hit the notification bell so you never miss an update.
                              <br/><br/>
                              Business inquiries: business@{channelName.toLowerCase().replace(/\s/g, '')}.com
                          </p>
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-lg font-bold">Stats</h3>
                          <div className="space-y-3 text-sm text-[var(--text-secondary)] border-t border-[var(--border-primary)] pt-4">
                              <p>Joined {new Date().toLocaleDateString()}</p>
                              <p>{totalViews} views</p>
                              <p>{videos.length} videos</p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
