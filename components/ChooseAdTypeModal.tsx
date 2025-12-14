
import React from 'react';
import { X, PlayCircle, RadioTower, Smartphone, Wand2, Film } from 'lucide-react';

interface ChooseAdTypeModalProps {
  onClose: () => void;
  onSelectSkippable: () => void;
  onSelectUnskippable: () => void;
  onSelectShortsAd: () => void;
  onSelectAIAssistant: () => void;
  onSelectCinematicAd: () => void;
}

export const ChooseAdTypeModal: React.FC<ChooseAdTypeModalProps> = ({ onClose, onSelectSkippable, onSelectUnskippable, onSelectShortsAd, onSelectAIAssistant, onSelectCinematicAd }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Choose Campaign Type</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 grid grid-cols-1 gap-4">
            <button
                onClick={onSelectAIAssistant}
                className="p-6 rounded-xl border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-all flex flex-col items-center gap-4 text-center"
            >
                <Wand2 className="w-12 h-12 text-purple-500" />
                <h3 className="font-bold text-lg">AI Ad Assistant</h3>
                <p className="text-sm text-[var(--text-secondary)]">Let Gemini generate complete ad concepts, scripts, and targeting ideas for you.</p>
            </button>
             <button
                onClick={onSelectCinematicAd}
                className="p-6 rounded-xl border-2 border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 transition-all flex flex-col items-center gap-4 text-center"
            >
                <Film className="w-12 h-12 text-orange-500" />
                <h3 className="font-bold text-lg">Cinematic Ad <span className="text-xs align-top bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-full">Labs</span></h3>
                <p className="text-sm text-[var(--text-secondary)]">Generate high-quality video ads with Google Gemini Labs, available in 16:9 or 9:16.</p>
            </button>
            <div className="flex items-center gap-4 my-2">
                <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
                <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">Or create manually</span>
                <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
            </div>
            <button 
                onClick={onSelectSkippable}
                className="p-6 rounded-xl border-2 border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)] transition-all flex flex-col items-center gap-4 text-center"
            >
                <PlayCircle className="w-12 h-12 text-blue-500" />
                <h3 className="font-bold text-lg">Skippable Ad</h3>
                <p className="text-sm text-[var(--text-secondary)]">Standard video ads that users can skip after 5 seconds.</p>
            </button>
            <button 
                onClick={onSelectUnskippable}
                className="p-6 rounded-xl border-2 border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)] transition-all flex flex-col items-center gap-4 text-center"
            >
                <RadioTower className="w-12 h-12 text-purple-500" />
                <h3 className="font-bold text-lg">Unskippable Ad</h3>
                <p className="text-sm text-[var(--text-secondary)]">Short 6s or 15s ads that play before or during a video.</p>
            </button>
             <button 
                onClick={onSelectShortsAd}
                className="p-6 rounded-xl border-2 border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)] transition-all flex flex-col items-center gap-4 text-center"
            >
                <Smartphone className="w-12 h-12 text-red-500" />
                <h3 className="font-bold text-lg">Shorts Ad</h3>
                <p className="text-sm text-[var(--text-secondary)]">Vertical video ads that appear between Shorts in the feed.</p>
            </button>
        </div>
      </div>
    </div>
  );
};
