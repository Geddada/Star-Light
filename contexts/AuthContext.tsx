
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as CurrentUser, Video, AdCampaign, UnskippableAdCampaign, ShortsAdCampaign, Report } from '../types';

const ADMIN_EMAIL = 'admin@starlight.app';
const ADMIN_BLOCKED_USERS_KEY = 'starlight_admin_blocked_users';

interface AuthContextType {
  currentUser: CurrentUser | null;
  isAdmin: boolean;
  isPremium: boolean;
  login: (user: CurrentUser, shouldNavigate?: boolean) => void;
  logout: () => void;
  upgradeToPremium: () => void;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// IMPORTANT: To enable Google Sign-In, you must replace 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
// with your actual Google Cloud project's OAuth 2.0 Client ID.
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  const gsiInitialized = useRef(false);

  const login = useCallback((user: CurrentUser, shouldNavigate = true) => {
    // Check for admin-set blocks before proceeding with login
    const adminBlockedUsersJSON = localStorage.getItem(ADMIN_BLOCKED_USERS_KEY);
    const adminBlockedUsers: any[] = adminBlockedUsersJSON ? JSON.parse(adminBlockedUsersJSON) : [];

    const blockInfo = adminBlockedUsers.find(u => u.email === user.email);

    if (blockInfo) {
        if (blockInfo.blockType === 'permanent') {
            alert('This account has been permanently blocked by an administrator.');
            return; // Prevent login
        }
        if (blockInfo.blockType === 'temporary') {
            const now = new Date().getTime();
            if (now < blockInfo.expiresAt) {
                const expiryDate = new Date(blockInfo.expiresAt).toLocaleString();
                alert(`This account has been temporarily blocked. The block will be lifted on ${expiryDate}.`);
                return; // Prevent login
            } else {
                // Block has expired, remove it and allow login
                const updatedBlocks = adminBlockedUsers.filter(u => u.email !== user.email);
                localStorage.setItem(ADMIN_BLOCKED_USERS_KEY, JSON.stringify(updatedBlocks));
            }
        }
    }
    
    // --- Proceed with login ---
    
    // Add/update user in the global user list for admin purposes
    const ALL_USERS_KEY = 'starlight_all_users';
    const allUsersJSON = localStorage.getItem(ALL_USERS_KEY);
    let allUsers: CurrentUser[] = allUsersJSON ? JSON.parse(allUsersJSON) : [];
    const userIndex = allUsers.findIndex(u => u.email === user.email);
    
    let userToLogin: CurrentUser;

    if (userIndex > -1) {
        // User exists, use their existing data but update name/avatar/premium status from login provider
        const existingUser = allUsers[userIndex];
        userToLogin = { 
            ...existingUser, 
            name: user.name, 
            avatar: user.avatar,
            isPremium: user.isPremium || existingUser.isPremium // if either is premium, keep it
        };
        allUsers[userIndex] = userToLogin;
    } else {
        // New user, add joinedDate
        userToLogin = { ...user, joinedDate: new Date().toISOString() };
        allUsers.push(userToLogin);
    }
    
    setCurrentUser(userToLogin);
    const isNowAdmin = userToLogin.email === ADMIN_EMAIL;
    const isNowPremium = userToLogin.isPremium || isNowAdmin;
    
    setIsAdmin(isNowAdmin);
    setIsPremium(isNowPremium);
    localStorage.setItem('currentUser', JSON.stringify(userToLogin));
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));

    if (isNowPremium && userToLogin.email) {
      const creditsKey = `starlight_ad_credits_${userToLogin.email}`;
      if (!localStorage.getItem(creditsKey)) {
        const adCredits = { skippable: 5, unskippable: 5 };
        localStorage.setItem(creditsKey, JSON.stringify(adCredits));
      }
    }

    if (shouldNavigate) {
      navigate('/');
    }
  }, [navigate]);
  
  // Use a ref for login to break dependency cycle in useEffect
  const loginRef = useRef(login);
  useEffect(() => {
    loginRef.current = login;
  }, [login]);

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        loginRef.current(user, false); // Don't navigate on initial load
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const logout = () => {
    // Revoke Google session only if GSI is initialized
    if (gsiInitialized.current && window.google?.accounts?.id && currentUser?.email && !['guest@starlight.app', ADMIN_EMAIL].includes(currentUser.email)) {
        window.google.accounts.id.revoke(currentUser.email, () => {
          console.log("Google account revoked.");
        });
    }

    setCurrentUser(null);
    setIsAdmin(false);
    setIsPremium(false);
    localStorage.removeItem('currentUser');
    navigate('/');
  };
  
  const upgradeToPremium = () => {
    if (currentUser) {
        const updatedUser = { ...currentUser, isPremium: true };
        setCurrentUser(updatedUser);
        setIsPremium(true);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Grant ad credits on upgrade
        if (currentUser.email) {
            const creditsKey = `starlight_ad_credits_${currentUser.email}`;
            const adCredits = { skippable: 5, unskippable: 5 };
            localStorage.setItem(creditsKey, JSON.stringify(adCredits));
        }
    }
  };
  
  const deleteAccount = () => {
    if (!currentUser) return;

    const userEmail = currentUser.email;
    const userName = currentUser.name;

    // 1. Simple removals of user-specific data
    localStorage.removeItem('watch_history');
    localStorage.removeItem('liked_videos');
    localStorage.removeItem('watch_later_videos');
    localStorage.removeItem('starlight_subscriptions');
    localStorage.removeItem('starlight_blocked_users');
    if (userEmail) {
        localStorage.removeItem(`starlight_ad_credits_${userEmail}`);
    }

    // 2. Filtered removals from shared data
    let userVideoIds: string[] = [];
    const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
    if (uploadedVideosJSON) {
        let allUploadedVideos: Video[] = JSON.parse(uploadedVideosJSON);
        userVideoIds = allUploadedVideos
            .filter(video => video.uploaderName === userName)
            .map(video => video.id);
        
        const otherUsersVideos = allUploadedVideos.filter(video => video.uploaderName !== userName);
        localStorage.setItem('starlight_uploaded_videos', JSON.stringify(otherUsersVideos));
    }

    const userAdsJSON = localStorage.getItem('starlight_user_ads');
    if (userAdsJSON) {
        const allUserAds: (AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[] = JSON.parse(userAdsJSON);
        // PromoteVideoModal uses communityName to store the uploader's name
        const otherUsersAds = allUserAds.filter(ad => ad.communityName !== userName);
        localStorage.setItem('starlight_user_ads', JSON.stringify(otherUsersAds));
    }

    const reportsJSON = localStorage.getItem('starlight_reports');
    if (reportsJSON) {
        const allReports: Report[] = JSON.parse(reportsJSON);
        // Remove reports made by the user AND reports against their content
        const otherReports = allReports.filter(report => 
            report.reporterEmail !== userEmail && !userVideoIds.includes(report.video.id)
        );
        localStorage.setItem('starlight_reports', JSON.stringify(otherReports));
    }

    // 3. Object property removal from profile details map
    if (userEmail) {
        const profileDetailsJSON = localStorage.getItem('starlight_profile_details');
        if (profileDetailsJSON) {
            const allProfileDetails = JSON.parse(profileDetailsJSON);
            delete allProfileDetails[userEmail];
            localStorage.setItem('starlight_profile_details', JSON.stringify(allProfileDetails));
        }
    }

    // 4. Final logout clears currentUser state and navigates home
    logout();
  };

  // Initialize the GSI client
  useEffect(() => {
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
        console.warn(`
********************************************************************************
* WARNING: Google Sign-In is not configured.                                   *
* Please replace 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' with your  *
* actual Google Client ID in 'contexts/AuthContext.tsx'.                       *
* You can create one at: https://console.cloud.google.com/apis/credentials     *
********************************************************************************
        `);
        return; // Don't initialize GSI with a placeholder, prevents console error
    }

    const handleCredentialResponse = (response: any) => {
        const userObject = JSON.parse(atob(response.credential.split('.')[1]));
        const user: CurrentUser = {
            name: userObject.name,
            avatar: userObject.picture,
            email: userObject.email,
            isPremium: false,
        };
        loginRef.current(user);
    };

    const initializeGsi = () => {
        if (window.google?.accounts?.id && !gsiInitialized.current) {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
            });
            gsiInitialized.current = true;
        }
    };

    const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (script) {
        script.addEventListener('load', initializeGsi);
        // If script is already loaded, GSI might be available
        if (window.google) {
            initializeGsi();
        }
        return () => script.removeEventListener('load', initializeGsi);
    }
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isPremium, login, logout, upgradeToPremium, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
