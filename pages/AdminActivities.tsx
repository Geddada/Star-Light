import React, { useState, useEffect, useCallback } from 'react';
import { generateAdminActivities } from '../services/gemini';
import { Activity as ActivityType } from '../types';
import { Loader2, Activity, ShieldAlert, Check, Trash2, Settings, RefreshCw } from 'lucide-react';

const ADMIN_ROLES = ['Lead Admin', 'Content Moderator', 'Ad Manager', 'Regional Lead', 'Community Manager', 'Analytics Expert'];

const ActivityIcon: React.FC<{ type: ActivityType['type'] }> = ({ type }) => {
    switch (type) {
        case 'delete_video':
            return <Trash2 className="w-5 h-5 text-red-500" />;
        case 'update_setting':
            return <Settings className="w-5 h-5 text-blue-500" />;
        case 'ban_user':
            return <ShieldAlert className="w-5 h-5 text-orange-500" />;
        case 'review_report':
            return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
        case 'approve_ad':
            return <Check className="w-5 h-5 text-green-500" />;
        default:
            return <Activity className="w-5 h-5 text-gray-500" />;
    }
};

const AdminColumn: React.FC<{ adminName: string }> = ({ adminName }) => {
    const [activities, setActivities] = useState<ActivityType[]>([]);
    const [loading, setLoading] = useState(true);

    const loadActivities = useCallback(async () => {
        setLoading(true);
        const data = await generateAdminActivities(adminName);
        setActivities(data);
        setLoading(false);
    }, [adminName]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    return (
        <div className="bg-[var(--background-secondary)] p-4 rounded-xl border border-[var(--border-primary)] flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${adminName.replace(/\s/g, '')}`} alt={adminName} className="w-10 h-10 rounded-full bg-slate-700" />
                    <h2 className="text-xl font-bold">{adminName}</h2>
                </div>
                <button
                    onClick={loadActivities}
                    disabled={loading}
                    className="p-2 text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh Activities"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--accent-color))]" />
                    </div>
                ) : (
                    activities.map((activity, index) => (
                        <div key={index} className="flex gap-4 animate-in fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex-shrink-0 mt-1">
                                <ActivityIcon type={activity.type} />
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-primary)] leading-tight">{activity.description}</p>
                                <p className="text-xs text-[var(--text-tertiary)] mt-1">{activity.timestamp}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// This component is being used for the Admin Activities page.
export const AdminActivities: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-[hsl(var(--accent-color))]" />
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Activity Log</h1>
            </div>
            <p className="text-[var(--text-secondary)] mb-6 max-w-3xl">
                A real-time, AI-generated feed of activities from different admin roles on the platform. Each column is generated independently by Gemini.
            </p>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                {ADMIN_ROLES.map(role => (
                    <div key={role} className="overflow-hidden">
                         <AdminColumn adminName={role} />
                    </div>
                ))}
            </div>
        </div>
    );
};