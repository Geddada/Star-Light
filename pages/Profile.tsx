import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UploadCloud, Video as VideoIcon, Camera, Settings, Film, User, Flag, Trash2, CheckCircle, ShieldAlert, Check, Clock, Megaphone, Gem, Gift, Users } from 'lucide-react';
import { Video as VideoType, Report, Playlist as PlaylistType, ProfileDetails, AdCampaign, UnskippableAdCampaign, ShortsAdCampaign, Community } from '../types';
import { VideoCard } from '../components/VideoCard';
import { UploadModal } from '../components/UploadModal';
import { useAuth } from '../contexts/AuthContext';
import { ShortsCard } from '../components/ShortsCard';
import { PromoteVideoModal } from '../components/PromoteVideoModal';
import { CampaignCard } from '../components/CampaignCard';

const ReportStatusBadge: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const statusMap = {
    'In Review': {
      icon: Clock,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      label: 'In Review'
    },
    'Action Taken': {
      icon: ShieldAlert,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      label: 'Action Taken'
    },
    'Dismissed': {
      icon: Check,
      color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
      label: 'Dismissed'
    }
  };

  const { icon: Icon, color, label } = statusMap[status] || statusMap['In Review'];

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};


export const Profile: React.FC = () => {
  const { currentUser, isPremium, isAdmin, logout } = useAuth();
  const [uploadedVideos, setUploadedVideos] = useState<VideoType[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  // FIX: Updated ad type in state to include ShortsAdCampaign.
  const [promotions, setPromotions] = useState<(AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[]>([]);
  const [adCredits, setAdCredits] = useState<{ skippable: number, unskippable: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | undefined>(undefined);
  const [promotingVideo, setPromotingVideo] = useState<VideoType | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'about' | 'reports' | 'promotions'>('videos');
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({});

  const loadData = useCallback(() => {
    if (currentUser) {
      // Load uploaded videos by current user
      const existingUploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
      const allUploadedVideos: VideoType[] = existingUploadedVideosJSON ? JSON.parse(existingUploadedVideosJSON) : [];
      const userVideos = allUploadedVideos.filter(video => video.uploaderName === currentUser.name);
      setUploadedVideos(userVideos);

      // Load reports on user's content
      const reportsJson = localStorage.getItem('starlight_reports');
      if (reportsJson) {
        const allReports: Report[] = JSON.parse(reportsJson);
        const userVideoIds = userVideos.map(v => v.id);
        const userReports = allReports.filter(r => userVideoIds.includes(r.video.id));
        setReports(userReports);
      }
      
      // Load extended profile details
      if (currentUser.email) {
        const allProfileDetailsJSON = localStorage.getItem('starlight_profile_details');
        if (allProfileDetailsJSON) {
          const allDetails = JSON.parse(allProfileDetailsJSON);
          const userDetails = allDetails[currentUser.email];
          if (userDetails) {
            setProfileDetails(userDetails);
          }
        }
      }

      // Load promotions and ad credits for premium/admin users
      if (isPremium || isAdmin) {
        const promotionsJson = localStorage.getItem('starlight_user_ads');
        // FIX: Updated ad type in state to include ShortsAdCampaign.
        const allPromotions: (AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[] = promotionsJson ? JSON.parse(promotionsJson) : [];
        const userPromotions = allPromotions.filter(p => p.communityName === currentUser.name);
        setPromotions(userPromotions);

        if (currentUser.email) {
          const creditsKey = `starlight_ad_credits_${currentUser.email}`;
          const creditsJson = localStorage.getItem(creditsKey);
          if (creditsJson) {
            setAdCredits(JSON.parse(creditsJson));
          } else if (isPremium) {
            // Give default credits if none found for a premium user
            const defaultCredits = { skippable: 5, unskippable: 5 };
            localStorage.setItem(creditsKey, JSON.stringify(defaultCredits));
            setAdCredits(defaultCredits);
          }
        }
      }

      setLoading(false);
    } else {
      navigate('/');
    }
  }, [currentUser, navigate, isPremium, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    window.addEventListener('videosUpdated', loadData);
    return () => {
      window.removeEventListener('videosUpdated', loadData);
    };
  }, [loadData]);
  
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadData();
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  const handleEdit = (video: VideoType) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };
  
  const handlePromote = (video: VideoType) => {
    setPromotingVideo(video);
  };

  const handleDeleteVideoAndReports = (videoId: string, videoTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${videoTitle}"? This will remove the video and all associated reports. This cannot be undone.`)) {
      
      const updateVideoList = (storageKey: string) => {
        const json = localStorage.getItem(storageKey);
        if(json) {
          let videos: VideoType[] = JSON.parse(json);
          videos = videos.filter(v => v.id !== videoId);
          localStorage.setItem(storageKey, JSON.stringify(videos));
        }
      };

      const updatePlaylists = () => {
        const json = localStorage.getItem('starlight_playlists');
        if (json) {
          let playlists: PlaylistType[] = JSON.parse(json);
          playlists = playlists.map(p => ({
            ...p,
            videos: p.videos.filter(v => v.id !== videoId)
          }));
          localStorage.setItem('starlight_playlists', JSON.stringify(playlists));
        }
      };

      // Remove video from all user-specific lists
      updateVideoList('starlight_uploaded_videos');
      updateVideoList('watch_history');
      updateVideoList('liked_videos');
      updateVideoList('watch_later_videos');
      updatePlaylists();
      
      // Remove all reports associated with this video from the main reports list
      const allReportsJson = localStorage.getItem('starlight_reports');
      if (allReportsJson) {
          let allReports: Report[] = JSON.parse(allReportsJson);
          allReports = allReports.filter(r => r.video.id !== videoId);
          localStorage.setItem('starlight_reports', JSON.stringify(allReports));
      }

      loadData(); // Re-load data to update the UI
      window.dispatchEvent(new Event('playlistsUpdated'));
    }
  };

  const handleDelete = (video: VideoType) => {
    handleDeleteVideoAndReports(video.id, video.title);
  };
  
  const handleDeletePromotion = (campaignId: string) => {
    if (window.confirm("Are you sure you want to delete this ad promotion?")) {
        const userAdsJson = localStorage.getItem('starlight_user_ads');
        if (userAdsJson) {
            // FIX: Updated ad type in state to include ShortsAdCampaign.
            let userAds: (AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[] = JSON.parse(userAdsJson);
            userAds = userAds.filter(ad => ad.id !== campaignId);
            localStorage.setItem('starlight_user_ads', JSON.stringify(userAds));
            loadData(); // Refresh the list
        }
    }
  };


  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This is a mock function as actual file handling is out of scope.
    // In a real app, you would upload to a server and get back a URL.
    if (currentUser) {
      alert(`In a real app, you'd upload a new photo for ${currentUser.name}!`);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6">
        <h2 className="text-2xl font-bold mb-4">You are not signed in.</h2>
      </div>
    );
  }

  const regularVideos = uploadedVideos.filter(v => !v.isShort);
  const shortsVideos = uploadedVideos.filter(v => v.isShort);

  return (
    <div className="flex flex-col w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)]">
      <div className="w-full h-48 md:h-64 bg-gradient-to-r from-[hsl(var(--accent-color))] to-[#020617] shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: 'url(https://picsum.photos/seed/channelbanner/1200/200)'}}></div>
      </div>
      
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 md:-mt-20">
          <div className="relative group flex-shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--background-primary)] shadow-lg bg-[var(--background-secondary)] object-cover"
            />
            <span className="absolute bottom-2 right-2 block h-6 w-6 rounded-full bg-green-500 border-4 border-[var(--background-primary)]" />
            <label
              htmlFor="profile-photo-upload"
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-8 h-8 text-white" />
            </label>
            <input
              id="profile-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="flex flex-col md:pt-24 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{currentUser.name}</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">@{currentUser.name.toLowerCase().replace(/\s/g, '')} • {uploadedVideos.length} videos</p>
                </div>
                <div className="flex items-center gap-3 mt-4 sm:mt-0 flex-wrap">
                    <button
                        onClick={() => {
                          setEditingVideo(undefined);
                          setShowUploadModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center gap-2 w-fit text-sm font-semibold shadow-md"
                        aria-label="Upload video"
                    >
                        <UploadCloud className="w-4 h-4" />
                        Upload
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2.5 bg-[var(--background-secondary)] text-[var(--text-primary)] rounded-full hover:bg-[var(--background-tertiary)] transition-colors w-fit text-sm border border-[var(--border-primary)]"
                        aria-label="Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2.5 bg-[var(--background-secondary)] text-[var(--text-primary)] rounded-full hover:bg-[var(--background-tertiary)] transition-colors w-fit text-sm border border-[var(--border-primary)]"
                        aria-label="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-[var(--border-primary)]">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('videos')} className={`py-3 font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'videos' ? 'border-[hsl(var(--accent-color))] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><VideoIcon className="w-4 h-4"/> Videos</button>
            <button onClick={() => setActiveTab('shorts')} className={`py-3 font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'shorts' ? 'border-[hsl(var(--accent-color))] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Film className="w-4 h-4"/> Shorts</button>
            {(isPremium || isAdmin) && <button onClick={() => setActiveTab('promotions')} className={`py-3 font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'promotions' ? 'border-[hsl(var(--accent-color))] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Megaphone className="w-4 h-4"/> Promotions</button>}
            <button onClick={() => setActiveTab('about')} className={`py-3 font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'about' ? 'border-[hsl(var(--accent-color))] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><User className="w-4 h-4"/> About</button>
            <button onClick={() => setActiveTab('reports')} className={`py-3 font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'reports' ? 'border-[hsl(var(--accent-color))] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Flag className="w-4 h-4"/> Reports</button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8 mb-8">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {Array.from({ length: 4 }).map((_, i) => <VideoCard key={i} isLoading={true} />)}
                </div>
            ) : (
                <>
                    {activeTab === 'videos' && (
                        regularVideos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                                {regularVideos.map((video) => (
                                    <VideoCard key={video.id} video={video} onEdit={handleEdit} onDelete={() => handleDelete(video)} onPromote={isPremium ? handlePromote : undefined} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)] bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] border-dashed">
                                <VideoIcon className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-semibold">No videos uploaded yet</p>
                                <p className="text-sm">Upload a video to see it here!</p>
                            </div>
                        )
                    )}

                    {activeTab === 'shorts' && (
                        shortsVideos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {shortsVideos.map((video) => (
                                    <ShortsCard key={video.id} video={video} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)] bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] border-dashed">
                                <Film className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-semibold">No Shorts uploaded yet</p>
                                <p className="text-sm">Upload a Short to see it here!</p>
                            </div>
                        )
                    )}
                    
                    {activeTab === 'promotions' && (
                      (isPremium || isAdmin) ? (
                          promotions.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                  {promotions.map((campaign) => (
                                      <CampaignCard key={campaign.id} campaign={campaign} onDelete={handleDeletePromotion} />
                                  ))}
                              </div>
                          ) : (
                              <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)] bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] border-dashed">
                                  <Megaphone className="w-16 h-16 mb-4 opacity-50" />
                                  <p className="text-lg font-semibold">No active promotions</p>
                                  <p className="text-sm max-w-sm">Promote a video from the 'Videos' tab to create an ad campaign and see its performance here.</p>
                              </div>
                          )
                      ) : null
                    )}


                    {activeTab === 'about' && (
                        <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] max-w-lg animate-in fade-in">
                            <h3 className="font-bold text-lg mb-4">About</h3>
                            <div className="space-y-3 text-sm">
                                <p><span className="font-semibold w-24 inline-block text-[var(--text-secondary)]">Name:</span> {currentUser.name}</p>
                                <p><span className="font-semibold w-24 inline-block text-[var(--text-secondary)]">Email:</span> {currentUser.email}</p>
                                <p><span className="font-semibold w-24 inline-block text-[var(--text-secondary)]">Joined:</span> {currentUser.joinedDate ? new Date(currentUser.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                                {(profileDetails.city || profileDetails.state || profileDetails.country) && (
                                  <p><span className="font-semibold w-24 inline-block text-[var(--text-secondary)]">Location:</span> {[profileDetails.city, profileDetails.state, profileDetails.country].filter(Boolean).join(', ')}</p>
                                )}
                            </div>
                            
                            {(isPremium || isAdmin) && adCredits && (
                                <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-amber-500" /> Your Ad Credits</h3>
                                    <div className="flex gap-8">
                                        <div className="text-center">
                                            <p className="font-bold text-3xl text-[var(--text-primary)]">{adCredits.skippable}</p>
                                            <p className="text-sm text-[var(--text-secondary)]">Skippable Ads</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-3xl text-[var(--text-primary)]">{adCredits.unskippable}</p>
                                            <p className="text-sm text-[var(--text-secondary)]">Unskippable Ads</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-4">Use credits to promote your videos from the 'Videos' tab. Credits reset monthly.</p>
                                </div>
                            )}

                            <button onClick={() => navigate('/settings')} className="mt-6 text-sm font-semibold text-[hsl(var(--accent-color))] hover:underline">
                                Edit details in Account Settings
                            </button>
                        </div>
                    )}
                    
                    {activeTab === 'reports' && (
                        reports.length > 0 ? (
                            <div className="space-y-4 animate-in fade-in">
                                {reports.map(report => (
                                    <div key={report.id} className="bg-[var(--background-secondary)] p-4 rounded-xl border border-yellow-500/30 flex flex-col sm:flex-row gap-4">
                                        <img
                                            src={report.video.thumbnailUrl}
                                            alt={report.video.title}
                                            className="w-full sm:w-40 aspect-video rounded-lg object-cover cursor-pointer"
                                            onClick={() => navigate(`/watch/${report.video.id}`, { state: { video: report.video } })}
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs text-[var(--text-tertiary)]">{new Date(report.reportDate).toLocaleString()}</p>
                                            <h3 className="font-bold text-md cursor-pointer hover:text-[hsl(var(--accent-color))]" onClick={() => navigate(`/watch/${report.video.id}`, { state: { video: report.video } })}>{report.video.title}</h3>

                                            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <p className="font-semibold text-sm text-yellow-500 flex items-center gap-2"><Flag className="w-4 h-4" /> Report Reason:</p>
                                                    <p className="text-sm text-[var(--text-primary)]">{report.reason}</p>
                                                  </div>
                                                  <ReportStatusBadge status={report.status} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t sm:border-t-0 sm:pt-0 sm:border-l border-[var(--border-primary)] sm:pl-4">
                                            <button
                                                onClick={() => handleDeleteVideoAndReports(report.video.id, report.video.title)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-sm font-semibold transition-colors"
                                                title="Delete Video"
                                            >
                                                <Trash2 className="w-4 h-4" /> <span>Delete Video</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)] bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] border-dashed animate-in fade-in">
                                <CheckCircle className="w-16 h-16 mb-4 opacity-50 text-green-500" />
                                <p className="text-lg font-semibold">No active reports on your content</p>
                                <p className="text-sm">Keep up the great work!</p>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
      </div>
      {showUploadModal && (
        <UploadModal 
          onClose={handleCloseModal} 
          onUploadSuccess={handleUploadSuccess} 
          videoToEdit={editingVideo}
        />
      )}
      {promotingVideo && (
        <PromoteVideoModal
            video={promotingVideo}
            onClose={() => setPromotingVideo(null)}
            onSuccess={() => {
                setPromotingVideo(null);
                loadData();
            }}
        />
      )}
    </div>
  );
};