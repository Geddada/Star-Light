
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Watch } from './pages/Watch';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Copyright } from './pages/Copyright';
import { Developers } from './pages/Developers';
import { HowItWorks } from './pages/HowItWorks';
import { SkippableAds } from './pages/SkippableAds';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AutoplayProvider } from './contexts/AutoplayContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccessDenied } from './pages/AccessDenied';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Press } from './pages/Press';
import { Footer } from './components/Footer';
import { Creators } from './pages/Creators';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Signup } from './pages/Signup';
import { History } from './pages/History';
import { LikedVideos } from './pages/LikedVideos';
import { WatchLater } from './pages/WatchLater';
import { Shorts } from './pages/Shorts';
import { Subscriptions } from './pages/Subscriptions';
import { Monetization } from './pages/Monetization';
import { ApplyMonetization } from './pages/ApplyMonetization';
import { Playlist } from './pages/Playlist';
import { Analytics } from './pages/Analytics';
import { CopyrightStrikes } from './pages/CopyrightStrikes';
import { CopyrightSchool } from './pages/CopyrightSchool';
import { Premium } from './pages/Premium';
import { Invite } from './pages/Invite';
import { Live } from './pages/Live';
import { Reports as MyReports } from './pages/Reports';
import { Admin } from './pages/Admin';
import { Community } from './pages/Community';
import { AdSettings } from './pages/AdSettings';
import { Help } from './pages/Help';
import { Chatbot } from './components/Chatbot';
import { Languages } from './pages/Languages';
import { UnskippableAds } from './pages/UnskippableAds';
import { AIAdAssistant } from './pages/AIAdAssistant';
import { AdminActivities } from './pages/AdminActivities';
import { ManageAdmins } from './pages/ManageAdmins';
import { BrandedEmail } from './pages/BrandedEmail';
import { CreateCommunity } from './pages/CreateCommunity';
import { UserManagement } from './pages/UserManagement';
import { ContentManagement } from './pages/ContentManagement';
import { Thanks } from './pages/Thanks';
import { ShortsAds } from './pages/ShortsAds';
import { CreatorStudio } from './pages/CreatorStudio';
import { CinematicAdCreator } from './pages/CinematicAdCreator';
import { VideoEditor } from './pages/VideoEditor';
import { Business } from './pages/Business';
import { AdCreationHub } from './pages/AdCreationHub';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SplashScreen } from './components/SplashScreen';
import { TestNewFeatures } from './pages/TestNewFeatures';
import { BlurVideo } from './pages/BlurVideo';
import { CookieConsent } from './components/CookieConsent';
import { Feedback } from './pages/Feedback';
import { Explore } from './pages/Explore';
import { Channel } from './pages/Channel';
import { FactionActivities } from './pages/FactionActivities';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { UserContent } from './pages/UserContent';
import { NotFound } from './pages/NotFound';
import { PremiumAnalytics } from './pages/PremiumAnalytics';
import { Studio } from './pages/Studio';


declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    handleCredentialResponse: (response: any) => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
          prompt: () => void;
          revoke: (email: string, done: () => void) => void;
        };
      };
    };
    aistudio?: AIStudio;
  }
}

const ShortLinkRedirect: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  return <Navigate to={`/watch/${videoId}`} replace />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const isWatchPage = location.pathname.startsWith('/watch');
  const isEditPage = location.pathname.startsWith('/edit');
  const isBlurPage = location.pathname.startsWith('/blur');
  const isShortsPage = location.pathname === '/shorts';
  const isStudioPage = location.pathname.startsWith('/studio') || location.pathname === '/news-overlay';
  // Add /lead-admin to pages without main layout
  const noLayoutPages = ['/thanks', '/signup'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focusSearch'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  
  if (noLayoutPages.includes(location.pathname) || isEditPage || isBlurPage || isStudioPage) {
      const bgClass = isStudioPage ? 'bg-[var(--background-secondary)]' : 'bg-[var(--background-primary)]';
      return (
         <div className={`flex flex-col h-screen max-h-screen ${bgClass} text-[var(--text-primary)] font-sans selection:bg-[hsl(var(--accent-color))] selection:text-white`}>
             <main className="flex-1 overflow-y-auto flex flex-col">
                <div className="flex-grow">
                  {children}
                </div>
             </main>
             {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
         </div>
      );
  }
  
  // Full-screen layouts that don't need the main header/sidebar structure
  if (isShortsPage) {
    const bgClass = 'bg-black';
    return (
      <div className={`h-screen max-h-screen ${bgClass} text-[var(--text-primary)] font-sans overflow-hidden flex flex-col`}>
        {isShortsPage && <Header />}
        <main className="h-full w-full flex-1 overflow-hidden pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
        <MobileBottomNav />
        {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[var(--background-primary)] text-[var(--text-primary)] font-sans selection:bg-[hsl(var(--accent-color))] selection:text-white overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <AnnouncementBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          aria-label="Main navigation"
          className={`${isSidebarOpen ? 'w-72' : 'w-[72px]'} flex-shrink-0 bg-[var(--background-primary)] border-r border-[var(--border-primary)] hidden md:flex flex-col transition-[width] duration-300`}
        >
           <div className="h-full overflow-y-auto custom-scrollbar overflow-x-hidden">
            <Sidebar isOpen={isSidebarOpen} />
           </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col relative custom-scrollbar scroll-smooth pb-20 md:pb-0">
          <div className="flex-grow">
            {children}
          </div>
          {!isWatchPage && <Footer />}
        </main>
      </div>
      <MobileBottomNav />
      {currentUser && <Chatbot />}
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(() => window.innerWidth < 768);
  const [splashOpacity, setSplashOpacity] = useState('opacity-100');

  useEffect(() => {
    if (showSplash) {
      // Start fade out after 4s (allowing sun animation to complete)
      const fadeTimer = setTimeout(() => {
        setSplashOpacity('opacity-100');
        // Actually start fade out slightly before unmount
        setTimeout(() => setSplashOpacity('opacity-0'), 4000);
      }, 100); 

      // Unmount after 4.5s
      const unmountTimer = setTimeout(() => {
        setShowSplash(false);
      }, 4500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [showSplash]);

  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <AutoplayProvider>
            {showSplash && <SplashScreen opacity={splashOpacity} />}
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/s/:videoId" element={<ShortLinkRedirect />} />
                
                {/* Explore & Topics */}
                <Route path="/explore" element={<Explore />} />
                <Route path="/trending" element={<Explore />} />
                <Route path="/music" element={<Explore />} />
                <Route path="/gaming" element={<Explore />} />
                <Route path="/news" element={<Explore />} />
                <Route path="/sports" element={<Explore />} />
                <Route path="/learning" element={<Explore />} />

                <Route path="/channel/:channelId" element={<Channel />} />
                <Route path="/live" element={
                  <ProtectedRoute requirePremium={true}>
                    <Live />
                  </ProtectedRoute>
                } />
                 <Route path="/edit/:videoId" element={
                  <ProtectedRoute>
                    <VideoEditor />
                  </ProtectedRoute>
                } />
                <Route path="/blur" element={
                  <ProtectedRoute>
                    <BlurVideo />
                  </ProtectedRoute>
                } />
                <Route path="/labs" element={
                  <ProtectedRoute requirePremium={true}>
                    <TestNewFeatures />
                  </ProtectedRoute>
                } />
                <Route path="/studio" element={
                  <ProtectedRoute>
                    <Studio />
                  </ProtectedRoute>
                } />
                <Route path="/news-overlay" element={
                  <ProtectedRoute>
                    <CreatorStudio />
                  </ProtectedRoute>
                } />
                <Route path="/content" element={
                  <ProtectedRoute>
                    <UserContent />
                  </ProtectedRoute>
                } />
                <Route path="/shorts" element={<Shorts />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/monetization" element={<Monetization />} />
                <Route path="/apply-monetization" element={
                  <ProtectedRoute requirePremium={true}>
                    <ApplyMonetization />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/premium-analytics" element={
                  <ProtectedRoute requirePremium={true}>
                    <PremiumAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/watch/:videoId" element={<Watch />} />
                <Route path="/results" element={<Search />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/history" element={<History />} />
                <Route path="/liked-videos" element={<LikedVideos />} />
                <Route path="/watch-later" element={<WatchLater />} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/press" element={<Press />} />
                <Route path="/creators" element={<Creators />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/lead-admin" element={<Signup />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/copyright" element={<Copyright />} />
                <Route path="/copyright-strikes" element={<CopyrightStrikes />} />
                <Route path="/copyright-school" element={<CopyrightSchool />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/help" element={<Help />} />
                <Route path="/invite" element={<Invite />} />
                <Route path="/skippable-ads" element={
                  <ProtectedRoute requirePremium={true}>
                    <SkippableAds />
                  </ProtectedRoute>
                } />
                <Route path="/unskippable-ads" element={
                  <ProtectedRoute requirePremium={true}>
                    <UnskippableAds />
                  </ProtectedRoute>
                } />
                <Route path="/shorts-ads" element={
                  <ProtectedRoute requirePremium={true}>
                    <ShortsAds />
                  </ProtectedRoute>
                } />
                <Route path="/ai-ad-assistant" element={
                  <ProtectedRoute requirePremium={true}>
                    <AIAdAssistant />
                  </ProtectedRoute>
                } />
                <Route path="/ads/create" element={
                  <ProtectedRoute requirePremium={true}>
                    <AdCreationHub />
                  </ProtectedRoute>
                } />
                <Route path="/cinematic-ad-creator" element={
                  <ProtectedRoute requirePremium={true}>
                    <CinematicAdCreator />
                  </ProtectedRoute>
                } />
                <Route path="/languages" element={<Languages />} />
                <Route path="/my-reports" element={
                  <ProtectedRoute>
                    <MyReports />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/activities" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminActivities />
                  </ProtectedRoute>
                } />
                <Route path="/admin/user-activities" element={
                  <ProtectedRoute requireAdmin={true}>
                    <FactionActivities />
                  </ProtectedRoute>
                } />
                <Route path="/admin/manage" element={
                  <ProtectedRoute requireAdmin={true}>
                    <ManageAdmins />
                  </ProtectedRoute>
                } />
                <Route path="/admin/user-management" element={
                  <ProtectedRoute requireAdmin={true}>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/content" element={
                  <ProtectedRoute requireAdmin={true}>
                    <ContentManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/ad-settings" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdSettings />
                  </ProtectedRoute>
                } />
                <Route path="/community" element={<Community />} />
                <Route path="/community/create" element={
                  <ProtectedRoute requireAdmin={true}>
                    <CreateCommunity />
                  </ProtectedRoute>
                } />
                <Route path="/branded-email" element={<BrandedEmail />} />
                <Route path="/thanks" element={<Thanks />} />
                <Route path="/business" element={<Business />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                {/* Catch all redirect - now points to 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <CookieConsent />
          </AutoplayProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
