
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, ThumbsUp, Film, Settings, Shield, ListVideo, BarChart2, Gem, UserPlus, ShieldAlert, Flag, LayoutDashboard, Tv2, Users, ChevronDown, Activity, User, Video, Beaker, Compass, Megaphone, PlaySquare } from 'lucide-react';
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
  className?: string;
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
      <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''} ${isOpen ? 'mr-4' : 'mb-1'} flex-shrink-0`} />
      <span className={`${isOpen ? 'text-sm font-medium' : 'text-[10px] font-medium'} truncate w-full text-center md:text-left`}>{label}</span>
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
      
      // Map subscriptions to community objects, creating fallbacks for those not in the communities list (e.g. individual creators)
      const userSubscriptions = subscriptions.map(subName => {
          const existing = allCommunities.find(c => c.name === subName);
          if (existing) return existing;
          
          // Fallback for creators/channels
          return {
              id: `sub-${subName}`,
              name: subName,
              ownerEmail: '',
              // Try to generate a consistent avatar for creators based on name
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(subName)}`
          } as Community;
      });

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
          {/* Main Section */}
          <SidebarItem icon={Home} label="Home" isActive={location.pathname === '/'} isOpen={isOpen} onClick={() => navigate('/')} />
          <SidebarItem icon={Compass} label="Explore" isActive={location.pathname === '/explore'} isOpen={isOpen} onClick={() => navigate('/explore')} />
          <SidebarItem icon={Film} label="Shorts" isActive={location.pathname === '/shorts'} isOpen={isOpen} onClick={() => navigate('/shorts')} />
          <SidebarItem icon={PlaySquare} label="Subscriptions" isActive={location.pathname === '/subscriptions'} isOpen={isOpen} onClick={() => navigate('/subscriptions')} />
          
          <div className={`my-2 border-t border-[var(--border-primary)]/50 mx-2 ${isOpen ? '' : 'hidden'}`} />
          
          {/* User Section (You) */}
          {currentUser && (
            <>
              <div className={`hidden lg:block`}>
                  <h3 className={`px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest ${isOpen ? '' : 'hidden'}`}>You</h3>
                  <SidebarItem icon={User} label="Your Channel" isActive={location.pathname === '/profile'} isOpen={isOpen} onClick={() => navigate('/profile')} />
                  <SidebarItem icon={Clock} label="History" isActive={location.pathname === '/history'} isOpen={isOpen} onClick={() => navigate('/history')} />
                  <SidebarItem icon={ListVideo} label="Playlists" isActive={location.pathname.startsWith('/playlist/')} isOpen={isOpen} onClick={() => {}} /> 
                  <SidebarItem icon={Video} label="Your Videos" isActive={location.pathname === '/content'} isOpen={isOpen} onClick={() => navigate('/content')} /> 
                  <SidebarItem icon={Clock} label="Watch Later" isActive={location.pathname === '/watch-later'} isOpen={isOpen} onClick={() => navigate('/watch-later')} />
                  <SidebarItem icon={ThumbsUp} label="Liked Videos" isActive={location.pathname === '/liked-videos'} isOpen={isOpen} onClick={() => navigate('/liked-videos')} />
                  
                  {/* Render User Created Playlists */}
                  {playlists.map(playlist => (
                      <SidebarItem 
                        key={playlist.id}
                        icon={ListVideo}
                        label={playlist.name}
                        isActive={location.pathname === `/playlist/${playlist.id}`}
                        isOpen={isOpen}
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                      />
                  ))}
              </div>
              <div className={`my-2 border-t border-[var(--border-primary)]/50 mx-2 ${isOpen ? '' : 'hidden'}`} />
            </>
          )}

          {/* Subscriptions List (Visible on all desktop/tablet sizes) */}
          {currentUser && subscribedCommunities.length > 0 && (
              <div className="">
                  {isOpen && <h3 className="px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Subscriptions</h3>}
                  {subscribedCommunities.slice(0, isOpen ? 10 : 50).map(community => (
                      <SidebarItem 
                          key={community.id} 
                          icon={(props) => <CommunityAvatarIcon {...props} src={community.avatar} name={community.name} />}
                          label={community.name} 
                          isActive={location.pathname === `/channel/${encodeURIComponent(community.name)}`}
                          isOpen={isOpen} 
                          onClick={() => navigate(`/channel/${encodeURIComponent(community.name)}`)}
                      />
                  ))}
                  {isOpen && subscribedCommunities.length > 10 && (
                      <SidebarItem icon={ChevronDown} label={`Show ${subscribedCommunities.length - 10} more`} isOpen={isOpen} onClick={() => navigate('/subscriptions')} />
                  )}
                  <div className={`my-2 border-t border-[var(--border-primary)]/50 mx-2`} />
              </div>
          )}

          {/* More from Starlight */}
          <div className="hidden lg:block">
             <h3 className={`px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest ${isOpen ? '' : 'hidden'}`}>More</h3>
             {!isPremium && <SidebarItem icon={Gem} label="Premium" isActive={location.pathname === '/premium'} isOpen={isOpen} onClick={() => navigate('/premium')} />}
             <SidebarItem icon={Tv2} label="TV" isOpen={isOpen} onClick={() => setShowTvModal(true)} />
             {(isPremium || isAdmin) && (
                <SidebarItem icon={Beaker} label="Labs" isActive={location.pathname === '/labs'} isOpen={isOpen} onClick={() => navigate('/labs')} />
             )}
             <SidebarItem icon={Users} label="Communities" isActive={location.pathname === '/community'} isOpen={isOpen} onClick={() => navigate('/community')} />
             <SidebarItem icon={Settings} label="Settings" isActive={onSettingsPage} isOpen={isOpen} onClick={() => navigate('/settings')} />
             <SidebarItem icon={Flag} label="Report History" isActive={location.pathname === '/my-reports'} isOpen={isOpen} onClick={() => navigate('/my-reports')} />
             <SidebarItem icon={UserPlus} label="Invite Friends" isActive={location.pathname === '/invite'} isOpen={isOpen} onClick={() => navigate('/invite')} />
          </div>

          {/* Admin Section */}
          {isAdmin && (
              <>
                <div className={`my-2 border-t border-[var(--border-primary)]/50 mx-2 ${isOpen ? '' : 'hidden'}`} />
                <div className="hidden lg:block">
                    <h3 className={`px-4 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest ${isOpen ? '' : 'hidden'}`}>Admin</h3>
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={location.pathname === '/admin'} isOpen={isOpen} onClick={() => navigate('/admin')} />
                    <SidebarItem icon={Users} label="Users" isActive={location.pathname === '/admin/user-management'} isOpen={isOpen} onClick={() => navigate('/admin/user-management')} />
                    <SidebarItem icon={BarChart2} label="Analytics" isActive={location.pathname === '/analytics'} isOpen={isOpen} onClick={() => navigate('/analytics')} />
                    <SidebarItem icon={Shield} label="Admins" isActive={location.pathname === '/admin/manage'} isOpen={isOpen} onClick={() => navigate('/admin/manage')} />
                    <SidebarItem icon={Activity} label="Activity Log" isActive={location.pathname === '/admin/activities'} isOpen={isOpen} onClick={() => navigate('/admin/activities')} />
                    <SidebarItem icon={Megaphone} label="Ad Settings" isActive={location.pathname === '/admin/ad-settings'} isOpen={isOpen} onClick={() => navigate('/admin/ad-settings')} />
                </div>
              </>
          )}
        </div>
      </div>
      {showTvModal && <TvConnectModal onClose={() => setShowTvModal(false)} />}
    </>
  );
};
