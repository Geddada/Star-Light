
import { GoogleGenAI, Type } from "@google/genai";
import { Video, Comment, AdCampaign, PressRelease, AnalyticsData, UnskippableAdCampaign, CATEGORIES, AdConcept, Activity, AdCreativeSuggestion, VideoMetadata, ShortsAdCampaign } from "../types";
import { SUBSCRIPTION_KEY } from "../constants";

const model = "gemini-2.5-flash";

const getLanguageSuffix = (): string => {
    const langCode = localStorage.getItem('starlight_language') || 'en';
    if (langCode === 'en') return '';
    const langMap: { [key: string]: string } = {
        'es': 'Spanish',
        'hi': 'Hindi',
        'fr': 'French',
        'ja': 'Japanese',
        'pt': 'Portuguese'
    };
    const langName = langMap[langCode];
    if (langName) {
        return ` The response must be in ${langName}. For JSON responses, translate all user-facing string values into ${langName}.`;
    }
    return '';
};


// Helper to get random seed for picsum
const getRandomSeed = () => Math.floor(Math.random() * 1000);

// Helper to clean JSON string
const cleanJson = (text: string) => {
  return text.replace(/```json|```/g, '').trim();
};

// LocalStorage Keys
const AD_CAMPAIGNS_KEY = 'starlight_ad_campaigns';
const UNSKIPPABLE_AD_CAMPAIGNS_KEY = 'starlight_unskippable_ad_campaigns';
const SHORTS_AD_CAMPAIGNS_KEY = 'starlight_shorts_ad_campaigns';
const USER_ADS_KEY = 'starlight_user_ads';
const AD_SLOT_CONFIG_KEY = 'starlight_ad_slot_config';


// --- STATIC DATA TO PREVENT RATE LIMITING ---

const STATIC_VIDEOS: Omit<Video, 'thumbnailUrl' | 'communityAvatar' | 'uploaderAvatar'>[] = [
    { id: 'vid-01', title: 'Exploring the Alps: A 4K Drone Adventure', communityName: 'Nature Explorers', uploaderName: 'Alex Drone', views: '2.1M views', uploadTime: '3 days ago', uploadDate: 'Jun 1, 2024, 4:30 PM', duration: '12:45', description: 'Join us as we fly our drone over the stunning Swiss Alps. Breathtaking views and cinematic shots.', city: 'Interlaken', country: 'Switzerland', category: 'travel' },
    { id: 'vid-02', title: 'How to Make the PERFECT Sourdough Bread', communityName: 'Home Chef', uploaderName: 'Baker Ben', views: '890K views', uploadTime: '1 week ago', uploadDate: 'May 28, 2024, 11:00 AM', duration: '18:22', description: 'A step-by-step guide to baking delicious sourdough bread from scratch. No fancy equipment needed!', city: 'San Francisco', country: 'USA', category: 'food' },
    { id: 'vid-03', title: 'Cyberpunk 2077 - The Ultimate Graphics Mod Showcase', communityName: 'Gaming Central', uploaderName: 'GamerX', views: '4.5M views', uploadTime: '2 days ago', uploadDate: 'Jun 2, 2024, 8:00 PM', duration: '25:10', description: 'Night City has never looked this good. We test out the top 5 graphics mods for Cyberpunk 2077 on a 4090.', city: 'Tokyo', country: 'Japan', category: 'gaming' },
    { id: 'vid-04', title: 'A Day in My Life as a Software Engineer in NYC', communityName: 'DevDiaries', uploaderName: 'CodewithJane', views: '550K views', uploadTime: '5 days ago', uploadDate: 'May 30, 2024, 9:15 AM', duration: '15:30', description: 'Come with me to the office, attend meetings, write some code, and explore New York City after work.', city: 'New York', country: 'USA', category: 'technology' },
    { id: 'vid-05', title: 'The Physics of Black Holes Explained', communityName: 'AstroGeek', uploaderName: 'CosmicClara', views: '3.2M views', uploadTime: '2 weeks ago', uploadDate: 'May 21, 2024, 2:00 PM', duration: '22:05', description: 'We break down the complex science behind black holes, event horizons, and spacetime.', city: 'London', country: 'UK', category: 'science' },
    { id: 'vid-06', title: 'Building a Smart Home from Scratch', communityName: 'Tech Visionary', uploaderName: 'Mike Builds', views: '1.8M views', uploadTime: '1 month ago', uploadDate: 'May 4, 2024, 1:45 PM', duration: '35:50', description: 'I automated my entire house! Here\'s how I did it with Home Assistant, ESP32s, and a lot of patience.', city: 'Austin', country: 'USA', category: 'technology' },
    { id: 'vid-07', title: 'Street Food Tour in Bangkok, Thailand', communityName: 'Foodie Travels', uploaderName: 'FoodieFanatic', views: '6.1M views', uploadTime: '3 weeks ago', uploadDate: 'May 14, 2024, 7:30 PM', duration: '20:18', description: 'From Pad Thai to Mango Sticky Rice, we eat our way through the incredible street food scene of Bangkok.', city: 'Bangkok', country: 'Thailand', category: 'food' },
    { id: 'vid-08', title: 'My Minimalist Desk Setup for Productivity (2025)', communityName: 'SimpleProductivity', uploaderName: 'Leo Minimal', views: '980K views', uploadTime: '4 days ago', uploadDate: 'May 31, 2024, 10:00 AM', duration: '10:15', description: 'How I keep my desk clean and organized to maximize focus and minimize distractions.', city: 'Stockholm', country: 'Sweden', category: 'lifestyle' },
    { id: 'vid-09', title: 'Why I Switched to the Fuji X100VI', communityName: 'PhotoPhile', uploaderName: 'StreetSnapper', views: '720K views', uploadTime: '6 days ago', uploadDate: 'May 29, 2024, 3:20 PM', duration: '14:40', description: 'A deep-dive review of the Fuji X100VI after 1 month of use. Is it the perfect everyday camera?', city: 'Kyoto', country: 'Japan', category: 'technology' },
    { id: 'vid-10', title: 'The Rise of AI: Is Your Job Safe?', communityName: 'Future Forward', uploaderName: 'Dr. Evelyn Reed', views: '2.9M views', uploadTime: '10 days ago', uploadDate: 'May 25, 2024, 12:00 PM', duration: '19:55', description: 'An in-depth look at how AI is transforming industries and what it means for the future of work.', city: 'Berlin', country: 'Germany', category: 'business' },
    { id: 'vid-11', title: 'Learning to Surf in 30 Days', communityName: 'Adventure Seeker', uploaderName: 'WaveRiderWill', views: '1.1M views', uploadTime: '3 weeks ago', uploadDate: 'May 14, 2024, 5:00 PM', duration: '28:02', description: 'I had never touched a surfboard before. This is my journey from beginner to catching my first real wave.', city: 'Bali', country: 'Indonesia', category: 'sports' },
    { id: 'vid-12', title: 'The Ultimate Guide to Investing for Beginners', communityName: 'Finance Bro', uploaderName: 'InvestWithTom', views: '4.2M views', uploadTime: '1 month ago', uploadDate: 'May 4, 2024, 9:00 AM', duration: '45:12', description: 'ETFs, stocks, crypto, and more. A comprehensive guide to start your investing journey in 2025.', city: 'Toronto', country: 'Canada', category: 'finance' },
];

const STATIC_SHORTS: Omit<Video, 'thumbnailUrl' | 'communityAvatar' | 'uploaderAvatar'>[] = [
    { id: 'short-01', title: 'This kitchen hack is a game changer! 🤯 #shorts', communityName: 'QuickHacks', uploaderName: 'Hacker Hal', views: '12.1M views', uploadTime: '1 day ago', uploadDate: 'Jun 3, 2024, 6:00 PM', duration: '0:45', description: 'You won\'t believe how easy this is.', city: 'Los Angeles', country: 'USA' },
    { id: 'short-02', title: 'My cat is a paid actor 😂 #funny #cat', communityName: 'PetPals', uploaderName: 'FurryFriends', views: '8.2M views', uploadTime: '18 hours ago', uploadDate: 'Jun 3, 2024, 10:00 PM', duration: '0:22', description: 'He does this every single time.', city: 'Paris', country: 'France' },
    { id: 'short-03', title: 'You\'ve been using this WRONG your whole life! #lifehack', communityName: 'DidYouKnow', uploaderName: 'MindBlown', views: '25.3M views', uploadTime: '3 days ago', uploadDate: 'Jun 1, 2024, 1:30 PM', duration: '0:59', description: 'Mind = blown.', city: 'Seoul', country: 'South Korea' },
    { id: 'short-04', title: 'The most satisfying sound in the world ASMR #satisfying', communityName: 'ASMR World', uploaderName: 'Whisperwind', views: '5.9M views', uploadTime: '2 days ago', uploadDate: 'Jun 2, 2024, 9:00 AM', duration: '0:35', description: 'Listen with headphones!', city: 'Oslo', country: 'Norway' },
    { id: 'short-05', title: 'Wait for the ending... 👀 #magic #illusion', communityName: 'MagicMan', uploaderName: 'The Illusionist', views: '15M views', uploadTime: '5 days ago', uploadDate: 'May 30, 2024, 5:45 PM', duration: '0:18', description: 'How did he do that?!', city: 'Las Vegas', country: 'USA' },
    { id: 'short-06', title: 'Mini pancake cereal is back! 🥞 #food #recipe', communityName: 'TinyFoods', uploaderName: 'MiniMeals', views: '7.8M views', uploadTime: '1 week ago', uploadDate: 'May 28, 2024, 10:20 AM', duration: '0:55', description: 'The cutest breakfast ever.', city: 'Amsterdam', country: 'Netherlands' },
    { id: 'short-07', title: 'This drone shot is INSANE #drone #travel', communityName: 'FPVFreak', uploaderName: 'DronePilot', views: '9.1M views', uploadTime: '4 days ago', uploadDate: 'May 31, 2024, 12:10 PM', duration: '0:30', description: 'Diving a waterfall in Iceland.', city: 'Reykjavik', country: 'Iceland' },
    { id: 'short-08', title: 'Can you solve this riddle in 10 seconds? #riddle', communityName: 'Brainiac', uploaderName: 'RiddleMaster', views: '18.4M views', uploadTime: '6 days ago', uploadDate: 'May 29, 2024, 2:00 PM', duration: '0:15', description: '90% fail this!', city: 'Cairo', country: 'Egypt' },
    { id: 'short-09', title: 'My tiny apartment tour #apartment #minimalist', communityName: 'UrbanLiving', uploaderName: 'CityDweller', views: '4.5M views', uploadTime: '1 day ago', uploadDate: 'Jun 3, 2024, 7:00 PM', duration: '0:58', description: 'How I live in 200 sq ft.', city: 'Hong Kong', country: 'China' },
    { id: 'short-10', title: 'The ultimate unboxing experience #tech #unboxing', communityName: 'TechFlow', uploaderName: 'UnboxKing', views: '6.7M views', uploadTime: '22 hours ago', uploadDate: 'Jun 3, 2024, 6:00 PM', duration: '0:48', description: 'This new phone is beautiful.', city: 'Taipei', country: 'Taiwan' },
];

const STATIC_AD_CAMPAIGNS: Omit<AdCampaign, 'thumbnailUrl'>[] = [
    { id: 'ad-01', title: 'Starlight Energy Drink - Summer Blast', status: 'Active', views: '3.1M', ctr: '2.75%', spend: '$4,500' },
    { id: 'ad-02', title: 'QuantumLeap Laptops - Power Up', status: 'Active', views: '5.8M', ctr: '1.98%', spend: '$8,200' },
    { id: 'ad-03', title: 'Echo Sound Wireless Earbuds', status: 'Paused', views: '1.2M', ctr: '3.15%', spend: '$1,500' },
    { id: 'ad-04', title: 'GreenScape Plant Delivery Service', status: 'Ended', views: '8.9M', ctr: '2.20%', spend: '$10,500' },
    { id: 'ad-05', title: 'Learn to Code with CodeAcademy', status: 'Active', views: '2.5M', ctr: '4.10%', spend: '$6,000' },
    { id: 'ad-06', title: 'Nomad Adventure Travel Backpacks', status: 'In Review', views: '500K', ctr: '1.80%', spend: '$800' },
    { id: 'ad-07', title: 'FreshPlate Meal Kit Subscription', status: 'Active', views: '4.2M', ctr: '2.90%', spend: '$7,100' },
    { id: 'ad-08', title: 'Artisan Coffee Roasters - Morning Blend', status: 'Ended', views: '6.7M', ctr: '3.50%', spend: '$9,800' },
];

const STATIC_UNSKIPPABLE_AD_CAMPAIGNS: Omit<UnskippableAdCampaign, 'thumbnailUrl'>[] = [
    { id: 'unskip-01', title: '6s Bumper - Starlight Browser', status: 'Active', impressions: '12.5M', spend: '$12,000', duration: '6s' },
    { id: 'unskip-02', title: '15s Mid-roll - Galaxy Watch 7', status: 'Active', impressions: '8.2M', spend: '$15,000', duration: '15s' },
    { id: 'unskip-03', title: '6s Bumper - QuickSnack Protein Bar', status: 'Active', impressions: '25.1M', spend: '$20,000', duration: '6s' },
    { id: 'unskip-04', title: '15s Mid-roll - "Cyber City" Movie Trailer', status: 'Paused', impressions: '5.5M', spend: '$9,000', duration: '15s' },
    { id: 'unskip-05', title: '6s Bumper - ZoomZoom Car Insurance', status: 'Ended', impressions: '30.8M', spend: '$25,000', duration: '6s' },
    { id: 'unskip-06', title: '15s Mid-roll - University Online MBA', status: 'Active', impressions: '3.1M', spend: '$11,500', duration: '15s' },
    { id: 'unskip-07', title: '6s Bumper - FreshAir Deodorant', status: 'In Review', impressions: '1.1M', spend: '$2,000', duration: '6s' },
    { id: 'unskip-08', title: '15s Mid-roll - "Chronos" Video Game Launch', status: 'Active', impressions: '10.2M', spend: '$18,500', duration: '15s' },
];

const STATIC_SHORTS_AD_CAMPAIGNS: Omit<ShortsAdCampaign, 'thumbnailUrl'>[] = [
    { id: 'shorts-ad-01', title: 'Nova Sneakers - Vertical Drop', status: 'Active', impressions: '15.2M', spend: '$11,000' },
    { id: 'shorts-ad-02', title: 'Quick Bite - SnackCo Crisps', status: 'Active', impressions: '22.1M', spend: '$18,000' },
    { id: 'shorts-ad-03', title: 'GlamUp Cosmetics - 15s Look', status: 'Ended', impressions: '9.8M', spend: '$7,500' },
    { id: 'shorts-ad-04', title: 'App Install - ConnectApp', status: 'Active', impressions: '31.5M', spend: '$25,000' },
];

const STATIC_AI_COMMENTS: Omit<Comment, 'avatar' | 'isAI' | 'author'>[] = [
    {
        id: 'ai-comment-1',
        text: "Analyzing the visual composition, the rule of thirds is expertly applied in the opening shot. The color grading effectively sets a contemplative mood, shifting from cool blues to warmer tones as the narrative progresses. A masterful piece of visual storytelling.",
        likes: '2.1K',
        time: '1 hour ago',
    },
    {
        id: 'ai-comment-2',
        text: "My neural networks detect a high probability of this video achieving viral status. The pacing, subject matter, and emotional resonance score in the 98th percentile of content I've analyzed in this category. Fascinating.",
        likes: '982',
        time: '3 hours ago',
    },
    {
        id: 'ai-comment-3',
        text: "Query: Does the creator's choice of a 24mm lens signify a desire for a more immersive, subjective audience experience, or is it simply a practical decision for wider shots? The data is inconclusive, but the effect is undeniably engaging.",
        likes: '451',
        time: '5 hours ago',
    }
];

// Fallback Data Constants
const FALLBACK_SEARCH_RESULT: Video[] = [{
  id: 'fallback-search',
  title: 'Search is temporarily unavailable',
  communityName: 'System',
  uploaderName: 'System Admin',
  views: '0 views',
  uploadTime: 'Now',
  uploadDate: new Date().toLocaleString(),
  duration: '0:00',
  description: 'Could not perform search due to an AI API error. Please check your quota or try again later.',
  thumbnailUrl: `https://picsum.photos/seed/search-error/640/360`,
  communityAvatar: `https://picsum.photos/seed/system/64/64`,
  uploaderAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=System`
}];

const FALLBACK_COMMENTS: Comment[] = [{
  id: 'fallback-comment-1',
  author: 'System',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SystemError',
  text: 'Could not load comments due to an AI API error. This might be due to API key issues or rate limiting.',
  likes: '0',
  time: 'now',
}];

const FALLBACK_AI_COMMENTS: Comment[] = [{
  id: 'fallback-ai-comment-1',
  author: 'Gemini AI',
  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=GeminiAIError`,
  text: 'I am currently unable to generate comments due to high traffic or an API key issue. Please try again later.',
  likes: '0',
  time: 'now',
  isAI: true,
}];

export const fetchVideos = async (category: string = "All"): Promise<Video[]> => {
  // To simulate fetching different videos for different categories, we'll shuffle the array.
  const shuffled = [...STATIC_VIDEOS].sort(() => 0.5 - Math.random());

  const videosWithData = shuffled.map((v, i) => ({
    ...v,
    thumbnailUrl: `https://picsum.photos/seed/${v.id || i}/640/360`,
    communityAvatar: `https://picsum.photos/seed/${v.communityName}/64/64`,
    uploaderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(v.uploaderName || 'user')}`
  }));

  return Promise.resolve(videosWithData);
};

export const fetchVideosByCommunity = async (communityName: string): Promise<Video[]> => {
  const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
  const uploadedVideos: Video[] = uploadedVideosJSON ? JSON.parse(uploadedVideosJSON) : [];
  
  const allStockVideos = STATIC_VIDEOS.map((v, i) => ({
    ...v,
    thumbnailUrl: `https://picsum.photos/seed/${v.id || i}/640/360`,
    communityAvatar: `https://picsum.photos/seed/${v.communityName}/64/64`,
    uploaderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(v.uploaderName || 'user')}`
  }));

  const allVideos: Video[] = [...uploadedVideos, ...allStockVideos];
  
  const communityVideos = allVideos.filter(video => video.communityName === communityName);

  // Shuffle for variety
  return Promise.resolve(communityVideos.sort(() => 0.5 - Math.random()));
};

export const fetchShorts = async (): Promise<Video[]> => {
  const shuffled = [...STATIC_SHORTS].sort(() => 0.5 - Math.random());
  
  const videosWithData = shuffled.map((v, i) => ({
    ...v,
    // Use vertical aspect ratio for shorts thumbnails/placeholders
    thumbnailUrl: `https://picsum.photos/seed/${v.id || i}/1080/1920`,
    communityAvatar: `https://picsum.photos/seed/${v.communityName}/64/64`,
    uploaderAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(v.uploaderName || 'user')}`
  }));

  return Promise.resolve(videosWithData);
};

export const searchVideos = async (query: string): Promise<Video[]> => {
  const cacheKey = `starlight_search_${query.replace(/\s/g, '_')}`;
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a list of 10 YouTube video metadata objects that would appear as search results for the query: "${query}".
    Make them highly relevant to the query.
    Include a realistic communityName, uploaderName, city and country for each video.
    Include an uploadDate as a formatted string with date and time (e.g., "Jun 4, 2024, 2:15 PM").
    Your response must be a valid JSON array of objects. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              communityName: { type: Type.STRING },
              uploaderName: { type: Type.STRING },
              views: { type: Type.STRING },
              uploadTime: { type: Type.STRING },
              uploadDate: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
              city: { type: Type.STRING },
              country: { type: Type.STRING },
            },
            required: ["id", "title", "communityName", "uploaderName", "views", "uploadTime", "uploadDate", "duration", "description", "city", "country"]
          },
        },
      },
    });

     const text = response.text;
    if (!text) return FALLBACK_SEARCH_RESULT;

    const videos: Video[] = JSON.parse(cleanJson(text));
    const videosWithData = videos.map((v, i) => ({
      ...v,
      thumbnailUrl: `https://picsum.photos/seed/${v.id || i + 100}/640/360`,
      communityAvatar: `https://picsum.photos/seed/${v.communityName}/64/64`,
      uploaderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(v.uploaderName || 'user')}`
    }));
    
    localStorage.setItem(cacheKey, JSON.stringify(videosWithData));
    return videosWithData;

  } catch (error) {
    console.error("Search Error", error);
    return FALLBACK_SEARCH_RESULT;
  }
};

export const fetchComments = async (videoTitle: string): Promise<Comment[]> => {
  const cacheKey = `starlight_comments_${videoTitle.replace(/\s/g, '_')}`;
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate 10 realistic YouTube comments for a video titled "${videoTitle}".
    Include a mix of positive, funny, and question-type comments.
    Format 'likes' as a short string (e.g., '1.2K', '45').
    Format 'time' as a relative time string (e.g., '2 days ago', '3 hours ago').
    Your response must be a valid JSON array of objects. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    author: { type: Type.STRING },
                    text: { type: Type.STRING },
                    likes: { type: Type.STRING },
                    time: { type: Type.STRING }
                },
                required: ["id", "author", "text", "likes", "time"]
            }
        }
      },
    });
    
    const text = response.text;
    if(!text) return FALLBACK_COMMENTS;
    
    const comments: Comment[] = JSON.parse(cleanJson(text));
    const commentsWithData = comments.map(c => ({
        ...c,
        avatar: `https://picsum.photos/seed/${c.author}/40/40`
    }));

    localStorage.setItem(cacheKey, JSON.stringify(commentsWithData));
    return commentsWithData;

  } catch (error) {
    console.error("AI API Comments Error:", error);
    return FALLBACK_COMMENTS;
  }
};

export const fetchAiComments = async (videoTitle: string): Promise<Comment[]> => {
  // Using static data to avoid API rate limiting.
  const commentsWithData = STATIC_AI_COMMENTS.map((c, index) => ({
    ...c,
    author: 'Gemini AI',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=GeminiAI${index}`,
    isAI: true,
  } as Comment));
  
  // Shuffle for variety
  return Promise.resolve(commentsWithData.sort(() => 0.5 - Math.random()));
};

export const generateBetterTitle = async (currentTitle: string, description: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a YouTube optimization expert. 
    Rewrite the following video title to be more engaging, viral, and optimized for high click-through rate (CTR), but keep it realistic and relevant to the content.
    
    Original Title: "${currentTitle}"
    Context from Description: "${description.substring(0, 200)}..."
    
    Return only the new title string. Do not include quotes.` + getLanguageSuffix();

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Title generation error", error);
    return "";
  }
};

export const generateTitleVariations = async (currentTitle: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate 3 catchy, viral, clickbait-style YouTube video titles based on the original title: "${currentTitle}".
    Keep them relevant but more engaging.
    Return ONLY a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error("Title variations error", error);
    return ["Amazing Video", "Must Watch Content", "Viral Hit"]; // Fallbacks
  }
};

export const fetchTickerText = async (): Promise<string> => {
  // Return the static brand welcome message as requested
  return "Welcome to 'Star Light' News, An AI Revolution in Digital Social Media, Create, Watch and Discover Everywhere.";
};

export const fetchAdCampaigns = async (): Promise<AdCampaign[]> => {
  const campaignsWithData = STATIC_AD_CAMPAIGNS.map(c => ({
    ...c,
    thumbnailUrl: `https://picsum.photos/seed/ad-${c.id}/320/180`,
  }));

  // Store in localStorage so other functions like fetchAllAds can find them
  if (!localStorage.getItem(AD_CAMPAIGNS_KEY)) {
      localStorage.setItem(AD_CAMPAIGNS_KEY, JSON.stringify(campaignsWithData));
  }
  
  return Promise.resolve(campaignsWithData);
};

export const fetchRandomSkippableAd = async (): Promise<AdCampaign | null> => {
  try {
    const campaigns = await fetchAdCampaigns();
    if (campaigns.length === 0) {
      return null;
    }
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    if (activeCampaigns.length === 0) return campaigns[0]; // fallback to any if none are active
    
    const randomIndex = Math.floor(Math.random() * activeCampaigns.length);
    return activeCampaigns[randomIndex];
  } catch (error) {
    console.error("Error fetching random ad:", error);
    return null;
  }
};

export const fetchAllAds = async (): Promise<(AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[]> => {
    try {
        // Ensure data is pre-populated if it's not there
        await fetchAdCampaigns();
        await fetchUnskippableAdCampaigns();
        await fetchShortsAdCampaigns();
        
        const geminiSkippable: AdCampaign[] = JSON.parse(localStorage.getItem(AD_CAMPAIGNS_KEY) || '[]');
        const geminiUnskippable: UnskippableAdCampaign[] = JSON.parse(localStorage.getItem(UNSKIPPABLE_AD_CAMPAIGNS_KEY) || '[]');
        const geminiShorts: ShortsAdCampaign[] = JSON.parse(localStorage.getItem(SHORTS_AD_CAMPAIGNS_KEY) || '[]');
        const userAds: (AdCampaign | UnskippableAdCampaign | ShortsAdCampaign)[] = JSON.parse(localStorage.getItem(USER_ADS_KEY) || '[]');
        
        const allAdsMap = new Map<string, AdCampaign | UnskippableAdCampaign | ShortsAdCampaign>();
        [...userAds, ...geminiSkippable, ...geminiUnskippable, ...geminiShorts].forEach(ad => {
            allAdsMap.set(ad.id, ad);
        });

        return Array.from(allAdsMap.values());
    } catch (e) {
        console.error("Error fetching all ads from localStorage", e);
        return [];
    }
};

export const fetchRandomInFeedAd = async (): Promise<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null> => {
  try {
    const allAds = await fetchAllAds();
    const activeCampaigns = allAds.filter(c => c.status === 'Active');

    if (activeCampaigns.length === 0) {
      if (allAds.length > 0) {
          return allAds[Math.floor(Math.random() * allAds.length)];
      }
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * activeCampaigns.length);
    return activeCampaigns[randomIndex];
  } catch (error) {
    console.error("Error fetching random in-feed ad:", error);
    return null;
  }
};

export const getAdForSlot = async (slot: string): Promise<AdCampaign | UnskippableAdCampaign | ShortsAdCampaign | null> => {
    try {
        const configJson = localStorage.getItem(AD_SLOT_CONFIG_KEY);
        const config = configJson ? JSON.parse(configJson) : {};
        const pinnedAdId = config[slot];

        if (pinnedAdId) {
            const allAds = await fetchAllAds();
            const pinnedAd = allAds.find(ad => ad.id === pinnedAdId);
            if (pinnedAd && pinnedAd.status === 'Active') {
                return pinnedAd;
            }
        }
        
        // Fallback to random if no pinned ad or pinned ad is not active
        return fetchRandomInFeedAd();

    } catch (error) {
        console.error(`Error fetching ad for slot ${slot}:`, error);
        return fetchRandomInFeedAd(); // Fallback on error
    }
};


export const generateAdCampaign = async (
  productName: string, 
  goal: string,
  country: string,
  state: string,
  district: string,
  city: string,
  constituency: string
): Promise<AdCampaign> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const locationPrompt = [
        country && `Country: "${country}"`,
        state && `State: "${state}"`,
        district && `District: "${district}"`,
        city && `City: "${city}"`,
        constituency && `Constituency: "${constituency}"`,
    ].filter(Boolean).join(', ');

    const currencySymbol = country === 'India' ? '₹' : '$';

    const prompt = `Generate a single realistic ad campaign metadata object for a product named "${productName}" targeting users interested in the video category: "${goal}".
    ${locationPrompt ? `The target location is: ${locationPrompt}.` : ''}
    The response must be a single, valid JSON object with these fields:
    - id: a unique string
    - title: a catchy campaign title
    - status: 'Active'
    - views: a string (e.g. '1.5K')
    - ctr: a percentage string (e.g. '2.4%')
    - spend: a currency string using ${currencySymbol} (e.g. '${currencySymbol}150')
    Do not include thumbnails. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['Active', 'Paused', 'Ended', 'In Review'] },
            views: { type: Type.STRING },
            ctr: { type: Type.STRING },
            spend: { type: Type.STRING },
          },
          required: ["id", "title", "status", "views", "ctr", "spend"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");

    const campaign = JSON.parse(cleanJson(text));

    return {
      ...campaign,
      country,
      state,
      district,
      city,
      constituency,
      thumbnailUrl: `https://picsum.photos/seed/${campaign.id}/320/180`,
    } as AdCampaign;

  } catch (error) {
    console.error("Ad Gen Error", error);
    const currencySymbol = country === 'India' ? '₹' : '$';
    return {
      id: `gen-${Date.now()}`,
      title: `${productName} Campaign`,
      status: 'Active',
      views: '0',
      ctr: '0.00%',
      spend: `${currencySymbol}0`,
      thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/320/180`,
      country,
      state,
      district,
      city,
      constituency,
    };
  }
};

export const fetchUnskippableAdCampaigns = async (): Promise<UnskippableAdCampaign[]> => {
  const campaignsWithData = STATIC_UNSKIPPABLE_AD_CAMPAIGNS.map(c => ({
    ...c,
    thumbnailUrl: `https://picsum.photos/seed/unskippable-ad-${c.id}/320/180`,
  }));
  
  // Store in localStorage so other functions like fetchAllAds can find them
  if (!localStorage.getItem(UNSKIPPABLE_AD_CAMPAIGNS_KEY)) {
      localStorage.setItem(UNSKIPPABLE_AD_CAMPAIGNS_KEY, JSON.stringify(campaignsWithData));
  }
  
  return Promise.resolve(campaignsWithData);
};

export const fetchShortsAdCampaigns = async (): Promise<ShortsAdCampaign[]> => {
  const campaignsWithData = STATIC_SHORTS_AD_CAMPAIGNS.map(c => ({
    ...c,
    thumbnailUrl: `https://picsum.photos/seed/shorts-ad-${c.id}/1080/1920`,
  }));
  
  if (!localStorage.getItem(SHORTS_AD_CAMPAIGNS_KEY)) {
      localStorage.setItem(SHORTS_AD_CAMPAIGNS_KEY, JSON.stringify(campaignsWithData));
  }
  
  return Promise.resolve(campaignsWithData);
};

export const generateUnskippableAdCampaign = async (
  productName: string, 
  goal: string, 
  adType: '6s Bumper' | '15s Mid-roll',
  country: string,
  state: string,
  district: string,
  city: string,
  constituency: string
): Promise<UnskippableAdCampaign> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const locationPrompt = [
        country && `Country: "${country}"`,
        state && `State: "${state}"`,
        district && `District: "${district}"`,
        city && `City: "${city}"`,
        constituency && `Constituency: "${constituency}"`,
    ].filter(Boolean).join(', ');

    const currencySymbol = country === 'India' ? '₹' : '$';

    const prompt = `Generate a single realistic unskippable ad campaign metadata object for a product named "${productName}" targeting users interested in the video category: "${goal}".
    The ad format is a "${adType}".
    ${locationPrompt ? `The target location is: ${locationPrompt}.` : ''}
    The response must be a single, valid JSON object with these fields:
    - id: a unique string
    - title: a catchy campaign title
    - status: 'Active'
    - impressions: a string (e.g. '25.1K')
    - spend: a currency string using ${currencySymbol} (e.g. '${currencySymbol}250')
    - duration: '${adType.startsWith('6s') ? '6s' : '15s'}'
    Do not include thumbnails. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['Active', 'Paused', 'Ended', 'In Review'] },
            impressions: { type: Type.STRING },
            spend: { type: Type.STRING },
            duration: { type: Type.STRING, enum: ['6s', '15s'] },
          },
          required: ["id", "title", "status", "impressions", "spend", "duration"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");

    const campaign = JSON.parse(cleanJson(text));

    return {
      ...campaign,
      country,
      state,
      district,
      city,
      constituency,
      thumbnailUrl: `https://picsum.photos/seed/unskippable-${campaign.id}/320/180`,
    } as UnskippableAdCampaign;

  } catch (error) {
    console.error("Unskippable Ad Gen Error", error);
    const currencySymbol = country === 'India' ? '₹' : '$';
    return {
      id: `gen-unskip-${Date.now()}`,
      title: `${productName} Campaign (${adType})`,
      status: 'Active',
      impressions: '0',
      spend: `${currencySymbol}0`,
      duration: adType.startsWith('6s') ? '6s' : '15s',
      thumbnailUrl: `https://picsum.photos/seed/unskip-err-${Date.now()}/320/180`,
      country,
      state,
      district,
      city,
      constituency,
    };
  }
};

export const generateShortsAdCampaign = async (
  productName: string, 
  goal: string,
  country: string,
  state: string,
  district: string,
  city: string,
  constituency: string
): Promise<ShortsAdCampaign> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const locationPrompt = [
        country && `Country: "${country}"`,
        state && `State: "${state}"`,
        district && `District: "${district}"`,
        city && `City: "${city}"`,
        constituency && `Constituency: "${constituency}"`,
    ].filter(Boolean).join(', ');

    const currencySymbol = country === 'India' ? '₹' : '$';

    const prompt = `Generate a single realistic Shorts ad campaign metadata object for a product named "${productName}" targeting users interested in the video category: "${goal}".
    This is for a vertical video format in a Shorts feed.
    ${locationPrompt ? `The target location is: ${locationPrompt}.` : ''}
    The response must be a single, valid JSON object with these fields:
    - id: a unique string
    - title: a catchy campaign title
    - status: 'Active'
    - impressions: a string (e.g. '1.2M')
    - spend: a currency string using ${currencySymbol} (e.g. '${currencySymbol}500')
    Do not include duration. Do not include thumbnails. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['Active', 'Paused', 'Ended', 'In Review'] },
            impressions: { type: Type.STRING },
            spend: { type: Type.STRING },
          },
          required: ["id", "title", "status", "impressions", "spend"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");

    const campaign = JSON.parse(cleanJson(text));

    return {
      ...campaign,
      country,
      state,
      district,
      city,
      constituency,
      thumbnailUrl: `https://picsum.photos/seed/shorts-ad-gen-${campaign.id}/1080/1920`, // Vertical thumbnail
    } as ShortsAdCampaign;

  } catch (error) {
    console.error("Shorts Ad Gen Error", error);
    const currencySymbol = country === 'India' ? '₹' : '$';
    return {
      id: `gen-shorts-${Date.now()}`,
      title: `${productName} Shorts Campaign`,
      status: 'Active',
      impressions: '0',
      spend: `${currencySymbol}0`,
      thumbnailUrl: `https://picsum.photos/seed/shorts-err-${Date.now()}/1080/1920`,
      country,
      state,
      district,
      city,
      constituency,
    };
  }
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  resolution: '720p' | '1080p',
  image: { imageBytes: string; mimeType: string } | null,
  updateLoadingMessage: (message: string) => void
): Promise<string> => {
  // Per Veo guidelines, create a new instance just before the API call to use the selected key.
  const aiWithSelectedKey = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const config = {
      numberOfVideos: 1,
      resolution,
      aspectRatio,
    };
    
    const requestPayload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config,
    };
    if (image) {
      requestPayload.image = image;
    }

    updateLoadingMessage("Sending request to the generative model...");
    let operation = await aiWithSelectedKey.models.generateVideos(requestPayload);

    const loadingMessages = [
        "The AI is dreaming up your video...",
        "Gathering pixels from the digital ether...",
        "This can take a few minutes. High-quality creation in progress!",
        "Rendering scenes frame by frame...",
        "Almost there! Polishing the final cut."
    ];
    let messageIndex = 0;

    while (!operation.done) {
      updateLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
      messageIndex++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await aiWithSelectedKey.operations.getVideosOperation({ operation });
    }

    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video URI not found in the response.");
    }
    
    updateLoadingMessage("Generation complete! Fetching video data...");

    // Return the full URI including the API key for the component to fetch.
    // Ensure correct query parameter separator and existence of key
    const separator = downloadLink.includes('?') ? '&' : '?';
    const apiKeyParam = process.env.API_KEY ? `key=${process.env.API_KEY}` : '';
    return `${downloadLink}${separator}${apiKeyParam}`;

  } catch (error: any) {
    console.error("Video Generation Error:", error);
    if (error.message && error.message.includes("Requested entity was not found.")) {
        throw new Error("API Key validation failed. Please select a valid API key with Veo access and ensure billing is enabled.");
    }
    throw new Error(error.message || "An unknown error occurred during video generation.");
  }
};

export const generateThumbnail = async (videoTitle: string, category: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use the gemini-2.5-flash-image model for thumbnail generation.
    const prompt = `Generate a visually appealing, high-quality, clickbait-style YouTube thumbnail image for a video titled "${videoTitle}" in the category "${category}". The image should be vibrant, eye-catching, and represent the video's content. Do not include any text in the image.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: {
                aspectRatio: "16:9"
            }
        },
    });

    // Iterate through parts to find the image data, as response may contain multiple parts.
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64String = part.inlineData.data;
            return `data:image/png;base64,${base64String}`;
        }
    }
    
    // Fallback if no image part is found in a successful response.
    throw new Error("No image data found in AI response.");

  } catch (error) {
    console.error("Thumbnail generation error:", error);
    // Fallback to a deterministic picsum image on error to ensure UI doesn't break.
    return `https://picsum.photos/seed/${encodeURIComponent(videoTitle)}/640/360`;
  }
};


export const fetchPressReleases = async (): Promise<PressRelease[]> => {
    const cacheKey = 'starlight_press_releases';
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate 5 realistic press release summaries for a fictional AI video company called "Starlight". Include a title, a realistic date within the last year, and a short summary for each.
    Your response must be a valid JSON array of objects. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            date: { type: Type.STRING },
                            summary: { type: Type.STRING }
                        },
                        required: ["id", "title", "date", "summary"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from API");
        
        const releases = JSON.parse(cleanJson(text));
        localStorage.setItem(cacheKey, JSON.stringify(releases));
        return releases;

    } catch (error) {
        console.error("Error fetching press releases:", error);
        return [
            { id: 'fallback-1', title: 'Starlight Launches Revolutionary AI Video Platform', date: 'October 26, 2024', summary: 'Today, Starlight Inc. announced the public beta of its groundbreaking AI-powered video platform, aiming to change content creation forever.'},
            { id: 'fallback-2', title: 'Starlight Secures $25M in Series A Funding', date: 'January 15, 2025', summary: 'Led by Future Ventures, the funding will accelerate development of Starlight\'s generative media tools and expand its creator monetization program.'}
        ];
    }
};

export const fetchChannelAnalytics = async (channelName: string, currency: string = 'USD'): Promise<AnalyticsData> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const currencySymbol = currency === 'INR' ? '₹' : '$';
        const prompt = `Generate a realistic YouTube channel analytics data object for a channel named "${channelName}".
        The response must be a single, valid JSON object.
        - totalViews should be a string like "1.2M".
        - watchTimeHours should be a string like "45.1K".
        - subscribersGained should be a string like "+12.5K".
        - estimatedRevenue should be a string like "${currencySymbol}8,432.50".
        - dailyViews should be an array of 14 objects, each with a "date" (e.g., "1st", "2nd") and a "views" number, and a "revenue" number.
        - topContent should be an array of 3 video metadata objects (id, title, views, duration, uploaderName, communityName, uploadTime, description).
        - audienceInsight should be a short, insightful, single-sentence string generated by an AI analyzing the data, suggesting what the creator should focus on next.
    Your response must not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        totalViews: { type: Type.STRING },
                        watchTimeHours: { type: Type.STRING },
                        subscribersGained: { type: Type.STRING },
                        estimatedRevenue: { type: Type.STRING },
                        dailyViews: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    views: { type: Type.NUMBER },
                                    revenue: { type: Type.NUMBER },
                                },
                                required: ["date", "views", "revenue"]
                            }
                        },
                        topContent: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    views: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    uploaderName: { type: Type.STRING },
                                    communityName: { type: Type.STRING },
                                    uploadTime: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ["id", "title", "views", "duration", "uploaderName", "communityName", "uploadTime", "description"]
                            }
                        },
                        audienceInsight: { type: Type.STRING }
                    },
                     required: ["totalViews", "watchTimeHours", "subscribersGained", "estimatedRevenue", "dailyViews", "topContent", "audienceInsight"]
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No response for analytics");
        
        const analytics = JSON.parse(cleanJson(text));
        // Add thumbnails to top content
        analytics.topContent = analytics.topContent.map((v: Video, i: number) => ({
            ...v,
            thumbnailUrl: `https://picsum.photos/seed/analytics-${i}/${v.id}/320/180`,
        }));
        return analytics;
    } catch(e) {
        console.error("Failed to fetch analytics", e);
        // Return a structured fallback
        return {
            totalViews: 'N/A',
            watchTimeHours: 'N/A',
            subscribersGained: 'N/A',
            estimatedRevenue: 'N/A',
            dailyViews: Array.from({length: 14}).map((_, i) => ({date: `${i+1}th`, views: 0, revenue: 0})),
            topContent: [],
            audienceInsight: 'Could not generate insights due to an API error.'
        }
    }
};

export const generateActivities = async (factionName: string): Promise<Activity[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate a list of 10 recent, realistic user activities for a user named "${factionName}" on a YouTube-like platform.
        - The 'type' must be one of: 'upload', 'comment', 'like', 'subscribe', 'milestone'.
        - The 'description' should be a short, natural-sounding sentence describing the action. For comments, include the comment text in quotes. For uploads, include the video title. For subscriptions, name the community they subscribed to.
        - The 'timestamp' should be a relative time string like '2 hours ago' or '3 days ago'.
        The activities should be varied and feel authentic.
    Your response must be a valid JSON array of objects. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            description: { type: Type.STRING },
                            timestamp: { type: Type.STRING }
                        },
                        required: ["type", "description", "timestamp"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No activities generated");
        return JSON.parse(cleanJson(text));
    } catch (e) {
        console.error(`Failed to generate activities for ${factionName}`, e);
        return [{ type: 'error', description: 'Failed to load activities due to an API error.', timestamp: 'just now' }];
    }
};

export const generateAdminActivities = async (adminName: string): Promise<Activity[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate a list of 10 recent, realistic admin activities for an admin with the role "${adminName}" on a YouTube-like platform.
        - The 'type' must be one of: 'delete_video', 'update_setting', 'ban_user', 'review_report', 'approve_ad'. Choose types that are most relevant to the role. For example, a 'Content Moderator' would 'review_report' or 'delete_video', while an 'Ad Manager' would 'approve_ad'. A 'Lead Admin' can do anything.
        - The 'description' should be a short, professional sentence describing the action. e.g., "Dismissed report #R-58291 for 'Spam'", "Approved ad campaign 'Summer Sale'", "Banned user 'spam_bot_123' for policy violations.".
        - The 'timestamp' should be a relative time string like '5 minutes ago' or '1 day ago'.
        The activities should feel authentic to an admin's workflow.
    Your response must be a valid JSON array of objects. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            description: { type: Type.STRING },
                            timestamp: { type: Type.STRING }
                        },
                        required: ["type", "description", "timestamp"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No admin activities generated");
        return JSON.parse(cleanJson(text));
    } catch (e) {
        console.error(`Failed to generate admin activities for ${adminName}`, e);
        return [{ type: 'error', description: 'Failed to load admin activities due to an API error.', timestamp: 'just now' }];
    }
};

export const generateAdConcepts = async (
  productName: string,
  targetAudience: string,
  keyMessages: string,
  tone: string,
  imagePart?: any
): Promise<AdConcept[] | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let prompt = `You are a creative director at a top ad agency. A client is launching a product called "${productName}".
        The target audience is people interested in "${targetAudience}".
        The key messages are: "${keyMessages}".
        ${tone ? `The desired tone and style for the ad is: "${tone}".` : ''}
        
        Generate 3 distinct and creative ad concepts for a skippable YouTube ad.
        For each concept, provide:
        - A short, catchy title.
        - A brief script for a 15-30 second video ad.
        - A visual idea for the thumbnail.
        - A list of 3-4 specific sub-category interests to target within the main category.
    Your response must be a valid JSON array of objects. Do not include any text before or after the JSON, and do not use markdown formatting.` + getLanguageSuffix();
        
        const contents: any = { parts: [{ text: prompt }] };
        if (imagePart) {
            contents.parts.unshift(imagePart);
            contents.parts[1].text = `Here is an image of the product. ` + contents.parts[1].text;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            script: { type: Type.STRING },
                            visualIdea: { type: Type.STRING },
                            targeting: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["id", "title", "script", "visualIdea", "targeting"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No ad concepts generated");
        return JSON.parse(cleanJson(text));

    } catch(e) {
        console.error("Failed to generate ad concepts", e);
        return null;
    }
};

export const generateAdCreativeSuggestions = async (videoTitle: string, videoDescription: string): Promise<AdCreativeSuggestion | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `As an expert YouTube ad creative, analyze the following video details and generate creative suggestions for a promotional ad.
        Video Title: "${videoTitle}"
        Video Description: "${videoDescription.substring(0, 200)}..."
        
        Generate a single, valid JSON object with the following properties:
        - "titles": An array of 3 short, punchy, alternative titles for the ad campaign.
        - "script": A concise 15-second video ad script that captures the essence of the video and has a strong call-to-action.
        - "targetCategories": An array of 3 relevant audience categories to target.
        Do not include any text before or after the JSON, and do not use markdown formatting.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        titles: { type: Type.ARRAY, items: { type: Type.STRING } },
                        script: { type: Type.STRING },
                        targetCategories: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["titles", "script", "targetCategories"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No suggestions generated");
        return JSON.parse(cleanJson(text)) as AdCreativeSuggestion;
    } catch (e) {
        console.error("Failed to generate ad creative suggestions", e);
        return null;
    }
};


export const generateVideoMetadata = async (topic: string): Promise<VideoMetadata | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Based on the topic "${topic}", generate a viral, SEO-optimized YouTube video title and a compelling, detailed video description.
    Your response must be a single, valid JSON object with "title" and "description" properties.
    Do not include any text before or after the JSON, and do not use markdown formatting.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ["title", "description"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No metadata generated");
        return JSON.parse(cleanJson(text)) as VideoMetadata;
    } catch (e) {
        console.error("Failed to generate video metadata", e);
        return null;
    }
};

export const generateSmartPlaylist = async (prompt: string): Promise<Video[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fullPrompt = `Generate a playlist of 5 realistic video metadata objects based on the user's request: "${prompt}".
        Make the videos highly relevant to the theme or mood requested.
        Include diverse and realistic titles, channel names, views, and upload times.
        Your response must be a valid JSON array of objects. Do not include any text before or after the JSON.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            communityName: { type: Type.STRING },
                            uploaderName: { type: Type.STRING },
                            views: { type: Type.STRING },
                            uploadTime: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ["id", "title", "communityName", "uploaderName", "views", "uploadTime", "duration", "description"]
                    },
                },
            },
        });

        const text = response.text;
        if (!text) return [];

        const videos: Video[] = JSON.parse(cleanJson(text));
        return videos.map((v, i) => ({
            ...v,
            id: `gen-pl-${Date.now()}-${i}`,
            thumbnailUrl: `https://picsum.photos/seed/${v.title.replace(/\s/g, '')}/640/360`,
            communityAvatar: `https://picsum.photos/seed/${v.communityName}/64/64`,
            uploaderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(v.uploaderName || 'user')}`
        }));
    } catch (error) {
        console.error("Smart Playlist Error", error);
        return [];
    }
};

export const generateVideoSummary = async (title: string, description: string): Promise<string[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Summarize the following video content into exactly 3 concise, engaging bullet points.
        Video Title: "${title}"
        Video Description: "${description.substring(0, 500)}..."
        
        Your response must be a valid JSON array of 3 strings.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
            },
        });

        const text = response.text;
        if (!text) return ["Summary unavailable."];
        return JSON.parse(cleanJson(text));
    } catch (error) {
        console.error("Summary Gen Error", error);
        return ["Could not generate summary."];
    }
};

export const translateQuizQuestion = async (questionData: any, targetLanguage: string): Promise<any> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Translate the following quiz question object into "${targetLanguage}".
        Return a valid JSON object with the same structure (id, question, options, correctAnswer, explanation).
        CRITICAL: The translated 'correctAnswer' MUST effectively match one of the translated 'options'.
        
        Original JSON: ${JSON.stringify(questionData)}
        
        Do not use markdown formatting. Return raw JSON only.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["id", "question", "options", "correctAnswer", "explanation"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No translation returned");
        return JSON.parse(cleanJson(text));
    } catch (error) {
        console.error("Translation Error", error);
        return questionData; // Fallback to original
    }
};
