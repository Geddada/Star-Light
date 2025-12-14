
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Clock, ThumbsUp, Film, Settings, Shield, ListVideo, 
  BarChart2, Gem, UserPlus, ShieldAlert, Flag, LayoutDashboard, 
  Tv2, Users, ChevronDown, ChevronUp, Activity, User, Video, 
  Beaker, Compass, PlaySquare, LineChart, LogIn
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Playlist, Community } from '../types';
import { TvConnectModal } from '../components/TvConnectModal';
import { SUBSCRIPTION_KEY } from '../constants';

interface SidebarProps {
  isOpen: boolean;
}

// --- Helper Components ---

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
  isAvatar?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  isActive, 
  isOpen, 
  onClick, 
  className = '',
  isAvatar = false
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group flex items-center w-full transition-all duration-200 rounded-lg
        ${isOpen ? 'px-3 py-2.5 gap-4' : 'flex-col justify-center px-1 py-3 gap-1'}
        ${isActive 
          ? 'bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))] font-medium' 
          : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]'}
        ${className}
      `}
      title={!isOpen ? label : undefined}
    >
      <div className={`relative flex items-center justify-center ${isOpen ? '' : 'w-full'}`}>
        {isAvatar ? (
           <Icon className="w-6 h-6 rounded-full object-cover" />
        ) : (
           <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''} transition-transform group-hover:scale-105`} />
        )}
      </div>
      
      <span className={`truncate text-sm ${isOpen ? 'opacity-100' : 'hidden opacity-0'} transition-opacity duration-200`}>
        {label}
      </span>
    </button>
  );
};

const SectionTitle: React.FC<{ title: string; isOpen: boolean }> = ({ title, isOpen }) => {
  if (!isOpen) return null;
  return (
    <h3 className="px-3 mt-4 mb-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider animate-in fade-in slide-in-from-left-2 duration-300">
      {title}
    </h3>
  );
};

const Separator: React.FC = () => <div className="my-2 border-t border-[var(--border-primary)]/50 mx-2" />;

// --- Main Component ---

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, currentUser, isPremium } = useAuth();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subscribedCommunities, setSubscribedCommunities] = useState<Community[]>([]);
  const [showTvModal, setShowTvModal] = useState(false);
  const [isSubsExpanded, setIsSubsExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const loadData = useCallback(() => {
    // Load playlists
    const playlistsJson = localStorage.getItem('starlight_playlists');
    setPlaylists(playlistsJson ? JSON.parse(playlistsJson) : []);

    if (currentUser) {
      const communitiesJson = localStorage.getItem('starlight_communities');
      const allCommunities: Community[] = communitiesJson ? JSON.parse(communitiesJson) : [];

      // Load subscriptions
      const subscriptions: string[] = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || '[]');
      
      const userSubscriptions = subscriptions.map(subName => {
          const existing = allCommunities.find(c => c.name === subName);
          if (existing) return existing;
          
          return {
              id: `sub-${subName}`,
              name: subName,
              ownerEmail: '',
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

  // Helper to render avatars as icons
  const CommunityAvatar = ({ src, name }: { src?: string; name: string }) => {
      if (src) return <img src={src} alt={name} className="w-6 h-6 rounded-full" />;
      return <Users className="w-6 h-6" />;
  };

  const displayedSubs = isSubsExpanded ? subscribedCommunities : subscribedCommunities.slice(0, 7);

  return (
    <>
      <nav className={`h-full flex flex-col ${isOpen ? 'px-3' : 'px-2'} py-2 overflow-y-auto custom-scrollbar`}>
        {/* Main Navigation */}
        <div className="space-y-0.5">
          <SidebarItem icon={Home} label="Home" isActive={isActive('/')} isOpen={isOpen} onClick={() => navigate('/')} />
          <SidebarItem icon={Compass} label="Explore" isActive={isActive('/explore')} isOpen={isOpen} onClick={() => navigate('/explore')} />
          <SidebarItem icon={Film} label="Shorts" isActive={isActive('/shorts')} isOpen={isOpen} onClick={() => navigate('/shorts')} />
          <SidebarItem icon={PlaySquare} label="Subscriptions" isActive={isActive('/subscriptions')} isOpen={isOpen} onClick={() => navigate('/subscriptions')} />
        </div>

        <Separator />

        {/* User Section (You) */}
        {currentUser ? (
          <>
            <SectionTitle title="You" isOpen={isOpen} />
            <div className="space-y-0.5">
              <SidebarItem icon={User} label="Your Channel" isActive={isActive('/profile')} isOpen={isOpen} onClick={() => navigate('/profile')} />
              <SidebarItem icon={Clock} label="History" isActive={isActive('/history')} isOpen={isOpen} onClick={() => navigate('/history')} />
              <SidebarItem icon={Video} label="Your Videos" isActive={isActive('/content')} isOpen={isOpen} onClick={() => navigate('/content')} />
              <SidebarItem icon={ListVideo} label="Watch Later" isActive={isActive('/watch-later')} isOpen={isOpen} onClick={() => navigate('/watch-later')} />
              <SidebarItem icon={ThumbsUp} label="Liked Videos" isActive={isActive('/liked-videos')} isOpen={isOpen} onClick={() => navigate('/liked-videos')} />
              
              {/* User Playlists */}
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
            <Separator />
          </>
        ) : (
          <>
            {isOpen && (
              <div className="px-4 py-4">
                <p className="text-sm text-[var(--text-secondary)] mb-3">Sign in to like videos, comment, and subscribe.</p>
                <button 
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--border-primary)] rounded-full text-blue-500 font-semibold hover:bg-blue-500/10 transition-colors w-full justify-center"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </button>
              </div>
            )}
            <Separator />
          </>
        )}

        {/* Subscriptions Section */}
        {currentUser && subscribedCommunities.length > 0 && (
          <>
            <SectionTitle title="Subscriptions" isOpen={isOpen} />
            <div className="space-y-0.5">
              {displayedSubs.map(community => (
                <SidebarItem 
                  key={community.id}
                  icon={() => <CommunityAvatar src={community.avatar} name={community.name} />}
                  label={community.name}
                  isActive={location.pathname === `/channel/${encodeURIComponent(community.name)}`}
                  isOpen={isOpen}
                  onClick={() => navigate(`/channel/${encodeURIComponent(community.name)}`)}
                  isAvatar={true}
                />
              ))}
              
              {/* Show More / Show Less */}
              {isOpen && subscribedCommunities.length > 7 && (
                <SidebarItem 
                  icon={isSubsExpanded ? ChevronUp : ChevronDown}
                  label={isSubsExpanded ? "Show Less" : `Show ${subscribedCommunities.length - 7} more`}
                  isOpen={isOpen}
                  isActive={false}
                  onClick={() => setIsSubsExpanded(!isSubsExpanded)}
                />
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Explore / More Section */}
        <SectionTitle title="More from Starlight" isOpen={isOpen} />
        <div className="space-y-0.5">
          {!isPremium && (
            <SidebarItem icon={Gem} label="Premium" isActive={isActive('/premium')} isOpen={isOpen} onClick={() => navigate('/premium')} className="text-amber-500 hover:text-amber-600" />
          )}
          
          {isPremium && (
            <SidebarItem 
              icon={LineChart} 
              label="Premium Analytics" 
              isActive={isActive('/premium-analytics')} 
              isOpen={isOpen} 
              onClick={() => navigate('/premium-analytics')} 
              className="text-amber-500"
            />
          )}

          {(isPremium || isAdmin) && (
            <SidebarItem icon={Beaker} label="Labs" isActive={isActive('/labs')} isOpen={isOpen} onClick={() => navigate('/labs')} />
          )}

          <SidebarItem icon={Tv2} label="Play on TV" isOpen={isOpen} onClick={() => setShowTvModal(true)} isActive={false} />
          <SidebarItem icon={Users} label="Communities" isActive={isActive('/community')} isOpen={isOpen} onClick={() => navigate('/community')} />
          <SidebarItem icon={Settings} label="Settings" isActive={isActive('/settings')} isOpen={isOpen} onClick={() => navigate('/settings')} />
          <SidebarItem icon={Flag} label="Report History" isActive={isActive('/my-reports')} isOpen={isOpen} onClick={() => navigate('/my-reports')} />
          <SidebarItem icon={UserPlus} label="Invite Friends" isActive={isActive('/invite')} isOpen={isOpen} onClick={() => navigate('/invite')} />
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <Separator />
            <SectionTitle title="Admin Tools" isOpen={isOpen} />
            <div className="space-y-0.5">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={isActive('/admin')} isOpen={isOpen} onClick={() => navigate('/admin')} />
              <SidebarItem icon={Users} label="Users" isActive={isActive('/admin/user-management')} isOpen={isOpen} onClick={() => navigate('/admin/user-management')} />
              <SidebarItem icon={BarChart2} label="Analytics" isActive={isActive('/analytics')} isOpen={isOpen} onClick={() => navigate('/analytics')} />
              <SidebarItem icon={Shield} label="Admins" isActive={isActive('/admin/manage')} isOpen={isOpen} onClick={() => navigate('/admin/manage')} />
              <SidebarItem icon={Activity} label="Activity Log" isActive={isActive('/admin/activities')} isOpen={isOpen} onClick={() => navigate('/admin/activities')} />
            </div>
          </>
        )}
        
        {/* Footer Padding */}
        <div className="pb-4" />
      </nav>

      {showTvModal && <TvConnectModal onClose={() => setShowTvModal(false)} />}
    </>
  );
};
