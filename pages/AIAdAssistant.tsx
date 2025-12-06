import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Loader2, Sparkles, Lightbulb, CheckCircle, ArrowRight, ArrowLeft, Image as ImageIcon, Clapperboard, ShoppingBag, Users, BarChart } from 'lucide-react';
import { AdConcept, AdCampaign, CATEGORIES } from '../types';
import { generateAdConcepts, generateThumbnail } from '../services/gemini';
import { useAuth } from '../contexts/AuthContext';

const USER_ADS_KEY = 'starlight_user_ads';

export const AIAdAssistant: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<'brief' | 'concepts' | 'refine'>('brief');
    
    // Step 1: Brief
    const [productName, setProductName] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [keyMessages, setKeyMessages] = useState('');
    const [productImage, setProductImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Step 2: Concepts
    const [isLoading, setIsLoading] = useState(false);
    const [concepts, setConcepts] = useState<AdConcept[]>([]);
    
    // Step 3: Refine
    const [selectedConcept, setSelectedConcept] = useState<AdConcept | null>(null);
    const [finalTitle, setFinalTitle] = useState('');
    const [finalScript, setFinalScript] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setProductImage(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };
    
    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: {
                data: await base64EncodedDataPromise,
                mimeType: file.type,
            },
        };
    };
    
    const handleGenerateConcepts = async () => {
        setIsLoading(true);
        let imagePart;
        if (productImage) {
            imagePart = await fileToGenerativePart(productImage);
        }
        const result = await generateAdConcepts(productName, targetAudience, keyMessages, imagePart);
        if (result) {
            setConcepts(result);
            setStep('concepts');
        } else {
            alert("Failed to generate concepts. Please try again.");
        }
        setIsLoading(false);
    };

    const handleSelectConcept = (concept: AdConcept) => {
        setSelectedConcept(concept);
        setFinalTitle(concept.title);
        setFinalScript(concept.script);
        setThumbnailUrl(null);
        setStep('refine');
    };
    
    const handleGenerateThumbnail = async () => {
        if (!selectedConcept) return;
        setIsGeneratingThumbnail(true);
        const url = await generateThumbnail(finalTitle, selectedConcept.visualIdea);
        setThumbnailUrl(url);
        setIsGeneratingThumbnail(false);
    };
    
    const handleLaunchCampaign = () => {
        if (!currentUser || !selectedConcept) return;
        setIsLaunching(true);

        const newCampaign: AdCampaign = {
          id: `user-ai-ad-${currentUser.email}-${Date.now()}`,
          title: finalTitle,
          status: 'In Review',
          views: '0',
          ctr: '0.00%',
          spend: '$0',
          thumbnailUrl: thumbnailUrl || `https://picsum.photos/seed/${selectedConcept.id}/640/360`,
          category: targetAudience,
          communityName: currentUser.name
        };
        
        const userAdsJson = localStorage.getItem(USER_ADS_KEY);
        const userAds = userAdsJson ? JSON.parse(userAdsJson) : [];
        userAds.unshift(newCampaign);
        localStorage.setItem(USER_ADS_KEY, JSON.stringify(userAds));

        setTimeout(() => {
            setIsLaunching(false);
            navigate('/skippable-ads');
        }, 1500);
    };

    const StepIndicator = ({ current }: { current: number }) => (
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
            {['The Brief', 'AI Concepts', 'Finalize'].map((label, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === current;
                const isDone = stepNum < current;
                return (
                    <React.Fragment key={stepNum}>
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-all ${isActive ? 'bg-[hsl(var(--accent-color))] text-white border-[hsl(var(--accent-color))]' : isDone ? 'bg-green-500 text-white border-green-500' : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-secondary)]'}`}>
                                {isDone ? <CheckCircle className="w-5 h-5"/> : stepNum}
                            </div>
                            <span className={`font-semibold hidden sm:inline ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{label}</span>
                        </div>
                        {stepNum < 3 && <div className={`flex-1 h-1 rounded-full transition-colors ${isDone ? 'bg-green-500' : 'bg-[var(--background-tertiary)]'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <Wand2 className="w-12 h-12 text-[hsl(var(--accent-color))] mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-[var(--text-primary)]">AI Ad Creation Assistant</h1>
                <p className="text-[var(--text-secondary)] mt-2">Let Gemini be your creative director. Go from idea to ad campaign in minutes.</p>
            </header>

            <StepIndicator current={step === 'brief' ? 1 : step === 'concepts' ? 2 : 3} />

            {step === 'brief' && (
                <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] space-y-6 animate-in fade-in">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> What are you advertising?</label>
                        <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., 'Quantum Leap' brand coffee beans" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2"><Users className="w-4 h-4" /> Who is your target audience?</label>
                        <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]">
                            <option value="">Select a category</option>
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2"><BarChart className="w-4 h-4" /> What are your key selling points?</label>
                        <textarea value={keyMessages} onChange={e => setKeyMessages(e.target.value)} placeholder="e.g., Ethically sourced, rich dark roast flavor, boosts productivity." rows={3} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"></textarea>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Product Image (Optional)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-[var(--background-primary)] rounded-lg border-2 border-dashed border-[var(--border-primary)] flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-[var(--text-tertiary)]" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageChange} />
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--background-tertiary)] transition-colors">
                                    Upload Image
                                </button>
                                {productImage && (
                                    <button type="button" onClick={removeImage} className="text-xs text-red-500 hover:underline text-left">
                                        Remove Image
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button onClick={handleGenerateConcepts} disabled={!productName || !targetAudience || (!keyMessages && !productImage) || isLoading} className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Thinking...</> : <><Sparkles className="w-5 h-5" /> Generate Concepts</>}
                        </button>
                    </div>
                </div>
            )}
            
            {step === 'concepts' && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setStep('brief')} className="flex items-center gap-2 px-4 py-2 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--background-tertiary)]">
                            <ArrowLeft className="w-4 h-4"/> Back to Brief
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {concepts.map((concept, i) => (
                            <div key={concept.id} className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <h3 className="text-xl font-bold mb-3">{concept.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] flex-grow line-clamp-3 mb-4">{concept.script}</p>
                                <div className="text-xs text-[var(--text-secondary)] mb-4"><strong className="text-[var(--text-primary)]">Visual Idea:</strong> {concept.visualIdea}</div>
                                <div className="text-xs text-[var(--text-secondary)] mb-4"><strong className="text-[var(--text-primary)]">Targeting:</strong> {concept.targeting.join(', ')}</div>
                                <button onClick={() => handleSelectConcept(concept)} className="w-full mt-auto py-2 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all">Select & Refine</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 'refine' && selectedConcept && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-6">
                         <button onClick={() => setStep('concepts')} className="flex items-center gap-2 px-4 py-2 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--background-tertiary)]">
                            <ArrowLeft className="w-4 h-4"/> Back to Concepts
                        </button>
                    </div>
                     <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Ad Title</label>
                            <input value={finalTitle} onChange={e => setFinalTitle(e.target.value)} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Ad Script</label>
                            <textarea value={finalScript} onChange={e => setFinalScript(e.target.value)} rows={4} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Thumbnail</label>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="w-full sm:w-64 aspect-video bg-[var(--background-primary)] rounded-lg border border-dashed border-[var(--border-primary)] flex items-center justify-center overflow-hidden">
                                    {isGeneratingThumbnail ? <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--accent-color))]"/> : thumbnailUrl ? <img src={thumbnailUrl} className="w-full h-full object-cover"/> : <ImageIcon className="w-8 h-8 text-[var(--text-tertiary)]"/>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-[var(--text-secondary)] mb-2">Based on the visual idea: <em>"{selectedConcept.visualIdea}"</em></p>
                                    <button onClick={handleGenerateThumbnail} disabled={isGeneratingThumbnail} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))] rounded-lg font-semibold text-sm hover:bg-[hsl(var(--accent-color))]/20 disabled:opacity-50">
                                        {isGeneratingThumbnail ? <><Loader2 className="w-4 h-4 animate-spin"/> Generating...</> : <><Sparkles className="w-4 h-4"/> Generate with AI</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-[var(--border-primary)] flex justify-end">
                            <button onClick={handleLaunchCampaign} disabled={isLaunching || !thumbnailUrl} className="py-3 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLaunching ? <><Loader2 className="w-5 h-5 animate-spin"/> Launching...</> : <><Clapperboard className="w-5 h-5"/> Launch Campaign</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};