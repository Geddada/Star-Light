import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Video } from '../types';
import { ArrowLeft, Save, Play, Pause, Scissors, Download, RefreshCw, Wand2, MonitorPlay } from 'lucide-react';
import { Logo } from '../components/Logo';
import { PREVIEW_VIDEOS } from '../constants';

export const VideoEditor: React.FC = () => {
    const { videoId } = useParams<{ videoId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const video = location.state?.video as Video | undefined;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    
    // Editor state
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(100); // Percentage
    
    const videoSrc = video ? PREVIEW_VIDEOS[((video.id.charCodeAt(0) || 0) + (video.id.charCodeAt(video.id.length - 1) || 0)) % PREVIEW_VIDEOS.length] : '';

    if (!video) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
                <p>No video selected for editing.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-[hsl(var(--accent-color))] hover:underline">Go Back</button>
            </div>
        );
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            navigate('/profile');
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-[var(--background-secondary)] text-[var(--text-primary)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--background-primary)] border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold">Editor: {video.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] rounded-lg text-sm font-semibold border border-[var(--border-primary)] transition-colors">
                        <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--accent-color))] text-white rounded-lg text-sm font-bold hover:brightness-90 transition-colors shadow-md disabled:opacity-70"
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Copy'}
                    </button>
                </div>
            </div>

            {/* Editor Workspace */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-hidden">
                {/* Video Preview */}
                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-[var(--border-primary)] group">
                    <video 
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        onClick={togglePlay}
                    />
                    
                    {/* Play Button Overlay */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                            <div className="p-4 bg-black/60 rounded-full backdrop-blur-sm">
                                <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="w-full max-w-4xl bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] p-4 shadow-lg">
                    {/* Timeline / Scrubber */}
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={togglePlay} className="p-2 bg-[var(--background-secondary)] rounded-full hover:bg-[var(--background-tertiary)] transition-colors">
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                        
                        <span className="text-xs font-medium text-[var(--text-secondary)] w-16 text-center">
                            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                        </span>
                        
                        <div className="flex-1 relative h-10 bg-[var(--background-secondary)] rounded-lg overflow-hidden group/timeline cursor-pointer">
                            {/* Fake waveforms */}
                            <div className="absolute inset-0 flex items-center justify-around opacity-20">
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <div key={i} className="w-1 bg-[var(--text-primary)] rounded-full" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                                ))}
                            </div>
                            
                            {/* Progress */}
                            <div className="absolute top-0 left-0 bottom-0 bg-[hsl(var(--accent-color))]/30 pointer-events-none" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                            
                            {/* Trim Handles */}
                            <div className="absolute top-0 bottom-0 left-0 bg-black/50 border-r-2 border-yellow-500 cursor-ew-resize" style={{ width: `${trimStart}%` }}></div>
                            <div className="absolute top-0 bottom-0 right-0 bg-black/50 border-l-2 border-yellow-500 cursor-ew-resize" style={{ width: `${100 - trimEnd}%` }}></div>
                        </div>
                        
                        <span className="text-xs font-medium text-[var(--text-secondary)] w-16 text-center">
                            {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                        </span>
                    </div>

                    {/* Tools */}
                    <div className="flex gap-4 border-t border-[var(--border-primary)] pt-4 overflow-x-auto">
                        <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group/tool">
                            <div className="p-2 bg-[var(--background-secondary)] rounded-lg group-hover/tool:bg-[hsl(var(--accent-color))]/10 group-hover/tool:text-[hsl(var(--accent-color))] transition-colors">
                                <Scissors className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Trim</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group/tool">
                            <div className="p-2 bg-[var(--background-secondary)] rounded-lg group-hover/tool:bg-[hsl(var(--accent-color))]/10 group-hover/tool:text-[hsl(var(--accent-color))] transition-colors">
                                <Wand2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Enhance</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group/tool">
                            <div className="p-2 bg-[var(--background-secondary)] rounded-lg group-hover/tool:bg-[hsl(var(--accent-color))]/10 group-hover/tool:text-[hsl(var(--accent-color))] transition-colors">
                                <MonitorPlay className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Crop</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group/tool">
                            <div className="p-2 bg-[var(--background-secondary)] rounded-lg group-hover/tool:bg-[hsl(var(--accent-color))]/10 group-hover/tool:text-[hsl(var(--accent-color))] transition-colors">
                                <Download className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Export</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};