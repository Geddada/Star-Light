
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { X, UploadCloud, Video, Image as ImageIcon, Sparkles, RefreshCw, Loader2, Save, Folder, Tag, ArrowLeft, Camera, Users, Upload, Newspaper, ChevronDown, Tv, FileVideo, CheckCircle, ArrowRight, AlertTriangle, Palette, ExternalLink, Link } from 'lucide-react';
import { Video as VideoType, CATEGORIES, Community } from '../types';
import { generateThumbnail, generateVideoMetadata } from '../services/gemini';
import { useAuth } from '../contexts/AuthContext';
import { VideoRecorder } from './VideoRecorder';
import { useNavigate } from 'react-router-dom';

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: () => void;
  videoToEdit?: VideoType;
  isShortsDefault?: boolean;
  initialStep?: 'initial' | 'recording' | 'details' | 'canva_import';
  preselectedCommunity?: Community | null;
  uploadType?: 'video' | 'image';
  flow?: 'simple' | 'detailed';
}

const USER_IMAGES_KEY = 'starlight_user_images';

// Basic HTML sanitization function
const sanitizeInput = (text: string) => text.replace(/<[^>]*>?/gm, "").trim();

export const UploadModal: React.FC<UploadModalProps> = ({ 
    onClose, onUploadSuccess, videoToEdit, isShortsDefault = false, 
    initialStep = 'initial', preselectedCommunity = null, uploadType = 'video', flow = 'simple' 
}) => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [videoType, setVideoType] = useState<'video' | 'short'>(videoToEdit?.isShort ? 'short' : isShortsDefault ? 'short' : 'video');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [uploadStep, setUploadStep] = useState<'initial' | 'recording' | 'details' | 'video-preview' | 'canva_import'>('initial');
  const [detailsSubStep, setDetailsSubStep] = useState(1); // 1: Assets, 2: Metadata
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const [communitySearch, setCommunitySearch] = useState('');
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const communityDropdownRef = useRef<HTMLDivElement>(null);

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  
  // Canva specific state
  const [canvaLink, setCanvaLink] = useState('');
  const [isImportingCanva, setIsImportingCanva] = useState(false);

  useEffect(() => {
    const communitiesJson = localStorage.getItem('starlight_communities');
    if (communitiesJson) {
      const allCommunities: Community[] = JSON.parse(communitiesJson);
      const adminEmails = ['admin@starlight.app', 'system@starlight.app'];
      const adminCreatedCommunities = allCommunities.filter(community => 
        adminEmails.includes(community.ownerEmail)
      );
      setCommunities(adminCreatedCommunities);
    }

    if (videoToEdit) {
      setTitle(videoToEdit.title);
      setDescription(videoToEdit.description);
      setSelectedCategory(videoToEdit.category || '');
      setSelectedSubCategory(videoToEdit.subCategory || '');
      setThumbnailUrl(videoToEdit.thumbnailUrl || null);
      setSelectedFileName('Existing Video File.mp4');
      setSelectedCommunity(videoToEdit.communityName);
      setUploadStep('details');
      setDetailsSubStep(2); // When editing, go straight to metadata step
    } else if (currentUser) {
      setUploadStep(initialStep);
      if (initialStep === 'details') {
          setDetailsSubStep(1); // For new uploads via Canva flow, start at assets step
      }
      if (preselectedCommunity) {
        setSelectedCommunity(preselectedCommunity.name);
      }
    }
  }, [currentUser, videoToEdit, initialStep, preselectedCommunity]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (communityDropdownRef.current && !communityDropdownRef.current.contains(event.target as Node)) {
            setIsCommunityDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [videoPreviewUrl, thumbnailUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, from: 'initial' | 'details' = 'initial') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security Check: STRICT ALLOWLIST
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm', 'mkv'];
    
    if (!ext || !allowedExtensions.includes(ext)) {
        alert("Security Alert: File type not supported. Please upload a valid image or video.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setSelectedFileName(file.name);
        if(from === 'details') return; // In details flow, just set state, don't change view

        const objectUrl = URL.createObjectURL(file);
        
        if (flow === 'simple') {
            setVideoPreviewUrl(objectUrl);
            setUploadStep('video-preview');
        } else {
            setTitle(file.name.replace(/\.[^/.]+$/, ""));
            setUploadStep('details');
            setDetailsSubStep(1);
        }
    } else if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setSelectedFileName(file.name);
        const objectUrl = URL.createObjectURL(file);
        setThumbnailUrl(objectUrl);
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        setUploadStep('details');
        setDetailsSubStep(1);
    } else {
        alert(`Please upload a valid image or video file.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRecordingComplete = (videoFile: File) => {
    setSelectedFile(videoFile);
    setSelectedFileName(videoFile.name);
    setVideoType('short');
    const objectUrl = URL.createObjectURL(videoFile);
    if (flow === 'simple') {
        setVideoPreviewUrl(objectUrl);
        setUploadStep('video-preview');
    } else {
        setTitle(objectUrl.split('/').pop()?.replace(/\.[^/.]+$/, "") || "Untitled Short"); // Use a temporary name for generated short
        setUploadStep('details');
        setDetailsSubStep(1);
    }
  };

  const handleGenerateThumbnail = async () => {
    const titleToUse = title || selectedFileName || "Untitled Video";
    setIsGeneratingThumbnail(true);
    try {
      const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'General';
      const url = await generateThumbnail(titleToUse, categoryName);
      setThumbnailUrl(url);
    } catch (error) { console.error("Failed to generate thumbnail", error); }
    finally { setIsGeneratingThumbnail(false); }
  };
  
  const handleGenerateDetails = async () => {
    const topic = title || selectedFileName;
    if (!topic) return;
    setIsGeneratingText(true);
    try {
        const metadata = await generateVideoMetadata(topic);
        if (metadata) {
            setTitle(metadata.title);
            setDescription(metadata.description);
        }
    } catch (error) { console.error("Failed to generate details", error); }
    finally { setIsGeneratingText(false); }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Security check for thumbnail as well
        const ext = file.name.split('.').pop()?.toLowerCase();
        const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (!ext || !allowedImageExtensions.includes(ext)) {
            alert("Invalid image file. Please use JPG, PNG, GIF, or WEBP.");
            return;
        }
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
    }
  };

  const handleCanvaImport = () => {
      if (!canvaLink.includes('canva.com')) {
          alert('Please enter a valid Canva design link.');
          return;
      }
      setIsImportingCanva(true);
      
      // Simulate fetching and processing video from Canva
      setTimeout(() => {
          const fakeFile = new File(["canva_video_content"], "Canva Design.mp4", { type: "video/mp4" });
          setSelectedFile(fakeFile);
          setSelectedFileName("Canva Design Project.mp4");
          
          // Generate a placeholder "thumbnail" or use a generic one
          // Check videoType state (set via props on init) to determine orientation
          const isShort = videoType === 'short';
          const thumbWidth = isShort ? 360 : 640;
          const thumbHeight = isShort ? 640 : 360;
          
          setThumbnailUrl(`https://picsum.photos/seed/canva-import/${thumbWidth}/${thumbHeight}`);
          setTitle(isShort ? "My Canva Short" : "My Canva Project");
          
          setIsImportingCanva(false);
          setUploadStep('details');
          setDetailsSubStep(1);
      }, 2000);
  };

  const handleUpload = async () => {
    if (!title.trim() || !description.trim() || (!selectedFile && !videoToEdit) || !currentUser || !selectedCommunity || !thumbnailUrl) {
      alert('Please fill in all fields.');
      return;
    }
    setUploading(true);

    const existingUploadedVideos: VideoType[] = JSON.parse(localStorage.getItem('starlight_uploaded_videos') || '[]');
    
    // Sanitize Inputs
    const cleanTitle = sanitizeInput(title).substring(0, 100); // Limit title length
    const cleanDescription = sanitizeInput(description).substring(0, 5000); // Limit description length

    const sharedData = {
        title: cleanTitle, description: cleanDescription, category: selectedCategory, subCategory: selectedSubCategory,
        thumbnailUrl: thumbnailUrl!, isShort: videoType === 'short', communityName: selectedCommunity,
        communityAvatar: `https://picsum.photos/seed/${encodeURIComponent(selectedCommunity)}/64/64`,
        uploaderName: currentUser.name, uploaderAvatar: currentUser.avatar,
    };
    if (videoToEdit) {
        const updatedVideo: VideoType = { ...videoToEdit, ...sharedData };
        const updatedVideos = existingUploadedVideos.map(v => v.id === videoToEdit.id ? updatedVideo : v);
        localStorage.setItem('starlight_uploaded_videos', JSON.stringify(updatedVideos));
    } else {
        const newVideo: VideoType = {
            ...sharedData, id: `uploaded-${Date.now()}`, views: '0 views', uploadTime: 'just now',
            uploadDate: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
            duration: videoType === 'short' ? `0:${String(Math.floor(Math.random()*50)+10).padStart(2, '0')}` : `${Math.floor(Math.random()*20)+1}:${String(Math.floor(Math.random()*59)).padStart(2, '0')}`,
        };
        existingUploadedVideos.unshift(newVideo);
        localStorage.setItem('starlight_uploaded_videos', JSON.stringify(existingUploadedVideos));
    }
    setUploading(false);
    onUploadSuccess();
    onClose();
  };
  
  const resetToInitial = () => {
    setUploadStep(initialStep === 'details' ? 'details' : 'initial');
    setDetailsSubStep(1);
    setSelectedFile(null);
    setSelectedFileName(null);
    setThumbnailUrl(null);
    setVideoPreviewUrl(null);
    setTitle('');
    setDescription('');
  };

  const activeCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
  const activeSubCategories = activeCategoryData?.subCategories || [];
  
  const filteredCommunities = communities.filter(c => c.name.toLowerCase().includes(communitySearch.toLowerCase()));

  const acceptType = uploadType === 'image' ? 'image/*' : 'video/*,image/*';
  const typeLabel = uploadType === 'image' ? 'Image' : 'Video';
  const typeLabelGeneric = uploadType === 'image' ? 'image' : 'file';

  const renderHeader = () => (
    <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)] sticky top-0 bg-[var(--background-secondary)] z-10">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">{videoToEdit ? 'Edit Content' : 'Upload Content'}</h2>
      <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--background-tertiary)]" aria-label="Close"><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-[var(--border-primary)]">
        {renderHeader()}
        <div className="flex-1 overflow-y-auto">
            {uploadStep === 'initial' && (<div className="p-6 md:p-10 flex flex-col items-center justify-center h-full"><input type="file" ref={fileInputRef} className="hidden" accept={acceptType} onChange={(e) => handleFileChange(e)} /><button onClick={() => fileInputRef.current?.click()} className="w-full h-full min-h-[300px] bg-[var(--background-primary)] border-2 border-dashed border-[var(--border-primary)] rounded-xl flex flex-col items-center justify-center gap-4 font-semibold hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)] transition-colors"><UploadCloud className="w-12 h-12 text-blue-500"/><span className="text-xl">Select {typeLabelGeneric} to upload</span></button></div>)}
            {uploadStep === 'recording' && <VideoRecorder onRecordingComplete={handleRecordingComplete} onCancel={() => setUploadStep('initial')} />}
            
            {uploadStep === 'canva_import' && (
                <div className="p-8 flex flex-col items-center justify-center h-full animate-in fade-in">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                        <Palette className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-center">Design in Canva</h2>
                    <p className="text-[var(--text-secondary)] text-center max-w-md mb-8">
                        Create stunning visuals and videos in Canva, then paste your public view link here to import directly to your channel.
                    </p>
                    
                    <div className="w-full max-w-md space-y-4">
                        <a 
                            href="https://www.canva.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg font-semibold hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                            Open Canva <ExternalLink className="w-4 h-4"/>
                        </a>
                        
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px bg-[var(--border-primary)] flex-1"></div>
                            <span className="text-xs text-[var(--text-tertiary)] font-bold">THEN</span>
                            <div className="h-px bg-[var(--border-primary)] flex-1"></div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Paste Canva Link</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input 
                                        type="url" 
                                        value={canvaLink}
                                        onChange={(e) => setCanvaLink(e.target.value)}
                                        placeholder="https://www.canva.com/design/..."
                                        className="w-full pl-9 pr-3 py-2.5 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                                    />
                                </div>
                                <button 
                                    onClick={handleCanvaImport}
                                    disabled={!canvaLink || isImportingCanva}
                                    className="px-6 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isImportingCanva ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                                </button>
                            </div>
                        </div>
                        {isImportingCanva && (
                            <p className="text-xs text-center text-[hsl(var(--accent-color))] animate-pulse mt-2">
                                Processing design... This may take a moment.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {uploadStep === 'details' && (
              <>
                {/* ----- STEP 1: ASSETS ----- */}
                {detailsSubStep === 1 && (
                  <>
                    <div className="p-6 flex flex-col gap-8 animate-in fade-in">
                      {/* --- THUMBNAIL --- */}
                      <div className="space-y-3">
                          <label className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Step 1: {uploadType === 'image' ? 'Image Preview' : 'Create Thumbnail'}</label>
                          <p className="text-sm text-slate-400 -mt-2">{uploadType === 'image' ? 'This image will be displayed as your content.' : 'An eye-catching thumbnail is key to attracting viewers.'}</p>
                          <div className="flex flex-col sm:flex-row gap-4">
                              <div className={`relative w-full ${videoType === 'short' ? 'sm:w-32 aspect-[9/16]' : 'sm:w-64 aspect-video'} bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)] border-dashed flex items-center justify-center overflow-hidden group flex-shrink-0 transition-all duration-300`}>
                                  {thumbnailUrl ? <><img src={thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover"/><button onClick={() => setThumbnailUrl(null)} className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-500 opacity-0 group-hover:opacity-100"><X className="w-4 h-4"/></button></> : <div className="flex flex-col items-center text-[var(--text-tertiary)]"><ImageIcon className="w-8 h-8 mb-2 opacity-50"/><span className="text-xs">Preview</span></div>)}
                              </div>
                              <div className="flex-1 space-y-3">
                                  <button onClick={handleGenerateThumbnail} disabled={isGeneratingThumbnail} className="w-full p-3 bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))] rounded-lg flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[hsl(var(--accent-color))]/20 disabled:opacity-50"><Sparkles className="w-4 h-4"/> Generate with AI</button>
                                  <button onClick={() => fileInputRef.current?.click()} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[var(--background-tertiary)]"><Upload className="w-4 h-4"/>Upload Image</button>
                                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload}/>
                              </div>
                          </div>
                      </div>

                      {/* --- VIDEO FILE --- */}
                      <div className="space-y-3">
                          <label className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2"><FileVideo className="w-5 h-5" /> Step 2: Content File</label>
                          <div onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed border-[var(--border-primary)] rounded-xl flex items-center justify-between text-center transition-colors cursor-pointer hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)]">
                              <input type="file" ref={fileInputRef} className="hidden" accept={acceptType} onChange={(e) => handleFileChange(e, 'details')} />
                              {selectedFileName ? (
                                  <div className="flex items-center gap-3 text-left">
                                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                      <div>
                                          <p className="font-semibold text-sm truncate">{selectedFileName}</p>
                                          <p className="text-xs text-[var(--text-tertiary)]">Ready to upload</p>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="w-full flex flex-col items-center py-4">
                                      <UploadCloud className="w-8 h-8 text-[var(--text-secondary)] mb-2" />
                                      <p className="font-semibold text-sm">Click to upload {typeLabelGeneric}</p>
                                  </div>
                              )}
                          </div>
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--background-primary)] border-t border-[var(--border-primary)] flex justify-end items-center sticky bottom-0">
                        <button onClick={() => { if (!title) setTitle(selectedFileName?.replace(/\.[^/.]+$/, "") || "Untitled Content"); setDetailsSubStep(2); }} disabled={!thumbnailUrl || !selectedFile} className="px-6 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 flex items-center justify-center gap-2 disabled:opacity-50">Next <ArrowRight className="w-4 h-4"/></button>
                    </div>
                  </>
                )}

                {/* ----- STEP 2: METADATA ----- */}
                {detailsSubStep === 2 && (
                  <>
                    <div className="p-6 flex flex-col gap-6 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-xs font-bold text-[var(--text-secondary)]">THUMBNAIL</label><img src={thumbnailUrl || ''} alt="Thumbnail Preview" className={`w-full ${videoType === 'short' ? 'aspect-[9/16]' : 'aspect-video'} rounded-lg object-cover border border-[var(--border-primary)]`}/></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-[var(--text-secondary)]">FILE</label><div className="w-full aspect-video bg-[var(--background-primary)] rounded-lg flex flex-col items-center justify-center text-center p-2 border border-[var(--border-primary)]"><FileVideo className="w-8 h-8 text-[var(--text-tertiary)] mb-2"/><p className="text-sm font-semibold truncate w-full">{selectedFileName}</p></div></div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                        <div className="flex flex-col gap-2"><div className="flex justify-between items-center"><label htmlFor="video-title" className="text-sm font-semibold text-[var(--text-secondary)]">Title (Max 100 chars)</label><button onClick={handleGenerateDetails} disabled={isGeneratingText} className="text-xs font-medium flex items-center gap-1.5 text-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/10 px-2 py-1 rounded" title="Generate catchy title and description"><>{isGeneratingText ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}{isGeneratingText ? 'Thinking...' : 'Auto-fill'}</></button></div><input id="video-title" type="text" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a topic or title for AI..." className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" disabled={uploading}/></div>
                        <div className="flex flex-col gap-2"><label htmlFor="video-description" className="text-sm font-semibold text-[var(--text-secondary)]">Description (Max 5000 chars)</label><textarea id="video-description" maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell viewers about your content" rows={4} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] resize-y" disabled={uploading}></textarea></div>
                        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-[var(--text-secondary)]">Content Type</label><div className="flex gap-2 rounded-lg bg-[var(--background-primary)] p-1 border border-[var(--border-primary)]"><button type="button" onClick={() => setVideoType('video')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${videoType === 'video' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>Standard (16:9)</button><button type="button" onClick={() => setVideoType('short')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${videoType === 'short' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>Vertical (9:16)</button></div></div>
                        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2"><Users className="w-4 h-4"/> Community</label><div className="relative" ref={communityDropdownRef}><button type="button" onClick={() => setIsCommunityDropdownOpen(p => !p)} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-left flex justify-between items-center" disabled={uploading}><span className={selectedCommunity ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>{selectedCommunity || 'Select Community'}</span><ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${isCommunityDropdownOpen ? 'rotate-180' : ''}`}/></button>{isCommunityDropdownOpen && (<div className="absolute z-20 top-full mt-1 w-full bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg max-h-60 flex flex-col"><div className="p-2 border-b border-[var(--border-primary)]"><input type="text" value={communitySearch} onChange={(e) => setCommunitySearch(e.target.value)} placeholder="Search..." className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-md outline-none" autoFocus/></div><ul className="overflow-y-auto" role="listbox">{filteredCommunities.length > 0 ? (filteredCommunities.map(c => (<li key={c.id} onClick={() => { setSelectedCommunity(c.name); setIsCommunityDropdownOpen(false); }} className="px-4 py-2 hover:bg-[var(--background-tertiary)] cursor-pointer text-sm" role="option">{c.name}</li>))) : (<li className="px-4 py-2 text-sm text-[var(--text-tertiary)]">No communities found.</li>)}</ul></div>)}</div></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="flex flex-col gap-2"><label className="text-sm font-semibold text-[var(--text-secondary)]">Category</label><select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]" disabled={uploading}><option value="">Select Category</option>{CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div className="flex flex-col gap-2"><label className="text-sm font-semibold text-[var(--text-secondary)]">Sub-Category</label><select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] disabled:opacity-50" disabled={uploading || !selectedCategory || activeSubCategories.length === 0}><option value="">Select Sub-Category</option>{activeSubCategories.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div>
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--background-primary)] border-t border-[var(--border-primary)] flex justify-between items-center sticky bottom-0">
                        <button onClick={() => setDetailsSubStep(1)} className="px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] rounded-lg">Back</button>
                        <button onClick={handleUpload} disabled={uploading || !title.trim() || !description.trim() || !selectedCommunity} className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50">
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin"/> : (videoToEdit ? <Save className="w-4 h-4"/> : <Upload className="w-4 h-4"/>)}
                            {uploading ? 'Processing...' : (videoToEdit ? 'Save Changes' : 'Upload')}
                        </button>
                    </div>
                  </>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
};
