import React, { useState, useEffect } from 'react';
import { X, Megaphone, Loader2, CheckCircle, Gift, PlayCircle, RadioTower, Clock, Sparkles } from 'lucide-react';
import { Video, AdCampaign, UnskippableAdCampaign, AdCreativeSuggestion } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { generateAdCreativeSuggestions } from '../services/gemini';

interface PromoteVideoModalProps {
  video: Video;
  onClose: () => void;
  onSuccess: () => void;
}

export const PromoteVideoModal: React.FC<PromoteVideoModalProps> = ({ video, onClose, onSuccess }) => {
  const { currentUser, isPremium } = useAuth();
  const [adType, setAdType] = useState<'skippable' | 'unskippable'>('skippable');
  const [duration, setDuration] = useState<'6s' | '15s'>('6s');
  const [useFreeCredit, setUseFreeCredit] = useState(true);
  const [adCredits, setAdCredits] = useState<{ skippable: number; unskippable: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // New state for form fields and AI assistant
  const [title, setTitle] = useState(`PROMO: ${video.title}`);
  const [suggestions, setSuggestions] = useState<AdCreativeSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);


  useEffect(() => {
    if (isPremium && currentUser?.email) {
      const creditsKey = `starlight_ad_credits_${currentUser.email}`;
      const storedCredits = localStorage.getItem(creditsKey);
      if (storedCredits) {
        setAdCredits(JSON.parse(storedCredits));
      } else {
        const newCredits = { skippable: 5, unskippable: 5 };
        localStorage.setItem(creditsKey, JSON.stringify(newCredits));
        setAdCredits(newCredits);
      }
    }
  }, [isPremium, currentUser]);

  const hasFreeCredits = adType === 'skippable' 
    ? (adCredits?.skippable ?? 0) > 0 
    : (adCredits?.unskippable ?? 0) > 0;
  
  const canUseCredit = isPremium && hasFreeCredits && useFreeCredit;

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    const result = await generateAdCreativeSuggestions(video.title, video.description);
    if (result) {
      setSuggestions(result);
    }
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      let newCampaign: AdCampaign | UnskippableAdCampaign;

      if (adType === 'unskippable') {
        newCampaign = {
          id: `promo-unskip-${video.id}-${Date.now()}`,
          title: title,
          status: 'In Review',
          impressions: '0',
          spend: canUseCredit ? 'Free Credit' : '$0',
          duration: duration,
          thumbnailUrl: video.thumbnailUrl!,
          category: video.category,
          communityName: video.communityName,
        };
      } else {
        newCampaign = {
          id: `promo-skip-${video.id}-${Date.now()}`,
          title: title,
          status: 'In Review',
          views: '0',
          ctr: '0.00%',
          spend: canUseCredit ? 'Free Credit' : '$0',
          thumbnailUrl: video.thumbnailUrl!,
          category: video.category,
          communityName: video.communityName,
        };
      }

      // Save to a generic user ads list
      const userAdsJson = localStorage.getItem('starlight_user_ads');
      const userAds = userAdsJson ? JSON.parse(userAdsJson) : [];
      userAds.unshift(newCampaign);
      localStorage.setItem('starlight_user_ads', JSON.stringify(userAds));

      // Decrement credits if used
      if (canUseCredit && adCredits && currentUser.email) {
        const creditsKey = `starlight_ad_credits_${currentUser.email}`;
        const newCredits = { ...adCredits };
        if (adType === 'skippable') {
          newCredits.skippable -= 1;
        } else {
          newCredits.unskippable -= 1;
        }
        setAdCredits(newCredits);
        localStorage.setItem(creditsKey, JSON.stringify(newCredits));
      }
      
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    }, 1500);
  };
  
  const renderForm = () => (
    <>
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="flex gap-4">
            <img src={video.thumbnailUrl} alt={video.title} className="w-32 aspect-video rounded-lg object-cover" />
            <div>
                <p className="text-xs text-[var(--text-secondary)]">You are promoting:</p>
                <h3 className="font-bold text-lg leading-tight">{video.title}</h3>
            </div>
        </div>

        <div className="space-y-2">
            <label htmlFor="ad-title" className="text-sm font-semibold text-[var(--text-secondary)]">1. Ad Title</label>
            <input id="ad-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your ad title" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
        </div>
        
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">2. Choose Ad Type</label>
            <div className="flex gap-2 rounded-lg bg-[var(--background-primary)] p-1 border border-[var(--border-primary)]">
                <button onClick={() => setAdType('skippable')} className={`flex-1 p-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${adType === 'skippable' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>
                    <PlayCircle className="w-5 h-5"/> Skippable Ad
                </button>
                <button onClick={() => setAdType('unskippable')} className={`flex-1 p-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${adType === 'unskippable' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>
                    <RadioTower className="w-5 h-5"/> Unskippable Ad
                </button>
            </div>
        </div>
        
        {adType === 'unskippable' && (
            <div className="space-y-2 animate-in fade-in">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">3. Select Duration</label>
                    <div className="flex gap-2 rounded-lg bg-[var(--background-primary)] p-1 border border-[var(--border-primary)]">
                    <button onClick={() => setDuration('6s')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${duration === '6s' ? 'bg-white text-black' : 'hover:bg-[var(--background-tertiary)]'}`}>
                        <Clock className="w-4 h-4"/> 6s Bumper
                    </button>
                    <button onClick={() => setDuration('15s')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${duration === '15s' ? 'bg-white text-black' : 'hover:bg-[var(--background-tertiary)]'}`}>
                        <Clock className="w-4 h-4"/> 15s Mid-roll
                    </button>
                </div>
            </div>
        )}
        
        {isPremium && adCredits && (
            <div className={`p-4 rounded-lg flex items-center gap-4 transition-all ${hasFreeCredits ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-gray-500/10 border border-gray-500/20'}`}>
                <Gift className={`w-10 h-10 flex-shrink-0 ${hasFreeCredits ? 'text-amber-500' : 'text-gray-500'}`} />
                <div>
                    <p className={`font-bold ${hasFreeCredits ? 'text-amber-500' : 'text-gray-500'}`}>Premium Benefit</p>
                    <p className={`text-sm ${hasFreeCredits ? 'text-amber-600' : 'text-gray-600'}`}>
                        You have {adType === 'skippable' ? adCredits.skippable : adCredits.unskippable} free {adType} ad credits.
                    </p>
                </div>
                    <input 
                    type="checkbox" 
                    checked={useFreeCredit}
                    onChange={(e) => setUseFreeCredit(e.target.checked)}
                    disabled={!hasFreeCredits}
                    className="ml-auto w-5 h-5 text-[hsl(var(--accent-color))] rounded focus:ring-[hsl(var(--accent-color))] disabled:opacity-50" 
                />
            </div>
        )}

        {/* AI Assistant section */}
        <div className="space-y-4 pt-6 border-t border-[var(--border-primary)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400"/> AI Ad Creative Assistant</h3>
            {!suggestions && (
                <button onClick={handleGenerateSuggestions} disabled={isGenerating} className="w-full py-2.5 bg-purple-600/10 text-purple-400 font-bold rounded-lg hover:bg-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait">
                    {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Suggestions...</> : 'Generate Suggestions'}
                </button>
            )}

            {isGenerating && !suggestions && <div className="text-center text-sm text-[var(--text-secondary)]">AI is thinking...</div>}

            {suggestions && (
                <div className="space-y-4 p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)] animate-in fade-in">
                    <div>
                        <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">SUGGESTED TITLES (click to use)</p>
                        <div className="flex flex-col gap-2">
                            {suggestions.titles.map((t, i) => (
                                <button key={i} onClick={() => setTitle(t)} className="text-left text-sm p-2 bg-[var(--background-secondary)] rounded hover:bg-[var(--background-tertiary)] transition-colors border border-[var(--border-primary)]">
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {adType === 'unskippable' && suggestions.script && (
                        <div>
                            <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">SUGGESTED {duration} SCRIPT</p>
                            <p className="text-sm p-3 bg-[var(--background-secondary)] rounded border border-[var(--border-primary)] whitespace-pre-wrap">{suggestions.script}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>

    <div className="p-4 bg-[var(--background-primary)] border-t border-[var(--border-primary)] flex justify-end">
        <button 
            onClick={handleSubmit}
            disabled={isLoading || !title}
            className="px-6 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : (canUseCredit ? 'Use 1 Free Credit' : 'Submit for Review')}
        </button>
    </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-center p-5 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Megaphone className="w-6 h-6 text-[hsl(var(--accent-color))]"/> Promote Video</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {isSuccess ? (
             <div className="p-8 text-center flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold">Promotion Submitted!</h3>
                <p className="text-[var(--text-secondary)] mt-2">Your ad campaign is now in review. You can track it in your Profile's "Promotions" tab.</p>
            </div>
        ) : renderForm()}
      </div>
    </div>
  );
};
