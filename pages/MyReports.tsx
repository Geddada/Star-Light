import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Flag, ArrowLeft, Clock, Check, ShieldAlert } from 'lucide-react';

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

export const MyReports: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myReports, setMyReports] = useState<Report[]>([]);

  const loadMyReports = useCallback(() => {
    if (!currentUser?.email) {
      return;
    }
    const reportsJson = localStorage.getItem('starlight_reports');
    if (reportsJson) {
      const allReports: Report[] = JSON.parse(reportsJson);
      // Filter for reports made by the current user
      const userReports = allReports.filter(r => r.reporterEmail === currentUser.email);
      setMyReports(userReports);
    }
  }, [currentUser]);

  useEffect(() => {
    loadMyReports();
  }, [loadMyReports]);

  if (!currentUser) return null; // Should be handled by ProtectedRoute

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--background-secondary)] rounded-full md:hidden">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Flag className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Submitted Reports</h1>
      </div>

      <p className="text-[var(--text-secondary)] mb-6">
        Here you can track the status of reports you've submitted. Thank you for helping keep the Starlight community safe.
      </p>

      {myReports.length === 0 ? (
        <div className="text-center py-20 bg-[var(--background-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-primary)]">
          <Flag className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-xl">You haven't reported any content</p>
          <p className="text-[var(--text-secondary)] mt-2">Reports you submit will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myReports.map(report => (
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
                  <p className="font-semibold text-sm text-[var(--text-secondary)] flex items-center gap-2">Your reason for reporting:</p>
                  <p className="text-sm text-[var(--text-primary)]">{report.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};