
import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const shortcuts = [
    { key: "Space / k", action: "Play / Pause" },
    { key: "j", action: "Rewind 10s" },
    { key: "l", action: "Fast Forward 10s" },
    { key: "m", action: "Mute / Unmute" },
    { key: "f", action: "Toggle Fullscreen" },
    { key: "←", action: "Rewind 5s" },
    { key: "→", action: "Fast Forward 5s" },
    { key: "/", action: "Focus Search" },
    { key: "?", action: "Show Shortcuts" },
    { key: "Esc", action: "Close Modal" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-[hsl(var(--accent-color))]" /> Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-h-[70vh] overflow-y-auto">
            {shortcuts.map((s, i) => (
                <div key={i} className="flex justify-between items-center border-b border-[var(--border-primary)]/50 pb-2 last:border-0">
                    <span className="text-[var(--text-secondary)] font-medium">{s.action}</span>
                    <span className="px-2 py-1 bg-[var(--background-tertiary)] rounded-md font-mono text-sm border border-[var(--border-primary)] min-w-[30px] text-center">
                        {s.key}
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
