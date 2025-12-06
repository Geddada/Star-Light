


import React, { useState, useEffect, useCallback } from 'react';
import { Community as CommunityType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Loader2, Save, Users, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CommunityCard } from '../components/CommunityCard';
import { UploadModal } from '../components/UploadModal';
import { COUNTRIES, INDIAN_STATES, USA_STATES, UK_STATES } from '../constants';

const MOCK_COMMUNITIES_DATA: Partial<CommunityType>[] = [
    { name: 'Nature Explorers', country: 'Switzerland' },
    { name: 'Gaming Central', country: 'Japan', city: 'Tokyo' },
    { name: 'Home Chef', country: 'United States of America', state: 'California' },
    { name: 'Tech Visionary', country: 'United States of America', state: 'California' },
    { name: 'DevDiaries', country: 'United States of America', state: 'New York' },
    { name: 'AstroGeek', country: 'United Kingdom', state: 'England' },
    { name: 'PhotoPhile', country: 'Japan' },
    { name: 'Finance Bro', country: 'Canada' },
    { name: 'Adventure Seeker', country: 'Indonesia' },
    { name: 'Future Forward', country: 'Germany' },
    { name: 'SimpleProductivity', country: 'Sweden' },
    { name: 'Foodie Travels', country: 'France', city: 'Paris' },
    { name: 'DIY Hub', country: 'United States of America', state: 'Texas' },
    { name: 'Book Worms', country: 'United Kingdom' },
    { name: 'Movie Buffs', country: 'United States of America' },
    { name: 'Mumbai Techies', country: 'India', state: 'Maharashtra', city: 'Mumbai' },
    { name: 'Andhra Coders', country: 'India', state: 'Andhra Pradesh' },
    { name: 'Delhi Gamers', country: 'India', state: 'Delhi' },
];

const STORAGE_KEY = 'starlight_communities';
const SUBSCRIPTION_KEY = 'starlight_subscriptions';

export const Community: React.FC = () => {
    const { currentUser, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [allCommunities, setAllCommunities] = useState<CommunityType[]>([]);
    const [subscribedCommunityNames, setSubscribedCommunityNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCommunity, setEditingCommunity] = useState<CommunityType | null>(null);
    const [formState, setFormState] = useState<{name?: string, memberCount?: number}>({});

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [preselectedCommunity, setPreselectedCommunity] = useState<CommunityType | null>(null);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');

    const loadData = useCallback(() => {
        setLoading(true);
        try {
            // Load all communities
            const storedCommunities = localStorage.getItem(STORAGE_KEY);
            if (storedCommunities) {
                setAllCommunities(JSON.parse(storedCommunities));
            } else {
                const initialCommunities: CommunityType[] = MOCK_COMMUNITIES_DATA.map((c, i) => ({
                    ...c,
                    id: `comm-mock-${i}`,
                    ownerEmail: 'system@starlight.app',
                    memberCount: Math.floor(Math.random() * 500000) + 1000,
                    // FIX: Add avatar to mock communities
                    avatar: `https://picsum.photos/seed/${encodeURIComponent(c.name!)}/64/64`,
                } as CommunityType));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCommunities));
                setAllCommunities(initialCommunities);
            }

            // Load user's subscriptions
            if (currentUser) {
                const storedSubscriptions = localStorage.getItem(SUBSCRIPTION_KEY);
                setSubscribedCommunityNames(storedSubscriptions ? JSON.parse(storedSubscriptions) : []);
            } else {
                setSubscribedCommunityNames([]);
            }
        } catch (error) { console.error("Error loading data", error); }
        finally { setLoading(false); }
    }, [currentUser]);

    useEffect(() => { 
        loadData(); 
        window.addEventListener('subscriptionsChanged', loadData);
        return () => window.removeEventListener('subscriptionsChanged', loadData);
    }, [loadData]);
    
    const handleSubscriptionChange = (communityName: string) => {
        if (!currentUser) {
            navigate('/signup');
            return;
        }
        const newSubscriptions = subscribedCommunityNames.includes(communityName)
            ? subscribedCommunityNames.filter(name => name !== communityName)
            : [...subscribedCommunityNames, communityName];
        setSubscribedCommunityNames(newSubscriptions);
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSubscriptions));
    };

    // Admin functions
    const handleOpenModal = (community: CommunityType | null = null) => {
        if (!isAdmin) return;
        if (community) {
            setEditingCommunity(community);
            setFormState({name: community.name, memberCount: community.memberCount});
        } else {
            setEditingCommunity(null);
            setFormState({ name: '', memberCount: 0 });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCommunity(null);
        setFormState({});
    };

    const handleDelete = (communityId: string) => {
        if (!isAdmin) return;
        if (window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
            const updatedCommunities = allCommunities.filter(c => c.id !== communityId);
            setAllCommunities(updatedCommunities);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCommunities));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin || !formState.name) return;

        let updatedCommunities;
        if (editingCommunity) {
            updatedCommunities = allCommunities.map(c => {
                if (c.id === editingCommunity.id) {
                    const newName = formState.name!;
                    const newAvatar = (c.name !== newName) ? `https://picsum.photos/seed/${encodeURIComponent(newName)}/64/64` : c.avatar;
                    return { ...c, name: newName, memberCount: formState.memberCount, avatar: newAvatar };
                }
                return c;
            });
        } else {
            const newCommunity: CommunityType = {
                id: `comm-${Date.now()}`,
                name: formState.name,
                ownerEmail: currentUser?.email || 'admin@starlight.app',
                memberCount: formState.memberCount || 0,
                avatar: `https://picsum.photos/seed/${encodeURIComponent(formState.name)}/64/64`,
            };
            updatedCommunities = [...allCommunities, newCommunity];
        }
        setAllCommunities(updatedCommunities);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCommunities));
        handleCloseModal();
    };
    
    const handleUpload = (community: CommunityType) => {
        if (!currentUser) {
            navigate('/signup');
            return;
        }
        setPreselectedCommunity(community);
        setShowUploadModal(true);
    };

    const handleUploadSuccess = () => {
        setShowUploadModal(false);
        setPreselectedCommunity(null);
        navigate('/profile');
    };

    const userSubscribedCommunities = allCommunities.filter(c => subscribedCommunityNames.includes(c.name));
    
    const discoverCommunities = allCommunities
        .filter(c => !subscribedCommunityNames.includes(c.name))
        .filter(c => {
            if (!selectedCountry) return true;
            if (c.country !== selectedCountry) return false;
            if (!selectedState) return true;
            return c.state === selectedState;
        });
        
    const stateOptions = selectedCountry === 'India' ? INDIAN_STATES : selectedCountry === 'United States of America' ? USA_STATES : selectedCountry === 'United Kingdom' ? UK_STATES : [];

    return (
        <>
            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUploadSuccess={handleUploadSuccess}
                    preselectedCommunity={preselectedCommunity}
                />
            )}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-[hsl(var(--accent-color))]"/>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Communities</h1>
                    </div>
                    {isAdmin && (
                        <button onClick={() => navigate('/community/create')} className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold filter hover:brightness-90 transition-colors shadow-md w-full sm:w-auto">
                            <PlusCircle className="w-5 h-5" />
                            <span>Create Community</span>
                        </button>
                    )}
                </div>
                
                <div className="mb-8 p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)]">
                    <h3 className="font-bold text-lg mb-4">Find Your Local Community</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Country</label>
                            <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedState(''); }} className="mt-1 w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg">
                                <option value="">All Countries</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">State / Region</label>
                            <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="mt-1 w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg" disabled={stateOptions.length === 0}>
                                <option value="">All States / Regions</option>
                                {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin"/></div> : (
                    <div className="space-y-12">
                        {currentUser && userSubscribedCommunities.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">My Subscriptions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userSubscribedCommunities.map(community => (
                                        <CommunityCard 
                                            key={community.id} 
                                            community={community} 
                                            isSubscribed={true}
                                            onSubscriptionChange={handleSubscriptionChange}
                                            isAdmin={isAdmin}
                                            onEdit={handleOpenModal} 
                                            onDelete={handleDelete}
                                            onUpload={handleUpload}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Discover Communities</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {discoverCommunities.map(community => (
                                    <CommunityCard 
                                        key={community.id} 
                                        community={community} 
                                        isSubscribed={false}
                                        onSubscriptionChange={handleSubscriptionChange}
                                        isAdmin={isAdmin}
                                        onEdit={handleOpenModal} 
                                        onDelete={handleDelete}
                                        onUpload={handleUpload}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {isAdmin && isModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={handleCloseModal}>
                        <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-lg border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">{editingCommunity ? 'Edit Community' : 'Create New Community'}</h2>
                            <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors"><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Name *</label>
                                    <input value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Member Count</label>
                                    <input type="number" value={formState.memberCount || 0} onChange={e => setFormState({...formState, memberCount: parseInt(e.target.value) || 0})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg" />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
