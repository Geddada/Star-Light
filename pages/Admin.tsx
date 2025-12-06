import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report, Video, Playlist } from '../types';
import { LayoutDashboard, Flag, Trash2, Check, ShieldAlert, Clock, X, BarChart, Users, Film } from 'lucide-react';

const ReportStatusBadge: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const statusMap = {
    'In Review': { icon: Clock, color: 'text-blue-500 bg-blue-500/10', label: 'In Review' },
    'Action Taken': { icon: ShieldAlert, color: 'text-red-500 bg-red-500/10', label: 'Action Taken' },
    'Dismissed': { icon: Check, color: 'text-gray-500 bg-gray-500/10', label: 'Dismissed' }
  };
  const { icon: Icon, color, label } = statusMap[status] || statusMap['In Review'];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllReports = useCallback(() => {
    setLoading(true);
    const reportsJson = localStorage.getItem('starlight_reports');
    const allReports: Report[] = reportsJson ? JSON.parse(reportsJson) : [];
    setReports(allReports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllReports();
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
      
      // Remove video from all possible locations
      const videoStorageKeys = ['geminitube_uploaded_videos', 'watch_history', 'liked_videos', 'watch_later_videos'];
      videoStorageKeys.forEach(storageKey => {
        const json = localStorage.getItem(storageKey);
        if(json) {
          let videos: Video[] = JSON.parse(json);
          videos = videos.filter(v => v.id !== videoId);
          localStorage.setItem(storageKey, JSON.stringify(videos));
        }
      });

      // Remove video from playlists
      const playlistsJson = localStorage.getItem('starlight_playlists');
      if (playlistsJson) {
        let playlists: Playlist[] = JSON.parse(playlistsJson);
        playlists = playlists.map(p => ({ ...p, videos: p.videos.filter(v => v.id !== videoId) }));
        localStorage.setItem('starlight_playlists', JSON.stringify(playlists));
        window.dispatchEvent(new Event('playlistsUpdated'));
      }
      
      // Update status of all reports for this video to 'Action Taken'
      const updatedReports = reports.map(r => r.video.id === videoId ? { ...r, status: 'Action Taken' as const } : r);
      setReports(updatedReports);
      localStorage.setItem('starlight_reports', JSON.stringify(updatedReports));
    }
  };

  const activeReports = reports.filter(r => r.status === 'In Review');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-8 h-8 text-[hsl(var(--accent-color))]" />
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><Flag className="w-6 h-6"/></div>
                <div>
                    <p className="text-3xl font-bold">{activeReports.length}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Active Reports</p>
                </div>
            </div>
          </div>
          <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Users className="w-6 h-6"/></div>
                <div>
                    <p className="text-3xl font-bold">1,234</p>
                    <p className="text-sm text-[var(--text-secondary)]">Total Users (mock)</p>
                </div>
            </div>
          </div>
          <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><Film className="w-6 h-6"/></div>
                <div>
                    <p className="text-3xl font-bold">5,678</p>
                    <p className="text-sm text-[var(--text-secondary)]">Total Videos (mock)</p>
                </div>
            </div>
          </div>
      </div>

      <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)]">
            <h2 className="text-xl font-bold">All Content Reports</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-[var(--background-tertiary)]/50 text-xs text-[var(--text-secondary)] uppercase">
                    <tr>
                        <th className="px-4 py-3">Video</th>
                        <th className="px-4 py-3">Reported By</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} className="text-center p-8">Loading reports...</td></tr>
                    ) : reports.length === 0 ? (
                        <tr><td colSpan={6} className="text-center p-8 text-[var(--text-secondary)]">No reports found.</td></tr>
                    ) : (
                        reports.map(report => (
                            <tr key={report.id} className="border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--background-tertiary)]/30">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <img src={report.video.thumbnailUrl} alt={report.video.title} className="w-20 aspect-video rounded-md object-cover" />
                                        <div className="max-w-xs">
                                            <p className="font-bold truncate hover:underline cursor-pointer" onClick={() => navigate(`/watch/${report.video.id}`)}>{report.video.title}</p>
                                            <p className="text-xs text-[var(--text-tertiary)]">by {report.video.communityName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-[var(--text-secondary)]">{report.reporterEmail}</td>
                                <td className="px-4 py-3 font-medium">{report.reason}</td>
                                <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(report.reportDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3"><ReportStatusBadge status={report.status} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                      {report.status === 'In Review' && (
                                        <>
                                            <button 
                                                onClick={() => handleDismiss(report.id)}
                                                title="Dismiss Report"
                                                className="p-2 text-gray-500 hover:bg-gray-500/10 rounded-md"
                                            ><X className="w-4 h-4" /></button>
                                            <button
                                                onClick={() => handleRemoveVideo(report.video.id, report.video.title)}
                                                title="Remove Video"
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-md"
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
        </div>
      </div>
    </div>
  );
};