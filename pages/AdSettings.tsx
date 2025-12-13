

import React, { useState, useEffect, useCallback } from 'react';
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign } from '../types';
import { Megaphone, PlayCircle, RadioTower, MapPin, PlusCircle, Trash2, Loader2, Save, CheckCircle, Eye, Clock } from 'lucide-react';
import { CreateAdModal } from '../components/CreateAdModal';
import { CreateUnskippableAdModal } from '../components/CreateUnskippableAdModal';
import { fetchAllAds } from '../services/gemini';
import { StatusBadge } from '../components/CampaignCard';

const AD_CAMPAIGNS_KEY = 'starlight_ad_campaigns';
const UNSKIPPABLE_AD_CAMPAIGNS_KEY = 'starlight_unskippable_ad_campaigns';
const USER_ADS_KEY = 'starlight_user_ads';
const AD_SLOT_CONFIG_KEY = 'starlight_ad_slot_config';

type Tab = 'placements' | 'skippable' | 'unskippable';

const AD_SLOTS = [
    { id: 'WATCH_PRE_ROLL', name: 'Watch Page Pre-roll (Skippable only)' },
    { id: 'WATCH_SIDEBAR', name: 'Watch Page Sidebar' },
    { id: 'HOME_IN_FEED', name: 'Home Page In-Feed' },
    { id: 'HOME_SIDEBAR', name: 'Home Page Sidebar' },
    { id: 'SEARCH_SPONSORED_RESULT', name: 'Search Page Sponsored Result' },
    { id: 'ADMIN_DASHBOARD_TOP', name: 'Admin Dashboard Top Banner' },
    { id: 'VEO_GENERATOR_SIDEBAR', name: 'Veo Generator Sidebar' },
    { id: 'LIVE_PAGE_SIDEBAR', name: 'Live Page Sidebar' },
];

export const AdSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('placements');
    const [allAds, setAllAds] = useState<(AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[]>([]);
    const [placements, setPlacements] = useState<Record<string, string>>({});
    
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showSkippableModal, setShowSkippableModal] = useState(false);
    const [showUnskippableModal, setShowUnskippableModal] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        const ads = await fetchAllAds();
        setAllAds(ads.sort((a, b) => a.title.localeCompare(b.title)));

        const savedPlacements = localStorage.getItem(AD_SLOT_CONFIG_KEY);
        if (savedPlacements) {
            setPlacements(JSON.parse(savedPlacements));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const skippableAds = allAds.filter(ad => 'ctr' in ad) as AdCampaign[];
    const unskippableAds = allAds.filter(ad => 'impressions' in ad && 'duration' in ad) as UnskippableAdCampaign[];

    const handleDeleteAd = (id: string, type: 'skippable' | 'unskippable') => {
        if (!window.confirm("Are you sure you want to delete this ad campaign? This action is permanent.")) return;

        let keyToUpdate: string;
        let isUserAd = id.startsWith('user-') || id.startsWith('manual-');
        
        if (isUserAd) {
            keyToUpdate = USER_ADS_KEY;
        } else {
            keyToUpdate = type === 'skippable' ? AD_CAMPAIGNS_KEY : UNSKIPPABLE_AD_CAMPAIGNS_KEY;
        }

        const currentAdsJSON = localStorage.getItem(keyToUpdate);
        if (currentAdsJSON) {
            const currentAds = JSON.parse(currentAdsJSON);
            const updatedAds = currentAds.filter((ad: AdCampaign | UnskippableAdCampaign) => ad.id !== id);
            localStorage.setItem(keyToUpdate, JSON.stringify(updatedAds));
            loadData();
        }
    };
    
    const handlePlacementChange = (slotId: string, adId: string) => {
        setPlacements(prev => ({ ...prev, [slotId]: adId }));
    };

    const handleSavePlacements = () => {
        setSaveStatus('saving');
        localStorage.setItem(AD_SLOT_CONFIG_KEY, JSON.stringify(placements));
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };

    const handleSuccess = () => {
        setShowSkippableModal(false);
        setShowUnskippableModal(false);
        loadData();
    };

    const renderAdTable = (ads: (AdCampaign | UnskippableAdCampaign)[], type: 'skippable' | 'unskippable') => (
        <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--background-tertiary)]/50 text-xs text-[var(--text-secondary)] uppercase">
                        <tr>
                            <th className="px-4 py-3">Ad Creative</th>
                            <th className="px-4 py-3 hidden lg:table-cell">Details</th>
                            <th className="px-4 py-3 hidden md:table-cell">Stats</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ads.length === 0 ? (
                            <tr><td colSpan={5} className="text-center p-8 text-[var(--text-secondary)]">No {type} ads found.</td></tr>
                        ) : (
                            ads.map(ad => (
                                <tr key={ad.id} className="border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--background-tertiary)]/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={ad.thumbnailUrl} alt={ad.title} className="w-24 aspect-video object-cover rounded flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-base line-clamp-2">{ad.title}</p>
                                                <p className="text-xs text-[var(--text-tertiary)] font-mono block lg:hidden">{ad.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] font-mono hidden lg:table-cell">{ad.id}</td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">
                                            { 'ctr' in ad ? (
                                                <div><p className="font-semibold text-[var(--text-primary)]">{ad.views} <span className="text-xs">Views</span></p><p className="font-semibold text-[var(--text-primary)] mt-1">{ad.ctr} <span className="text-xs">CTR</span></p></div>
                                            ) : (
                                                <div><p className="font-semibold text-[var(--text-primary)]">{ad.impressions} <span className="text-xs">Impressions</span></p><p className="font-semibold text-[var(--text-primary)] mt-1">{ad.duration} <span className="text-xs">Duration</span></p></div>
                                            )}
                                        </td>
                                    <td className="px-4 py-3"><StatusBadge status={ad.status} /></td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDeleteAd(ad.id, type)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-md"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPlacements = () => (
        <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
            <h2 className="text-xl font-bold mb-2">Ad Placements</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Assign specific ads to display in different locations across the app. If set to "Random", a random active ad will be shown.</p>
            <div className="space-y-6">
                {AD_SLOTS.map(slot => {
                    const selectedAdId = placements[slot.id];
                    const selectedAd = selectedAdId ? allAds.find(ad => ad.id === selectedAdId) : null;
                    const filteredAdsForSlot = slot.id.includes('PRE_ROLL') ? skippableAds : allAds;

                    return (
                        <div key={slot.id} className="bg-[var(--background-primary)] p-4 rounded-lg border border-[var(--border-primary)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div>
                                    <label htmlFor={slot.id} className="font-semibold">{slot.name}</label>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Slot ID: <span className="font-mono">{slot.id}</span></p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        id={slot.id}
                                        value={placements[slot.id] || ''}
                                        onChange={(e) => handlePlacementChange(slot.id, e.target.value)}
                                        className="flex-1 p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none"
                                    >
                                        <option value="">Random Active Ad (Default)</option>
                                        {filteredAdsForSlot.filter(ad => ad.status === 'Active').map(ad => (
                                            <option key={ad.id} value={ad.id}>
                                                {ad.title}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedAd ? (
                                        <img src={selectedAd.thumbnailUrl} alt="Ad thumbnail" className="w-16 aspect-video rounded object-cover border border-[var(--border-primary)]" />
                                    ) : (
                                        <div className="w-16 h-9 bg-[var(--background-tertiary)] rounded flex items-center justify-center border border-[var(--border-primary)]">
                                            <p className="text-[10px] text-center text-[var(--text-tertiary)]">Auto</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSavePlacements}
                    disabled={saveStatus !== 'idle'}
                    className="px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {saveStatus === 'saving' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {saveStatus === 'saved' && <CheckCircle className="w-5 h-5" />}
                    {saveStatus === 'idle' && <Save className="w-5 h-5" />}
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Placements'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
                <Megaphone className="w-8 h-8 text-[hsl(var(--accent-color))]"/>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">AdSpace Management</h1>
            </div>
            
            {showSkippableModal && <CreateAdModal onClose={() => setShowSkippableModal(false)} onSuccess={handleSuccess} />}
            {showUnskippableModal && <CreateUnskippableAdModal onClose={() => setShowUnskippableModal(false)} onSuccess={handleSuccess} />}

            <div className="flex gap-2 border-b border-[var(--border-primary)] mb-6">
                <button onClick={() => setActiveTab('placements')} className={`px-4 py-2 font-semibold text-sm flex items-center gap-2 ${activeTab === 'placements' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><MapPin className="w-4 h-4"/> Placements</button>
                <button onClick={() => setActiveTab('skippable')} className={`px-4 py-2 font-semibold text-sm flex items-center gap-2 ${activeTab === 'skippable' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><PlayCircle className="w-4 h-4"/> Skippable</button>
                <button onClick={() => setActiveTab('unskippable')} className={`px-4 py-2 font-semibold text-sm flex items-center gap-2 ${activeTab === 'unskippable' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><RadioTower className="w-4 h-4"/> Unskippable</button>
            </div>
            
            {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin"/></div> : (
            <div className="animate-in fade-in">
                {activeTab === 'placements' && renderPlacements()}
                {activeTab === 'skippable' && (
                <>
                    <div className="flex justify-end mb-4"><button onClick={() => setShowSkippableModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold text-sm"><PlusCircle className="w-4 h-4"/> Create Skippable</button></div>
                    {renderAdTable(skippableAds, 'skippable')}
                </>
                )}
                {activeTab === 'unskippable' && (
                <>
                    <div className="flex justify-end mb-4"><button onClick={() => setShowUnskippableModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold text-sm"><PlusCircle className="w-4 h-4"/> Create Unskippable</button></div>
                    {renderAdTable(unskippableAds, 'unskippable')}
                </>
                )}
            </div>
            )}
        </div>
    );
};