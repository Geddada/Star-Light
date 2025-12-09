
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Mic, Bell, User, LogOut, Settings, Sparkles, ShieldAlert, Gem, Radio, Sun, Moon, ArrowLeft, Home, Upload, Save, Check, Download, RefreshCw, Camera, Smartphone, Loader2, Video, Megaphone, PlayCircle, RadioTower, Wand2, Palette, Keyboard, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UploadModal } from './UploadModal';
import { SendToMobileModal } from './SendToMobileModal';


interface CurrentUser {
  name: string;
  avatar: string;
  email?: string;
  isPremium?: boolean;
}

interface HeaderProps {
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    user: 'Tech Visionary',
    action: 'uploaded: The Future of AI is Here',
    time: '2 hours ago',
    read: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechVisionary',
    thumbnail: 'https://picsum.photos/seed/tech/160/90'
  },
  {
    id: '2',
    user: 'Alex commented on your video:',
    action: '"This is incredible! Mind-blowing stuff."',
    time: '5 hours ago',
    read: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    thumbnail: 'https://picsum.photos/seed/ai-video/160/90'
  },
  {
    id: '3',
    user: 'Gaming Central',
    action: 'is going live: Grand Finals Tournament!',
    time: '1 day ago',
    read: true,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gaming',
    thumbnail: 'https://picsum.photos/seed/gaming-live/160/90'
  },
  {
    id: '4',
    user: 'Starlight Monetization',
    action: 'Congratulations! You\'ve reached 1,000 subscribers.',
    time: '2 days ago',
    read: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Starlight',
  },
  {
    id: '5',
    user: 'Starlight Updates',
    action: 'New features are available in the lab!',
    time: '2 days ago',
    read: true,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Starlight',
  },
  {
    id: '6',
    user: 'MovieBuff replied to your comment:',
    action: '"Totally agree with your analysis!"',
    time: '3 days ago',
    read: true,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MovieBuff',
  },
  {
    id: '7',
    user: 'Your video is ready!',
    action: '"My Trip to Japan" has finished processing and is now public.',
    time: '3 days ago',
    read: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Starlight-Check',
    thumbnail: 'https://picsum.photos/seed/japan-trip/160/90'
  }
];


export const Header: React.FC<HeaderProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isListening, setIsListening] = useState(false);
  const [isMobileSearch, setIsMobileSearch] = useState(false);
  
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showAdsDropdown, setShowAdsDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalConfig, setUploadModalConfig] = useState<{
    initialStep: 'initial' | 'recording' | 'details';
    isShorts: boolean;
    uploadType: 'video' | 'image';
  }>({ initialStep: 'initial', isShorts: false, uploadType: 'video' });
  const [showSendToMobileModal, setShowSendToMobileModal] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  
  const { currentUser, logout, isPremium, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLDivElement>(null);
  const adsDropdownRef = useRef<HTMLDivElement>(null);
  const adsButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !avatarButtonRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node) && !notifButtonRef.current?.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node) && !createButtonRef.current?.contains(event.target as Node)) {
        setShowCreateDropdown(false);
      }
      if (adsDropdownRef.current && !adsDropdownRef.current.contains(event.target as Node) && !adsButtonRef.current?.contains(event.target as Node)) {
        setShowAdsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close mobile search on navigation
  useEffect(() => {
    if (isMobileSearch) {
      setIsMobileSearch(false);
    }
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/results?search_query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setSearchQuery(transcript);
        navigate(`/results?search_query=${encodeURIComponent(transcript)}`);
      }
    };
    recognition.start();
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };
  
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    window.dispatchEvent(new Event('videosUpdated'));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const openUploadModal = (initialStep: 'initial' | 'recording' | 'details' = 'initial', isShorts = false, uploadType: 'video' | 'image' = 'video') => {
    setUploadModalConfig({ initialStep, isShorts, uploadType });
    setShowUploadModal(true);
  };

  const handleDownloadApp = () => {
    if (!currentUser) return;
    const link = document.createElement('a');
    link.href = '/StarLight.apk'; // Path to the mock APK
    link.setAttribute('download', 'StarLight.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const micButtonClasses = `p-2.5 rounded-full flex-shrink-0 transition-all duration-300 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] ${isListening ? 'text-red-500 border-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`;
  const downloadAppClasses = 'p-2.5 rounded-full transition-all ' + 
                           (currentUser
                            ? 'bg-[hsl(var(--accent-color))] text-white hover:brightness-90 shadow-md hover:shadow-lg'
                            : 'bg-[var(--background-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed');

  const desktopSearchBar = (
    <div className="w-full max-w-xl hidden sm:flex items-center gap-3">
        <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full group">
               <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 rounded-full opacity-20 group-focus-within:opacity-100 transition duration-500 blur-[1px]"></div>
               <div className="relative flex items-center bg-[var(--background-secondary)] rounded-full overflow-hidden shadow-inner border border-transparent group-focus-within:border-[var(--border-secondary)] transition-colors">
                  <button type="submit" className="pl-4 pr-2 text-[var(--text-tertiary)] group-focus-within:text-[hsl(var(--accent-color))] transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="w-full bg-transparent outline-none text-[var(--text-primary)] h-10 text-sm placeholder-[var(--text-tertiary)] px-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
        </form>
        <button 
          type="button" 
          onClick={handleVoiceSearch}
          className={micButtonClasses}
        >
          <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
        </button>
    </div>
  );

  return (
    <>
      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} initialStep={uploadModalConfig.initialStep} isShortsDefault={uploadModalConfig.isShorts} uploadType={uploadModalConfig.uploadType} />}
      {showSendToMobileModal && <SendToMobileModal onClose={() => setShowSendToMobileModal(false)} />}
      
      <style>{`
        @keyframes on-air-blink {
          0%, 49% {
            background-color: #ef4444; /* red-500 */
            box-shadow: 0 0 8px #ef4444, 0 0 15px #ef4444;
          }
          50%, 100% {
            background-color: #7f1d1d; /* red-900 */
            box-shadow: none;
          }
        }
        .animate-on-air {
          animation: on-air-blink 1.s infinite;
        }
      `}</style>
      <header className="h-16 hidden md:flex items-center justify-between px-4 gap-4 sticky top-0 z-50 glass border-b border-[var(--border-primary)]/50">
        
        {/* Mobile Search Overlay */}
        {isMobileSearch && (
          <div className="absolute inset-0 h-full w-full bg-[var(--background-secondary)] z-20 flex items-center px-2 animate-in fade-in">
            <button onClick={() => setIsMobileSearch(false)} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] rounded-full">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearch} className="flex-1 mx-2">
              <div className="relative w-full group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 rounded-full opacity-80 transition duration-500 blur-[1px]"></div>
                <div className="relative flex items-center bg-[var(--background-primary)] rounded-full overflow-hidden shadow-inner">
                  <button type="submit" className="pl-4 pr-2 text-[var(--text-tertiary)] text-[hsl(var(--accent-color))]">
                    <Search className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-transparent outline-none text-[var(--text-primary)] h-10 text-sm placeholder-[var(--text-tertiary)] px-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            </form>
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-2.5 rounded-full flex-shrink-0 transition-all duration-300 ${isListening ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-lg opacity-50 group-hover:opacity-80 transition-opacity rounded-full"></div>
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-7 h-7 text-red-500 relative z-10"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </div>
            <span className="font-bold text-xl text-[var(--text-primary)] tracking-tighter hidden sm:block">StarLight</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${location.pathname === '/' ? 'bg-[var(--background-tertiary)]' : 'hover:bg-[var(--background-tertiary)]'}`}
            aria-label="Home page"
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-semibold">Home</span>
          </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center px-4">
        {desktopSearchBar}
      </div>


      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Mobile search button */}
        <button onClick={() => setIsMobileSearch(true)} className="p-2.5 rounded-full hover:bg-[var(--background-tertiary)] sm:hidden">
            <Search className="w-5 h-5" />
        </button>
        
        {/* Ads Manager Dropdown - Only for Premium or Admin */}
        {(isPremium || isAdmin) && (
          <div className="relative" ref={adsButtonRef}>
            <button
              onClick={() => setShowAdsDropdown(prev => !prev)}
              title="Ads Manager"
              aria-label="Manage Ads"
              aria-haspopup="true"
              aria-expanded={showAdsDropdown}
              className="flex items-center gap-2 rounded-full bg-[hsl(var(--accent-color))] text-white hover:brightness-90 transition-all p-2.5 sm:px-4 sm:py-2 shadow-md hover:shadow-lg"
            >
              <Megaphone className="w-5 h-5" />
              <span className="font-bold text-sm hidden sm:block">Ads Manager</span>
            </button>
            {showAdsDropdown && (
              <div ref={adsDropdownRef} className="absolute top-full right-0 mt-2 w-64 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] shadow-2xl p-2 animate-in fade-in zoom-in-95 z-50">
                  <div className="px-3 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Campaigns</div>
                  <button onClick={() => { navigate('/skippable-ads'); setShowAdsDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <PlayCircle className="w-4 h-4 text-blue-500" /> Skippable Ads
                  </button>
                  <button onClick={() => { navigate('/unskippable-ads'); setShowAdsDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <RadioTower className="w-4 h-4 text-purple-500" /> Unskippable Ads
                  </button>
                  <button onClick={() => { navigate('/shorts-ads'); setShowAdsDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <Smartphone className="w-4 h-4 text-red-500" /> Shorts Ads
                  </button>
                  <div className="h-px bg-[var(--border-primary)] my-1"></div>
                  <div className="px-3 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Tools</div>
                  <button onClick={() => { navigate('/ads/create'); setShowAdsDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <Wand2 className="w-4 h-4 text-orange-500" /> Creation Studio
                  </button>
              </div>
            )}
          </div>
        )}

        {/* Create Button with Dropdown */}
        {currentUser && (
          <div className="relative" ref={createButtonRef}>
            <button
              onClick={() => setShowCreateDropdown(prev => !prev)}
              title="Create"
              aria-label="Create content"
              aria-haspopup="true"
              aria-expanded={showCreateDropdown}
              className="flex items-center gap-2 rounded-full border border-[var(--border-secondary)] hover:bg-[var(--background-tertiary)] transition-colors p-2.5 sm:px-4 sm:py-2"
            >
              <Upload className="w-5 h-5" />
              <span className="font-semibold text-sm hidden sm:block">Create</span>
            </button>
            {showCreateDropdown && (
              <div ref={createDropdownRef} className="absolute top-full right-0 mt-2 w-72 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] shadow-2xl p-2 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Media</div>
                  <button onClick={() => { openUploadModal('initial', false, 'video'); setShowCreateDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <Video className="w-4 h-4" /> Upload Video
                  </button>
                  <button onClick={() => { openUploadModal('initial', false, 'image'); setShowCreateDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <ImageIcon className="w-4 h-4" /> Upload Image
                  </button>
                  <button onClick={() => { openUploadModal('recording', true, 'video'); setShowCreateDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <Camera className="w-4 h-4" /> Record a Short
                  </button>
                  <div className="h-px bg-[var(--border-primary)] my-1"></div>
                  <div className="px-3 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Tools</div>
                  <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" onClick={() => setShowCreateDropdown(false)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <Palette className="w-4 h-4 text-[#7D2AE8]" /> Canva Design Tool
                  </a>
                  <a href="https://www.google.co.in/inputtools/try/" target="_blank" rel="noopener noreferrer" onClick={() => setShowCreateDropdown(false)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors">
                      <Keyboard className="w-4 h-4 text-blue-500" /> Typing Tools
                  </a>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        {isAdmin && (
          <button
            onClick={handleSave}
            title={isSaved ? "Saved!" : "Save all uploads"}
            aria-label="Save all uploads"
            className={`p-2.5 rounded-full transition-all duration-300 ${isSaved ? 'bg-green-500/10 text-green-500' : 'hover:bg-[var(--background-tertiary)]'}`}
            disabled={isSaved}
          >
            {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          </button>
        )}

        {/* Go Live Button */}
        {isAdmin && (
          <button
            onClick={() => navigate('/live')}
            title="Go Live"
            className="p-2.5 rounded-full hover:bg-[var(--background-tertiary)] transition-colors hidden sm:block"
          >
            <Radio className="w-5 h-5" />
          </button>
        )}
        
        {/* Reload Button */}
        <button
          onClick={() => window.location.reload()}
          title="Reload page"
          aria-label="Reload page"
          className="p-2.5 rounded-full hover:bg-[var(--background-tertiary)] transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {/* Download App Button */}
        <button
          onClick={handleDownloadApp}
          title={currentUser ? "Download App" : "Sign in to download"}
          aria-label="Download App"
          disabled={!currentUser}
          className={downloadAppClasses}
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="p-2.5 rounded-full hover:bg-[var(--background-tertiary)] transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifButtonRef}
            onClick={() => currentUser && setShowNotifications(!showNotifications)}
            disabled={!currentUser}
            title={currentUser ? "Notifications" : "Sign in to view notifications"}
            className={`p-2.5 rounded-full transition-colors ${
              currentUser
                ? 'hover:bg-[var(--background-tertiary)]'
                : 'text-[var(--text-tertiary)] cursor-not-allowed'
            }`}
          >
            <Bell className="w-5 h-5" />
            {currentUser && unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{unreadCount}</span>}
          </button>
          {currentUser && showNotifications && (
            <div ref={notificationRef} className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] shadow-2xl animate-in fade-in zoom-in-95">
              <div className="p-3 font-semibold border-b border-[var(--border-primary)] flex items-center">
                <span>Notifications</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 flex gap-3 border-b border-[var(--border-primary)]/50 ${!n.read ? 'bg-[hsl(var(--accent-color))]/5' : ''}`}>
                    <img src={n.avatar} className="w-10 h-10 rounded-full flex-shrink-0" alt="" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-bold">{n.user}</span> {n.action}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{n.time}</p>
                    </div>
                    {n.thumbnail && <img src={n.thumbnail} className="w-20 aspect-video rounded-md" alt="" />}
                  </div>
                ))}
              </div>
               <div className="p-2 text-center">
                  <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10 font-semibold text-sm transition-colors">Mark all as read</button>
               </div>
            </div>
          )}
        </div>
        
        {/* User Avatar & Dropdown */}
        {currentUser ? (
           <div className="relative">
              <button ref={avatarButtonRef} onClick={() => setShowDropdown(!showDropdown)} className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[hsl(var(--accent-color))] transition-all">
                 <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover"/>
              </button>
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[var(--background-secondary)]" />
              {showDropdown && (
                <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-64 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] shadow-2xl animate-in fade-in zoom-in-95">
                   <div className="p-3 border-b border-[var(--border-primary)] flex items-center gap-3">
                     <div className="relative flex-shrink-0">
                       <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                       <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[var(--background-secondary)]" />
                     </div>
                     <div>
                       <p className="font-semibold text-sm">{currentUser.name}</p>
                       <p className="text-xs text-[var(--text-tertiary)] truncate">{currentUser.email}</p>
                     </div>
                   </div>
                   <div className="p-2">
                     {isPremium && (
                       <div className="px-3 py-2 text-amber-500 font-semibold text-sm flex items-center gap-2">
                         <Gem className="w-4 h-4" /> Premium Member
                       </div>
                     )}
                     {isAdmin && (
                       <div className="px-3 py-2 text-red-500 font-semibold text-sm flex items-center gap-2">
                         <ShieldAlert className="w-4 h-4" /> Admin Access
                       </div>
                     )}
                     <button onClick={() => { navigate('/profile'); setShowDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors"><User className="w-4 h-4"/> Your Profile</button>
                     <button onClick={() => { setShowSendToMobileModal(true); setShowDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors"><Smartphone className="w-4 h-4"/> Send to Mobile</button>
                     <button onClick={() => { navigate('/settings'); setShowDropdown(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--background-tertiary)] text-sm transition-colors"><Settings className="w-4 h-4"/> Settings</button>
                     <div className="h-px bg-[var(--border-primary)] my-1"></div>
                     <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10 font-semibold text-sm transition-colors"><LogOut className="w-4 h-4"/> Sign out</button>
                   </div>
                </div>
              )}
           </div>
        ) : (
          <button 
            onClick={() => navigate('/signup')} 
            className="px-4 py-2 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold text-sm hover:brightness-90 transition-colors shadow-md"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
    </>
  );
};
