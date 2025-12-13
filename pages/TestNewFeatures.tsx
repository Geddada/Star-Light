

import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, generateSmartPlaylist } from '../services/gemini';
import { Beaker, Film, Image as ImageIcon, Loader2, AlertTriangle, Download, X, ShieldCheck, Play, ListVideo, Sparkles, Save, CheckCircle } from 'lucide-react';
import { getAdForSlot } from '../services/gemini';
import { SidebarAd } from '../components/SidebarAd';
import { AdCampaign, UnskippableAdCampaign, ShortsAdCampaign, Video, Playlist } from '../types';
import { VideoCard } from '../components/VideoCard';
import { Logo } from '../components/Logo';

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

export const TestNewFeatures: React.FC = () => {
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [keyCheckLoading, setKeyCheckLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'veo' | 'playlist'>('veo');

    // Veo State
    const [prompt, setPrompt] = useState('A majestic lion wearing a crown, cinematic 4k');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [startImageFile, setStartImageFile] = useState<File | null>(null);
    const [startImagePreview, setStartImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Playlist Generator State
    const [playlistPrompt, setPlaylistPrompt] = useState('');
    const [generatedPlaylist, setGeneratedPlaylist] = useState<Video[]>([]);
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
    const [playlistSaved, setPlaylistSaved] = useState(false);

    const [sidebarAd, setSidebarAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);


    useEffect(() => {
        const checkKeyAndLoadAd = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
                 if (hasKey) { 
                    const ad = await getAdForSlot('VEO_GENERATOR_SIDEBAR');
                    setSidebarAd(ad);
                }
            }
            setKeyCheckLoading(false);
        };
        checkKeyAndLoadAd();
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
            // Per guidelines, assume success after prompt to avoid race conditions.
            setIsKeySelected(true);
        }
    };

    const handleGenerate = async () => {
        setError(null);
        setGeneratedVideoUrl(null);
        setIsLoading(true);

        try {
            let imagePayload: { imageBytes: string; mimeType: string } | null = null;
            if (startImageFile) {
                setLoadingMessage("Processing starting image...");
                const { data, mimeType } = await fileToBase64(startImageFile);
                imagePayload = { imageBytes: data, mimeType };
            }

            const videoLink = await generateVideo(prompt, aspectRatio, resolution, imagePayload, setLoadingMessage);
            
            setGeneratedVideoUrl(videoLink);

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
    
    const handleGeneratePlaylist = async () => {
        if(!playlistPrompt.trim()) return;
        setIsPlaylistLoading(true);
        setPlaylistSaved(false);
        const videos = await generateSmartPlaylist(playlistPrompt);
        setGeneratedPlaylist(videos);
        setIsPlaylistLoading(false);
    };

    const handleSavePlaylist = () => {
        if(generatedPlaylist.length === 0) return;
        const newPlaylist: Playlist = {
            id: `ai-pl-${Date.now()}`,
            name: playlistPrompt.length > 30 ? playlistPrompt.substring(0, 30) + '...' : playlistPrompt,
            description: `Generated by AI for: "${playlistPrompt}"`,
            videos: generatedPlaylist,
            createdAt: new Date().toISOString()
        };
        
        const existing = JSON.parse(localStorage.getItem('starlight_playlists') || '[]');
        localStorage.setItem('starlight_playlists', JSON.stringify([...existing, newPlaylist]));
        window.dispatchEvent(new Event('playlistsUpdated'));
        setPlaylistSaved(true);
    };

    const resetGenerator = () => {
        setGeneratedVideoUrl(null);
        setError(null);
    };
    
    if (keyCheckLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
            </div>
        );
    }

    if (!isKeySelected && activeTab === 'veo') {
        return (
            <div className="flex items-center justify-center h-full text-center p-6">
                <div className="bg-[var(--background-secondary)] p-10 rounded-2xl border border-[var(--border-primary)] max-w-lg shadow-lg">
                    <ShieldCheck className="w-16 h-16 mx-auto text-[hsl(var(--accent-color))]" />
                    <h2 className="text-2xl font-bold mt-6">API Key Required for Veo</h2>
                    <p className="text-[var(--text-secondary)] mt-3">
                        This experimental feature uses the Veo model which may incur billing charges on your Google Cloud project. Please select an API key associated with a valid billing account to proceed.
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-color))] hover:underline font-medium ml-1">Learn more</a>.
                    </p>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <button 
                        onClick={handleSelectKey}
                        className="mt-6 px-6 py-3 bg-[hsl(var(--accent-color))] text-white font-semibold rounded-full filter hover:brightness-90 transition-colors shadow-lg"
                    >
                        Select API Key
                    </button>
                    <button onClick={() => setActiveTab('playlist')} className="block mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mx-auto underline">
                        Try other labs features
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <Beaker className="w-8 h-8 text-[hsl(var(--accent-color))]" />
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Starlight Labs</h1>
                </div>
                <p className="text-[var(--text-secondary)] mt-1">Welcome to the bleeding edge. Test experimental AI features before they're released.</p>
            </header>

            <div className="flex gap-4 mb-8 border-b border-[var(--border-primary)] overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('veo')} 
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'veo' ? 'border-[hsl(var(--accent-color))] text-[hsl(var(--accent-color))]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                    <Film className="w-4 h-4" /> Veo Video Generator
                </button>
                <button 
                    onClick={() => setActiveTab('playlist')} 
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'playlist' ? 'border-[hsl(var(--accent-color))] text-[hsl(var(--accent-color))]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                    <ListVideo className="w-4 h-4" /> Smart Playlist Generator
                </button>
            </div>

            {activeTab === 'veo' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in">
                    {/* Controls */}
                    <div className="lg:col-span-2 bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                placeholder="e.g., A robot surfing on a rainbow wave"
                                className="mt-1 w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                                disabled={isLoading}
                            />
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
                                <label className="text-sm font-semibold text-[var(--text-secondary)]">Resolution</label>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => setResolution('720p')} disabled={isLoading} className={`flex-1 p-2 rounded-lg border-2 font-medium ${resolution === '720p' ? 'border-[hsl(var(--accent-color))]' : 'border-transparent hover:bg-[var(--background-tertiary)] bg-[var(--background-primary)]'}`}>720p</button>
                                    <button onClick={() => setResolution('1080p')} disabled={isLoading} className={`flex-1 p-2 rounded-lg border-2 font-medium ${resolution === '1080p' ? 'border-[hsl(var(--accent-color))]' : 'border-transparent hover:bg-[var(--background-tertiary)] bg-[var(--background-primary)]'}`}>1080p</button>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Optional: Start Image</label>
                            <div className="mt-1 flex items-center gap-4">
                                <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="px-4 py-2 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] rounded-lg flex items-center gap-2 transition-colors border border-[var(--border-primary)]">
                                    <ImageIcon className="w-4 h-4" />
                                    {startImageFile ? "Change Image" : "Upload Image"}
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => setStartImageFile(e.target.files?.[0] || null)} />
                                {startImagePreview && (
                                    <div className="relative">
                                        <img src={startImagePreview} className="w-12 h-12 rounded-lg object-cover" alt="Preview"/>
                                        <button onClick={() => setStartImageFile(null)} disabled={isLoading} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(var(--accent-color))] text-white rounded-lg font-bold filter hover:brightness-90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {isLoading ? "Generating..." : "Generate Video"}
                        </button>
                    </div>
                    
                    {/* Output & Ad Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="aspect-video bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-primary)] flex items-center justify-center p-4">
                            {isLoading ? (
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--accent-color))] mx-auto" />
                                    <p className="mt-4 font-medium text-[var(--text-primary)]">{loadingMessage}</p>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">Video generation can take several minutes.</p>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500">
                                    <AlertTriangle className="w-10 h-10 mx-auto" />
                                    <p className="mt-4 font-semibold">Generation Failed</p>
                                    <p className="text-sm mt-1 max-w-sm">{error}</p>
                                    <button onClick={resetGenerator} className="mt-4 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors">Try Again</button>
                                </div>
                            ) : generatedVideoUrl ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 relative">
                                    <video src={generatedVideoUrl} controls autoPlay className="w-full h-full rounded-lg bg-black object-cover"/>
                                    <div className="flex gap-4">
                                        <a href={generatedVideoUrl} download={`${prompt.slice(0, 20)}.mp4`} className="px-4 py-2 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] rounded-lg flex items-center gap-2 transition-colors border border-[var(--border-primary)]">
                                            <Download className="w-4 h-4" /> Download Video
                                        </a>
                                        <button onClick={resetGenerator} className="px-4 py-2 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] rounded-lg flex items-center gap-2 transition-colors border border-[var(--border-primary)]">
                                            Generate Another
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-[var(--text-secondary)]">
                                    <Film className="w-12 h-12 mx-auto" />
                                    <p className="mt-4 font-medium">Your generated video will appear here</p>
                                    <p className="text-sm mt-1">Configure your settings and click "Generate"</p>
                                </div>
                            )}
                        </div>
                        {/* Ad Space */}
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Sponsored</h2>
                            <SidebarAd ad={sidebarAd} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'playlist' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in">
                    <div className="lg:col-span-1 bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Describe your ideal playlist</label>
                            <textarea
                                value={playlistPrompt}
                                onChange={(e) => setPlaylistPrompt(e.target.value)}
                                rows={4}
                                placeholder="e.g., Chill lofi beats for studying, or Top 10 space documentaries"
                                className="mt-1 w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                                disabled={isPlaylistLoading}
                            />
                        </div>
                        <button onClick={handleGeneratePlaylist} disabled={isPlaylistLoading || !playlistPrompt.trim()} className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(var(--accent-color))] text-white rounded-lg font-bold filter hover:brightness-90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPlaylistLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {isPlaylistLoading ? "Curating..." : "Generate Playlist"}
                        </button>
                    </div>

                    <div className="lg:col-span-2">
                        {generatedPlaylist.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xl">Preview: {playlistPrompt}</h3>
                                    <button onClick={handleSavePlaylist} disabled={playlistSaved} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${playlistSaved ? 'bg-green-500/10 text-green-500' : 'bg-[hsl(var(--accent-color))] text-white hover:brightness-90'}`}>
                                        {playlistSaved ? <CheckCircle className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
                                        {playlistSaved ? 'Saved to Library' : 'Save Playlist'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {generatedPlaylist.map((video, idx) => (
                                        <VideoCard key={idx} video={video} compact />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-primary)] rounded-2xl bg-[var(--background-secondary)]">
                                <ListVideo className="w-12 h-12 mb-4 opacity-50" />
                                <p>Enter a prompt to generate a custom AI playlist.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};