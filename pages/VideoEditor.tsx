
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Video } from '../types';
import { PREVIEW_VIDEOS } from '../constants';
import { generateThumbnail } from '../services/gemini';
import { 
    ArrowLeft, Save, Loader2, CheckCircle, Scissors, MonitorPlay, 
    Play, Pause, Rewind, FastForward,
    Smartphone, Image as ImageIcon, Film, Palette, Newspaper, Download, Sparkles, ExternalLink,
    MoveHorizontal, Type, Layout, Clock, AlertTriangle, ShieldCheck, Droplet
} from 'lucide-react';

type EditorTab = 'trim' | 'news' | 'shorts' | 'thumbnail' | 'intro' | 'end' | 'canva' | 'blur';

const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
    { id: 'canva', label: 'Canva Highlight', icon: Palette },
    { id: 'news', label: 'Breaking News', icon: Newspaper },
    { id: 'shorts', label: 'Shorts', icon: Smartphone },
    { id: 'thumbnail', label: 'Thumbnail', icon: ImageIcon },
    { id: 'intro', label: 'Global Intro', icon: Film },
    { id: 'end', label: 'End Screen', icon: MonitorPlay },
    { id: 'trim', label: 'Trim', icon: Scissors },
    { id: 'blur', label: 'Blur', icon: Droplet },
];

const INTRO_TEMPLATES = [
    { id: 'cinematic', name: 'Cinematic Fade', color: 'bg-black', text: 'text-white' },
    { id: 'vlog', name: 'Vlog Pop', color: 'bg-yellow-400', text: 'text-black' },
    { id: 'news', name: 'News Breaking', color: 'bg-red-700', text: 'text-white' },
    { id: 'tech', name: 'Tech Glitch', color: 'bg-blue-600', text: 'text-white' },
];

const END_TEMPLATES = [
    { id: '1v1s', name: '1 Video + Subscribe', layout: 'grid-cols-2' },
    { id: '2v', name: '2 Videos', layout: 'grid-rows-2' },
    { id: '1v', name: '1 Video', layout: 'grid-cols-1' },
];

export const VideoEditor: React.FC = () => {
    const { videoId } = useParams<{ videoId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [video, setVideo] = useState<Video | null>(location.state?.video || null);
    const [activeTab, setActiveTab] = useState<EditorTab>('news');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Player State
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isVertical, setIsVertical] = useState(false);
    const [cropPosition, setCropPosition] = useState(50); // 0 to 100

    // Feature States
    const [newsSettings, setNewsSettings] = useState({
        show: false,
        headline: 'BREAKING NEWS',
        subhead: 'Live coverage from the scene',
        ticker: 'Starlight News • Developing Story • Updates as they happen • ',
        theme: 'red' as 'red' | 'blue' | 'minimal',
        speed: 20 // seconds for animation
    });
    
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
    const [thumbPrompt, setThumbPrompt] = useState('');
    
    const [selectedIntro, setSelectedIntro] = useState<string | null>(null);
    const [selectedEndScreen, setSelectedEndScreen] = useState<string | null>(null);

    useEffect(() => {
        if (!video && !videoId) {
            navigate('/');
        } else if (!video && videoId) {
            // Fallback mock video if direct navigation
            setVideo({
                id: videoId,
                title: 'Untitled Project',
                description: '',
                thumbnailUrl: `https://picsum.photos/seed/${videoId}/640/360`,
                communityName: 'My Channel',
                views: '0',
                uploadTime: 'Draft',
                duration: '10:00'
            });
        }
    }, [video, videoId, navigate]);

    // Pre-fill prompt when video loads
    useEffect(() => {
        if (video && !thumbPrompt) {
            setThumbPrompt(`${video.title} - High quality, 4k, trending`);
        }
    }, [video]);

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 1500);
        }, 1500);
    };

    const videoSrc = video ? PREVIEW_VIDEOS[video.id.charCodeAt(video.id.length - 1) % PREVIEW_VIDEOS.length] : PREVIEW_VIDEOS[0];
    
    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    };

    const handleGenerateThumbnail = async () => {
        if (!video) return;
        setIsGeneratingThumb(true);
        try {
            // Use user prompt or video title
            const promptToUse = thumbPrompt || video.title;
            const url = await generateThumbnail(promptToUse, 'YouTube Thumbnail');
            setThumbnailUrl(url);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingThumb(false);
        }
    };

    if (!video) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'trim': 
                return (
                    <div className="p-6 space-y-4 animate-in fade-in">
                        <h3 className="font-bold text-lg">Trim & Cut</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Drag the handles to trim the start and end of your video.</p>
                        <div className="h-16 bg-[var(--background-tertiary)] rounded-lg relative overflow-hidden border border-[var(--border-primary)] flex items-center justify-center">
                            <span className="text-xs text-[var(--text-tertiary)]">Timeline Visualizer</span>
                            <div className="absolute left-0 w-4 h-full bg-[hsl(var(--accent-color))] cursor-ew-resize opacity-50"></div>
                            <div className="absolute right-0 w-4 h-full bg-[hsl(var(--accent-color))] cursor-ew-resize opacity-50"></div>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono">
                            <span>00:00</span>
                            <span>{video.duration}</span>
                        </div>
                    </div>
                );
            case 'news':
                return (
                    <div className="p-6 space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center pb-4 border-b border-[var(--border-primary)]">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Newspaper className="w-5 h-5"/> Breaking News</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={newsSettings.show} onChange={e => setNewsSettings({...newsSettings, show: e.target.checked})} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">THEME</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setNewsSettings({...newsSettings, theme: 'red'})} className={`flex-1 py-2 text-xs font-bold rounded border-2 ${newsSettings.theme === 'red' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}>Red Alert</button>
                                    <button onClick={() => setNewsSettings({...newsSettings, theme: 'blue'})} className={`flex-1 py-2 text-xs font-bold rounded border-2 ${newsSettings.theme === 'blue' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>Blue Night</button>
                                    <button onClick={() => setNewsSettings({...newsSettings, theme: 'minimal'})} className={`flex-1 py-2 text-xs font-bold rounded border-2 ${newsSettings.theme === 'minimal' ? 'border-gray-800 bg-gray-50 text-gray-800' : 'border-gray-200 text-gray-500'}`}>Minimal</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">HEADLINE</label>
                                <input value={newsSettings.headline} onChange={e => setNewsSettings({...newsSettings, headline: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-md text-sm font-bold uppercase" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">SUB-HEADLINE</label>
                                <input value={newsSettings.subhead} onChange={e => setNewsSettings({...newsSettings, subhead: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">TICKER TEXT</label>
                                <textarea rows={2} value={newsSettings.ticker} onChange={e => setNewsSettings({...newsSettings, ticker: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-md text-sm font-mono" />
                            </div>
                            
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 flex justify-between">
                                    <span>TICKER SPEED</span>
                                    <span>{newsSettings.speed}s</span>
                                </label>
                                <input type="range" min="10" max="60" step="5" value={newsSettings.speed} onChange={e => setNewsSettings({...newsSettings, speed: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    </div>
                );
            case 'shorts':
                return (
                    <div className="p-6 space-y-6 animate-in fade-in">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Smartphone className="w-5 h-5"/> Shorts Converter</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Convert your landscape video into a vertical Short (9:16).</p>
                        
                        <div className="flex gap-2 bg-[var(--background-tertiary)] p-1 rounded-lg">
                            <button onClick={() => setIsVertical(false)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${!isVertical ? 'bg-[var(--background-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>Original (16:9)</button>
                            <button onClick={() => setIsVertical(true)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${isVertical ? 'bg-[hsl(var(--accent-color))] text-white shadow-sm' : 'text-[var(--text-secondary)]'}`}>Vertical (9:16)</button>
                        </div>

                        {isVertical && (
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600">
                                    <p className="font-semibold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Smart Crop</p>
                                    <p>AI suggests the center. Adjust manually if needed.</p>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block flex items-center gap-2">
                                        <MoveHorizontal className="w-4 h-4"/> HORIZONTAL PAN
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={cropPosition} 
                                        onChange={(e) => setCropPosition(parseInt(e.target.value))} 
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--accent-color))]" 
                                    />
                                    <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
                                        <span>Left</span>
                                        <span>Center</span>
                                        <span>Right</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'thumbnail':
                return (
                    <div className="p-6 space-y-6 animate-in fade-in">
                        <h3 className="font-bold text-lg flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Thumbnail Creator</h3>
                        
                        <div className="aspect-video bg-[var(--background-tertiary)] rounded-lg overflow-hidden border border-[var(--border-primary)] flex items-center justify-center relative group">
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-[var(--text-tertiary)]">
                                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No thumbnail generated</p>
                                </div>
                            )}
                            {thumbnailUrl && (
                                <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2">
                                    <Download className="w-5 h-5" /> Download
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">AI PROMPT</label>
                                <textarea 
                                    value={thumbPrompt} 
                                    onChange={e => setThumbPrompt(e.target.value)} 
                                    className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-md text-sm resize-none"
                                    rows={2}
                                    placeholder="Describe the thumbnail..."
                                />
                            </div>
                            <button 
                                onClick={handleGenerateThumbnail} 
                                disabled={isGeneratingThumb}
                                className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingThumb ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                Generate with AI
                            </button>
                            
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex gap-3 text-xs text-blue-700 mt-2">
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                <p>Safety Check: All AI generated images are scanned for policy violations. Spam and NSFW content are automatically filtered.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'intro':
                return (
                    <div className="p-6 space-y-6 animate-in fade-in">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Film className="w-5 h-5"/> Global Intro</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Select a branded intro to add to the start of your video.</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {INTRO_TEMPLATES.map(intro => (
                                <button 
                                    key={intro.id}
                                    onClick={() => setSelectedIntro(intro.id === selectedIntro ? null : intro.id)}
                                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${selectedIntro === intro.id ? 'border-[hsl(var(--accent-color))] ring-2 ring-[hsl(var(--accent-color))]/20' : 'border-transparent hover:border-[var(--border-primary)]'}`}
                                >
                                    <div className={`w-full h-full ${intro.color} opacity-80 flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                                        <span className={`${intro.text} font-bold text-xs uppercase tracking-wider shadow-lg`}>{intro.name}</span>
                                    </div>
                                    {selectedIntro === intro.id && (
                                        <div className="absolute top-1 right-1 bg-white text-[hsl(var(--accent-color))] rounded-full p-0.5">
                                            <CheckCircle className="w-4 h-4 fill-current" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'end':
                return (
                    <div className="p-6 space-y-6 animate-in fade-in">
                        <h3 className="font-bold text-lg flex items-center gap-2"><MonitorPlay className="w-5 h-5"/> End Screen</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Choose a layout for the last 20 seconds.</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {END_TEMPLATES.map(template => (
                                <button 
                                    key={template.id}
                                    onClick={() => setSelectedEndScreen(template.id === selectedEndScreen ? null : template.id)}
                                    className={`p-3 rounded-lg border-2 bg-[var(--background-primary)] transition-all ${selectedEndScreen === template.id ? 'border-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/5' : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'}`}
                                >
                                    <div className="aspect-video bg-[var(--background-tertiary)] rounded mb-2 relative">
                                        {/* Mock layout visualization */}
                                        <div className={`absolute inset-2 grid gap-1 ${template.layout} h-full`}>
                                            <div className="bg-[var(--border-primary)] rounded-sm opacity-50 w-full h-full"></div>
                                            {template.id !== '1v' && <div className={`bg-[var(--border-primary)] rounded-sm opacity-50 w-full h-full ${template.id === '1v1s' ? 'rounded-full aspect-square w-auto h-auto place-self-center' : ''}`}></div>}
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'canva':
                return (
                    <div className="p-6 space-y-6 animate-in fade-in">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Palette className="w-5 h-5"/> Canva Highlight</h3>
                        
                        <div className="bg-gradient-to-br from-[#7D2AE8] to-[#00C4CC] p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <h4 className="font-bold text-xl mb-2 relative z-10">Design with Canva</h4>
                            <p className="text-white/90 text-sm mb-6 relative z-10">Create stunning thumbnails, channel art, and video assets directly in Canva's powerful editor.</p>
                            <a 
                                href="https://www.canva.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#7D2AE8] font-bold rounded-lg hover:bg-gray-100 transition-colors text-sm shadow-md relative z-10"
                            >
                                Open Canva <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                        
                        <div className="p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)]">
                            <h5 className="font-bold text-sm mb-2">Instructions</h5>
                            <ol className="list-decimal list-inside text-sm text-[var(--text-secondary)] space-y-2">
                                <li>Click the button above to open Canva in a new tab.</li>
                                <li>Create your design (Thumbnail, Intro, or Overlay).</li>
                                <li>Download the file to your device as PNG or MP4.</li>
                                <li>Come back and upload it in the specific tab (Thumbnail, Intro).</li>
                            </ol>
                        </div>
                    </div>
                );
            case 'blur':
                return (
                    <div className="p-6 space-y-6 animate-in fade-in">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Droplet className="w-5 h-5"/> Blur Effects</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Apply privacy blurs to your video.</p>
                        
                        <div className="bg-[var(--background-tertiary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
                            <p className="text-sm text-[var(--text-secondary)] mb-4">Launch the advanced blur editor to mask faces or objects.</p>
                            <button 
                                onClick={() => navigate('/blur')}
                                className="px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all shadow-md"
                            >
                                Open Blur Editor
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="w-full h-screen flex flex-col bg-[var(--background-secondary)]">
            {/* Header */}
            <header className="flex-shrink-0 h-16 flex items-center justify-between px-4 gap-4 bg-[var(--background-primary)] border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full"><ArrowLeft className="w-5 h-5"/></button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Video Editor</h1>
                        <p className="text-xs text-[var(--text-tertiary)] truncate max-w-xs">{video.title}</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saveStatus !== 'idle'} className="px-5 py-2 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 flex items-center justify-center gap-2 disabled:opacity-70 w-32 shadow-sm transition-all">
                    {saveStatus === 'saving' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {saveStatus === 'saved' && <CheckCircle className="w-5 h-5" />}
                    {saveStatus === 'idle' && <Save className="w-4 h-4" />}
                    {saveStatus === 'idle' ? 'Save' : saveStatus === 'saving' ? 'Saving...' : 'Saved!'}
                </button>
            </header>
            
            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content (Player + Timeline) */}
                <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                    <div className="flex-1 bg-[#1a1a1a] rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner border border-[var(--border-primary)]">
                        {/* Video Player */}
                        <div 
                            className={`relative transition-all duration-500 ease-in-out bg-black shadow-2xl overflow-hidden ${isVertical ? 'h-[90%] aspect-[9/16]' : 'w-[90%] aspect-video'}`}
                        >
                            <video 
                                ref={videoRef}
                                src={videoSrc} 
                                className="w-full h-full"
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: isVertical ? `${cropPosition}% center` : 'center center'
                                }}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                loop
                            />
                            
                            {/* Intro Overlay Simulation */}
                            {selectedIntro && currentTime < 3 && (
                                <div className={`absolute inset-0 flex items-center justify-center z-20 ${INTRO_TEMPLATES.find(i => i.id === selectedIntro)?.color} animate-fade-out`}>
                                    <h1 className={`text-4xl font-bold ${INTRO_TEMPLATES.find(i => i.id === selectedIntro)?.text} uppercase tracking-widest drop-shadow-lg`}>INTRO</h1>
                                </div>
                            )}

                            {/* News Overlay */}
                            {newsSettings.show && (
                                <div className="absolute inset-0 pointer-events-none flex flex-col justify-end z-10">
                                    <div className="mb-12 mx-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
                                        <div className={`${newsSettings.theme === 'red' ? 'bg-red-600' : newsSettings.theme === 'blue' ? 'bg-blue-600' : 'bg-black'} text-white px-3 py-1 text-sm font-bold w-fit uppercase tracking-wider shadow-lg`}>
                                            {newsSettings.headline}
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm text-black px-3 py-1 text-base font-medium w-fit shadow-lg max-w-[80%]">
                                            {newsSettings.subhead}
                                        </div>
                                    </div>
                                    <div className={`${newsSettings.theme === 'red' ? 'bg-blue-900/90 border-yellow-400' : newsSettings.theme === 'blue' ? 'bg-slate-900/90 border-blue-400' : 'bg-black/80 border-white'} text-white text-sm font-semibold py-1.5 overflow-hidden whitespace-nowrap border-t-2`}>
                                        <div className="px-4 uppercase tracking-wide inline-block whitespace-nowrap" style={{
                                            animation: `marquee ${newsSettings.speed}s linear infinite`
                                        }}>
                                            {newsSettings.ticker.repeat(10)}
                                        </div>
                                    </div>
                                    <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
                                </div>
                            )}

                            {/* End Screen Overlay Simulation */}
                            {selectedEndScreen && duration > 0 && currentTime > duration - 5 && (
                                <div className="absolute inset-4 z-20 pointer-events-none">
                                    <div className={`grid gap-4 w-full h-full ${END_TEMPLATES.find(e => e.id === selectedEndScreen)?.layout}`}>
                                        <div className="bg-black/80 border-2 border-white/50 rounded-lg flex items-center justify-center text-white font-bold">NEXT VIDEO</div>
                                        {selectedEndScreen !== '1v' && <div className={`bg-black/80 border-2 border-white/50 flex items-center justify-center text-white font-bold ${selectedEndScreen === '1v1s' ? 'rounded-full aspect-square w-24 h-24 place-self-center' : 'rounded-lg'}`}>SUB</div>}
                                    </div>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/60 backdrop-blur-md rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity z-30">
                                <button className="text-white p-1 hover:text-[hsl(var(--accent-color))] transition-colors"><Rewind className="w-5 h-5"/></button>
                                <button onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()} className="text-white p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                                    {isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
                                </button>
                                <button className="text-white p-1 hover:text-[hsl(var(--accent-color))] transition-colors"><FastForward className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="h-40 bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] p-4 flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                            <span>Timeline</span>
                            <span>{Math.floor(currentTime)}s / {Math.floor(duration)}s</span>
                        </div>
                        <div className="flex-1 bg-[var(--background-tertiary)] rounded-lg relative overflow-hidden cursor-pointer group">
                             {/* Track 1: Video */}
                             <div className="absolute top-2 left-0 right-0 h-10 bg-blue-500/20 border border-blue-500/50 rounded mx-2 flex items-center justify-center overflow-hidden">
                                <div className="flex w-full opacity-30">
                                    {Array.from({length: 20}).map((_, i) => <div key={i} className="flex-1 border-r border-blue-500/30 h-full"></div>)}
                                </div>
                                <span className="absolute text-xs text-blue-700 font-bold flex items-center gap-1"><Film className="w-3 h-3"/> Video Track</span>
                             </div>
                             
                             {/* Track 2: News Overlay Indicator */}
                             {newsSettings.show && (
                                <div className="absolute top-14 left-0 right-0 h-6 bg-red-500/20 border border-red-500/50 rounded mx-2 flex items-center px-2">
                                    <span className="text-[10px] text-red-700 font-bold flex items-center gap-1"><Newspaper className="w-3 h-3"/> Breaking News Overlay</span>
                                </div>
                             )}
                             
                             {/* Track 3: Intro/End Indicator */}
                             {(selectedIntro || selectedEndScreen) && (
                                <div className="absolute top-22 left-0 right-0 h-4 mx-2 flex justify-between pointer-events-none">
                                    {selectedIntro && <div className="w-10 h-full bg-purple-500/40 rounded-l"></div>}
                                    {selectedEndScreen && <div className="w-20 h-full bg-purple-500/40 rounded-r ml-auto"></div>}
                                </div>
                             )}

                             {/* Playhead */}
                             <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-100 ease-linear" style={{ left: `${duration > 0 ? (currentTime/duration)*100 : 0}%`}}>
                                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rotate-45 transform"></div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel (Tools) */}
                <aside className="w-80 border-l border-[var(--border-primary)] flex bg-[var(--background-primary)] shadow-[-5px_0_15px_rgba(0,0,0,0.02)]">
                    {/* Vertical Tabs */}
                    <div className="w-20 flex-shrink-0 bg-[var(--background-tertiary)]/30 border-r border-[var(--border-primary)]">
                        <div className="flex flex-col">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    title={tab.label}
                                    className={`w-full py-4 flex flex-col items-center gap-1.5 transition-all relative ${
                                        activeTab === tab.id
                                            ? 'bg-[var(--background-primary)] text-[hsl(var(--accent-color))]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--accent-color))] rounded-r-full"></div>}
                                    <tab.icon className="w-5 h-5" />
                                    <span className="text-[10px] font-semibold text-center leading-tight px-1">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content Panel */}
                    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--background-primary)]">
                        {renderTabContent()}
                    </div>
                </aside>
            </div>
        </div>
    );
};
