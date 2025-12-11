
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report, Video, Playlist } from '../types';
import { 
  LayoutDashboard, Flag, Trash2, Check, ShieldAlert, Clock, X, 
  BarChart2, Users, Film, DollarSign, TrendingUp, Activity, 
  Server, Database, Cpu, AlertTriangle, CheckCircle, RefreshCw,
  Search, FileText, Bell, Loader2
} from 'lucide-react';

const ReportStatusBadge: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const statusMap = {
    'In Review': { icon: Clock, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: 'In Review' },
    'Action Taken': { icon: ShieldAlert, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Action Taken' },
    'Dismissed': { icon: Check, color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', label: 'Dismissed' }
  };
  const { icon: Icon, color, label } = statusMap[status] || statusMap['In Review'];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
};

const SimpleLineChart: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 40 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
         fill={color}
         fillOpacity="0.1"
         points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  );
};

const AdminStatCard: React.FC<{
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ElementType;
    chartData: number[];
    colorClass: string;
}> = ({ title, value, trend, trendUp, icon: Icon, chartData, colorClass }) => (
    <div className="bg-[var(--background-secondary)] p-5 rounded-xl border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-[var(--text-secondary)] text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
        </div>
        <div className="flex items-end justify-between relative z-10">
            <div className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {trend}
            </div>
            <div className="h-8 w-24">
                <SimpleLineChart data={chartData} color={trendUp ? '#22c55e' : '#ef4444'} height={32} />
            </div>
        </div>
    </div>
);

const SystemHealthItem: React.FC<{ label: string; status: 'healthy' | 'warning' | 'critical'; value: string; icon: React.ElementType }> = ({ label, status, value, icon: Icon }) => {
    const statusColor = status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center justify-between p-3 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)]">
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[var(--text-secondary)]">{value}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-[0_0_8px_rgba(0,0,0,0.2)]`}></div>
            </div>
        </div>
    );
};

const ActivityLogItem: React.FC<{ action: string; time: string; user: string; type: 'info' | 'warning' | 'success' }> = ({ action, time, user, type }) => {
    const bgClass = type === 'success' ? 'bg-green-500/10 text-green-500' : type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500';
    return (
        <div className="flex gap-3 items-start pb-4 border-b border-[var(--border-primary)] last:border-0 last:pb-0">
            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] font-medium leading-tight">{action}</p>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-[var(--text-tertiary)]">{user}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{time}</p>
                </div>
            </div>
        </div>
    );
};

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadAllReports = useCallback(() => {
    setLoading(true);
    const reportsJson = localStorage.getItem('starlight_reports');
    const allReports: Report[] = reportsJson ? JSON.parse(reportsJson) : [];
    setReports(allReports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()));
    setLoading(false);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    loadAllReports();
    // Simulate periodic refresh for system stats
    const interval = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(interval);
  }, [loadAllReports]);

  const updateReportStatus = (reportId: string, status: Report['status']) => {
    const updatedReports = reports.map(r => r.id === reportId ? { ...r, status } : r);
    setReports(updatedReports);
    localStorage.setItem('starlight_reports', JSON.stringify(updatedReports));
  };
  
  const handleDismiss = (reportId: string) => {
    updateReportStatus(reportId, 'Dismissed');
  };

  const handleRemoveVideo = (videoId: string, videoTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${videoTitle}"? This will remove the video and ALL associated reports. This is a permanent action.`)) {
      
      const videoStorageKeys = ['starlight_uploaded_videos', 'watch_history', 'liked_videos', 'watch_later_videos'];
      videoStorageKeys.forEach(storageKey => {
        const json = localStorage.getItem(storageKey);
        if(json) {
          let videos: Video[] = JSON.parse(json);
          videos = videos.filter(v => v.id !== videoId);
          localStorage.setItem(storageKey, JSON.stringify(videos));
        }
      });

      const playlistsJson = localStorage.getItem('starlight_playlists');
      if (playlistsJson) {
        let playlists: Playlist[] = JSON.parse(playlistsJson);
        playlists = playlists.map(p => ({ ...p, videos: p.videos.filter(v => v.id !== videoId) }));
        localStorage.setItem('starlight_playlists', JSON.stringify(playlists));
        window.dispatchEvent(new Event('playlistsUpdated'));
      }
      
      const updatedReports = reports.map(r => r.video.id === videoId ? { ...r, status: 'Action Taken' as const } : r);
      setReports(updatedReports);
      localStorage.setItem('starlight_reports', JSON.stringify(updatedReports));
    }
  };

  const activeReports = reports.filter(r => r.status === 'In Review');

  // Mock Data for Dashboard
  const revenueData = [12, 19, 15, 25, 32, 30, 45, 40, 55, 60, 58, 65];
  const trafficData = [400, 450, 420, 480, 550, 600, 580, 650, 700, 750, 800, 850];
  const uploadData = [10, 15, 12, 20, 25, 22, 30, 28, 35, 40, 38, 45];
  const reportData = [5, 3, 4, 6, 2, 5, 3, 4, 2, 1, 3, 2]; // Inverse logic for trend color

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[hsl(var(--accent-color))]/10 rounded-lg">
                <LayoutDashboard className="w-8 h-8 text-[hsl(var(--accent-color))]" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
                <p className="text-sm text-[var(--text-secondary)]">Platform Overview & Management</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-tertiary)] bg-[var(--background-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-primary)] flex items-center gap-2">
                <Clock className="w-3 h-3" /> Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button onClick={loadAllReports} className="p-2 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] rounded-full border border-[var(--border-primary)] transition-colors">
                <RefreshCw className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatCard 
            title="Total Revenue" 
            value="$12,450.00" 
            trend="+15%" 
            trendUp={true} 
            icon={DollarSign} 
            chartData={revenueData} 
            colorClass="text-green-500"
          />
          <AdminStatCard 
            title="Active Users" 
            value="4,320" 
            trend="+8%" 
            trendUp={true} 
            icon={Users} 
            chartData={trafficData} 
            colorClass="text-blue-500"
          />
          <AdminStatCard 
            title="New Videos" 
            value="156" 
            trend="+22%" 
            trendUp={true} 
            icon={Film} 
            chartData={uploadData} 
            colorClass="text-purple-500"
          />
          <AdminStatCard 
            title="Active Reports" 
            value={activeReports.length.toString()} 
            trend={activeReports.length > 5 ? "+2%" : "-5%"} 
            trendUp={activeReports.length <= 5} 
            icon={Flag} 
            chartData={reportData} 
            colorClass="text-red-500"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Traffic Chart Placeholder */}
              <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Traffic Overview</h3>
                      <select className="bg-[var(--background-primary)] border border-[var(--border-primary)] text-xs rounded-lg px-2 py-1 outline-none">
                          <option>Last 30 Days</option>
                          <option>Last 7 Days</option>
                          <option>Last 24 Hours</option>
                      </select>
                  </div>
                  <div className="h-64 w-full bg-[var(--background-tertiary)]/30 rounded-lg border border-[var(--border-primary)] flex items-end justify-between p-4 gap-1">
                      {/* Simple CSS Bar Chart Simulation for Traffic */}
                      {Array.from({ length: 30 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-[hsl(var(--accent-color))] opacity-80 hover:opacity-100 transition-opacity rounded-t-sm w-full"
                            style={{ height: `${30 + Math.random() * 60}%` }}
                          ></div>
                      ))}
                  </div>
              </div>

              {/* Reports Table */}
              <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" /> Content Moderation
                    </h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                            <input type="text" placeholder="Search reports..." className="pl-9 pr-4 py-1.5 text-xs bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-md outline-none focus:ring-1 focus:ring-[hsl(var(--accent-color))]" />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--background-tertiary)]/50 text-xs text-[var(--text-secondary)] uppercase">
                            <tr>
                                <th className="px-4 py-3">Video</th>
                                <th className="px-4 py-3">Reason</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-8 text-[var(--text-secondary)]"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading reports...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan={4} className="text-center p-8 text-[var(--text-secondary)]">No reports found.</td></tr>
                            ) : (
                                reports.slice(0, 10).map(report => (
                                    <tr key={report.id} className="border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--background-tertiary)]/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={report.video.thumbnailUrl} alt={report.video.title} className="w-16 aspect-video rounded object-cover border border-[var(--border-primary)]" />
                                                <div className="max-w-[200px]">
                                                    <p className="font-bold truncate text-sm hover:underline cursor-pointer" onClick={() => navigate(`/watch/${report.video.id}`)}>{report.video.title}</p>
                                                    <p className="text-[10px] text-[var(--text-tertiary)]">by {report.video.communityName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-xs bg-[var(--background-primary)] px-2 py-1 rounded border border-[var(--border-primary)]">{report.reason}</span>
                                            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Reported by: {report.reporterEmail}</p>
                                        </td>
                                        <td className="px-4 py-3"><ReportStatusBadge status={report.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                              {report.status === 'In Review' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleDismiss(report.id)}
                                                        title="Dismiss Report"
                                                        className="p-1.5 text-gray-500 hover:bg-gray-500/10 rounded-md transition-colors"
                                                    ><X className="w-4 h-4" /></button>
                                                    <button
                                                        onClick={() => handleRemoveVideo(report.video.id, report.video.title)}
                                                        title="Remove Video"
                                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                    ><Trash2 className="w-4 h-4" /></button>
                                                </>
                                              )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {reports.length > 10 && <div className="p-3 text-center text-xs font-semibold text-[hsl(var(--accent-color))] cursor-pointer hover:bg-[var(--background-tertiary)] transition-colors border-t border-[var(--border-primary)]">View All Reports</div>}
                </div>
              </div>
          </div>

          {/* RIGHT COLUMN (1/3 width) */}
          <div className="space-y-8">
              {/* System Health */}
              <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500"/> System Health
                  </h3>
                  <div className="space-y-3">
                      <SystemHealthItem label="API Latency" status="healthy" value="24ms" icon={Server} />
                      <SystemHealthItem label="Database" status="healthy" value="Connected" icon={Database} />
                      <SystemHealthItem label="Storage Usage" status="warning" value="82%" icon={Database} />
                      <SystemHealthItem label="AI Services" status="healthy" value="Operational" icon={Cpu} />
                  </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-500"/> Recent Logs
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                      <ActivityLogItem action="Updated system settings" time="2m ago" user="Admin" type="info" />
                      <ActivityLogItem action="Banned user 'spam_bot_99'" time="15m ago" user="Priya S." type="warning" />
                      <ActivityLogItem action="Approved ad 'Summer Sale'" time="1h ago" user="John S." type="success" />
                      <ActivityLogItem action="Deleted video 'Copyright v...'" time="2h ago" user="AutoMod" type="warning" />
                      <ActivityLogItem action="Server backup completed" time="4h ago" user="System" type="success" />
                  </div>
                  <button className="w-full mt-4 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline" onClick={() => navigate('/admin/activities')}>View Full Activity Log</button>
              </div>

              {/* Quick Actions */}
              <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                  <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => navigate('/admin/user-management')} className="p-3 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold flex flex-col items-center gap-2 transition-colors">
                          <Users className="w-5 h-5 text-blue-500" /> Manage Users
                      </button>
                      <button onClick={() => navigate('/community/create')} className="p-3 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold flex flex-col items-center gap-2 transition-colors">
                          <Users className="w-5 h-5 text-green-500" /> New Community
                      </button>
                      <button onClick={() => navigate('/admin/ad-settings')} className="p-3 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold flex flex-col items-center gap-2 transition-colors">
                          <DollarSign className="w-5 h-5 text-amber-500" /> Manage Ads
                      </button>
                      <button onClick={() => navigate('/admin/content')} className="p-3 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold flex flex-col items-center gap-2 transition-colors">
                          <FileText className="w-5 h-5 text-purple-500" /> All Content
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
