
import React, { useState, useRef } from 'react';
import { X, Sparkles, Target, ShoppingBag, Clock, Loader2, Upload, FileVideo, DollarSign, LayoutTemplate } from 'lucide-react';
import { UnskippableAdCampaign, CATEGORIES } from '../types';
import { generateUnskippableAdCampaign } from '../services/gemini';
import { COUNTRIES, USA_STATES, INDIAN_STATES, UK_STATES, ANDHRA_PRADESH_CONSTITUENCIES } from '../constants';


interface CreateUnskippableAdModalProps {
  onClose: () => void;
  onSuccess: (campaign: UnskippableAdCampaign) => void;
}

export const CreateUnskippableAdModal: React.FC<CreateUnskippableAdModalProps> = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [productName, setProductName] = useState('');
  const [goal, setGoal] = useState('');
  const [adType, setAdType] = useState<'6s Bumper' | '15s Mid-roll'>('6s Bumper');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [constituency, setConstituency] = useState('');
  
  const [manualTitle, setManualTitle] = useState('');
  const [manualBudget, setManualBudget] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAiGenerate = async () => {
    if (!productName || !goal) return;
    
    setLoading(true);
    try {
        const newCampaign = await generateUnskippableAdCampaign(productName, goal, adType, country, state, district, city, constituency);
        onSuccess(newCampaign);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleManualUpload = () => {
    if(!manualTitle || !manualBudget || !selectedFile) return;
    
    setLoading(true);
    setTimeout(() => {
        const newCampaign: UnskippableAdCampaign = {
            id: `manual-unskippable-${Date.now()}`,
            title: manualTitle,
            status: 'In Review',
            impressions: '0',
            spend: `$0 / ${manualBudget}`,
            duration: adType.startsWith('6s') ? '6s' : '15s',
            thumbnailUrl: URL.createObjectURL(selectedFile),
            country,
            state,
            district,
            city,
            constituency,
            category: selectedCategory,
            subCategory: selectedSubCategory,
        };
        onSuccess(newCampaign);
        setLoading(false);
    }, 1500);
  };
  
  const stateOptions = country === 'India' ? INDIAN_STATES : country === 'United States of America' ? USA_STATES : country === 'United Kingdom' ? UK_STATES : [];
  
  const activeCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
  const activeSubCategories = activeCategoryData?.subCategories || [];
  
  const locationFields = (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Country</label>
                <select 
                    value={country} 
                    onChange={e => { setCountry(e.target.value); setState(''); setCity(''); setDistrict(''); setConstituency(''); }} 
                    className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all text-[var(--text-primary)]"
                    disabled={loading}
                >
                    <option value="">Any Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">State / Region</label>
                {stateOptions.length > 0 ? (
                    <select value={state} onChange={e => { setState(e.target.value); setConstituency(''); }} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all text-[var(--text-primary)]" disabled={loading}>
                        <option value="">Any State</option>
                        {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                ) : (
                    <input type="text" value={state} onChange={e => { setState(e.target.value); setConstituency(''); }} placeholder="e.g. California" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all" disabled={loading} />
                )}
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">District</label>
                <input type="text" value={district} onChange={e => setDistrict(e.target.value)} placeholder="e.g. Santa Clara County" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all" disabled={loading} />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mountain View" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all" disabled={loading} />
            </div>
        </div>
        {(country === 'India' && state === 'Andhra Pradesh') && (
            <div className="space-y-2 mt-4 sm:col-span-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Constituency (Andhra Pradesh)</label>
                <select 
                    value={constituency} 
                    onChange={e => setConstituency(e.target.value)}
                    className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all text-[var(--text-primary)]"
                    disabled={loading}
                >
                    <option value="">Any Constituency</option>
                    {ANDHRA_PRADESH_CONSTITUENCIES.map(c => <option key={c.id} value={c.name}>{c.name}{c.isReservedSC ? ' (SC)' : ''}</option>)}
                </select>
            </div>
        )}
      </>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[var(--border-primary)]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Create Unskippable Ad</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-primary)]">
            <button 
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'ai' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                onClick={() => setActiveTab('ai')}
            >
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                </div>
            </button>
            <button 
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'manual' ? 'text-[hsl(var(--accent-color))] border-b-2 border-[hsl(var(--accent-color))]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                onClick={() => setActiveTab('manual')}
            >
                <div className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Manually
                </div>
            </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
            {activeTab === 'ai' ? (
                 <div className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Product / Service Name
                        </label>
                        <input 
                            type="text" 
                            value={productName}
                            onChange={e => setProductName(e.target.value)}
                            placeholder="e.g. Quantum Leap Coffee"
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all"
                            disabled={loading}
                        />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <Target className="w-4 h-4" /> Target Video Category
                        </label>
                        <select
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all"
                            disabled={loading}
                        >
                            <option value="">Select a Category to Target</option>
                            {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    {locationFields}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Ad Format
                        </label>
                         <select 
                            value={adType}
                            onChange={e => setAdType(e.target.value as '6s Bumper' | '15s Mid-roll')}
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all"
                         >
                            <option value="6s Bumper">6s Bumper Ad</option>
                            <option value="15s Mid-roll">15s Mid-roll</option>
                         </select>
                    </div>
                    
                    <button 
                        onClick={handleAiGenerate}
                        disabled={loading || !productName || !goal}
                        className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
                    >
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Campaign</>}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4" /> Campaign Title
                        </label>
                        <input 
                            type="text" 
                            value={manualTitle}
                            onChange={e => setManualTitle(e.target.value)}
                            placeholder="e.g. Flash Sale - 6 Seconds"
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all"
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Total Budget
                        </label>
                        <input 
                            type="text" 
                            value={manualBudget}
                            onChange={e => setManualBudget(e.target.value)}
                            placeholder={country === 'India' ? "e.g. ₹2000" : "e.g. $1000"}
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all"
                            disabled={loading}
                        />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Ad Format
                        </label>
                         <select 
                            value={adType}
                            onChange={e => setAdType(e.target.value as '6s Bumper' | '15s Mid-roll')}
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all"
                         >
                            <option value="6s Bumper">6s Bumper Ad</option>
                            <option value="15s Mid-roll">15s Mid-roll</option>
                         </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                            <FileVideo className="w-4 h-4" /> Ad Creative
                        </label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[var(--border-primary)] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                            {selectedFile ? (
                                <div className="text-center">
                                    <FileVideo className="w-10 h-10 text-[hsl(var(--accent-color))] mx-auto mb-2" />
                                    <p className="text-sm font-semibold">{selectedFile.name}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-[var(--text-secondary)]">Click to upload video/image</p>
                                    <p className="text-xs text-[var(--text-tertiary)]">MP4, MOV, JPG, PNG</p>
                                </div>
                            )}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="video/*,image/*"
                                className="hidden"
                                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                    <h3 className="text-md font-bold text-[var(--text-primary)] pt-4 mt-2 border-t border-[var(--border-primary)]">Targeting</h3>
                    {locationFields}
                    <h3 className="text-md font-bold text-[var(--text-primary)] pt-4 mt-2 border-t border-[var(--border-primary)]">Category</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Category</label>
                            <select 
                                value={selectedCategory} 
                                onChange={e => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }} 
                                className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all text-[var(--text-primary)]"
                                disabled={loading}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Sub-Category</label>
                            <select 
                                value={selectedSubCategory} 
                                onChange={e => setSelectedSubCategory(e.target.value)} 
                                className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none transition-all text-[var(--text-primary)]" 
                                disabled={loading || !selectedCategory || activeSubCategories.length === 0}
                            >
                                <option value="">Any Sub-Category</option>
                                {activeSubCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <button 
                        onClick={handleManualUpload}
                        disabled={loading || !manualTitle || !manualBudget || !selectedFile}
                        className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
                    >
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : <><Upload className="w-5 h-5" /> Upload Campaign</>}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
