import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchChannelAnalytics } from '../services/gemini';
import { AnalyticsData, Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Eye, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  PieChart
} from 'lucide-react';
import { UploadModal } from '../components/UploadModal';

// Simple SVG Line Chart Component
const LineChart: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 60 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height; // Invert Y because SVG coords go down
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-md"
      />
      <polygon
         fill={color}
         fillOpacity="0.1"
         points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  );
};

const MetricCard: React.FC<{ 
  title: string; 
  value: string; 
  subtext: string; 
  icon: React.ElementType; 
  trend?: 'up' | 'down';
  data?: number[];
}> = ({ title, value, subtext, icon: Icon, trend = 'up', data }) => (
  <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] flex flex-col justify-between h-full hover:border-[hsl(var(--accent-color))] transition-colors group">
    <div className="flex justify-between items-start mb-4">
       <div className="p-3 rounded-xl bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))]">
          <Icon className="w-6 h-6" />
       </div>
       {trend === 'up' ? (
         <div className="flex items-center text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-bold">
            <TrendingUp className="w-3 h-3 mr-1" /> +12%
         </div>
       ) : (
         <div className="flex items-center text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-bold">
            <TrendingUp className="w-3 h-3 mr-1 rotate-180" /> -2.4%
         </div>
       )}
    </div>
    <div>
      <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-2">{subtext}</p>
    </div>
    {data && (
       <div className="h-12 mt-4 w-full">
          <LineChart data={data} color={trend === 'up' ? '#22c55e' : '#ef4444'} height={40} />
       </div>
    )}
  </div>
);

export const Analytics: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('28d');
  const [showViews, setShowViews] = useState(true);
  const [showRevenue, setShowRevenue] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchAnalyticsData = () => {
    if (currentUser) {
      setLoading(true);
      fetchChannelAnalytics(currentUser.name).then(analytics => {
        setData(analytics);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [currentUser]);

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    fetchAnalyticsData();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[var(--background-primary)]">
        <BarChart2 className="w-24 h-24 text-[hsl(var(--accent-color))] mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Channel Analytics</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          Sign in to view deep insights about your channel performance.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="px-8 py-3 bg-[hsl(var(--accent-color))] text-white font-semibold rounded-full filter hover:brightness-90 transition-colors shadow-lg"
        >
           Sign In
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
       <div className="p-6 md:p-10 max-w-7xl mx-auto w-full h-full animate-pulse">
          <div className="h-10 bg-[var(--background-secondary)] w-1/3 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             {[1,2,3,4].map(i => <div key={i} className="h-40 bg-[var(--background-secondary)] rounded-2xl"></div>)}
          </div>
          <div className="h-64 bg-[var(--background-secondary)] rounded-2xl mb-8"></div>
       </div>
    );
  }

  // Prepare chart data arrays
  const viewData = data.dailyViews.map(d => d.views);
  const revenueData = data.dailyViews.map(d => d.revenue);

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
       {showUploadModal && (
        <UploadModal
          onClose={handleCloseModal}
          onUploadSuccess={handleUploadSuccess}
          videoToEdit={editingVideo}
        />
      )}
       <div className="max-w-[1600px] mx-auto p-6 md:p-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                   Channel Analytics
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">Overview of your channel's performance</p>
             </div>
             
             <div className="flex items-center bg-[var(--background-secondary)] rounded-lg p-1 border border-[var(--border-primary)] self-start">
                {['7d', '28d', '90d', '365d'].map(range => (
                   <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range ? 'bg-[hsl(var(--accent-color))] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                   >
                      {range}
                   </button>
                ))}
             </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             <MetricCard 
                title="Total Views" 
                value={data.totalViews} 
                subtext="vs previous 28 days" 
                icon={Eye} 
                data={viewData}
             />
             <MetricCard 
                title="Watch Time (Hours)" 
                value={data.watchTimeHours} 
                subtext="vs previous 28 days" 
                icon={Clock} 
                trend="down"
                data={[40, 35, 50, 45, 30, 25, 40, 35, 30, 20, 15, 25, 30, 28]} // Mock specific trend
             />
             <MetricCard 
                title="Subscribers" 
                value={data.subscribersGained} 
                subtext="vs previous 28 days" 
                icon={Users} 
             />
             <MetricCard 
                title="Est. Revenue" 
                value={data.estimatedRevenue} 
                subtext="vs previous 28 days" 
                icon={DollarSign} 
                data={revenueData}
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
             {/* Main Chart Area */}
             <div className="lg:col-span-2 bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-lg">Views & Revenue Overview</h3>
                   <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowViews(!showViews)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${showViews ? 'bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))]' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--accent-color))]"></div>
                        Views
                      </button>
                      <button
                        onClick={() => setShowRevenue(!showRevenue)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${showRevenue ? 'bg-green-500/10 text-green-500' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        Revenue
                      </button>
                   </div>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="h-64 w-full flex items-end gap-2 sm:gap-4 justify-between">
                   {data.dailyViews.map((day, i) => {
                      const maxView = Math.max(...viewData, 1);
                      const maxRevenue = Math.max(...revenueData, 1);
                      const viewHeightPercent = showViews ? Math.max((day.views / maxView) * 100, 2) : 0;
                      const revenueHeightPercent = showRevenue ? Math.max((day.revenue / maxRevenue) * 100, 2) : 0;
                      
                      return (
                         <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            {/* Tooltip */}
                            {(showViews || showRevenue) && (
                               <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 left-1/2 -translate-x-1/2">
                                  {showViews && <span>{day.views.toLocaleString()} views</span>}
                                  {showViews && showRevenue && <span className="mx-1">•</span>}
                                  {showRevenue && <span>${day.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}
                               </div>
                            )}
                            
                            {/* Bars */}
                            <div className="w-full h-full flex items-end justify-center gap-1 relative">
                               {showViews && (
                                   <div
                                     className="w-full bg-[hsl(var(--accent-color))] opacity-80 rounded-t-sm transition-all group-hover:opacity-100"
                                     style={{ height: `${viewHeightPercent}%` }}
                                   ></div>
                               )}
                               {showRevenue && (
                                   <div
                                     className="w-full bg-green-500 opacity-80 rounded-t-sm transition-all group-hover:opacity-100"
                                     style={{ height: `${revenueHeightPercent}%` }}
                                   ></div>
                               )}
                            </div>
                            
                            <span className="text-xs text-[var(--text-tertiary)]">{day.date}</span>
                         </div>
                      );
                   })}
                </div>
             </div>

             {/* AI Insight Panel */}
             <div className="bg-gradient-to-br from-[hsl(var(--accent-color))]/20 to-blue-900/20 p-6 rounded-2xl border border-[hsl(var(--accent-color))]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4 text-[hsl(var(--accent-color))] font-bold">
                      <Sparkles className="w-5 h-5" />
                      <span>Gemini Insights</span>
                   </div>
                   <p className="text-lg font-medium leading-relaxed mb-4">
                      "{data.audienceInsight}"
                   </p>
                   <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between p-3 bg-[var(--background-primary)]/50 rounded-lg backdrop-blur-sm">
                         <span className="text-sm font-medium">Audience Retention</span>
                         <span className="text-green-400 font-bold text-sm flex items-center gap-1">High <ArrowUpRight className="w-4 h-4"/></span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[var(--background-primary)]/50 rounded-lg backdrop-blur-sm">
                         <span className="text-sm font-medium">Click-Through Rate</span>
                         <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">Avg <TrendingUp className="w-4 h-4"/></span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Top Content */}
          <div className="mb-8">
             <h2 className="text-xl font-bold mb-6">Top Performing Content</h2>
             <div className="bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-primary)] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-primary)]">
                   {data.topContent.map((video, i) => (
                      <div key={video.id} className="p-4 hover:bg-[var(--background-tertiary)] transition-colors group">
                         <div className="flex items-center justify-between mb-3">
                             <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">#{i+1} Ranked</span>
                             <ArrowUpRight className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <VideoCard video={video} compact onEdit={handleEdit} />
                         <div className="flex justify-between mt-4 pt-4 border-t border-[var(--border-primary)] text-sm">
                            <div>
                               <p className="font-bold">{video.views}</p>
                               <p className="text-xs text-[var(--text-tertiary)]">Views</p>
                            </div>
                             <div className="text-right">
                               <p className="font-bold text-green-500">95.4%</p>
                               <p className="text-xs text-[var(--text-tertiary)]">Likes</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

           {/* Demographics / Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-6">
                   <PieChart className="w-5 h-5 text-[var(--text-secondary)]" />
                   <h3 className="font-bold text-lg">Age & Gender</h3>
                </div>
                <div className="space-y-4">
                   {/* Mock Bars */}
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                         <span>18-24 years</span>
                         <span className="font-bold">45%</span>
                      </div>
                      <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-[45%]"></div>
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                         <span>25-34 years</span>
                         <span className="font-bold">30%</span>
                      </div>
                      <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                         <div className="h-full bg-purple-500 w-[30%]"></div>
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                         <span>35-44 years</span>
                         <span className="font-bold">15%</span>
                      </div>
                      <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                         <div className="h-full bg-orange-500 w-[15%]"></div>
                      </div>
                   </div>
                </div>
             </div>

              <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-6">
                   <Calendar className="w-5 h-5 text-[var(--text-secondary)]" />
                   <h3 className="font-bold text-lg">When your viewers are on</h3>
                </div>
                <div className="grid grid-cols-7 gap-1 h-40">
                   {Array.from({length: 7}).map((_, col) => (
                      <div key={col} className="flex flex-col gap-1 h-full">
                         {Array.from({length: 6}).map((_, row) => {
                             // Generate a random intensity for heat map
                             const opacity = Math.random();
                             return (
                                <div 
                                   key={row} 
                                   className="flex-1 rounded-sm bg-[hsl(var(--accent-color))]"
                                   style={{ opacity: opacity > 0.2 ? opacity : 0.1 }}
                                ></div>
                             );
                         })}
                         <span className="text-[10px] text-center text-[var(--text-tertiary)]">
                            {['M','T','W','T','F','S','S'][col]}
                         </span>
                      </div>
                   ))}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">
                   Darker color indicates more active viewers.
                </p>
             </div>
          </div>

       </div>
    </div>
  );
};