
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchChannelAnalytics } from '../services/gemini';
import { AnalyticsData, Video } from '../types';
import { 
  ArrowUp, CheckCircle, Newspaper, PenTool, Home,
} from 'lucide-react';

export const Studio: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [latestVideo, setLatestVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      setLoading(true);
      
      // Load local uploaded videos to find the latest one
      const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
      if (uploadedVideosJSON) {
        const videos: Video[] = JSON.parse(uploadedVideosJSON);
        const userVideos = videos.filter(v => v.uploaderName === currentUser.name);
        if (userVideos.length > 0) {
          setLatestVideo(userVideos[0]); // Assuming index 0 is latest
        }
      }

      // Fetch analytics
      const data = await fetchChannelAnalytics(currentUser.name);
      setAnalytics(data);
      setLoading(false);
    };
    loadData();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto bg-[var(--background-secondary)] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Channel Dashboard</h1>
            <button onClick={() => navigate('/')} className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1 mt-1">
                <Home className="w-3 h-3" /> Back to StarLight
            </button>
        </div>
        <div className="flex gap-3">
            <button onClick={() => navigate('/news-overlay')} className="flex items-center gap-2 px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--background-tertiary)] transition-colors">
                <Newspaper className="w-4 h-4" /> News Overlay Tool
            </button>
            <button onClick={() => navigate('/ads/create')} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-color))] text-white rounded-lg text-sm font-semibold hover:brightness-90 transition-colors shadow-sm">
                <PenTool className="w-4 h-4" /> Create Ad
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Latest Video */}
        <div className="space-y-6">
            <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border-primary)]">
                    <h3 className="font-bold text-lg">Latest Video Performance</h3>
                </div>
                {latestVideo ? (
                    <div className="p-4">
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-black group cursor-pointer" onClick={() => navigate(`/watch/${latestVideo.id}`)}>
                            <img src={latestVideo.thumbnailUrl} alt={latestVideo.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">{latestVideo.duration}</div>
                        </div>
                        <h4 className="font-bold text-base mb-1 line-clamp-1">{latestVideo.title}</h4>
                        <p className="text-xs text-[var(--text-tertiary)] mb-4">Uploaded {latestVideo.uploadDate || 'Just now'}</p>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-secondary)]">Ranking by views</span>
                                <span className="font-bold">1 of 10</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-secondary)]">Views</span>
                                <span className="font-bold flex items-center gap-1">{latestVideo.views} <ArrowUp className="w-3 h-3 text-green-500" /></span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-secondary)]">Impressions click-through rate</span>
                                <span className="font-bold flex items-center gap-1">8.4% <ArrowUp className="w-3 h-3 text-green-500" /></span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-secondary)]">Average view duration</span>
                                <span className="font-bold flex items-center gap-1">4:20 <CheckCircle className="w-3 h-3 text-gray-400" /></span>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
                            <button onClick={() => navigate(`/analytics`)} className="text-[hsl(var(--accent-color))] text-sm font-bold hover:underline uppercase tracking-wide">Go to Video Analytics</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-[var(--text-secondary)]">
                        <p>No videos uploaded yet.</p>
                        <button onClick={() => navigate('/content')} className="mt-2 text-[hsl(var(--accent-color))] font-bold hover:underline">Upload a video</button>
                    </div>
                )}
            </div>
        </div>

        {/* Middle Column: Analytics */}
        <div className="space-y-6">
            <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border-primary)]">
                    <h3 className="font-bold text-lg">Channel Analytics</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-[var(--text-secondary)]">Current subscribers</p>
                    <h2 className="text-4xl font-bold mt-1 mb-6">1,234</h2>
                    
                    <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">Summary</h4>
                        <p className="text-xs text-[var(--text-tertiary)] -mt-1">Last 28 days</p>
                        
                        <div className="flex justify-between items-center text-sm pt-2">
                            <span className="text-[var(--text-secondary)]">Views</span>
                            <span className="font-bold">{loading ? '...' : analytics?.totalViews || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text-secondary)]">Watch time (hours)</span>
                            <span className="font-bold">{loading ? '...' : analytics?.watchTimeHours || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text-secondary)]">Estimated Revenue</span>
                            <span className="font-bold">{loading ? '...' : analytics?.estimatedRevenue || '$0.00'}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
                        <button onClick={() => navigate('/analytics')} className="text-[hsl(var(--accent-color))] text-sm font-bold hover:underline uppercase tracking-wide">Go to Channel Analytics</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: News & Ideas */}
        <div className="space-y-6">
            <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border-primary)]">
                    <h3 className="font-bold text-lg">News</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="group cursor-pointer" onClick={() => navigate('/labs')}>
                        <div className="aspect-video bg-[var(--background-tertiary)] rounded mb-2 overflow-hidden relative">
                             <img src="https://picsum.photos/seed/news1/300/160" className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="News" />
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <h4 className="font-bold text-sm group-hover:text-[hsl(var(--accent-color))] transition-colors">New Tools for Creators: Starlight Labs</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">We've launched Veo video generation and advanced analytics for Premium users. Check it out!</p>
                    </div>
                    <div className="pt-2">
                        <button onClick={() => navigate('/press')} className="text-[hsl(var(--accent-color))] text-sm font-bold hover:underline uppercase tracking-wide">Read More</button>
                    </div>
                </div>
            </div>
            
            <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border-primary)]">
                    <h3 className="font-bold text-lg">Creator Insider</h3>
                </div>
                <div className="p-4">
                    <div className="flex gap-3">
                        <div className="w-1/3 aspect-video bg-black rounded overflow-hidden">
                            <img src="https://picsum.photos/seed/insider/200/110" className="w-full h-full object-cover" alt="Insider" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">This week at Starlight</h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">Hello Insiders! We're discussing the new Shorts algorithm update and monetization policies.</p>
                        </div>
                    </div>
                     <div className="mt-4 pt-2">
                        <button className="text-[hsl(var(--accent-color))] text-sm font-bold hover:underline uppercase tracking-wide">Watch on Starlight</button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
