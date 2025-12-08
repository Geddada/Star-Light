
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report, Video, Playlist as PlaylistType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Flag, Trash2, ArrowLeft, CheckCircle, Clock, ShieldAlert, Check, BookOpen } from 'lucide-react';

const StatusBadge: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const statusMap = {
    'In Review': {
      icon: Clock,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      label: 'In Review'
    },
    'Action Taken': {
      icon: ShieldAlert,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      label: 'Action Taken'
    },
    'Dismissed': {
      icon: Check,
      color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
      label: 'Dismissed'
    }
  };

  const { icon: Icon, color, label } = statusMap[status] || statusMap['In Review'];

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};

export const Reports: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);

  const loadReports = useCallback(() => {
    if (!currentUser) {
      // This should be handled by ProtectedRoute, but as a fallback.
      navigate('/signup');
      return;
    }
    const reportsJson = localStorage.getItem('starlight_reports');
    if (reportsJson) {
      const allReports: Report[] = JSON.parse(reportsJson);
      const userReports = allReports.filter(r => r.video.communityName === currentUser.name);
      setReports(userReports);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDeleteVideo = (videoId: string) => {
    if (window.confirm("Are you sure you want to delete this video? This will remove the video and all associated reports. This cannot be undone.")) {
      
      const updateVideoList = (storageKey: string) => {
        const json = localStorage.getItem(storageKey);
        if(json) {
          let videos: Video[] = JSON.parse(json);
          videos = videos.filter(v => v.id !== videoId);
          localStorage.setItem(storageKey, JSON.stringify(videos));
        }
      };

      const updatePlaylists = () => {
        const json = localStorage.getItem('starlight_playlists');
        if (json) {
          let playlists: PlaylistType[] = JSON.parse(json);
          playlists = playlists.map(p => ({
            ...p,
            videos: p.videos.filter(v => v.id !== videoId)
          }));
          localStorage.setItem('starlight_playlists', JSON.stringify(playlists));
        }
      };

      // Remove video from all user-specific lists
      updateVideoList('starlight_uploaded_videos');
      updateVideoList('watch_history');
      updateVideoList('liked_videos');
      updateVideoList('watch_later_videos');
      updatePlaylists();
      
      // Remove all reports associated with this video from the main reports list
      const allReportsJson = localStorage.getItem('starlight_reports');
      if (allReportsJson) {
          let allReports: Report[] = JSON.parse(allReportsJson);
          allReports = allReports.filter(r => r.video.id !== videoId);
          localStorage.setItem('starlight_reports', JSON.stringify(allReports));
      }

      loadReports(); // Re-load data to update the UI
      window.dispatchEvent(new Event('playlistsUpdated'));
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--background-secondary)] rounded-full md:hidden">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Flag className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Content Reports</h1>
      </div>

      <p className="text-[var(--text-secondary)] mb-6">
        This page lists content you've uploaded that has been reported by the community. Reports are reviewed by our team. Receiving a report does not automatically result in a strike.
      </p>

      {reports.length === 0 ? (
        <div className="text-center py-20 bg-[var(--background-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-primary)]">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="font-semibold text-xl">No active reports</p>
          <p className="text-[var(--text-secondary)] mt-2">None of your content has been reported. Keep up the great work!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-[var(--background-secondary)] p-4 rounded-xl border border-[var(--border-primary)] flex flex-col sm:flex-row gap-4 items-start">
              <img 
                src={report.video.thumbnailUrl} 
                alt={report.video.title} 
                className="w-full sm:w-40 aspect-video rounded-lg object-cover cursor-pointer"
                onClick={() => navigate(`/watch/${report.video.id}`, { state: { video: report.video } })}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)]">Reported on: {new Date(report.reportDate).toLocaleDateString()}</p>
                        <h3 
                            className="font-bold text-md cursor-pointer hover:text-[hsl(var(--accent-color))]" 
                            onClick={() => navigate(`/watch/${report.video.id}`, { state: { video: report.video } })}
                        >
                            {report.video.title}
                        </h3>
                    </div>
                    <StatusBadge status={report.status} />
                </div>
                
                <div className="mt-3 p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg">
                  <p className="font-semibold text-sm text-[var(--text-secondary)] flex items-center gap-2"><Flag className="w-4 h-4" /> Report Reason:</p>
                  <p className="text-sm text-[var(--text-primary)]">{report.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t sm:border-t-0 sm:pt-0 sm:border-l border-[var(--border-primary)] sm:pl-4">
                <button 
                  onClick={() => handleDeleteVideo(report.video.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-sm font-semibold transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" /> <span>Delete Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-blue-500/10 rounded-full text-blue-500">
            <BookOpen className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Copyright School</h3>
            <p className="text-[var(--text-secondary)]">
                Want to learn more about copyright policies and fair use? Take our interactive quiz to test your knowledge and become a better community member.
            </p>
        </div>
        <button 
            onClick={() => navigate('/copyright-school')}
            className="px-6 py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all whitespace-nowrap"
        >
            Start Quiz
        </button>
      </div>
    </div>
  );
};
