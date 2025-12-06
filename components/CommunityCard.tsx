
import React from 'react';
import { Community } from '../types';
import { Users, Edit, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CommunityCardProps {
    community: Community;
    isSubscribed: boolean;
    onSubscriptionChange: (communityName: string) => void;
    isAdmin: boolean;
    onEdit: (community: Community) => void;
    onDelete: (communityId: string) => void;
    onUpload: (community: Community) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, isSubscribed, onSubscriptionChange, isAdmin, onEdit, onDelete, onUpload }) => {
    const { currentUser } = useAuth();
    
    const handleSubscribe = () => {
        if (!currentUser) return; // Or prompt to sign in
        onSubscriptionChange(community.name);
    };

    const adminEmails = ['admin@starlight.app', 'system@starlight.app'];
    const isCommunityAdminCreated = adminEmails.includes(community.ownerEmail);

    return (
        <div className="bg-[var(--background-secondary)] p-4 rounded-xl border border-[var(--border-primary)] flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center">
                    <Users className="w-8 h-8 text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg">{community.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {(community.memberCount || 0).toLocaleString()} members
                    </p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex justify-between items-center h-10">
                {currentUser && (
                    <button 
                        onClick={handleSubscribe}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                            isSubscribed 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300' 
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                )}
                <div className="flex items-center gap-2">
                    {currentUser && isCommunityAdminCreated && (
                        <button
                            onClick={() => onUpload(community)}
                            title={`Upload to ${community.name}`}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                            <Upload className="w-4 h-4"/>
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            <button onClick={() => onEdit(community)} title="Edit Community" className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => onDelete(community.id)} title="Delete Community" className="p-2 text-red-500 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};