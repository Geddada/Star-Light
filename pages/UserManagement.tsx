
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldOff, ShieldAlert, Search, Ban, Gem, CheckCircle, XCircle, MapPin, Filter } from 'lucide-react';
import { User as UserType, ProfileDetails } from '../types';
import { COUNTRIES, INDIAN_STATES, USA_STATES, UK_STATES, ANDHRA_PRADESH_CITIES } from '../constants';

// Mock users for the admin panel, as we don't have a central user database
const MOCK_USERS: UserType[] = [
    { name: 'Alex Drone', email: 'alex.d@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexDrone' },
    { name: 'Baker Ben', email: 'ben.b@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BakerBen' },
    { name: 'GamerX', email: 'gamerx@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerX' },
    { name: 'CodewithJane', email: 'jane.c@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodewithJane' },
    { name: 'CosmicClara', email: 'clara.c@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CosmicClara' },
    { name: 'WaveRiderWill', email: 'will.w@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WaveRiderWill' },
    { name: 'InvestWithTom', email: 'tom.i@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=InvestWithTom' },
];

const MOCK_PROFILE_DETAILS: Record<string, ProfileDetails> = {
    'alex.d@example.com': { country: 'Switzerland', city: 'Interlaken' },
    'ben.b@example.com': { country: 'United States of America', state: 'California', city: 'San Francisco' },
    'gamerx@example.com': { country: 'Japan', city: 'Tokyo' },
    'jane.c@example.com': { country: 'United States of America', state: 'New York', city: 'New York' },
    'clara.c@example.com': { country: 'United Kingdom', state: 'England', city: 'London' },
    'will.w@example.com': { country: 'Indonesia', city: 'Bali' },
    'tom.i@example.com': { country: 'Canada', city: 'Toronto' },
};

const ADMIN_BLOCKED_USERS_KEY = 'starlight_admin_blocked_users';
const ALL_USERS_KEY = 'starlight_all_users';

interface BlockedUser extends UserType {
    blockType: 'temporary' | 'permanent';
    expiresAt?: number;
}

export const UserManagement: React.FC = () => {
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileDetails, setProfileDetails] = useState<Record<string, ProfileDetails>>({});
    
    // Filters
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        // Load blocked users
        const storedBlockedUsers = localStorage.getItem(ADMIN_BLOCKED_USERS_KEY);
        if (storedBlockedUsers) {
            setBlockedUsers(JSON.parse(storedBlockedUsers));
        }

        // Load profile details for location filtering
        const detailsJson = localStorage.getItem('starlight_profile_details');
        let loadedDetails: Record<string, ProfileDetails> = {};
        if (detailsJson) {
            try {
                loadedDetails = JSON.parse(detailsJson);
            } catch (e) { console.error("Error parsing profile details", e); }
        }
        // Merge mock details so filters work for demo users
        setProfileDetails({ ...MOCK_PROFILE_DETAILS, ...loadedDetails });

        // Load all known users from mocks and local storage
        const storedAllUsers = localStorage.getItem(ALL_USERS_KEY);
        const allKnownUsers = new Map<string, UserType>();
        
        MOCK_USERS.forEach(u => u.email && allKnownUsers.set(u.email, u));
        
        if (storedAllUsers) {
            try {
                const parsedUsers: UserType[] = JSON.parse(storedAllUsers);
                parsedUsers.forEach(u => u.email && allKnownUsers.set(u.email, u));
            } catch (e) { console.error("Could not parse all users list", e); }
        }
        setAllUsers(Array.from(allKnownUsers.values()).sort((a,b) => a.name.localeCompare(b.name)));
    }, []);

    const handleBlock = (user: UserType, type: 'temporary' | 'permanent') => {
        if (!user.email) return;

        const newBlock: BlockedUser = {
            ...user,
            blockType: type,
        };
        if (type === 'temporary') {
            newBlock.expiresAt = new Date().getTime() + 15 * 24 * 60 * 60 * 1000; // 15 days from now
        }
        
        const updatedBlockedUsers = [...blockedUsers.filter(u => u.email !== user.email), newBlock];
        setBlockedUsers(updatedBlockedUsers);
        localStorage.setItem(ADMIN_BLOCKED_USERS_KEY, JSON.stringify(updatedBlockedUsers));
    };

    const handleUnblock = (email: string) => {
        const updatedBlockedUsers = blockedUsers.filter(u => u.email !== email);
        setBlockedUsers(updatedBlockedUsers);
        localStorage.setItem(ADMIN_BLOCKED_USERS_KEY, JSON.stringify(updatedBlockedUsers));
    };

    const handleTogglePremium = (user: UserType) => {
        if (!user.email) return;
        const updatedUsers = allUsers.map(u => {
            if (u.email === user.email) {
                return { ...u, isPremium: !u.isPremium };
            }
            return u;
        });
        setAllUsers(updatedUsers);
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));
        
        // Also update if it's the current user in local storage to reflect immediately if they are logged in
        const currentUserJson = localStorage.getItem('currentUser');
        if (currentUserJson) {
            const currentUser = JSON.parse(currentUserJson);
            if (currentUser.email === user.email) {
                currentUser.isPremium = !currentUser.isPremium;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                window.dispatchEvent(new Event('storage')); 
            }
        }
    };

    const isUserBlocked = (email: string) => blockedUsers.some(u => u.email === email);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const details = profileDetails[user.email || ''];
            const userCountry = details?.country;
            const userState = details?.state;
            const userCity = details?.city;

            const matchesCountry = !selectedCountry || userCountry === selectedCountry;
            const matchesState = !selectedState || userState === selectedState;
            // For city, do a case-insensitive includes if not AP city, or exact match if selected from list
            const matchesCity = !selectedCity || (userCity && userCity.toLowerCase().includes(selectedCity.toLowerCase()));

            return matchesSearch && matchesCountry && matchesState && matchesCity;
        });
    }, [allUsers, searchTerm, selectedCountry, selectedState, selectedCity, profileDetails]);
    
    const stateOptions = selectedCountry === 'India' ? INDIAN_STATES : selectedCountry === 'United States of America' ? USA_STATES : selectedCountry === 'United Kingdom' ? UK_STATES : [];
    
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Ban className="w-8 h-8 text-[hsl(var(--accent-color))]"/>
                    <Gem className="w-4 h-4 text-amber-500 absolute -bottom-1 -right-1" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">User & Premium Management</h1>
            </div>

            {/* All Users Section */}
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[hsl(var(--accent-color))]" /> Filter Users
                </h2>
                
                <div className="flex flex-col gap-4 mb-6 p-4 bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                        <input 
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--text-secondary)] ml-1">Country</label>
                            <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedState(''); setSelectedCity(''); }} className="w-full p-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]">
                                <option value="">All Countries</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--text-secondary)] ml-1">State / Region</label>
                            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity(''); }} className="w-full p-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" disabled={stateOptions.length === 0}>
                                <option value="">All States</option>
                                {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--text-secondary)] ml-1">City</label>
                            {selectedState === 'Andhra Pradesh' ? (
                                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full p-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]">
                                    <option value="">All Cities</option>
                                    {ANDHRA_PRADESH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            ) : (
                                <input 
                                    type="text" 
                                    placeholder="Filter by City" 
                                    value={selectedCity} 
                                    onChange={e => setSelectedCity(e.target.value)} 
                                    className="w-full p-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[60vh] border border-[var(--border-primary)] rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-[var(--background-tertiary)] z-10 shadow-sm">
                            <tr className="border-b border-[var(--border-primary)]">
                                <th className="p-4 font-bold text-[var(--text-secondary)]">User</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)] hidden md:table-cell">Location</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)] text-center">Premium Status</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[var(--background-secondary)]">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="text-center p-8 text-[var(--text-secondary)]">No users found matching filters.</td></tr>
                            ) : (
                                filteredUsers.map(user => {
                                    const details = profileDetails[user.email || ''];
                                    const locationStr = [details?.city, details?.state, details?.country].filter(Boolean).join(', ');
                                    return (
                                        <tr key={user.email} className="border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--background-tertiary)]/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-gray-200" />
                                                    <div>
                                                        <p className="font-bold flex items-center gap-2 text-[var(--text-primary)]">
                                                            {user.name}
                                                            {user.isPremium && <Gem className="w-3 h-3 text-amber-500" />}
                                                        </p>
                                                        <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell text-[var(--text-secondary)]">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                    {locationStr || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleTogglePremium(user)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                                        user.isPremium 
                                                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20' 
                                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {user.isPremium ? 'Premium Active' : 'Free User'}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                {isUserBlocked(user.email!) ? (
                                                    <div className="flex justify-end">
                                                        <button onClick={() => handleUnblock(user.email!)} className="px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-md flex items-center gap-1.5 transition-colors border border-green-500/20">
                                                            <ShieldOff className="w-3 h-3" /> Unblock
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2 flex-wrap">
                                                        <button onClick={() => handleTogglePremium(user)} className={`px-3 py-1.5 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors ${user.isPremium ? 'text-gray-500 border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800' : 'text-amber-600 border-amber-500/30 hover:bg-amber-50'}`}>
                                                            {user.isPremium ? <XCircle className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>}
                                                            {user.isPremium ? 'Revoke' : 'Grant'}
                                                        </button>
                                                        <div className="w-px h-6 bg-[var(--border-primary)] mx-1 hidden sm:block"></div>
                                                        <button onClick={() => handleBlock(user, 'temporary')} className="px-3 py-1.5 text-xs font-semibold text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-md border border-yellow-500/20 transition-colors">
                                                            Block (15d)
                                                        </button>
                                                        <button onClick={() => handleBlock(user, 'permanent')} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-md border border-red-500/20 transition-colors">
                                                            Ban
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Blocked Users Section */}
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500">
                    <Ban className="w-5 h-5" /> Blocked Users ({blockedUsers.length})
                </h2>
                {blockedUsers.length === 0 ? (
                    <p className="text-sm text-center text-[var(--text-tertiary)] py-8 border border-dashed border-[var(--border-primary)] rounded-xl">No users are currently blocked.</p>
                ) : (
                    <div className="overflow-x-auto border border-[var(--border-primary)] rounded-xl">
                         <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-[var(--background-tertiary)]">
                                <tr className="border-b border-[var(--border-primary)]">
                                    <th className="p-3">User</th>
                                    <th className="p-3">Block Type</th>
                                    <th className="p-3">Expires</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--background-secondary)]">
                                {blockedUsers.map(user => (
                                    <tr key={user.email} className="border-b border-[var(--border-primary)] last:border-b-0">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <p className="font-bold">{user.name}</p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`capitalize font-semibold text-xs px-2 py-1 rounded-full ${user.blockType === 'permanent' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                                {user.blockType}
                                            </span>
                                        </td>
                                        <td className="p-3 text-[var(--text-tertiary)]">
                                            {user.blockType === 'temporary' && user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleUnblock(user.email!)} className="px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-md flex items-center gap-1.5 ml-auto border border-green-500/20 transition-colors">
                                                <ShieldOff className="w-3 h-3" /> Unblock
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
