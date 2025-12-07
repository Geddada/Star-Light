import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateVideo, generateThumbnail } from '../services/gemini';
import { Film, Image as ImageIcon, Loader2, AlertTriangle, Download, X, ShieldCheck, Play, ArrowLeft, Clapperboard, Save, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdCampaign } from '../types';

const USER_ADS_KEY = 'starlight_user_ads';

const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
            resolve({ data, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};


export const CinematicAdCreator: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [isKeySelected, setIsKeySelected] = useState(false);
    const [keyCheckLoading, setKeyCheckLoading] = useState(true);
    const [step, setStep] = useState<'create' | 'launch'>('create');

    const [prompt, setPrompt] = useState('A beautiful cinematic shot of a futuristic car driving through a neon-lit city at night.');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [startImageFile, setStartImageFile] = useState<File | null>(null);
    const [startImagePreview, setStartImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [campaignTitle, setCampaignTitle] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            }
            setKeyCheckLoading(false);
        };
        checkKey();
    }, []);

    useEffect(() => {
        if (!startImageFile) {
            setStartImagePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(startImageFile);
        setStartImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [startImageFile]);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setIsKeySelected(true);
        }
    };

    const handleGenerateVideo = async () => {
        setError(null);
        setIsLoading(true);

        try {
            let imagePayload: { imageBytes: string; mimeType: string } | null = null;
            if (startImageFile) {
                setLoadingMessage("Processing starting image...");
                const { data, mimeType } = await fileToBase64(startImageFile);
                imagePayload = { imageBytes: data, mimeType };
            }

            const videoLink = await generateVideo(prompt, aspectRatio, '720p', imagePayload, setLoadingMessage);
            
            setGeneratedVideoUrl(videoLink);
            setCampaignTitle(`PROMO: ${prompt.substring(0, 40)}...`);
            setStep('launch');
        } catch (err: any) {
            setError(err.message);
            if (err.message && err.message.includes("API Key validation failed")) {
                setIsKeySelected(false);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleGenerateThumbnail = async () => {
        setIsGeneratingThumbnail(true);
        const url = await generateThumbnail(campaignTitle, 'Cinematic Ad');
        setThumbnailUrl(url);
        setIsGeneratingThumbnail(false);
    };

    const handleLaunchCampaign = () => {
        if (!currentUser || !thumbnailUrl) return;
        setIsLaunching(true);

        const newCampaign: AdCampaign = {
            id: `user-cinematic-ad-${currentUser.email}-${Date.now()}`,
            title: campaignTitle,
            status: 'In Review',
            views: '0',
            ctr: '0.00%',
            spend: '$0',
            thumbnailUrl: thumbnailUrl,
            category: 'Cinematic Ad',
            communityName: currentUser.name,
        };
        
        const userAdsJson = localStorage.getItem(USER_ADS_KEY);
        const userAds = userAdsJson ? JSON.parse(userAdsJson) : [];
        userAds.unshift(newCampaign);
        localStorage.setItem(USER_ADS_KEY, JSON.stringify(userAds));

        setTimeout(() => {
            setIsLaunching(false);
            navigate('/skippable-ads');
        }, 1500);
    };
    
    if (keyCheckLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" /></div>;
    }

    if (!isKeySelected) {
        return (
            <div className="flex items-center justify-center h-full text-center p-6">
                <div className="bg-[var(--background-secondary)] p-10 rounded-2xl border border-[var(--border-primary)] max-w-lg shadow-lg">
                    <ShieldCheck className="w-16 h-16 mx-auto text-[hsl(var(--accent-color))]" />
                    <h2 className="text-2xl font-bold mt-6">API Key Required for Cinematic Ads</h2>
                    <p className="text-[var(--text-secondary)] mt-3">This Labs feature uses the Veo model which may incur billing charges. Please select a Google Cloud API key with billing enabled to proceed. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-color))] hover:underline font-medium">Learn more</a>.</p>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <button onClick={handleSelectKey} className="mt-6 px-6 py-3 bg-[hsl(var(--accent-color))] text-white font-semibold rounded-full filter hover:brightness-90 transition-colors shadow-lg">Select API Key</button>
                </div>
            </div>
        );
    }
    
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
            <Film className="w-12 h-12 text-[hsl(var(--accent-color))] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-[var(--text-primary)]">Cinematic Ad Creator <span className="text-base align-top bg-orange-500 text-white font-bold px-2 py-1 rounded-full">Labs</span></h1>
            <p className="text-[var(--text-secondary)] mt-2">Use the power of Google Flow to generate stunning, skippable video ads.</p>
        </header>

        {step === 'create' && (
          <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--text-secondary)]">Creative Prompt</label>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg" disabled={isLoading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="text-sm font-semibold text-[var(--text-secondary)]">Aspect Ratio</label>
                      <div className="flex gap-2 mt-1">
                          <button onClick={() => setAspectRatio('16:9')} disabled={isLoading} className={`flex-1 p-2 rounded-lg border-2 font-medium ${aspectRatio === '16:9' ? 'border-[hsl(var(--accent-color))]' : 'border-transparent hover:bg-[var(--background-tertiary)] bg-[var(--background-primary)]'}`}>16:9 Landscape</button>
                          <button onClick={() => setAspectRatio('9:16')} disabled={isLoading} className={`flex-1 p-2 rounded-lg border-2 font-medium ${aspectRatio === '9:16' ? 'border-[hsl(var(--accent-color))]' : 'border-transparent hover:bg-[var(--background-tertiary)] bg-[var(--background-primary)]'}`}>9:16 Portrait</button>
                      </div>
                  </div>
                   <div>
                       <label className="text-sm font-semibold text-[var(--text-secondary)]">Start Image (Optional)</label>
                       <div className="mt-1 flex items-center gap-4">
                           <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="px-4 py-2 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] rounded-lg text-sm font-semibold border border-[var(--border-primary)]">
                               {startImageFile ? "Change" : "Upload"}
                           </button>
                           <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => setStartImageFile(e.target.files?.[0] || null)} />
                           {startImagePreview && (
                              <div className="relative">
                                  <img src={startImagePreview} className="w-12 h-12 rounded-lg object-cover" alt="Preview"/>
                                  <button onClick={() => setStartImageFile(null)} disabled={isLoading} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                              </div>
                           )}
                       </div>
                  </div>
              </div>
              <button onClick={handleGenerateVideo} disabled={isLoading || !prompt} className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(var(--accent-color))] text-white rounded-lg font-bold disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  {isLoading ? "Generating..." : "Generate Video"}
              </button>
              {isLoading && <p className="text-center text-sm text-[var(--text-secondary)]">{loadingMessage}</p>}
              {error && <div className="text-center text-red-500 text-sm"><AlertTriangle className="w-5 h-5 inline-block mr-2" />{error}</div>}
          </div>
        )}
        
        {step === 'launch' && (
             <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] animate-in fade-in">
                <button onClick={() => setStep('create')} className="flex items-center gap-2 px-4 py-2 mb-6 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--background-tertiary)]"><ArrowLeft className="w-4 h-4"/> Back to Editor</button>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Generated Video</label>
                        <div className="aspect-video bg-black rounded-lg"><video src={generatedVideoUrl!} controls autoPlay className="w-full h-full rounded-lg"/></div>
                        <a href={generatedVideoUrl!} download={`${campaignTitle.slice(0, 30)}.mp4`} className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg font-semibold text-sm">
                            <Download className="w-4 h-4" /> Download Video
                        </a>
                    </div>
                     <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Campaign Title</label>
                            <input value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} className="w-full p-2 mt-1 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"/>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Ad Thumbnail</label>
                             <div className="aspect-video mt-1 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)] flex items-center justify-center overflow-hidden">
                                {isGeneratingThumbnail ? <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--accent-color))]"/> : thumbnailUrl ? <img src={thumbnailUrl} className="w-full h-full object-cover"/> : <ImageIcon className="w-10 h-10 text-[var(--text-tertiary)]"/>}
                             </div>
                        </div>
                        <button onClick={handleGenerateThumbnail} disabled={isGeneratingThumbnail} className="w-full flex items-center justify-center gap-2 py-2 bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))] rounded-lg font-semibold text-sm disabled:opacity-50">
                            {isGeneratingThumbnail ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>} Generate Thumbnail with AI
                        </button>
                    </div>
                </div>
                <div className="pt-6 mt-6 border-t border-[var(--border-primary)] flex justify-end">
                    <button onClick={handleLaunchCampaign} disabled={isLaunching || !thumbnailUrl} className="py-3 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                        {isLaunching ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} {isLaunching ? 'Launching...' : 'Launch Campaign'}
                    </button>
                </div>
             </div>
        )}
      </div>
    );
};
