import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BlurVideo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen flex flex-col bg-[var(--background-secondary)]">
            {/* Header */}
            <header className="flex-shrink-0 h-16 flex items-center justify-between px-4 gap-4 bg-[var(--background-primary)] border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full">
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Blur Video</h1>
                        <p className="text-xs text-[var(--text-tertiary)]">Add custom blurs to your video</p>
                    </div>
                </div>
            </header>
            
            <div className="flex-1 flex items-center justify-center">
                <p className="text-[var(--text-secondary)]">Blur Video feature coming soon.</p>
            </div>
        </div>
    );
};