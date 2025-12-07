import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Video } from '../types';
import { PREVIEW_VIDEOS } from '../constants';
import { 
    ArrowLeft, Save, Loader2, CheckCircle, Scissors, EyeOff, Music, MonitorPlay, 
    CreditCard, Clapperboard, Trash2, Plus, Play, Pause, Volume2, Rewind, FastForward
} from 'lucide-react';

type EditorTab = 'trim' | 'blur' | 'audio' | 'end' | 'cards' | 'ads';

const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
    { id: 'trim', label: 'Trim & Cut', icon: Scissors },
    { id: 'blur', label: 'Blur', icon: EyeOff },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'end', label: 'End Screen', icon: MonitorPlay },
    { id: 'cards', label: 'Info Cards', icon: CreditCard },
    { id: 'ads', label: 'Ad Breaks', icon: Clapperboard },
];

export const VideoEditor: React.FC = () => {
    const { videoId } = useParams<{ videoId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [video, setVideo] = useState<Video | null>(location.state?.video || null);
    const [activeTab, setActiveTab] = useState<EditorTab>('trim');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!video) {
            // In a real app, you'd fetch the video details here based on videoId
            // For this demo, we'll navigate back if the video state is missing
            navigate('/');
        }
    }, [video, navigate]);

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => {
                navigate(-1); // Go back to previous page
            }, 1500);
        }, 1000);
    };

    const videoSrc = videoId ? PREVIEW_VIDEOS[videoId.charCodeAt(videoId.length - 1) % PREVIEW_VIDEOS.length] : PREVIEW_VIDEOS[0];
    
    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    };

    if (!video) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'trim': return <div className="p-4"><p className="text-sm">Use the handles on the timeline to trim your video. Click 'Split' to make cuts.</p></div>;
            case 'blur': return <div className="p-4"><button className="flex items-center gap-2 text-sm font-semibold p-2 bg-[var(--background-tertiary)] rounded-lg w-full justify-center"><Plus/>Add Blur</button></div>;
            case 'audio': return <div className="p-4"><button className="flex items-center gap-2 text-sm font-semibold p-2 bg-[var(--background-tertiary)] rounded-lg w-full justify-center"><Plus/>Add Audio Track</button></div>;
            case 'end': return <div className="p-4"><p className="text-sm">Add an end screen template to the last 20 seconds.</p></div>;
            case 'cards': return <div className="p-4"><p className="text-sm">Add cards to link to other videos or playlists.</p></div>;
            case 'ads': return <div className="p-4"><button className="flex items-center gap-2 text-sm font-semibold p-2 bg-[var(--background-tertiary)] rounded-lg w-full justify-center"><Plus/>Add Ad Break</button></div>;
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
                <button onClick={handleSave} disabled={saveStatus !== 'idle'} className="px-5 py-2 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 flex items-center justify-center gap-2 disabled:opacity-70 w-32">
                    {saveStatus === 'saving' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {saveStatus === 'saved' && <CheckCircle className="w-5 h-5" />}
                    {saveStatus === 'idle' && <Save className="w-4 h-4" />}
                    {saveStatus === 'idle' ? 'Save' : saveStatus === 'saving' ? 'Saving...' : 'Saved!'}
                </button>
            </header>
            
            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content (Player + Timeline) */}
                <div className="flex-1 flex flex-col p-4 gap-4">
                    <div className="flex-1 bg-black rounded-xl flex items-center justify-center relative">
                        <video 
                            ref={videoRef}
                            src={videoSrc} 
                            className="max-w-full max-h-full"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/50 backdrop-blur-sm rounded-full">
                            <button className="text-white p-1"><Rewind className="w-5 h-5"/></button>
                            <button onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()} className="text-white p-2 bg-white/20 rounded-full">
                                {isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
                            </button>
                            <button className="text-white p-1"><FastForward className="w-5 h-5"/></button>
                         </div>
                    </div>
                    {/* Timeline */}
                    <div className="h-40 bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] p-3 space-y-2">
                        <div className="h-16 bg-[var(--background-tertiary)] rounded-md relative flex items-center">
                            {/* Simple timeline vis */}
                             <div className="w-full h-1 bg-gray-500 absolute top-1/2 -translate-y-1/2"></div>
                             <div className="absolute h-full w-0.5 bg-red-500" style={{ left: `${(currentTime/duration)*100}%`}}></div>
                        </div>
                        <div className="h-8 bg-[var(--background-tertiary)] rounded-md text-xs flex items-center px-2 text-[var(--text-tertiary)] gap-2"><Music className="w-4 h-4"/> Audio Track</div>
                        <div className="h-8 bg-[var(--background-tertiary)] rounded-md text-xs flex items-center px-2 text-[var(--text-tertiary)] gap-2"><Clapperboard className="w-4 h-4"/> Ad Breaks</div>
                    </div>
                </div>

                {/* Right Panel (Tools) */}
                <aside className="w-96 border-l border-[var(--border-primary)] flex">
                    {/* Vertical Tabs */}
                    <div className="w-24 flex-shrink-0 bg-[var(--background-primary)] border-r border-[var(--border-primary)] p-2">
                        <div className="space-y-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    title={tab.label}
                                    className={`w-full p-3 text-sm font-semibold flex flex-col items-center gap-1.5 rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]'
                                    }`}
                                >
                                    <tab.icon className="w-6 h-6" />
                                    <span className="text-xs text-center">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content Panel */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-[var(--border-primary)]">
                            <h2 className="text-lg font-bold">{TABS.find(t => t.id === activeTab)?.label}</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {renderTabContent()}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};