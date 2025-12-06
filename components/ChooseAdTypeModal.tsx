import React from 'react';
import { X, PlayCircle, RadioTower, Smartphone } from 'lucide-react';

interface ChooseAdTypeModalProps {
  onClose: () => void;
  onSelectSkippable: () => void;
  onSelectUnskippable: () => void;
  onSelectShortsAd: () => void;
}

export const ChooseAdTypeModal: React.FC<ChooseAdTypeModalProps> = ({ onClose, onSelectSkippable, onSelectUnskippable, onSelectShortsAd }) => {
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