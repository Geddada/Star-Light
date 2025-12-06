import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Loader2, Upload, LayoutTemplate, Clock } from 'lucide-react';
import { AdCampaign, UnskippableAdCampaign } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface UserAdUploadModalProps {
  onClose: () => void;
  onSuccess: (campaign: AdCampaign | UnskippableAdCampaign) => void;
  adType: 'skippable' | 'unskippable';
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const UserAdUploadModal: React.FC<UserAdUploadModalProps> = ({ onClose, onSuccess, adType }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<'6s' | '15s'>('6s');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !thumbnailFile || !currentUser) {
      alert('Please provide a title and a thumbnail image.');
      return;
    }

    setLoading(true);
    try {
        const thumbnailUrl = await fileToBase64(thumbnailFile);
        
        if (adType === 'unskippable') {
            const newCampaign: UnskippableAdCampaign = {
                id: `user-unskippable-ad-${currentUser.email}-${Date.now()}`,
                title: title.trim(),
                status: 'In Review',
                impressions: '0',
                spend: '$0',
                duration: duration,
                thumbnailUrl,
            };
            onSuccess(newCampaign);
        } else {
            const newCampaign: AdCampaign = {
                id: `user-skippable-ad-${currentUser.email}-${Date.now()}`,
                title: title.trim(),
                status: 'In Review',
                views: '0',
                ctr: '0.00%',
                spend: '$0',
                thumbnailUrl,
            };
            onSuccess(newCampaign);
        }
    } catch (error) {
        console.error("Error creating ad:", error);
        alert("There was an error creating your ad. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[var(--border-primary)]">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Upload Your {adType === 'skippable' ? 'Skippable' : 'Unskippable'} Ad</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-6">
            <div className="flex flex-col gap-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4" /> Campaign Title
                    </label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. My New Product Launch"
                        className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all"
                        disabled={loading}
                    />
                </div>
                
                {adType === 'unskippable' && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Ad Duration
                        </label>
                        <div className="flex gap-2 rounded-lg bg-[var(--background-primary)] p-1 border border-[var(--border-primary)]">
                            <button type="button" onClick={() => setDuration('6s')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${duration === '6s' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>
                                6s Bumper
                            </button>
                            <button type="button" onClick={() => setDuration('15s')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${duration === '15s' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>
                                15s Mid-roll
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                       <ImageIcon className="w-4 h-4" /> Ad Thumbnail (Image)
                    </label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[var(--border-primary)] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)] transition-colors"
                    >
                        {thumbnailPreview ? (
                            <img src={thumbnailPreview} alt="Thumbnail preview" className="max-h-40 rounded-lg" />
                        ) : (
                            <div className="text-center">
                                <UploadCloud className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-2" />
                                <p className="text-sm font-semibold text-[var(--text-secondary)]">Click to upload image</p>
                                <p className="text-xs text-[var(--text-tertiary)]">PNG, JPG, GIF</p>
                            </div>
                        )}
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                
                <button 
                    onClick={handleSubmit}
                    disabled={loading || !title || !thumbnailFile}
                    className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
                >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Upload className="w-5 h-5" /> Submit for Review</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
