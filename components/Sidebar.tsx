import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, ThumbsUp, Film, Settings, Shield, ListVideo, BarChart2, Gem, UserPlus, ShieldAlert, Flag, LayoutDashboard, Tv2, Users, ChevronDown, Activity, User, Lock, KeyRound, UserX, Video, Palette, FileVideo, Beaker, Compass, Megaphone, Clapperboard, MonitorPlay } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Playlist, Community } from '../types';
import { TvConnectModal } from '../components/TvConnectModal';
import { SUBSCRIPTION_KEY } from '../constants';

interface SidebarProps {
  isOpen: boolean;
}

const SidebarItem: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  isActive?: boolean;
  isOpen: boolean;
  onClick?: () => void;
  className?: string; // Added className prop
}> = ({ icon: Icon, label, isActive, isOpen, onClick, className }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative flex items-center rounded-xl cursor-pointer mb-1 transition-all duration-200 group
        ${isOpen ? 'px-4 py-3' : 'flex-col justify-center py-3 px-1'}
        ${isActive 
          ? 'bg-[hsl(var(--accent-color))]/15 text-[hsl(var(--accent-color))] shadow-[0_0_15px_rgba(124,58,237,0.15)]' 
          : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]'}
        ${className || ''}
      `}
      title={!isOpen ? label : undefined}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[hsl(var(--accent-color))] rounded-r-full"></div>
      )}
      <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''} ${isOpen ? 'mr-4' : 'mb-1'}`} />
      <span className={`${isOpen ? 'text-sm font-medium' : 'text-[10px] font-medium'} truncate`}>{label}</span>
    </div>
  );
};

const SidebarSubItem: React.FC<{
    icon: React.ElementType;
    label: string;
    href: string;
}> = ({ icon: Icon, label, href }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const hash = href.split('#')[1] || '';
    const currentHash = location.hash.substring(1);
    const isActive = (currentHash === hash) || (!currentHash && hash === 'account');

    return (
        <div
            onClick={() => navigate(href)}
            className={`relative flex items-center rounded-lg cursor-pointer transition-all duration-200 group px-3 py-2 ${
                isActive
                ? 'bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]'
            }`}
        >
            <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{label}</span>
        </div>
    );
};


const CommunityAvatarIcon: React.FC<{ src?: string; name: string, className?: string }> = ({ src, name, className }) => {
    if (src) {
        return <img src={src} alt={name} className={`${className} rounded-full object-cover`} />;
    }
    return <Users className={className} />;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, currentUser, isPremium } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subscribedCommunities, setSubscribedCommunities] = useState<Community[]>([]);
  const [showTvModal, setShowTvModal] = useState(false);
  const onSettingsPage = location.pathname === '/settings';
  
  const loadData = useCallback(() => {
    // Load playlists
    const playlistsJson = localStorage.getItem('starlight_playlists');
    setPlaylists(playlistsJson ? JSON.parse(playlistsJson) : []);

    if (currentUser) {
      const communitiesJson = localStorage.getItem('starlight_communities');
      const allCommunities: Community[] = communitiesJson ? JSON.parse(communitiesJson) : [];

      // Load subscriptions
      const subscriptions: string[] = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || '[]');
      const userSubscriptions = allCommunities.filter((community) => subscriptions.includes(community.name));
      setSubscribedCommunities(userSubscriptions.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      setSubscribedCommunities([]);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();

    window.addEventListener('playlistsUpdated', loadData);
    window.addEventListener('subscriptionsChanged', loadData);
    window.addEventListener('labsToggled', loadData);
    
    return () => {
      window.removeEventListener('playlistsUpdated', loadData);
      window.removeEventListener('subscriptionsChanged', loadData);
      window.removeEventListener('labsToggled', loadData);
    };
  }, [loadData]);

  return (
    <>
      <div className={`h-full flex flex-col ${isOpen ? 'px-3 py-4' : 'px-2 py-2'}`}>
        <div className="flex-1 space-y-1">
          <SidebarItem icon={Home} label="Home" isActive={location.pathname === '/'} isOpen={isOpen} onClick={() => navigate('/')} />
          <SidebarItem icon={Film} label="Shorts" isActive={location.pathname === '/shorts'} isOpen={isOpen} onClick={() => navigate('/shorts')} />
          <SidebarItem icon={Compass} label="Explore" isActive={location.pathname === '/explore'} isOpen={isOpen} onClick={() => navigate('/explore')} />
          <SidebarItem icon={Users} label="Communities" isActive={location.pathname === '/community'} isOpen={isOpen} onClick={() => navigate('/community')} />
          
          {currentUser && (
            <>
              <div className={`my-4 border-t border-[var(--border-primary)]/50 mx-2 ${isOpen ? '' : 'hidden'}`} />
              
              {/* These sections will be hidden on mobile (screens smaller than lg), but we keep them visible in sidebar logic */}
              <div className="hidden lg:block">
                <div>
                  <h3 className={`px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest ${isOpen ? '' : 'hidden'}`}>Library</h3>
                  <SidebarItem icon={Video} label="My Videos" isActive={location.pathname === '/profile'} isOpen={isOpen} onClick={() => navigate('/profile')} />
                  <SidebarItem icon={Clock} label="History" isActive={location.pathname === '/history'} isOpen={isOpen} onClick={() => navigate('/history')} />
                  <SidebarItem icon={ThumbsUp} label="Liked Videos" isActive={location.pathname === '/liked-videos'} isOpen={isOpen} onClick={() => navigate('/liked-videos')} />
                  <SidebarItem icon={Clock} label="Watch Later" isActive={location.pathname === '/watch-later'} isOpen={isOpen} onClick={() => navigate('/watch-later')} />
                  <SidebarItem icon={Tv2} label="Watch on TV" isOpen={isOpen} onClick={() => setShowTvModal(true)} />
                  <SidebarItem icon={Flag} label="My Reports" isActive={location.pathname === '/my-reports'} isOpen={isOpen} onClick={() => navigate('/my-reports')} />
                  {!isPremium && <SidebarItem icon={Gem} label="Starlight Premium" isActive={location.pathname === '/premium'} isOpen={isOpen} onClick={() => navigate('/premium')} />}
                  {(isPremium || isAdmin) && (
                    <SidebarItem icon={Beaker} label="Labs" isActive={location.pathname === '/labs'} isOpen={isOpen} onClick={() => navigate('/labs')} />
                  )}
                  <SidebarItem icon={UserPlus} label="Invite Friends" isActive={location.pathname === '/invite'} isOpen={isOpen} onClick={() => navigate('/invite')} />
                  
                  {playlists.length > 0 && (
                      <>
                        <h3 className={`px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest ${isOpen ? '' : 'hidden'} mt-4`}>Playlists</h3>
                        {playlists.slice(0, 5).map(playlist => (
                            <SidebarItem 
                                key={playlist.id} 
                                icon={ListVideo} 
                                label={playlist.name} 
                                isActive={location.pathname === `/playlist/${playlist.id}`} 
                                isOpen={isOpen} 
                                onClick={() => navigate(`/playlist/${playlist.id}`)} 
                            />
                        ))}
                      </>
                  )}


                  {subscribedCommunities.length > 0 && (
                      <>
                          <div className={`my-4 border-t border-[var(--border-primary)]/50 mx-2 ${isOpen ? '' : 'hidden'}`} />
                          <h3 className={`px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest ${isOpen ? '' : 'hidden'}`}>Subscriptions</h3>
                          {subscribedCommunities.slice(0, 7).map(community => (
                              <SidebarItem 
                                  key={community.id} 
                                  icon={(props) => <CommunityAvatarIcon {...props} src={community.avatar || `https://picsum.photos/seed/${encodeURIComponent(community.name)}/64/64`} name={community.name} />}
                                  label={community.name} 
                                  isActive={false}
                                  isOpen={isOpen} 
                                  onClick={() => navigate(`/channel/${encodeURIComponent(community.name)}`)} // Navigate to channel page
                              />
                          ))}
                          {subscribedCommunities.length > 7 && (
                              <SidebarItem
                                  icon={ChevronDown}
                                  label="Show more"
                                  isOpen={isOpen}
                                  onClick={() => navigate('/subscriptions')}
                              />
                          )}
                      </>
                  )}

                  <div className={`my-4 border-t border-[var(--border-primary)]/50 mx-2 ${isOpen ? '' : 'hidden'}`} />
                  
                  {isAdmin && (
                      <>
                        <h3 className={`px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest ${isOpen ? '' : 'hidden'}`}>Admin Tools</h3>
                        <SidebarItem icon={LayoutDashboard} label="Admin Dashboard" isActive={location.pathname === '/admin'} isOpen={isOpen} onClick={() => navigate('/admin')} />
                        <SidebarItem icon={Users} label="Users & Premium" isActive={location.pathname === '/admin/user-management'} isOpen={isOpen} onClick={() => navigate('/admin/user-management')} />
                        <SidebarItem icon={FileVideo} label="Content Management" isActive={location.pathname === '/admin/content'} isOpen={isOpen} onClick={() => navigate('/admin/content')} />
                        <SidebarItem icon={Shield} label="Manage Admins" isActive={location.pathname === '/admin/manage'} isOpen={isOpen} onClick={() => navigate('/admin/manage')} />
                        <SidebarItem icon={Activity} label="Admin Activities" isActive={location.pathname === '/admin/activities'} isOpen={isOpen} onClick={() => navigate('/admin/activities')} />
                        <SidebarItem icon={Activity} label="User Activities" isActive={location.pathname === '/admin/user-activities'} isOpen={isOpen} onClick={() => navigate('/admin/user-activities')} />
                        <SidebarItem icon={Megaphone} label="Ad Placements" isActive={location.pathname === '/admin/ad-settings'} isOpen={isOpen} onClick={() => navigate('/admin/ad-settings')} />
                        <SidebarItem icon={BarChart2} label="Analytics" isActive={location.pathname === '/analytics'} isOpen={isOpen} onClick={() => navigate('/analytics')} />
                      </>
                  )}
                  <SidebarItem icon={Settings} label="Settings" isActive={onSettingsPage} isOpen={isOpen} onClick={() => navigate('/settings')} />
                  {onSettingsPage && isOpen && (
                    <div className="pl-6 space-y-1 mt-1 animate-in fade-in">
                        <SidebarSubItem label="Account" href="/settings#account" icon={User} />
                        <SidebarSubItem label="Login & Security" href="/settings#security" icon={Lock} />
                        <SidebarSubItem label="Blocked Users" href="/settings#blocked-users" icon={UserX} />
                        <SidebarSubItem label="API Keys" href="/settings#api" icon={KeyRound} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {showTvModal && <TvConnectModal onClose={() => setShowTvModal(false)} />}
    </>
  );
};