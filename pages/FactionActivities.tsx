import React, { useState, useEffect, useCallback } from 'react';
import { generateActivities } from '../services/gemini';
import { Activity as ActivityType } from '../types';
import { Loader2, Activity, Video, MessageSquare, ThumbsUp, UserPlus, Award, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FACTIONS = ['User-1', 'User-2', 'User-3'];

const ActivityIcon: React.FC<{ type: ActivityType['type'] }> = ({ type }) => {
    switch (type) {
        case 'upload':
            return <Video className="w-5 h-5 text-sky-500" />;
        case 'comment':
            return <MessageSquare className="w-5 h-5 text-green-500" />;
        case 'like':
            return <ThumbsUp className="w-5 h-5 text-red-500" />;
        case 'subscribe':
            return <UserPlus className="w-5 h-5 text-purple-500" />;
        case 'milestone':
            return <Award className="w-5 h-5 text-amber-500" />;
        default:
            return <Activity className="w-5 h-5 text-gray-500" />;
    }
};

const FactionColumn: React.FC<{ factionName: string }> = ({ factionName }) => {
    const [activities, setActivities] = useState<ActivityType[]>([]);
    const [loading, setLoading] = useState(true);

    const loadActivities = useCallback(async () => {
        setLoading(true);
        const data = await generateActivities(factionName);
        setActivities(data);
        setLoading(false);
    }, [factionName]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    return (
        <div className="bg-[var(--background-secondary)] p-4 rounded-xl border border-[var(--border-primary)] flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${factionName}`} alt={factionName} className="w-10 h-10 rounded-full bg-slate-700" />
                    <h2 className="text-xl font-bold">{factionName}</h2>
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


export const FactionActivities: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // This is a placeholder, ProtectedRoute should handle this ideally.
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Please sign in to view this page.</h2>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-[hsl(var(--accent-color))]" />
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Faction Activities</h1>
            </div>
            <p className="text-[var(--text-secondary)] mb-6 max-w-3xl">
                A real-time, AI-generated feed of activities from different user factions on the platform. Each column is generated independently by Gemini. Click the refresh button on a column to generate new activities for that user.
            </p>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                {FACTIONS.map(faction => (
                    <div key={faction} className="overflow-hidden">
                         <FactionColumn factionName={faction} />
                    </div>
                ))}
            </div>
        </div>
    );
};
