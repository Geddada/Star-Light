
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Video, CATEGORIES, AdCampaign, UnskippableAdCampaign, ShortsAdCampaign, isAd } from '../types';
import { fetchVideos, fetchShorts, getAdForSlot } from '../services/gemini';
import { VideoCard } from '../components/VideoCard';
import { ShortsCard } from '../components/ShortsCard';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';
import { SidebarAd } from '../components/SidebarAd';
import { InFeedAdCard } from '../components/InFeedAdCard';
import { TrendingWidget } from '../components/TrendingWidget';
import { PollWidget } from '../components/PollWidget';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPremium } = useAuth();
  const [aiVideos, setAiVideos] = useState<Video[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortsLoading, setShortsLoading] = useState(true);
  
  // Initialize state based on URL parameters or defaults
  const [selectedCategory, setSelectedCategory] = useState('technology');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [homePageAd, setHomePageAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);
  const [inFeedAd, setInFeedAd] = useState<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollArrows, setShowScrollArrows] = useState(false);
  const [isScrolledLeft, setIsScrolledLeft] = useState(true);
  const [isScrolledRight, setIsScrolledRight] = useState(false);

  const subCategoryScrollContainerRef = useRef<HTMLDivElement>(null);
  const [showSubCategoryScrollArrows, setShowSubCategoryScrollArrows] = useState(false);
  const [isSubCategoryScrolledLeft, setIsSubCategoryScrolledLeft] = useState(true);
  const [isSubCategoryScrolledRight, setIsSubCategoryScrolledRight] = useState(false);

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);

  // Sync state from URL parameters
  useEffect(() => {
    const catParam = searchParams.get('category');
    const subParam = searchParams.get('subcategory');

    let targetCat = catParam || 'technology';
    let targetSub = subParam || null;

    // If subcategory is present, ensure the correct parent category is selected
    if (subParam) {
        const parentCategory = CATEGORIES.find(c => c.subCategories?.some(s => s.id === subParam));
        if (parentCategory) {
            targetCat = parentCategory.id;
        }
    }

    if (targetCat !== selectedCategory) setSelectedCategory(targetCat);
    if (targetSub !== selectedSubCategory) setSelectedSubCategory(targetSub);
  }, [searchParams]);

  const loadUploadedVideos = useCallback(() => {
    const existingUploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
    if (existingUploadedVideosJSON) {
      setUploadedVideos(JSON.parse(existingUploadedVideosJSON));
    } else {
      setUploadedVideos([]);
    }
  }, []);

  useEffect(() => {
    const loadAd = async () => {
      if (isPremium) {
        setHomePageAd(null);
        setInFeedAd(null);
        return;
      }
      try {
        const [sidebarAd, inFeedAdResult] = await Promise.all([
            getAdForSlot('HOME_SIDEBAR'),
            getAdForSlot('HOME_IN_FEED')
        ]);
        setHomePageAd(sidebarAd);
        setInFeedAd(inFeedAdResult);
      } catch (e) {
        console.error("Failed to load homepage ads", e);
      }
    };

    const loadAllContent = async () => {
      setLoading(true);
      setShortsLoading(true);

      let categoryToFetch = 'General';
      if (selectedSubCategory && activeCategory?.subCategories) {
        const subCat = activeCategory.subCategories.find(sc => sc.id === selectedSubCategory);
        if (subCat) categoryToFetch = `${activeCategory.name}: ${subCat.name}`;
      } else if (selectedCategory !== 'all' && activeCategory) {
        categoryToFetch = activeCategory.name;
      } else {
        categoryToFetch = 'All';
      }
      
      // Fetch sequentially to avoid API rate limiting issues.
      const aiData = await fetchVideos(categoryToFetch);
      setAiVideos(aiData);
      setLoading(false);

      const shortsData = await fetchShorts();
      setShorts(shortsData);
      setShortsLoading(false);
      
      loadUploadedVideos();
      loadAd();
    };
    loadAllContent();
  }, [selectedCategory, selectedSubCategory, loadUploadedVideos, activeCategory, isPremium]);

  useEffect(() => {
    window.addEventListener('videosUpdated', loadUploadedVideos);
    return () => {
      window.removeEventListener('videosUpdated', loadUploadedVideos);
    };
  }, [loadUploadedVideos]);

  const allContent = useMemo(() => {
    // We add a 'poll' item type to the array which we'll render differently
    const combined: any[] = [...uploadedVideos, ...aiVideos];
    
    // Inject Ad at index 4
    if (inFeedAd && combined.length > 4) {
        combined.splice(4, 0, inFeedAd);
    }
    
    // Inject Poll Widget at index 2 (high visibility)
    if (combined.length > 2) {
        combined.splice(2, 0, { type: 'poll', id: 'community-poll-1' });
    }
    
    return combined;
  }, [uploadedVideos, aiVideos, inFeedAd]);


  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL
    const newParams = new URLSearchParams();
    if (categoryId !== 'all' && categoryId !== 'technology') {
        newParams.set('category', categoryId);
    } else if (categoryId === 'technology') {
        // Keep URL clean for default category if desired, or set explicit param
        // For now, let's explicit set it if user clicks, or clear if default logic prefers
        newParams.set('category', categoryId);
    }
    setSearchParams(newParams);
  };
  
  const handleSubCategoryClick = (subId: string | null) => {
      setSelectedSubCategory(subId);
      
      const newParams = new URLSearchParams(searchParams);
      // Ensure category is preserved or updated
      if (selectedCategory && selectedCategory !== 'all') {
          newParams.set('category', selectedCategory);
      }
      
      if (subId) {
          newParams.set('subcategory', subId);
      } else {
          newParams.delete('subcategory');
      }
      setSearchParams(newParams);
  };
  
  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
    loadUploadedVideos();
  };
  
  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingVideo(undefined);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleSubCategoryScroll = (direction: 'left' | 'right') => {
    const container = subCategoryScrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const hasOverflow = scrollWidth > clientWidth;
      setShowScrollArrows(hasOverflow);
      setIsScrolledLeft(scrollLeft < 1);
      setIsScrolledRight(scrollLeft + clientWidth >= scrollWidth - 1);
    }
  }, []);

  const checkSubCategoryScrollPosition = useCallback(() => {
    const container = subCategoryScrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const hasOverflow = scrollWidth > clientWidth;
      setShowSubCategoryScrollArrows(hasOverflow);
      setIsSubCategoryScrolledLeft(scrollLeft < 1);
      setIsSubCategoryScrolledRight(scrollLeft + clientWidth >= scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    // A small timeout to ensure layout is complete before checking scroll
    const timeoutId = setTimeout(() => {
        if (!container) return;

        checkScrollPosition(); // Initial check

        container.addEventListener('scroll', checkScrollPosition, { passive: true });
        
        // Also check on window resize
        const resizeObserver = new ResizeObserver(checkScrollPosition);
        resizeObserver.observe(document.body);
        window.addEventListener('resize', checkScrollPosition);

        return () => {
            container.removeEventListener('scroll', checkScrollPosition);
            resizeObserver.disconnect();
            window.removeEventListener('resize', checkScrollPosition);
        };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [checkScrollPosition]);

  useEffect(() => {
    const container = subCategoryScrollContainerRef.current;
    // A small timeout to ensure layout is complete before checking scroll
    const timeoutId = setTimeout(() => {
        if (!container) return;

        checkSubCategoryScrollPosition(); // Initial check

        container.addEventListener('scroll', checkSubCategoryScrollPosition, { passive: true });
        
        const resizeObserver = new ResizeObserver(checkSubCategoryScrollPosition);
        resizeObserver.observe(container);
        window.addEventListener('resize', checkSubCategoryScrollPosition);

        return () => {
            if (container) {
              container.removeEventListener('scroll', checkSubCategoryScrollPosition);
            }
            resizeObserver.disconnect();
            window.removeEventListener('resize', checkSubCategoryScrollPosition);
        };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [checkSubCategoryScrollPosition, selectedCategory]);


  return (
    <div className="w-full h-full flex flex-col relative">
      {showUploadModal && (
        <UploadModal 
          onClose={handleCloseModal} 
          onUploadSuccess={handleUploadSuccess} 
          videoToEdit={editingVideo}
        />
      )}
      
      {/* Categories Header: Sticky at top on all devices */}
      <div className="sticky top-0 z-40 bg-[var(--background-primary)]/95 backdrop-blur-xl border-b border-[var(--border-primary)]/50 flex flex-col shadow-sm transition-all duration-300">
        
        {/* Row 1: Main Categories */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="w-full flex items-center px-4 md:px-6 py-1 md:py-2 gap-2 overflow-x-auto no-scrollbar scroll-smooth"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? `bg-[hsl(var(--accent-color))] text-white shadow-[0_0_15px_hsla(var(--accent-color),0.4)]`
                    : 'bg-[var(--background-secondary)] text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Left Scroll Button & Gradient - Visible on all screens */}
          <div className={`absolute top-0 left-0 h-full flex items-center transition-opacity duration-300 ${showScrollArrows && !isScrolledLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--background-primary)] to-transparent"></div>
            <button
              onClick={() => handleScroll('left')}
              className="relative ml-2 z-10 p-1.5 bg-[var(--background-secondary)] rounded-full shadow-lg border border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Right Scroll Button & Gradient - Visible on all screens */}
          <div className={`absolute top-0 right-0 h-full flex items-center justify-end transition-opacity duration-300 ${showScrollArrows && !isScrolledRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--background-primary)] to-transparent"></div>
             <button
              onClick={() => handleScroll('right')}
              className="relative mr-2 z-10 p-1.5 bg-[var(--background-secondary)] rounded-full shadow-lg border border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Row 2: Subcategories (Conditional) */}
        {activeCategory && activeCategory.id !== 'all' && activeCategory.subCategories && (
          <div className="relative border-t border-[var(--border-primary)]/30 pt-1 md:pt-2 pb-1 md:pb-0">
            <div
              ref={subCategoryScrollContainerRef}
              className="w-full flex items-center px-4 md:px-6 pb-1 md:pb-3 gap-2 overflow-x-auto no-scrollbar scroll-smooth"
            >
              <button
                onClick={() => handleSubCategoryClick(null)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  !selectedSubCategory
                    ? `bg-[var(--text-primary)] text-[var(--background-primary)]`
                    : 'bg-[var(--background-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]/30'
                }`}
              >
                All
              </button>
              {activeCategory.subCategories.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => handleSubCategoryClick(subCat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    selectedSubCategory === subCat.id
                      ? `bg-[var(--text-primary)] text-[var(--background-primary)]`
                      : 'bg-[var(--background-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]/30'
                  }`}
                >
                  {subCat.name}
                </button>
              ))}
            </div>

            {/* Left Scroll Button & Gradient - Visible on all screens */}
            <div className={`absolute top-0 left-0 h-full flex items-center transition-opacity duration-300 ${showSubCategoryScrollArrows && !isSubCategoryScrolledLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--background-primary)] to-transparent"></div>
              <button
                onClick={() => handleSubCategoryScroll('left')}
                className="relative ml-2 z-10 p-1 bg-[var(--background-secondary)] rounded-full shadow-lg border border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Right Scroll Button & Gradient - Visible on all screens */}
            <div className={`absolute top-0 right-0 h-full flex items-center justify-end transition-opacity duration-300 ${showSubCategoryScrollArrows && !isSubCategoryScrolledRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--background-primary)] to-transparent"></div>
              <button
                onClick={() => handleSubCategoryScroll('right')}
                className="relative mr-2 z-10 p-1 bg-[var(--background-secondary)] rounded-full shadow-lg border border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col xl:flex-row pb-4 md:pb-0">
        <div className="flex-1 min-w-0">
          {/* Shorts Shelf Section */}
          <div className="p-4 md:p-6 border-b xl:border-b-0 border-[var(--border-primary)]">
            <div className="flex items-center gap-3 mb-4">
                <Film className="w-6 h-6 text-[hsl(var(--accent-color))]" />
                <h2 className="text-xl font-bold">Shorts</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {shortsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-48 flex-shrink-0 animate-pulse">
                            <div className="aspect-[9/16] bg-[var(--background-secondary)] rounded-xl"></div>
                        </div>
                    ))
                ) : (
                    shorts.map(short => <ShortsCard key={short.id} video={short} />)
                )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="p-4 md:p-6 xl:border-t border-[var(--border-primary)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 gap-x-4 gap-y-8">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <VideoCard key={i} isLoading={true} />
                  ))
                : allContent.map((item) => {
                    if (item.type === 'poll') {
                        return <PollWidget key={item.id} />;
                    }
                    if (isAd(item)) {
                      return <InFeedAdCard key={item.id} campaign={item} />;
                    } 
                    return <VideoCard key={(item as Video).id} video={item as Video} onEdit={handleEdit} />;
                  })}
            </div>
          </div>
        </div>

        <aside className="w-full xl:w-[400px] xl:flex-shrink-0 p-6 border-t xl:border-t-0 xl:border-l border-[var(--border-primary)] space-y-6">
            <div className="xl:sticky top-20 space-y-6">
                <div>
                    <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Sponsored</h2>
                    <SidebarAd ad={homePageAd} />
                </div>
                <div>
                    <TrendingWidget />
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};
