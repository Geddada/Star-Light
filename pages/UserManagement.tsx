import React, { useState, useEffect, useMemo } from 'react';
import { ShieldOff, ShieldAlert, Search, Ban } from 'lucide-react';
import { User as UserType } from '../types';

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

    useEffect(() => {
        // Load blocked users
        const storedBlockedUsers = localStorage.getItem(ADMIN_BLOCKED_USERS_KEY);
        if (storedBlockedUsers) {
            setBlockedUsers(JSON.parse(storedBlockedUsers));
        }

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

    const isUserBlocked = (email: string) => blockedUsers.some(u => u.email === email);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);
    
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-3">
                <Ban className="w-8 h-8 text-[hsl(var(--accent-color))]"/>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">User Management</h1>
            </div>

            {/* All Users Section */}
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h2 className="text-xl font-bold mb-4">All Users</h2>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                    <input 
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"
                    />
                </div>
                <div className="overflow-x-auto max-h-[50vh]">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-[var(--background-secondary)]">
                            <tr className="border-b border-[var(--border-primary)]">
                                <th className="p-3">User</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.email} className="border-b border-[var(--border-primary)] last:border-b-0">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-bold">{user.name}</p>
                                                <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {isUserBlocked(user.email!) ? (
                                            <div className="flex justify-end">
                                                <button onClick={() => handleUnblock(user.email!)} className="px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-md flex items-center gap-1.5">
                                                    <ShieldOff className="w-3 h-3" /> Unblock
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <button onClick={() => handleBlock(user, 'temporary')} className="px-3 py-1.5 text-xs font-semibold text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-md">
                                                    Block (15 Days)
                                                </button>
                                                <button onClick={() => handleBlock(user, 'permanent')} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-md">
                                                    Block Permanently
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Blocked Users Section */}
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h2 className="text-xl font-bold mb-4">Blocked Users ({blockedUsers.length})</h2>
                {blockedUsers.length === 0 ? (
                    <p className="text-sm text-center text-[var(--text-tertiary)] py-8">No users are currently blocked.</p>
                ) : (
                    <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-[var(--background-secondary)]">
                                <tr className="border-b border-[var(--border-primary)]">
                                    <th className="p-3">User</th>
                                    <th className="p-3">Block Type</th>
                                    <th className="p-3">Expires</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blockedUsers.map(user => (
                                    <tr key={user.email} className="border-b border-[var(--border-primary)] last:border-b-0">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <p className="font-bold">{user.name}</p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`capitalize font-semibold text-xs px-2 py-1 rounded-full ${user.blockType === 'permanent' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {user.blockType}
                                            </span>
                                        </td>
                                        <td className="p-3 text-[var(--text-tertiary)]">
                                            {user.blockType === 'temporary' && user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleUnblock(user.email!)} className="px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-md flex items-center gap-1.5 ml-auto">
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