

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUnskippableAdCampaigns } from '../services/gemini';
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';
import { PlusCircle, RadioTower } from 'lucide-react';
import { CreateUnskippableAdModal } from '../components/CreateUnskippableAdModal';
import { PaymentGateway } from '../components/PaymentGateway';
import { CampaignCard } from '../components/CampaignCard';
import { ChooseAdTypeModal } from '../components/ChooseAdTypeModal';
import { CreateAdModal } from '../components/CreateAdModal';
import { CreateShortsAdModal } from '../components/CreateShortsAdModal';

const USER_ADS_KEY = 'starlight_user_ads';

export const UnskippableAds: React.FC = () => {
  const [campaigns, setCampaigns] = useState<UnskippableAdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChooseAdModal, setShowChooseAdModal] = useState(false);
  const [showSkippableModal, setShowSkippableModal] = useState(false);
  const [showUnskippableModal, setShowUnskippableModal] = useState(false);
  const [showShortsAdModal, setShowShortsAdModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'billing'>('campaigns');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCampaigns = async () => {
      setLoading(true);
      const geminiCampaigns = await fetchUnskippableAdCampaigns();

      const userAdsJson = localStorage.getItem(USER_ADS_KEY);
      const userAds: (AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[] = userAdsJson ? JSON.parse(userAdsJson) : [];
      const userUnskippableAds = userAds.filter(ad => 'impressions' in ad && 'duration' in ad) as UnskippableAdCampaign[];

      setCampaigns([...userUnskippableAds, ...geminiCampaigns]);
      setLoading(false);
    };
    loadCampaigns();
  }, []);

  const handleCreateUnskippableSuccess = (newCampaign: UnskippableAdCampaign) => {
      const userAdsJson = localStorage.getItem(USER_ADS_KEY);
      const allUserAds = userAdsJson ? JSON.parse(userAdsJson) : [];
      allUserAds.unshift(newCampaign);
      localStorage.setItem(USER_ADS_KEY, JSON.stringify(allUserAds));
      
      setCampaigns(prev => [newCampaign, ...prev]);
      setShowUnskippableModal(false);
  };
  
  const handleCreateSkippableSuccess = (newCampaign: AdCampaign) => {
      const userAdsJson = localStorage.getItem(USER_ADS_KEY);
      const allUserAds = userAdsJson ? JSON.parse(userAdsJson) : [];
      allUserAds.unshift(newCampaign);
      localStorage.setItem(USER_ADS_KEY, JSON.stringify(allUserAds));

      setShowSkippableModal(false);
  };

  const handleCreateShortsSuccess = (newCampaign: ShortsAdCampaign) => {
    const userAdsJson = localStorage.getItem(USER_ADS_KEY);
    const allUserAds = userAdsJson ? JSON.parse(userAdsJson) : [];
    allUserAds.unshift(newCampaign);
    localStorage.setItem(USER_ADS_KEY, JSON.stringify(allUserAds));
    setShowShortsAdModal(false);
  };


  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <RadioTower className="w-8 h-8" /> Unskippable Ads
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage bumper and mid-roll ad campaigns.</p>
        </div>
        {activeTab === 'campaigns' && (
            <button 
              onClick={() => setShowChooseAdModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold filter hover:brightness-90 transition-colors shadow-md w-full sm:w-auto"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Campaign</span>
            </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-[var(--border-primary)] mb-8">
         <button 
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 font-bold text-sm transition-all ${activeTab === 'campaigns' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
         >
            Campaigns
         </button>
         <button 
            onClick={() => setActiveTab('billing')}
            className={`pb-3 font-bold text-sm transition-all ${activeTab === 'billing' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
         >
            Billing & Payments
         </button>
      </div>

      {activeTab === 'campaigns' ? (
         loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array