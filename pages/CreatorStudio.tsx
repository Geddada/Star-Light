
import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { LiveClock } from '../components/LiveClock';
import { Logo } from '../components/Logo';

const NEWS_OVERLAY_SETTINGS_KEY = 'starlight_news_overlay_settings';

interface NewsOverlaySettings {
    headline: string;
    subHeadline: string;
    breakingText: string;
    tickerText: string;
}

const defaultSettings: NewsOverlaySettings = {
    headline: 'Enter Your Headline',
    subHeadline: 'Sub-headline or topic description',
    breakingText: 'Starlight News - Where Every Story Shines Brighter.',
    tickerText: 'At Starlight News, we bring you the latest headlines, insightful reports, and inspiring stories that matter.'
};

export const CreatorStudio: React.FC = () => {
    const [settings, setSettings] = useState<NewsOverlaySettings>(defaultSettings);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showHeadlines, setShowHeadlines] = useState(true);

    useEffect(() => {
        const savedSettings = localStorage.getItem(NEWS_OVERLAY_SETTINGS_KEY);
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error("Failed to parse news overlay settings", e);
            }
        }
    }, []);

    useEffect(() => {
        setShowHeadlines(true);
        const timer = setTimeout(() => {
            setShowHeadlines(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [settings.headline, settings.subHeadline]);

    const handleSave = () => {
        setSaveStatus('saving');
        localStorage.setItem(NEWS_OVERLAY_SETTINGS_KEY, JSON.stringify(settings));
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };

    const handleInputChange = (field: keyof NewsOverlaySettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    // Safe ticker generation
    const breakingTicker = Array(5).fill(settings.breakingText + "   +++   ").join("");
    const infoTicker = Array(5).fill(settings.tickerText + "   ***   ").join("");

    return (
        <div className="flex h-full bg-[var(--background-primary)]">
            <div className="w-1/3 p-6 border-r border-[var(--border-primary)] overflow-y-auto space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
                    <h1 className="text-2xl font-bold">News Overlay Creator</h1>
                    <button
                        onClick={handleSave}
                        disabled={saveStatus !== 'idle'}
                        className="px-4 py-2 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 flex items-center justify-center gap-2 disabled:opacity-70 w-28"
                    >
                        {saveStatus === 'saving' && <Loader2 className="w-5 h-5 animate-spin" />}
                        {saveStatus === 'saved' && <CheckCircle className="w-5 h-5" />}
                        {saveStatus === 'idle' && <Save className="w-4 h-4" />}
                        {saveStatus === 'idle' ? 'Save' : saveStatus === 'saving' ? 'Saving' : 'Saved!'}
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Main Headline</label>
                        <input 
                            type="text" 
                            value={settings.headline} 
                            onChange={e => handleInputChange('headline', e.target.value)} 
                            className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Sub-Headline</label>
                        <input 
                            type="text" 
                            value={settings.subHeadline} 
                            onChange={e => handleInputChange('subHeadline', e.target.value)} 
                            className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Breaking News Ticker</label>
                        <textarea 
                            value={settings.breakingText} 
                            onChange={e => handleInputChange('breakingText', e.target.value)} 
                            rows={3} 
                            className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg resize-y"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Info Ticker</label>
                        <textarea 
                            value={settings.tickerText} 
                            onChange={e => handleInputChange('tickerText', e.target.value)} 
                            rows={3} 
                            className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg resize-y"
                        />
                    </div>
                </div>
            </div>

            <div className="w-2/3 p-6 flex items-center justify-center bg-[var(--background-secondary)]">
                <div className="w-full aspect-video bg-black rounded-xl shadow-2xl relative overflow-hidden border-2 border-[var(--border-primary)] group">
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/newspreview/1280/720')] bg-cover opacity-80"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent"></div>
                    
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 right-4 flex items-center gap-4 p-2 bg-black/30 backdrop-blur-md rounded-lg">
                            <LiveClock />
                        </div>

                        <div className="absolute top-4 left-4">
                            <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                                <Logo className="w-6 h-6 text-white drop-shadow-md" />
                                <span className="font-extrabold text-white text-lg drop-shadow-md tracking-tighter font-sans uppercase">STAR LIGHT</span>
                            </div>
                        </div>

                        <div className={`absolute bottom-16 left-0 w-full p-4 transition-opacity duration-1000 ${showHeadlines ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="bg-red-700/90 text-white p-2 rounded-t-md max-w-2xl inline-block">
                                <h1 className="text-2xl font-bold uppercase tracking-wide px-2">{settings.headline}</h1>
                            </div>
                            <div className="clear-both"></div>
                            <div className="bg-black/70 backdrop-blur-sm text-white p-2 rounded-b-md rounded-r-md max-w-2xl inline-block">
                                <p className="text-lg px-2">{settings.subHeadline}</p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-16">
                            <div className="absolute top-0 left-0 right-0 h-8 bg-red-800/90 overflow-hidden flex items-center">
                                <div className="whitespace-nowrap animate-scroll-left-fast text-white font-bold text-sm uppercase px-4">
                                    {breakingTicker}
                                </div>
                            </div>
                             <div className="absolute bottom-0 left-0 right-0 h-8 bg-blue-900/90 overflow-hidden flex items-center">
                                <div className="whitespace-nowrap animate-scroll-left text-white text-sm px-4">
                                    {infoTicker}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
