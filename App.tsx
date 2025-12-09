
import React from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { Thanks } from './pages/Thanks';
import { ShortsAds } from './pages/ShortsAds';
import { CreatorStudio } from './pages/CreatorStudio';
import { CinematicAdCreator } from './pages/CinematicAdCreator';
import { VideoEditor } from './pages/VideoEditor';
import { Business } from './pages/Business';
import { AdCreationHub } from './pages/AdCreationHub';
import { MobileBottomNav } from './components/MobileBottomNav';


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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const isWatchPage = location.pathname.startsWith('/watch');
  const isEditPage = location.pathname.startsWith('/edit');
  const isSignupPage = location.pathname === '/signup';
  const isShortsPage = location.pathname === '/shorts';
  const noLayoutPages = ['/thanks', '/signup'];

  
  if (noLayoutPages.includes(location.pathname) || isEditPage) {
      return (
         <div className="flex flex-col h-screen max-h-screen bg-[var(--background-primary)] text-[var(--text-primary)] font-sans selection:bg-[hsl(var(--accent-color))] selection:text-white">
             <main className="flex-1 overflow-y-auto flex flex-col">
                <div className="flex-grow">
                  {children}
                </div>
             </main>
         </div>
      );
  }
  
  // Full-screen layouts that don't need the main header/sidebar structure
  if (isShortsPage) {
    const bgClass = 'bg-black';
    return (
      <div className={`h-screen max-h-screen ${bgClass} text-[var(--text-primary)] font-sans overflow-hidden flex flex-col`}>
        {isShortsPage && <Header />}
        <main className="h-full w-full flex-1 overflow-hidden pb-14 md:pb-0">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[var(--background-primary)] text-[var(--text-primary)] font-sans selection:bg-[hsl(var(--accent-color))] selection:text-white overflow-hidden">
      <Header />
      <AnnouncementBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          aria-label="Main navigation"
          className="w-72 flex-shrink-0 bg-[var(--background-primary)] border-r border-[var(--border-primary)] hidden md:flex flex-col"
        >
           <div className="h-full overflow-y-auto custom-scrollbar">
            <Sidebar isOpen={true} />
           </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col relative custom-scrollbar scroll-smooth pb-14 md:pb-0">
          <div className="flex-grow">
            {children}
          </div>
          {!isWatchPage && <Footer />}
        </main>
      </div>
      <MobileBottomNav />
      {currentUser && <Chatbot />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
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
              <Route path="/studio" element={
                <ProtectedRoute>
                  <CreatorStudio />
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
              <Route path="/contact" element={<Contact />} />
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
            </Routes>
          </Layout>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
