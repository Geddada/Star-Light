import React, { useState } from 'react';
import { X, Copy, Check, Facebook, Twitter, Linkedin, Mail, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  currentTime?: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, videoUrl, videoTitle, currentTime = 0 }) => {
  const [copied, setCopied] = useState(false);
  const [startAt, setStartAt] = useState(false);
  
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };
  
  const timeString = formatTime(currentTime);
  
  const generateUrlWithTimestamp = () => {
    try {
      // Use the URL API for robust parameter handling. It correctly places search params before the hash.
      const url = new URL(videoUrl);
      url.searchParams.set('t', String(Math.floor(currentTime)));
      return url.href;
    } catch (e) {
      console.error("Could not parse URL for timestamping, using fallback.", e);
      // Basic fallback for safety, though unlikely with window.location.href
      return `${videoUrl}?t=${Math.floor(currentTime)}`;
    }
  };
  
  const finalUrl = startAt ? generateUrlWithTimestamp() : videoUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
      { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]', url: `https://wa.me/?text=${encodeURIComponent(videoTitle + ' ' + finalUrl)}` },
      { name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}` },
      { name: 'X', icon: Twitter, color: 'bg-black', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle)}&url=${encodeURIComponent(finalUrl)}` },
      { name: 'Email', icon: Mail, color: 'bg-gray-500', url: `mailto:?subject=${encodeURIComponent(videoTitle)}&body=${encodeURIComponent('Check out this video: ' + finalUrl)}` },
      { name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0077B5]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalUrl)}` },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Share</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
             <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-8">
            {/* Social Icons */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-between">
                {shareLinks.map((link) => (
                    <a 
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 group min-w-[70px]"
                    >
                        <div className={`w-14 h-14 rounded-full ${link.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                            <link.icon className="w-7 h-7" />
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] font-medium">{link.name}</span>
                    </a>
                ))}
            </div>

            {/* Copy Link Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl p-1.5 pl-3 focus-within:ring-2 focus-within:ring-[hsl(var(--accent-color))] transition-all">
                    <input 
                        type="text" 
                        value={finalUrl} 
                        readOnly 
                        className="bg-transparent w-full text-sm text-[var(--text-secondary)] outline-none truncate mr-2" 
                    />
                    <button 
                        onClick={handleCopy}
                        className="bg-[hsl(var(--accent-color))] filter hover:brightness-90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                
                {/* Start At Checkbox */}
                <div className="flex items-center gap-2 mt-1 cursor-pointer" onClick={() => setStartAt(!startAt)}>
                    <div className={`w-5 h-5 rounded border border-[var(--border-secondary)] flex items-center justify-center transition-colors ${startAt ? 'bg-[hsl(var(--accent-color))] border-[hsl(var(--accent-color))]' : 'bg-[var(--background-primary)]'}`}>
                        {startAt && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-secondary)] select-none">
                        Start at <span className="text-[var(--text-primary)]">{timeString}</span>
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};