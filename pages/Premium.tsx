
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, PlayCircle, ShieldCheck, Gem, CheckCircle2, Gift, Loader2 } from 'lucide-react';
import { ProfileDetails } from '../types';

const PhonePeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11.192 15.228C11.399 15.688 11.756 16.035 12.284 16.035C12.923 16.035 13.31 15.657 13.31 15.228C13.31 14.829 13.016 14.535 12.377 14.341L11.708 14.136C10.875 13.881 10.458 13.431 10.458 12.783C10.458 12.018 11.161 11.451 12.224 11.451C13.141 11.451 13.791 11.85 14.067 12.447L14.77 11.13C14.283 10.593 13.488 10.26 12.512 10.26C11.954 10.26 11.417 10.377 10.976 10.593C10.154 11.022 9.64601 11.829 9.64601 12.798C9.64601 13.986 10.397 14.751 11.531 15.111L12.213 15.326C13.025 15.57 13.488 15.969 13.488 16.596C13.488 17.316 12.871 17.853 11.965 17.853C10.88 17.853 10.129 17.327 9.87401 16.71L9.17101 18.027C9.72901 18.519 10.667 18.9 11.729 18.9C12.338 18.9 12.926 18.771 13.434 18.528C14.329 18.1095 14.887 17.316 14.887 16.299C14.887 15.003 14.019 14.2275 12.841 13.881L12.159 13.665C11.368 13.422 10.88 13.098 10.88 12.486C10.88 11.97 11.297 11.583 11.894 11.583C12.382 11.583 12.787 11.7555 13.063 12.1155L13.755 10.809C13.208 10.239 12.386 9.84 11.47 9.84C10.746 9.84 10.054 10.0335 9.51601 10.422C8.61101 11.049 8.08301 11.958 8.08301 13.047C8.08301 14.313 8.94701 15.15 10.173 15.588L10.855 15.804C11.041 15.8625 11.129 15.909 11.192 15.9945V15.228Z" fill="#5F259F"/>
        <path d="M16.5913 14.0625L17.7523 11.9445L16.2223 11.13L15.0613 13.248L16.5913 14.0625Z" fill="#5F259F"/>
        <path d="M15.421 8.16C15.034 7.905 14.542 7.749 14.005 7.749C12.97 7.749 12.118 8.199 11.668 8.871L12.964 9.603C13.093 9.429 13.318 9.2145 13.696 9.2145C14.083 9.2145 14.338 9.429 14.467 9.603C14.5855 9.777 14.596 9.99 14.536 10.2045L13.2505 15.021L14.887 15.021L16.561 8.841C16.327 8.424 15.9595 8.16 15.421 8.16Z" fill="#5F259F"/>
    </svg>
);


export const Premium: React.FC = () => {
  const { currentUser, isPremium, upgradeToPremium } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState({ symbol: '$', price: '9.99' });
  const [isIndia, setIsIndia] = useState(false);
  const [showPhonePeSpinner, setShowPhonePeSpinner] = useState(false);


  useEffect(() => {
    // Reset country specific settings
    setIsIndia(false);
    setCurrency({ symbol: '$', price: '9.99' });
    

    if (currentUser?.email) {
      const allProfileDetailsJSON = localStorage.getItem('starlight_profile_details');
      if (allProfileDetailsJSON) {
        try {
          const allDetails: { [email: string]: ProfileDetails } = JSON.parse(allProfileDetailsJSON);
          const userDetails = allDetails[currentUser.email];
          
          if (userDetails?.country) {
            const country = userDetails.country;
            // Currency mapping
            if (country === 'India') {
              setCurrency({ symbol: '₹', price: '499' });
              setIsIndia(true);
            } else if (country === 'United Kingdom') {
              setCurrency({ symbol: '£', price: '7.99' });
            } else if (['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Finland', 'Greece', 'Ireland', 'Portugal'].includes(country)) {
              setCurrency({ symbol: '€', price: '8.99' });
            } else if (['Australia', 'Canada'].includes(country)) {
                setCurrency({ symbol: '$', price: '12.99' });
            } else if (country === 'Japan') {
                setCurrency({ symbol: '¥', price: '1100' });
            }
          }
        } catch (e) {
          console.error("Failed to parse profile details:", e);
        }
      }
    }
  }, [currentUser]);

  const handleUpgrade = () => {
    if (!currentUser) {
      navigate('/signup');
    } else {
      upgradeToPremium();
    }
  };
  
  const handlePhonePeUpgrade = () => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    setShowPhonePeSpinner(true);
    // Simulate API call to PhonePe
    setTimeout(() => {
        upgradeToPremium();
        // Don't need to hide spinner because the component will re-render as premium
    }, 2000);
  };

  const benefits = [
    { icon: PlayCircle, title: "Ad-Free Viewing", description: "Enjoy your favorite content without any interruptions from pre-roll or mid-roll ads." },
    { icon: Zap, title: "Background Play", description: "Listen to videos even when you're in another app or your screen is off. (Feature simulated)" },
    { icon: ShieldCheck, title: "Early Access", description: "Be the first to try experimental features from Starlight Labs, like AI video generation." },
    { icon: Gift, title: "10 Free Ad Credits", description: "Get 5 skippable and 5 unskippable ad credits each month to promote your content." },
  ];

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-6 text-center">
        
        <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-5 rounded-3xl bg-amber-500/10 shadow-lg shadow-amber-500/10">
            <Gem className="w-20 h-20 text-amber-400" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          Starlight Premium
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          {isPremium ? "You have access to an enhanced viewing experience." : "Unlock an enhanced viewing experience. Go ad-free, get early access, and more."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          {benefits.map(benefit => (
            <div key={benefit.title} className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] hover:-translate-y-1 transition-transform">
              <benefit.icon className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{benefit.description}</p>
            </div>
          ))}
        </div>

        {isPremium ? (
          <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-green-500/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold">You are a Premium Member</h2>
                <p className="text-[var(--text-secondary)] mt-2 max-w-md">
                    Thank you for your support! You have access to all the benefits listed above, including ad-free viewing and Starlight Labs.
                </p>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <h2 className="text-2xl font-bold">Ready to Go Premium?</h2>
            <p className="text-[var(--text-secondary)] mt-2 mb-6">Just one click to upgrade your account.</p>
            
            <div className="flex flex-col items-center">
               <p className="text-4xl font-bold mb-2">{currency.symbol}{currency.price}<span className="text-lg text-[var(--text-secondary)]">/month</span></p>
               
               <button 
                  onClick={handleUpgrade}
                  className="mt-4 px-10 py-4 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 text-lg"
                >
                  {currentUser ? 'Upgrade Now' : 'Sign In to Upgrade'}
                </button>

                {isIndia && (
                    <>
                        <div className="flex items-center gap-4 my-6 w-full max-w-sm">
                            <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
                            <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">OR</span>
                            <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
                        </div>

                        <button 
                            onClick={handlePhonePeUpgrade}
                            disabled={showPhonePeSpinner}
                            className="w-full max-w-sm flex items-center justify-center gap-3 px-10 py-4 bg-[#6739B7] text-white font-bold rounded-full hover:bg-[#5F259F] transition-colors shadow-lg shadow-purple-500/20 text-lg disabled:opacity-70 disabled:cursor-wait"
                        >
                            {showPhonePeSpinner ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                <PhonePeIcon />
                                Pay with PhonePe
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
