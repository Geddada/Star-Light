
import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Save, ScanFace, Grip, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BlurVideo: React.FC = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [blurType, setBlurType] = useState<'face' | 'custom'>('face');

    const handleApplyBlur = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert("Blur effect applied!");
        }, 1500);
    };

    return (
        <div className="w-full h-screen flex flex-col bg-[var(--background-secondary)] text-[var(--text-primary)]">
            {/* Header */}
            <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 gap-4 bg-[var(--background-primary)] border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Blur Video</h1>
                        <p className="text-xs text-[var(--text-tertiary)]">Add custom blurs to your video</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-semibold hover:bg-[var(--background-tertiary)] rounded-lg transition-colors">Discard</button>
                    <button className="px-4 py-2 text-sm font-semibold bg-[hsl(var(--accent-color))] text-white rounded-lg hover:brightness-90 transition-colors shadow-sm">Save</button>
                </div>
            </header>
            
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Video Preview Area */}
                <div className="flex-1 bg-black p-8 flex items-center justify-center relative group">
                    <div className="aspect-video w-full max-w-4xl bg-[#1a1a1a] rounded-lg relative overflow-hidden shadow-2xl border border-white/10">
                        {/* Placeholder for video content */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                            <span className="text-white text-lg font-medium">Video Preview</span>
                        </div>
                        
                        {/* Blur Overlay Simulation */}
                        {blurType === 'custom' && (
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 backdrop-blur-md border-2 border-dashed border-white/50 rounded-lg cursor-move flex items-center justify-center">
                                <span className="text-xs font-bold text-white drop-shadow-md">Blur Area</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="w-full lg:w-80 bg-[var(--background-primary)] border-l border-[var(--border-primary)] p-6 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <h3 className="font-bold mb-4">Blur Type</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setBlurType('face')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${blurType === 'face' ? 'border-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/5 text-[hsl(var(--accent-color))]' : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'}`}
                            >
                                <ScanFace className="w-6 h-6" />
                                <span className="text-xs font-bold">Face Blur</span>
                            </button>
                            <button 
                                onClick={() => setBlurType('custom')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${blurType === 'custom' ? 'border-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/5 text-[hsl(var(--accent-color))]' : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'}`}
                            >
                                <Grip className="w-6 h-6" />
                                <span className="text-xs font-bold">Custom Blur</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold mb-2">Settings</h3>
                        {blurType === 'face' ? (
                            <p className="text-sm text-[var(--text-secondary)]">
                                Automatically detect and blur faces in the video. This process may take a few minutes.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Shape</label>
                                    <div className="flex gap-2 mt-1">
                                        <button className="flex-1 py-2 bg-[var(--background-tertiary)] rounded text-xs font-medium border border-[var(--border-primary)]">Rectangle</button>
                                        <button className="flex-1 py-2 bg-[var(--background-secondary)] rounded text-xs font-medium border border-[var(--border-primary)] hover:bg-[var(--background-tertiary)]">Oval</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Behavior</label>
                                    <div className="flex gap-2 mt-1">
                                        <button className="flex-1 py-2 bg-[var(--background-tertiary)] rounded text-xs font-medium border border-[var(--border-primary)]">Track Object</button>
                                        <button className="flex-1 py-2 bg-[var(--background-secondary)] rounded text-xs font-medium border border-[var(--border-primary)] hover:bg-[var(--background-tertiary)]">Fixed Position</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleApplyBlur}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        {isProcessing ? 'Processing...' : 'Apply Blur'}
                    </button>
                </div>
            </div>
        </div>
    );
};
