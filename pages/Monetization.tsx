
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CircleDollarSign, 
  Users, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  PlaySquare, 
  MessageSquareHeart, 
  ShoppingBag,
  Layout,
  Gem,
  LayoutDashboard
} from 'lucide-react';
import { Video } from '../types';

export const Monetization: React.FC = () => {
  const { currentUser, isPremium } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ subs: 0, hours: 0, videos: 0, invites: 0 });

  useEffect(() => {
    if (currentUser) {
      // Deterministic mock data based on name hash to keep it consistent for the session
      const seed = currentUser.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Generate numbers that are often close to the goal for demo excitement
      const mockSubs = Math.floor((seed * 13) % 600); 
      const mockHours = Math.floor((seed * 47) % 2500); // Adjusted to be more likely near 2000
      const mockInvites = Math.floor((seed * 23) % 110);
      
      const existingUploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
      let userVideosCount = 0;
      if (existingUploadedVideosJSON) {
          const allUploadedVideos: Video[] = JSON.parse(existingUploadedVideosJSON);
          userVideosCount = allUploadedVideos.filter(video => video.uploaderName === currentUser.name).length;
      }

      setStats({ subs: mockSubs, hours: mockHours, videos: userVideosCount, invites: mockInvites });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[var(--background-primary)] overflow-y-auto">
        <div className="p-6 bg-[hsl(var(--accent-color))]/10 rounded-full mb-6">
            <CircleDollarSign className="w-16 h-16 text-[hsl(var(--accent-color))]" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">Earn money with Starlight</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md text-lg">
          Apply to the Starlight Partner Program to monetize your videos, get creator support, and more.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="px-8 py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-full filter hover:brightness-90 transition-all shadow-lg flex items-center gap-2 text-lg"
        >
           Sign In to Apply
        </button>
      </div>
    );
  }

  const subTarget = 500;
  const hourTarget = 2000;
  const videoTarget = 60;
  const inviteTarget = 100;
  
  const subProgress = Math.min((stats.subs / subTarget) * 100, 100);
  const hourProgress = Math.min((stats.hours / hourTarget) * 100, 100);
  const videoProgress = Math.min((stats.videos / videoTarget) * 100, 100);
  const inviteProgress = Math.min((stats.invites / inviteTarget) * 100, 100);
  
  const isEligible = stats.subs >= subTarget && stats.hours >= hourTarget && stats.videos >= videoTarget && stats.invites >= inviteTarget;

  const benefits = [
      {
          title: "Watch Page Ads",
          desc: "Earn from ads and Starlight Premium on the Watch Page.",
          icon: PlaySquare
      },
      {
          title: "Shorts Feed Ads",
          desc: "Earn from ads and Starlight Premium in the Shorts Feed.",
          icon: Layout
      },
      {
          title: "Community Memberships",
          desc: "Create a fan club of members paying monthly for perks.",
          icon: Users
      },
      {
          title: "Supers",
          desc: "Engage with fans who support you through one-time purchases.",
          icon: MessageSquareHeart
      },
      {
          title: "Shopping",
          desc: "Share products across your channel from your own store.",
          icon: ShoppingBag
      },
      {
          title: "Ads Manager Facility",
          desc: "Control ad placements and categories to maximize your revenue potential.",
          icon: LayoutDashboard
      }
  ];

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
       <div className="max-w-5xl mx-auto p-6 md:p-10">
           
           <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl font-bold mb-4">Earn with Starlight</h1>
                <p className="text-[var(--text-secondary)] text-lg">Hello, {currentUser.name}. Ready to become a partner?</p>
           </div>

           {/* Ways to Earn Grid */}
           <div className="mb-12">
               <h2 className="text-2xl font-bold mb-6">Many ways to earn</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {benefits.map((b, i) => (
                       <div key={i} className="p-6 rounded-xl border border-[var(--border-primary)] bg-[var(--background-secondary)] hover:border-[hsl(var(--accent-color))] transition-colors group">
                           <b.icon className="w-10 h-10 mb-4 text-[hsl(var(--accent-color))] group-hover:scale-110 transition-transform" />
                           <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                           <p className="text-[var(--text-secondary)] text-sm">{b.desc}</p>
                       </div>
                   ))}
               </div>
           </div>

           {/* Eligibility Section */}
           {isPremium ? (
            <div className="bg-[var(--background-secondary)] rounded-2xl p-8 border border-[var(--border-primary)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
               <h2 className="text-2xl font-bold mb-8">How do I join?</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                   {/* Subscriber Requirement */}
                   <div className="space-y-4">
                       <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-medium text-[var(--text-secondary)]">Requirement</span>
                           <div className="flex items-center gap-2">
                               {stats.subs >= subTarget ? (
                                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                               ) : (
                                   <span className="text-xs bg-[var(--background-primary)] px-2 py-1 rounded border border-[var(--border-primary)]">{subTarget - stats.subs} left</span>
                               )}
                           </div>
                       </div>
                       
                       <div className="relative h-4 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                           <div 
                               className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${stats.subs >= subTarget ? 'bg-green-500' : 'bg-[hsl(var(--accent-color))]'}`} 
                               style={{ width: `${subProgress}%` }}
                           />
                       </div>
                       
                       <div className="flex justify-between items-baseline">
                           <div className="flex flex-col">
                               <span className="text-3xl font-bold">{stats.subs.toLocaleString()}</span>
                               <span className="text-sm text-[var(--text-secondary)]">subscribers</span>
                           </div>
                           <span className="text-sm font-medium text-[var(--text-secondary)]">
                               of {subTarget.toLocaleString()} required
                           </span>
                       </div>
                   </div>

                   {/* Watch Hours Requirement */}
                   <div className="space-y-4">
                       <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-medium text-[var(--text-secondary)]">Requirement</span>
                            <div className="flex items-center gap-2">
                               {stats.hours >= hourTarget ? (
                                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                               ) : (
                                   <span className="text-xs bg-[var(--background-primary)] px-2 py-1 rounded border border-[var(--border-primary)]">{hourTarget - stats.hours} left</span>
                               )}
                           </div>
                       </div>
                       
                       <div className="relative h-4 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                           <div 
                               className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${stats.hours >= hourTarget ? 'bg-green-500' : 'bg-[hsl(var(--accent-color))]'}`} 
                               style={{ width: `${hourProgress}%` }}
                           />
                       </div>
                       
                       <div className="flex justify-between items-baseline">
                           <div className="flex flex-col">
                               <span className="text-3xl font-bold">{stats.hours.toLocaleString()}</span>
                               <span className="text-sm text-[var(--text-secondary)]">public watch hours</span>
                           </div>
                           <span className="text-sm font-medium text-[var(--text-secondary)]">
                               of {hourTarget.toLocaleString()} required
                           </span>
                       </div>
                   </div>
                   
                   {/* Video Upload Requirement */}
                   <div className="space-y-4">
                       <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-medium text-[var(--text-secondary)]">Requirement</span>
                           <div className="flex items-center gap-2">
                               {stats.videos >= videoTarget ? (
                                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                               ) : (
                                   <span className="text-xs bg-[var(--background-primary)] px-2 py-1 rounded border border-[var(--border-primary)]">{videoTarget - stats.videos} left</span>
                               )}
                           </div>
                       </div>
                       
                       <div className="relative h-4 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                           <div 
                               className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${stats.videos >= videoTarget ? 'bg-green-500' : 'bg-[hsl(var(--accent-color))]'}`} 
                               style={{ width: `${videoProgress}%` }}
                           />
                       </div>
                       
                       <div className="flex justify-between items-baseline">
                           <div className="flex flex-col">
                               <span className="text-3xl font-bold">{stats.videos.toLocaleString()}</span>
                               <span className="text-sm text-[var(--text-secondary)]">public videos</span>
                           </div>
                           <span className="text-sm font-medium text-[var(--text-secondary)]">
                               of {videoTarget.toLocaleString()} required
                           </span>
                       </div>
                   </div>

                    {/* User Invites Requirement */}
                   <div className="space-y-4">
                       <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-medium text-[var(--text-secondary)]">Requirement</span>
                           <div className="flex items-center gap-2">
                               {stats.invites >= inviteTarget ? (
                                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                               ) : (
                                   <span className="text-xs bg-[var(--background-primary)] px-2 py-1 rounded border border-[var(--border-primary)]">{inviteTarget - stats.invites} left</span>
                               )}
                           </div>
                       </div>
                       
                       <div className="relative h-4 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                           <div 
                               className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${stats.invites >= inviteTarget ? 'bg-green-500' : 'bg-[hsl(var(--accent-color))]'}`} 
                               style={{ width: `${inviteProgress}%` }}
                           />
                       </div>
                       
                       <div className="flex justify-between items-baseline">
                           <div className="flex flex-col">
                               <span className="text-3xl font-bold">{stats.invites.toLocaleString()}</span>
                               <span className="text-sm text-[var(--text-secondary)]">invited users</span>
                           </div>
                           <span className="text-sm font-medium text-[var(--text-secondary)]">
                               of {inviteTarget.toLocaleString()} required
                           </span>
                       </div>
                   </div>
               </div>

               {/* Action Button */}
               <div className="flex flex-col items-center justify-center pt-6 border-t border-[var(--border-primary)]">
                   <button 
                       onClick={() => navigate('/apply-monetization')}
                       disabled={!isEligible}
                       className="px-10 py-4 bg-[hsl(var(--accent-color))] text-white font-bold rounded-full filter hover:brightness-90 transition-all shadow-xl flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                       aria-label={isEligible ? "Apply for monetization" : "Application requirements not met"}
                   >
                       Apply Now <ArrowRight className="w-5 h-5" />
                   </button>
                   {!isEligible ? (
                       <p className="text-sm text-[var(--text-secondary)] mt-4 text-center">
                           You have not met the eligibility requirements yet. Keep growing your channel!
                       </p>
                   ) : (
                       <p className="text-sm text-green-500 mt-4 text-center animate-in fade-in">
                           You're eligible! Click the button above to begin your application.
                       </p>
                   )}
               </div>
            </div>
           ) : (
             <div className="bg-amber-500/10 p-8 rounded-2xl border-2 border-dashed border-amber-500/30 text-center animate-in fade-in">
                <div className="flex justify-center mb-4">
                    <Gem className="w-12 h-12 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Unlock Partner Program Eligibility</h2>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                    Monetization application is an exclusive benefit for Premium members. Upgrade your account to see your eligibility and apply to the Starlight Partner Program.
                </p>
                <button
                    onClick={() => navigate('/premium')}
                    className="px-8 py-3 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                >
                    Upgrade to Premium
                </button>
            </div>
           )}

           {/* 2-Step Verification Badge */}
           <div className="mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
               <div className="p-2 bg-green-500 rounded-full text-white">
                   <Lock className="w-5 h-5" />
               </div>
               <div>
                   <h4 className="font-bold text-[var(--text-primary)]">2-Step Verification</h4>
                   <p className="text-sm text-[var(--text-secondary)]">Turned on</p>
               </div>
               <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto" />
           </div>
       </div>
    </div>
  );
};
