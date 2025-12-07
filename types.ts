
export interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string; // Optional because we generate it locally if missing
  communityName: string;
  communityAvatar?: string;
  views: string;
  uploadTime: string;
  uploadDate?: string;
  duration: string;
  description: string;
  category?: string;
  subCategory?: string;
  country?: string;
  state?: string;
  city?: string;
  isShort?: boolean;
  uploaderName?: string;
  uploaderAvatar?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: string;
  time: string;
  isAI?: boolean;
}

export interface User {
  name: string;
  avatar?: string;
  email?: string;
  isPremium?: boolean;
  joinedDate?: string;
}

export interface Community {
  id: string;
  name: string;
  ownerEmail: string;
  memberCount?: number;
  country?: string;
  state?: string;
  city?: string;
  avatar?: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  status: 'Active' | 'Paused' | 'Ended' | 'In Review';
  views: string;
  ctr: string; // Click-through rate
  spend: string;
  thumbnailUrl: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  constituency?: string;
  category?: string;
  subCategory?: string;
  communityName?: string;
}

export interface UnskippableAdCampaign {
  id: string;
  title: string;
  status: 'Active' | 'Paused' | 'Ended' | 'In Review';
  impressions: string;
  spend: string;
  duration: '6s' | '15s';
  thumbnailUrl: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  constituency?: string;
  category?: string;
  subCategory?: string;
  communityName?: string;
}

export interface ShortsAdCampaign {
  id: string;
  title: string;
  status: 'Active' | 'Paused' | 'Ended' | 'In Review';
  impressions: string;
  spend: string;
  thumbnailUrl: string; // Should be a vertical image URL
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  constituency?: string;
  category?: string;
  subCategory?: string;
  communityName?: string;
}

export interface Transaction {
  id: string;
  sponsorName: string;
  campaignId: string;
  amount: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  method: 'Credit Card' | 'PayPal' | 'Bank Transfer';
}

export interface PressRelease {
  id: string;
  title: string;
  date: string;
  summary: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories?: SubCategory[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videos: Video[];
  createdAt: string;
}

export interface DailyMetric {
  date: string;
  views: number;
  revenue: number;
}

export interface AnalyticsData {
  totalViews: string;
  watchTimeHours: string;
  subscribersGained: string;
  estimatedRevenue: string;
  dailyViews: DailyMetric[];
  topContent: Video[];
  audienceInsight: string;
}

export interface Report {
  id: string;
  video: Video;
  reason: string;
  reportDate: string;
  reporterEmail: string;
  status: 'In Review' | 'Action Taken' | 'Dismissed';
}

export interface ProfileDetails {
  mobileNumber?: string;
  isMobileVerified?: boolean;
  country?: string;
  state?: string;
  city?: string;
  nativeLanguages?: string[];
  gender?: 'male' | 'female' | 'prefer_not_to_say';
}

export interface AdConcept {
  id: string;
  title: string;
  script: string;
  visualIdea: string;
  targeting: string[];
}

export interface AdCreativeSuggestion {
  titles: string[];
  script: string;
  targetCategories: string[];
}

export interface VideoMetadata {
  title: string;
  description: string;
}

// FIX: Added missing Activity interface for FactionActivities page.
export interface Activity {
  type: 'upload' | 'comment' | 'like' | 'subscribe' | 'milestone' | string;
  description: string;
  timestamp: string;
}

export const ADMIN_ROLES = [
  'Lead Admin', 
  'Content Moderator', 
  'Ad Manager', 
  'Regional Lead',
  'Community Manager',
  'Analytics Expert',
  'Policy Advisor',
  'Support Specialist'
] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  country: string;
  state?: string;
  district?: string;
  city?: string;
}


export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  {
    id: 'agriculture',
    name: 'Agriculture',
    subCategories: [
      { id: 'agri-tech', name: 'Agri-Tech' },
      { id: 'crop-updates', name: 'Crop Updates' },
      { id: 'dairy-farming', name: 'Dairy Farming' },
      { id: 'farm-machinery', name: 'Farm Machinery' },
      { id: 'farming-tips', name: 'Farming Tips' },
      { id: 'fisheries', name: 'Fisheries' },
      { id: 'govt-schemes', name: 'Govt Schemes' },
      { id: 'horticulture', name: 'Horticulture' },
      { id: 'irrigation', name: 'Irrigation' },
      { id: 'livestock', name: 'Livestock' },
      { id: 'market-prices', name: 'Mandi Prices' },
      { id: 'organic-farming', name: 'Organic Farming' },
      { id: 'pest-control', name: 'Pest Control' },
      { id: 'poultry', name: 'Poultry Farming' },
      { id: 'sustainable-agriculture', name: 'Sustainable Agriculture' },
      { id: 'vertical-farming', name: 'Vertical Farming' },
      { id: 'weather-alert', name: 'Weather Alerts' },
      { id: 'agriculture-other', name: 'Other' },
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    subCategories: [
        { id: 'animal-behavior', name: 'Animal Behavior' },
        { id: 'birds', name: 'Birds' },
        { id: 'documentaries', name: 'Documentaries' },
        { id: 'funny-clips', name: 'Funny Clips' },
        { id: 'insects', name: 'Insects' },
        { id: 'marine-life', name: 'Marine Life' },
        { id: 'pets', name: 'Pets & Care' },
        { id: 'reptiles-amphibians', name: 'Reptiles & Amphibians' },
        { id: 'animal-rescue', name: 'Rescues' },
        { id: 'veterinary-medicine', name: 'Veterinary Medicine' },
        { id: 'wildlife', name: 'Wildlife' },
        { id: 'zoos-sanctuaries', name: 'Zoos & Sanctuaries' },
        { id: 'animals-other', name: 'Other' },
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    subCategories: [
      { id: 'bikes', name: 'Bikes' },
      { id: 'car-mods', name: 'Car Mods' },
      { id: 'car-reviews', name: 'Car Reviews' },
      { id: 'diy-auto', name: 'DIY Auto Repair' },
      { id: 'evs', name: 'Electric Vehicles' },
      { id: 'maintenance', name: 'Maintenance' },
      { id: 'motorsports', name: 'Motorsports' },
      { id: 'offroad', name: 'Off-Road' },
      { id: 'racing', name: 'Racing' },
      { id: 'supercars', name: 'Supercars' },
      { id: 'trucks', name: 'Trucks & Logistics' },
      { id: 'vintage', name: 'Vintage Classics' },
      { id: 'automotive-other', name: 'Other' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    subCategories: [
      { id: 'case-studies', name: 'Case Studies' },
      { id: 'corporate', name: 'Corporate' },
      { id: 'crypto', name: 'Crypto & Web3' },
      { id: 'entrepreneurship', name: 'Entrepreneurship' },
      { id: 'global-economy', name: 'Global Economy' },
      { id: 'leadership', name: 'Leadership' },
      { id: 'marketing-biz', name: 'Marketing' },
      { id: 'personal-finance', name: 'Personal Finance' },
      { id: 'real-estate', name: 'Real Estate' },
      { id: 'startups', name: 'Startups' },
      { id: 'stock-market', name: 'Stock Market' },
      { id: 'taxes-policy', name: 'Taxes & Policy' },
      { id: 'business-other', name: 'Other' },
    ],
  },
  {
    id: 'crime',
    name: 'Crime',
    subCategories: [
      { id: 'cold-cases', name: 'Cold Cases' },
      { id: 'court-cases', name: 'Court Cases' },
      { id: 'cyber-fraud', name: 'Cyber Fraud' },
      { id: 'forensics', name: 'Forensics' },
      { id: 'heists', name: 'Heists' },
      { id: 'investigations', name: 'Investigations' },
      { id: 'local-crime', name: 'Local Incidents' },
      { id: 'safety-alerts', name: 'Safety Alerts' },
      { id: 'scam-awareness', name: 'Scam Awareness' },
      { id: 'true-crime', name: 'True Crime Stories' },
      { id: 'unsolved-mysteries', name: 'Unsolved Mysteries' },
      { id: 'white-collar-crime', name: 'White Collar Crime' },
      { id: 'crime-other', name: 'Other' },
    ],
  },
  {
    id: 'disasters',
    name: 'Disasters',
    subCategories: [
      { id: 'avalanche', name: 'Avalanche' },
      { id: 'cyclone', name: 'Cyclone & Hurricane' },
      { id: 'drought', name: 'Drought' },
      { id: 'earthquake', name: 'Earthquake' },
      { id: 'floods', name: 'Floods' },
      { id: 'industrial-accidents', name: 'Industrial Accidents' },
      { id: 'landslide', name: 'Landslide' },
      { id: 'preparedness', name: 'Preparedness' },
      { id: 'tornadoes', name: 'Tornadoes' },
      { id: 'tsunami', name: 'Tsunami' },
      { id: 'volcanic', name: 'Volcanic Eruption' },
      { id: 'wildfires', name: 'Wildfires' },
      { id: 'disasters-other', name: 'Other' },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    subCategories: [
      { id: 'career-advice', name: 'Career Advice' },
      { id: 'coding-tutorials', name: 'Coding Tutorials' },
      { id: 'exam-prep', name: 'Exam Prep' },
      { id: 'history-facts', name: 'History & Facts' },
      { id: 'language-learning', name: 'Languages' },
      { id: 'literature', name: 'Literature' },
      { id: 'mathematics', name: 'Mathematics' },
      { id: 'online-courses', name: 'Online Courses' },
      { id: 'philosophy', name: 'Philosophy' },
      { id: 'psychology', name: 'Psychology' },
      { id: 'science-explainers-edu', name: 'Science Explainers' },
      { id: 'study-abroad', name: 'Study Abroad' },
      { id: 'education-other', name: 'Other' },
    ],
  },
  {
    id: 'employment',
    name: 'Employment',
    subCategories: [
      { id: 'career-guidance', name: 'Career Guidance' },
      { id: 'corporate-culture', name: 'Corporate Culture' },
      { id: 'freelancing', name: 'Freelancing' },
      { id: 'govt-jobs', name: 'Govt Jobs' },
      { id: 'interview-tips', name: 'Interview Tips' },
      { id: 'job-search', name: 'Job Search' },
      { id: 'networking', name: 'Networking' },
      { id: 'private-sector', name: 'Private Sector' },
      { id: 'resume-building', name: 'Resume Building' },
      { id: 'salary-negotiation', name: 'Salary Negotiation' },
      { id: 'skill-development', name: 'Skill Development' },
      { id: 'work-from-home', name: 'Work from Home' },
      { id: 'employment-other', name: 'Other' },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    subCategories: [
      { id: 'animation', name: 'Animation' },
      { id: 'behind-the-scenes', name: 'Behind the Scenes' },
      { id: 'celebrity-news', name: 'Celebrity News' },
      { id: 'cinema-analysis', name: 'Cinema Analysis' },
      { id: 'comedy-skits', name: 'Comedy' },
      { id: 'magic', name: 'Magic' },
      { id: 'movie-trailers', name: 'Movie Trailers' },
      { id: 'music', name: 'Music' },
      { id: 'podcasts', name: 'Podcasts' },
      { id: 'tv-shows', name: 'TV Shows' },
      { id: 'viral-trends', name: 'Viral Trends' },
      { id: 'web-series', name: 'Web Series' },
      { id: 'entertainment-other', name: 'Other' },
    ],
  },
  {
    id: 'environment',
    name: 'Environment',
    subCategories: [
      { id: 'climate-change', name: 'Climate Action' },
      { id: 'conservation', name: 'Conservation' },
      { id: 'disaster-watch', name: 'Disaster Watch' },
      { id: 'eco-innovations', name: 'Eco-Innovations' },
      { id: 'renewable-energy', name: 'Green Energy' },
      { id: 'nature-docs', name: 'Nature Documentaries' },
      { id: 'oceanography', name: 'Oceanography' },
      { id: 'pollution', name: 'Pollution' },
      { id: 'recycling', name: 'Recycling' },
      { id: 'sustainability', name: 'Sustainability' },
      { id: 'urban-gardening', name: 'Urban Gardening' },
      { id: 'weather', name: 'Weather' },
      { id: 'wildlife-env', name: 'Wildlife' },
      { id: 'environment-other', name: 'Other' },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    subCategories: [
      { id: 'child-development', name: 'Child Development' },
      { id: 'diy-for-kids', name: 'DIY for Kids' },
      { id: 'education-for-kids', name: 'Education for Kids' },
      { id: 'elder-care', name: 'Elder Care' },
      { id: 'family-challenges', name: 'Family Challenges' },
      { id: 'family-travel', name: 'Family Travel' },
      { id: 'family-vlogs', name: 'Family Vlogs' },
      { id: 'home-living', name: 'Home & Living' },
      { id: 'kids-activities', name: 'Kids Activities' },
      { id: 'matrimonial', name: 'Matrimonial' },
      { id: 'parenting-tips', name: 'Parenting Tips' },
      { id: 'pregnancy-baby', name: 'Pregnancy & Baby' },
      { id: 'relationships', name: 'Relationships' },
      { id: 'family-other', name: 'Other' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Investing',
    subCategories: [
      { id: 'banking-credit', name: 'Banking & Credit' },
      { id: 'crypto-web3', name: 'Cryptocurrency & Web3' },
      { id: 'economic-history', name: 'Economic History' },
      { id: 'financial-news', name: 'Financial News' },
      { id: 'fintech', name: 'Fintech' },
      { id: 'frugal-living', name: 'Frugal Living & Budgeting' },
      { id: 'global-economy', name: 'Global Economy' },
      { id: 'insurance', name: 'Insurance' },
      { id: 'investing', name: 'Investing & Trading' },
      { id: 'personal-finance', name: 'Personal Finance' },
      { id: 'real-estate-investing', name: 'Real Estate' },
      { id: 'retirement-planning', name: 'Retirement Planning' },
      { id: 'stock-market', name: 'Stock Market' },
      { id: 'tax-planning', name: 'Tax Planning' },
      { id: 'finance-other', name: 'Other' },
    ]
  },
  {
    id: 'food',
    name: 'Food & Drink',
    subCategories: [
      { id: 'baking', name: 'Baking' },
      { id: 'cocktails', name: 'Cocktails & Drinks' },
      { id: 'cooking-shows', name: 'Cooking Shows' },
      { id: 'farm-to-table', name: 'Farm to Table' },
      { id: 'food-challenges', name: 'Food Challenges' },
      { id: 'food-science', name: 'Food Science' },
      { id: 'gourmet-cooking', name: 'Gourmet Cooking' },
      { id: 'healthy-eating', name: 'Healthy Recipes' },
      { id: 'quick-recipes', name: 'Quick Recipes' },
      { id: 'restaurant-reviews', name: 'Restaurant Reviews' },
      { id: 'street-food', name: 'Street Food' },
      { id: 'vegan-vegetarian', name: 'Vegan & Vegetarian' },
      { id: 'food-other', name: 'Other' },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    subCategories: [
      { id: 'esports', name: 'E-Sports' },
      { id: 'game-development', name: 'Game Development' },
      { id: 'game-reviews', name: 'Game Reviews' },
      { id: 'gaming-news', name: 'Gaming News' },
      { id: 'indie-games', name: 'Indie Games' },
      { id: 'lets-play', name: 'Let\'s Plays' },
      { id: 'live-streams', name: 'Live Streams' },
      { id: 'mobile-gaming', name: 'Mobile Gaming' },
      { id: 'pc-gaming', name: 'PC Gaming' },
      { id: 'retro-gaming', name: 'Retro Gaming' },
      { id: 'speedruns', name: 'Speedruns' },
      { id: 'vr-ar-gaming', name: 'VR/AR Gaming' },
      { id: 'walkthroughs', name: 'Walkthroughs' },
      { id: 'gaming-other', name: 'Other' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    subCategories: [
      { id: 'biohacking', name: 'Biohacking' },
      { id: 'first-aid', name: 'First Aid & Emergency' },
      { id: 'healthy-eating', name: 'Healthy Eating' },
      { id: 'home-workouts', name: 'Home Workouts' },
      { id: 'medical-science', name: 'Medical Science' },
      { id: 'mental-health', name: 'Mental Health' },
      { id: 'nutrition', name: 'Nutrition' },
      { id: 'sports-medicine', name: 'Sports Medicine' },
      { id: 'weight-loss', name: 'Weight Loss' },
      { id: 'womens-health', name: 'Women\'s Health' },
      { id: 'workout-routines', name: 'Workout Routines' },
      { id: 'yoga-meditation', name: 'Yoga & Meditation' },
      { id: 'health-other', name: 'Other' },
    ],
  },
  {
    id: 'judicial',
    name: 'Judicial',
    subCategories: [
      { id: 'constitutional-law', name: 'Constitutional Law' },
      { id: 'corporate-law', name: 'Corporate Law' },
      { id: 'court-proceedings', name: 'Court Proceedings' },
      { id: 'criminal-law', name: 'Criminal Law' },
      { id: 'family-law', name: 'Family Law' },
      { id: 'famous-trials', name: 'Famous Trials' },
      { id: 'immigration-law', name: 'Immigration Law' },
      { id: 'intellectual-property', name: 'Intellectual Property' },
      { id: 'know-your-rights', name: 'Know Your Rights' },
      { id: 'law-school', name: 'Law School & Bar Prep' },
      { id: 'legal-analysis', name: 'Legal News & Analysis' },
      { id: 'legal-tech', name: 'Legal Tech' },
      { id: 'judicial-other', name: 'Other' },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    subCategories: [
      { id: 'digital-nomad', name: 'Digital Nomad' },
      { id: 'diy', name: 'DIY & Crafts' },
      { id: 'fashion', name: 'Fashion' },
      { id: 'food-reviews', name: 'Food Reviews' },
      { id: 'home-garden', name: 'Home & Garden' },
      { id: 'luxury', name: 'Luxury' },
      { id: 'minimalism', name: 'Minimalism' },
      { id: 'motivational', name: 'Motivational' },
      { id: 'parenting', name: 'Parenting' },
      { id: 'pets', name: 'Pets' },
      { id: 'photography', name: 'Photography' },
      { id: 'urban-exploration', name: 'Urban Exploration' },
      { id: 'lifestyle-other', name: 'Other' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    subCategories: [
      { id: 'affiliate-marketing', name: 'Affiliate Marketing' },
      { id: 'analytics', name: 'Analytics' },
      { id: 'brand-management', name: 'Brand Management' },
      { id: 'content-marketing', name: 'Content Marketing' },
      { id: 'copywriting', name: 'Copywriting' },
      { id: 'digital-marketing', name: 'Digital Marketing' },
      { id: 'email-marketing', name: 'Email Marketing' },
      { id: 'growth-hacking', name: 'Growth Hacking' },
      { id: 'influencer-marketing', name: 'Influencer Marketing' },
      { id: 'public-relations', name: 'Public Relations' },
      { id: 'sem-ppc', name: 'SEM / PPC' },
      { id: 'seo', name: 'SEO' },
      { id: 'social-media', name: 'Social Media' },
      { id: 'video-marketing', name: 'Video Marketing' },
      { id: 'marketing-other', name: 'Other' },
    ],
  },
  {
    id: 'politics',
    name: 'Politics',
    subCategories: [
      { id: 'activism', name: 'Activism' },
      { id: 'debates', name: 'Debates' },
      { id: 'elections', name: 'Elections' },
      { id: 'fact-checking', name: 'Fact Checking' },
      { id: 'geopolitics', name: 'Geopolitics' },
      { id: 'international', name: 'International' },
      { id: 'local-gov', name: 'Local Gov' },
      { id: 'national-news', name: 'National News' },
      { id: 'policy-analysis', name: 'Policy Analysis' },
      { id: 'political-history', name: 'Political History' },
      { id: 'satire', name: 'Satire' },
      { id: 'politics-other', name: 'Other' },
    ],
  },
  {
    id: 'religious',
    name: 'Religious',
    subCategories: [
      { id: 'atheism-agnosticism', name: 'Atheism & Agnosticism' },
      { id: 'buddhism', name: 'Buddhism' },
      { id: 'christianity', name: 'Christianity' },
      { id: 'hinduism', name: 'Hinduism' },
      { id: 'interfaith', name: 'Interfaith Dialogue' },
      { id: 'islam', name: 'Islam' },
      { id: 'judaism', name: 'Judaism' },
      { id: 'mythology', name: 'Mythology' },
      { id: 'religious-history', name: 'Religious History' },
      { id: 'sikhism', name: 'Sikhism' },
      { id: 'spirituality', name: 'Spirituality' },
      { id: 'theology', name: 'Theology' },
      { id: 'religious-other', name: 'Other' },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    subCategories: [
      { id: 'astronomy', name: 'Astronomy & Space' },
      { id: 'biology', name: 'Biology' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'environment-sci', name: 'Environmental Science' },
      { id: 'experiments', name: 'Experiments' },
      { id: 'geology', name: 'Geology' },
      { id: 'neuroscience', name: 'Neuroscience' },
      { id: 'paleontology', name: 'Paleontology' },
      { id: 'physics', name: 'Physics' },
      { id: 'quantum-mechanics', name: 'Quantum Mechanics' },
      { id: 'robotics', name: 'Robotics' },
      { id: 'science-explainers', name: 'Science Explainers' },
      { id: 'science-other', name: 'Other' },
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    subCategories: [
      { id: 'athletics', name: 'Athletics' },
      { id: 'badminton', name: 'Badminton' },
      { id: 'basketball', name: 'Basketball' },
      { id: 'cricket', name: 'Cricket' },
      { id: 'esports-sports', name: 'E-Sports' },
      { id: 'extreme-sports', name: 'Extreme Sports' },
      { id: 'f1-racing', name: 'F1 Racing' },
      { id: 'fantasy-sports', name: 'Fantasy Sports' },
      { id: 'football', name: 'Football' },
      { id: 'mma', name: 'MMA & Boxing' },
      { id: 'olympics', name: 'Olympics' },
      { id: 'sports-science', name: 'Sports Science' },
      { id: 'tennis', name: 'Tennis' },
      { id: 'sports-other', name: 'Other' },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    subCategories: [
      { id: '3d-printing', name: '3D Printing' },
      { id: 'ai-ml', name: 'AI & Machine Learning' },
      { id: 'apps-software', name: 'Apps & Software' },
      { id: 'blockchain-crypto', name: 'Blockchain & Crypto' },
      { id: 'cybersecurity', name: 'Cybersecurity' },
      { id: 'future-tech', name: 'Future Tech' },
      { id: 'gadgets', name: 'Gadget Reviews' },
      { id: 'how-to', name: 'How-To\'s & Tutorials' },
      { id: 'iot', name: 'IoT (Internet of Things)' },
      { id: 'pc-hardware', name: 'PC & Hardware' },
      { id: 'coding', name: 'Programming' },
      { id: 'smartphones', name: 'Smartphones' },
      { id: 'tech-news', name: 'Tech News' },
      { id: 'technology-other', name: 'Other' },
    ],
  },
  {
    id: 'travel',
    name: 'Travel',
    subCategories: [
      { id: 'adventure', name: 'Adventure Travel' },
      { id: 'backpacking', name: 'Backpacking' },
      { id: 'budget-travel', name: 'Budget Travel' },
      { id: 'city-guides', name: 'City Guides' },
      { id: 'cultural-immersion', name: 'Cultural Immersion' },
      { id: 'digital-nomad-travel', name: 'Digital Nomad Life' },
      { id: 'food-travel', name: 'Food & Travel' },
      { id: 'luxury-travel', name: 'Luxury Travel' },
      { id: 'travel-vlogs', name: 'Travel Vlogs' },
      { id: 'road-trips', name: 'Road Trips' },
      { id: 'solo-travel', name: 'Solo Travel' },
      { id: 'travel-hacks', name: 'Travel Hacks' },
      { id: 'travel-other', name: 'Other' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    subCategories: [
      { id: 'other-general', name: 'Other' },
    ],
  },
];

export function isAd(item: any): item is AdCampaign | UnskippableAdCampaign | ShortsAdCampaign {
    return item && typeof item === 'object' && 'status' in item && ('ctr' in item || 'impressions' in item);
}